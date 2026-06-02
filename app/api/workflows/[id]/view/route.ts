import { NextResponse } from 'next/server';
import { getAdminSettings } from '@/lib/admin-settings';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const webhookUrl = process.env.N8N_VIEW_WEBHOOK_URL;
  
  if (!webhookUrl) {
    return NextResponse.json(
      { error: 'Missing N8N_VIEW_WEBHOOK_URL in .env' },
      { status: 503 }
    );
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 });
  }

  try {
    const settings = getAdminSettings();
    const sheetIdFlows = settings.sheetIdFlows || process.env.GOOGLE_SHEET_ID_FLOWS || '';

    // Send a background request to n8n to increment the view.
    // Assuming the n8n webhook might be a GET or POST, we'll use GET if it expects query params,
    // or POST if it expects a body. Let's use GET as the user's n8n screenshot shows a GET webhook.
    const url = new URL(webhookUrl);
    url.searchParams.append('id', id);
    url.searchParams.append('action', 'increment_view');
    url.searchParams.append('sheetId', sheetIdFlows);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: process.env.N8N_WEBHOOK_SECRET 
        ? { 'x-flowshare-secret': process.env.N8N_WEBHOOK_SECRET }
        : undefined,
    });

    if (!response.ok) {
      console.error(`Failed to increment view for ${id}: ${response.status}`);
      return NextResponse.json({ error: 'Failed to update view in n8n' }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error incrementing view:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
