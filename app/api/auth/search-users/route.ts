import { NextRequest, NextResponse } from 'next/server';
import { getAdminSettings } from '@/lib/admin-settings';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Must be logged in
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ users: [] });
  }
  try {
    const searchWebhookUrl = process.env.N8N_SEARCH_USERS_WEBHOOK_URL;
    if (!searchWebhookUrl) {
      return NextResponse.json(
        { error: 'Missing N8N_SEARCH_USERS_WEBHOOK_URL in .env' },
        { status: 503 }
      );
    }

    const settings = getAdminSettings();
    const sheetId = settings.sheetIdUsers || process.env.GOOGLE_SHEET_ID_USERS || '';

    const separator = searchWebhookUrl.includes('?') ? '&' : '?';
    const fetchUrl = `${searchWebhookUrl}${separator}q=${encodeURIComponent(q)}&sheetId=${encodeURIComponent(sheetId)}`;

    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: process.env.N8N_WEBHOOK_SECRET
        ? { 'x-flowshare-secret': process.env.N8N_WEBHOOK_SECRET }
        : undefined,
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to search users via n8n' }, { status: response.status });
    }

    const text = await response.text();
    let users: { username: string; email: string; imageUrl: string }[] = [];
    if (text && text.trim() !== '') {
      try {
        const data = JSON.parse(text);
        users = Array.isArray(data) ? data : (data.users || []);
      } catch (e) {
        console.warn('n8n search users returned invalid JSON:', text.slice(0, 200));
      }
    }

    // Exclude current user from results
    const currentUsername = String(session.username || '').toLowerCase();
    const filtered = users.filter(
      (u) => u.username.toLowerCase() !== currentUsername
    );

    return NextResponse.json({ users: filtered });
  } catch (error: any) {
    console.error('[SearchUsers] API Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
}
