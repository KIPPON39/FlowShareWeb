import { NextResponse } from 'next/server';
import { getAdminSettings } from './admin-settings';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createSpeakerRequest(request: Request) {
  const n8nUrl = process.env.N8N_SPEAKER_REQUEST_URL || 'https://libn.kku.ac.th/webhook/speaker-request';

  if (!n8nUrl) {
    return NextResponse.json(
      { error: 'Missing N8N_SPEAKER_REQUEST_URL in .env' },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const flowID = String(body.flowID || '').trim();
  const requesterName = String(body.requesterName || '').trim();
  const requesterEmail = String(body.requesterEmail || '').trim();
  const recipient = String(body.recipient || '').trim();
  const recipientEmail = String(body.recipientEmail || '').trim();
  const event_name = String(body.event_name || '').trim();
  const event_date = String(body.event_date || '').trim();
  const event_location = String(body.event_location || '').trim();
  const event_purpose = String(body.event_purpose || '').trim();
  const speaker_name = String(body.speaker_name || '').trim();
  const speaker_position = String(body.speaker_position || 'Flow Creator').trim();
  const session_type = String(body.session_type || '').trim();
  const topic = String(body.topic || '').trim();
  const lecture_date = String(body.lecture_date || '').trim();
  const time_range = String(body.time_range || '').trim();
  const signer_name = String(body.signer_name || '').trim();
  const signer_position = String(body.signer_position || '').trim();

  if (!flowID) {
    return NextResponse.json({ error: 'flowID is required.' }, { status: 400 });
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomHex = crypto.randomUUID().split('-')[0].toUpperCase();

  const skrequestID = `SPK-${year}${month}${day}-${randomHex}`;
  const date = `${year}-${month}-${day}`;

  const settings = getAdminSettings();
  const sheetId = settings.sheetIdSpeakerRequests || process.env.GOOGLE_SHEET_ID_SPEAKER_REQUESTS || '';

  const speakerRequest = {
    skrequestID,
    sheetId,
    flowID,
    requesterName,
    requesterEmail,
    date,
    recipient,
    recipientEmail,
    event_name,
    event_date,
    event_location,
    event_purpose,
    speaker_name,
    speaker_position,
    session_type,
    topic,
    lecture_date,
    time_range,
    signer_name,
    signer_position
  };

  try {
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(process.env.N8N_WEBHOOK_SECRET ? { 'x-flowshare-secret': process.env.N8N_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify(speakerRequest),
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json(
        {
          error: 'n8n webhook failed to save the speaker request.',
          n8nStatus: response.status,
          n8nStatusText: response.statusText,
          detail: detail.slice(0, 1000),
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, speakerRequest }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Could not reach the n8n speaker webhook.',
        detail: error instanceof Error ? error.message : 'Unknown network error',
      },
      { status: 502 },
    );
  }
}
