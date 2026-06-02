import { NextResponse } from 'next/server';

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
    const { getAdminSettings } = await import('@/lib/admin-settings');
    const settings = getAdminSettings();
    const sheetId = settings.sheetIdFlows || process.env.GOOGLE_SHEET_ID_FLOWS || '';

    // Send a background request to n8n to increment the view.
    const url = new URL(webhookUrl);
    url.searchParams.append('id', id);
    url.searchParams.append('action', 'increment_view');
    if (sheetId) url.searchParams.append('sheetId', sheetId);

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
