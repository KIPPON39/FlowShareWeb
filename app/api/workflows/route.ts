import { NextResponse } from 'next/server';
import { getAdminSettings } from '@/lib/admin-settings';
import {
  SAMPLE_WORKFLOWS,
  normalizeList,
  slugifyWorkflowTitle,
  enrichWorkflowTags,
  generateFlowId,
  type WorkflowTemplate,
} from '@/lib/workflows';

export const revalidate = 30;

function shouldUseMockWorkflows() {
  return process.env.ENABLE_MOCK_WORKFLOWS === 'true';
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(field);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      field = '';
      continue;
    }

    field += char;
  }

  row.push(field);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}

function parseJsonCell<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

async function loadFromN8n() {
  let listWebhookUrl = process.env.N8N_LIST_WEBHOOK_URL;
  if (!listWebhookUrl) return null;

  try {
    const settings = getAdminSettings();
    const sheetId = settings.sheetIdFlows || process.env.GOOGLE_SHEET_ID_FLOWS || '';
    if (sheetId) {
      const separator = listWebhookUrl.includes('?') ? '&' : '?';
      listWebhookUrl = `${listWebhookUrl}${separator}sheetId=${encodeURIComponent(sheetId)}`;
    }

    const response = await fetch(listWebhookUrl, {
      headers: process.env.N8N_WEBHOOK_SECRET
        ? { 'x-flowshare-secret': process.env.N8N_WEBHOOK_SECRET }
        : undefined,
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      console.warn(`n8n list webhook returned ${response.status}`);
      return null;
    }

    const text = await response.text();
    if (!text || text.trim() === '') {
      console.warn(`n8n list webhook returned empty body`);
      return null;
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.warn(`n8n list webhook returned invalid JSON:`, text.slice(0, 200));
      return null;
    }

    if (Array.isArray(data)) return data as WorkflowTemplate[];
    if (Array.isArray(data.workflows)) return data.workflows as WorkflowTemplate[];
    return null;
  } catch (err) {
    console.warn(`Failed to fetch from n8n webhook:`, err);
    return null;
  }
}

export async function GET() {
  try {
    const rawWorkflows = (await loadFromN8n())
      ?? (shouldUseMockWorkflows() ? SAMPLE_WORKFLOWS : []);

    const workflows = rawWorkflows.map(wf => ({
      ...wf,
      tags: enrichWorkflowTags(wf.title || '', wf.description || '', wf.keys || [], wf.tags || []),
    }));

    return NextResponse.json({ workflows });
  } catch (error) {
    console.error('Failed to load workflows', error);

    const fallbackWorkflows = (shouldUseMockWorkflows() ? SAMPLE_WORKFLOWS : []).map(wf => ({
      ...wf,
      tags: enrichWorkflowTags(wf.title || '', wf.description || '', wf.keys || [], wf.tags || []),
    }));

    return NextResponse.json(
      {
        workflows: fallbackWorkflows,
        warning: shouldUseMockWorkflows()
          ? 'Backend source failed, showing mock workflows because ENABLE_MOCK_WORKFLOWS=true.'
          : 'Backend source failed. Check your n8n list webhook or Google Sheet CSV URL.',
      },
      { status: 200 },
    );
  }
}

export async function POST(request: Request) {
  const webhookUrl = process.env.N8N_WORKFLOW_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      { error: 'Missing N8N_WORKFLOW_WEBHOOK_URL. Add it to .env to enable Google Sheet updates.' },
      { status: 503 },
    );
  }

  const body = await request.json();
  const title = String(body.title || '').trim();
  const description = String(body.description || '').trim();

  if (!title || !description) {
    return NextResponse.json({ error: 'Title and description are required.' }, { status: 400 });
  }

  const rawTags = normalizeList(body.tags).length ? normalizeList(body.tags) : ['Community'];
  const enrichedTags = enrichWorkflowTags(title, description, normalizeList(body.keys), rawTags);

  const workflow: WorkflowTemplate = {
    id: generateFlowId(),
    title,
    description,
    tags: enrichedTags,
    keys: normalizeList(body.keys),
    creators: Array.isArray(body.creators) && body.creators.length ? body.creators : [{ name: 'FlowShare Creator' }],
    nodes: Array.isArray(body.steps) ? body.steps.length : Number(body.nodes) || 1,
    steps: Array.isArray(body.steps) ? body.steps : [],
    rawJson: body.rawJson || undefined,
    jsonFileUrl: body.jsonFileUrl || '',
    createdAt: new Date().toISOString(),
  };

  let n8nResponse: Response;

  try {
    const settings = getAdminSettings();
    const sheetIdFlows = settings.sheetIdFlows || process.env.GOOGLE_SHEET_ID_FLOWS || '';

    n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(process.env.N8N_WEBHOOK_SECRET ? { 'x-flowshare-secret': process.env.N8N_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify({
        action: 'upsert_workflow',
        workflow,
        source: 'flowshare-web',
        sheetId: sheetIdFlows,
      }),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Could not reach the n8n webhook.',
        detail: error instanceof Error ? error.message : 'Unknown network error',
      },
      { status: 502 },
    );
  }

  if (!n8nResponse.ok) {
    const detail = await n8nResponse.text();
    return NextResponse.json(
      {
        error: 'n8n webhook failed to save the workflow.',
        n8nStatus: n8nResponse.status,
        n8nStatusText: n8nResponse.statusText,
        detail: detail.slice(0, 1000),
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, workflow }, { status: 201 });
}


//feat: dowload
