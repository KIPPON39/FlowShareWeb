import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { skrequestID, status, reason } = body;

    if (!skrequestID || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const n8nUrl = process.env.N8N_SPEAKER_RESPONSE_URL || 'https://libn.kku.ac.th/webhook/speaker-response';

    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        skrequestID,
        status,
        reason: reason || ''
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n responded with ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting speaker response:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
