import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const n8nUrl = process.env.N8N_DOWNLOAD_REQUEST_URL;

  // Verify that the webhook URL is configured in the environment
  if (!n8nUrl) {
    return NextResponse.json(
      { error: 'Missing N8N_DOWNLOAD_REQUEST_URL configuration' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.workflowId || !body.requesterEmail) {
      return NextResponse.json(
        { error: 'Workflow ID and Requester Email are required.' },
        { status: 400 }
      );
    }

    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId: crypto.randomUUID(),
        workflowId: body.workflowId,
        requesterEmail: body.requesterEmail,
        requesterName: body.requesterName || '',
        reason: body.reason || '',
        ownerEmail: body.ownerEmail || '',
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook responded with status ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Download request forwarding error:', error);
    return NextResponse.json(
      { error: 'Failed to send download request to webhook receiver' },
      { status: 500 }
    );
  }
}
