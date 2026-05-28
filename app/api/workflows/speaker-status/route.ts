import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  const n8nUrl = process.env.N8N_SPEAKER_CHECKSTATUS_URL || 'https://libn.kku.ac.th/webhook/speaker-status';

  try {
    const response = await fetch(`${n8nUrl}?skrequestID=${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
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
