import { NextResponse } from 'next/server';
import { getAdminSettings } from './admin-settings';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createDownloadRequest(request: Request) {
  const n8nUrl = process.env.N8N_DOWNLOAD_REQUEST_URL;

  if (!n8nUrl) {
    return NextResponse.json(
      { error: 'Missing N8N_DOWNLOAD_REQUEST_URL in .env' },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const workflowId = String(body.workflowId || '').trim();
  const requesterEmail = String(body.requesterEmail || '').trim().toLowerCase();
  const ownerEmail = String(body.ownerEmail || '').trim().toLowerCase();
  const requesterName = String(body.requesterName || '').trim();
  const reason = String(body.reason || '').trim();
  const flow_name = String(body.flow_name || '').trim();
  const recipient = String(body.recipient || '').trim();
  const signer_name = String(body.signer_name || '').trim();
  const signer_position = String(body.signer_position || '').trim();

  if (!workflowId) {
    return NextResponse.json({ error: 'Workflow ID is required.' }, { status: 400 });
  }

  if (!EMAIL_PATTERN.test(requesterEmail)) {
    return NextResponse.json({ error: 'A valid requester email is required.' }, { status: 400 });
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomHex = crypto.randomUUID().split('-')[0].toUpperCase();

  const timestampStr = new Date().toISOString();
  const dateStr = timestampStr.split('T')[0];

  const settings = await getAdminSettings();
  const sheetId = settings.sheetIdDownloadRequests || process.env.GOOGLE_SHEET_ID_DOWNLOAD_REQUESTS || '';

  const downloadRequest = {
    dlrequestID: `DR-${year}${month}${day}-${randomHex}`,
    sheetId,
    flowID: workflowId,
    requesterName,
    date: dateStr,
    flow_name,
    recipient,
    purpose: reason,
    signer_name,
    signer_position,
    requesterEmail,
    ownerEmail,
    status: 'Pending',
    timestamp: timestampStr,
  };

  try {
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(process.env.N8N_WEBHOOK_SECRET ? { 'x-flowshare-secret': process.env.N8N_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify(downloadRequest),
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json(
        {
          error: 'n8n webhook failed to save the download request.',
          n8nStatus: response.status,
          n8nStatusText: response.statusText,
          detail: detail.slice(0, 1000),
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, downloadRequest }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Could not reach the n8n download webhook.',
        detail: error instanceof Error ? error.message : 'Unknown network error',
      },
      { status: 502 },
    );
  }
}
