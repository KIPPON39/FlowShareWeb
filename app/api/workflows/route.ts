import { NextResponse } from 'next/server';
import {
  SAMPLE_WORKFLOWS,
  normalizeList,
  slugifyWorkflowTitle,
  enrichWorkflowTags,
  type WorkflowTemplate,
} from '@/lib/workflows';

export const dynamic = 'force-dynamic';

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

function workflowsFromCsv(csv: string): WorkflowTemplate[] {
  const rows = parseCsv(csv);
  const [headers, ...records] = rows;
  if (!headers?.length) return [];

  const normalizedHeaders = headers.map((header) => header.trim().toLowerCase());

  return records.reduce<WorkflowTemplate[]>((workflows, record) => {
    const get = (name: string) => {
      const index = normalizedHeaders.indexOf(name.toLowerCase());
      return index >= 0 ? record[index]?.trim() : '';
    };

    const title = get('title');
    if (!title) return workflows;

    const keys = normalizeList(get('keys') || get('required_credentials'));
    const tags = normalizeList(get('tags'));
    const parsedCreators = parseJsonCell(get('creators'), normalizeList(get('creators')).map((name) => ({ name })));
    const creators = Array.isArray(parsedCreators) ? parsedCreators : [];
    const parsedSteps = parseJsonCell(get('steps'), []);
    const steps = Array.isArray(parsedSteps) ? parsedSteps : [];

    const rawTags = tags.length ? tags : ['Community'];
    const enrichedTags = enrichWorkflowTags(title, get('description') || '', keys, rawTags);

    workflows.push({
      id: get('id') || slugifyWorkflowTitle(title),
      title,
      description: get('description') || 'No description provided yet.',
      tags: enrichedTags,
      keys,
      creators: creators.length ? creators : [{ name: get('creator') || 'FlowShare Creator' }],
      nodes: Number(get('nodes')) || steps.length || keys.length || 1,
      views: Number(get('views')) || Math.floor(Math.random() * 500) + 10,
      downloads: Number(get('downloads')) || Math.floor(Math.random() * 200),
      updatedAt: get('updated_at') || new Date().toISOString(),
      steps,
      rawJson: parseJsonCell(get('raw_json'), null) ?? undefined,
      jsonFileUrl: get('json_file_url') || '',
      createdAt: get('created_at') || undefined,
    });

    return workflows;
  }, []);
}

async function loadFromN8n() {
  const listWebhookUrl = process.env.N8N_LIST_WEBHOOK_URL;
  if (!listWebhookUrl) return null;

  try {
    const response = await fetch(listWebhookUrl, {
      headers: process.env.N8N_WEBHOOK_SECRET
        ? { 'x-flowshare-secret': process.env.N8N_WEBHOOK_SECRET }
        : undefined,
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn(`n8n list webhook returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    if (Array.isArray(data)) return data as WorkflowTemplate[];
    if (Array.isArray(data.workflows)) return data.workflows as WorkflowTemplate[];
    return null;
  } catch (err) {
    console.warn(`Failed to fetch from n8n webhook:`, err);
    return null;
  }
}

async function loadFromGoogleSheetCsv() {
  const csvUrl = process.env.GOOGLE_SHEETS_CSV_URL;
  if (!csvUrl) return null;

  try {
    const response = await fetch(csvUrl, { cache: 'no-store' });
    if (!response.ok) {
      console.warn(`Google Sheet CSV returned ${response.status}`);
      return null;
    }

    return workflowsFromCsv(await response.text());
  } catch (err) {
    console.warn(`Failed to fetch from Google Sheet CSV:`, err);
    return null;
  }
}

export async function GET() {
  try {
    const rawWorkflows = (await loadFromN8n())
      ?? (await loadFromGoogleSheetCsv())
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
    id: body.id || slugifyWorkflowTitle(title),
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
