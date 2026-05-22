import { NextResponse } from 'next/server';

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
  const requesterName = String(body.requesterName || '').trim();  // เพิ่ม
  const reason = String(body.reason || '').trim();                // เพิ่ม

  if (!workflowId) {
    return NextResponse.json({ error: 'Workflow ID is required.' }, { status: 400 });
  }

  if (!EMAIL_PATTERN.test(requesterEmail)) {
    return NextResponse.json({ error: 'A valid requester email is required.' }, { status: 400 });
  }

  const downloadRequest = {
    requestId: crypto.randomUUID(),
    workflowId,
    requesterName,   // เพิ่ม
    requesterEmail,
    ownerEmail,
    reason,          // เพิ่ม
    status: 'pending',
    timestamp: new Date().toISOString(),
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
