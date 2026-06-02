import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  const n8nUrl = process.env.N8N_SPEAKER_CHECKSTATUS_URL || 'https://libn.kku.ac.th/webhook/speaker-status';

  const { getAdminSettings } = await import('@/lib/admin-settings');
  const settings = getAdminSettings();
  const sheetId = settings.sheetIdSpeakerRequests || process.env.GOOGLE_SHEET_ID_SPEAKER_REQUESTS || '';

  try {
    const separator = n8nUrl.includes('?') ? '&' : '?';
    const fetchUrl = `${n8nUrl}${separator}skrequestID=${encodeURIComponent(id)}&sheetId=${encodeURIComponent(sheetId)}`;

    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(process.env.N8N_WEBHOOK_SECRET ? { 'x-flowshare-secret': process.env.N8N_WEBHOOK_SECRET } : {}),
      },
      // short timeout in case webhook doesn't exist
      signal: AbortSignal.timeout(5000), 
    });

    if (!response.ok) {
      // If n8n webhook isn't configured, we just fail gracefully and pretend it's pending
      return NextResponse.json({ status: 'pending' });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching speaker status from n8n:', error);
    // Fail gracefully so the frontend still loads if n8n webhook is not set up
    return NextResponse.json({ status: 'pending' });
  }
}
