import { NextRequest, NextResponse } from 'next/server';
import { getAdminSettings } from '@/lib/admin-settings';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const settings = await getAdminSettings();
  const sheetId = settings.sheetIdSocialLinks || '';

  if (!sheetId) {
    return NextResponse.json({ links: [] });
  }

  // ─── n8n webhook approach ───
  const n8nUrl = process.env.N8N_SOCIAL_LINKS_WEBHOOK_URL;
  if (n8nUrl) {
    try {
      const separator = n8nUrl.includes('?') ? '&' : '?';
      const fetchUrl = `${n8nUrl}${separator}sheetId=${encodeURIComponent(sheetId)}`;

      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...(process.env.N8N_WEBHOOK_SECRET ? { 'x-flowshare-secret': process.env.N8N_WEBHOOK_SECRET } : {}),
        },
        next: { revalidate: 60 }, // cache for 60 seconds — social links don't change often
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ links: data.links || [] });
      }
      console.warn(`n8n social-links webhook returned ${response.status}`);
    } catch (err) {
      console.warn('Could not reach n8n social-links webhook, falling back to direct Google Sheets:', err);
    }
  }

  // ─── Fallback: direct Google Sheets API ───
  try {
    const { google } = await import('googleapis');
    const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!serviceEmail || !privateKey) {
      return NextResponse.json({ links: [] });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: serviceEmail, private_key: privateKey },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:B',
    });

    const rows = res.data.values;
    if (!rows || rows.length <= 1) return NextResponse.json({ links: [] });

    const links = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[0]) {
        links.push({ platform: row[0].trim(), url: (row[1] || '').trim() });
      }
    }

    return NextResponse.json({ links });
  } catch (error) {
    console.error('Error fetching social links:', error);
    return NextResponse.json({ links: [] });
  }
}

export async function POST(request: NextRequest) {
  // Only admins can save social links
  const session = await getSession();
  if (!session || session.role !== 'Admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const settings = await getAdminSettings();
  const sheetId = settings.sheetIdSocialLinks || '';

  if (!sheetId) {
    return NextResponse.json({ error: 'Sheet ID for Social Links is not configured' }, { status: 400 });
  }

  const body = await request.json();
  const { links } = body;
  if (!Array.isArray(links)) {
    return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
  }

  // ─── n8n webhook approach ───
  const n8nUrl = process.env.N8N_SOCIAL_LINKS_WEBHOOK_URL;
  if (n8nUrl) {
    try {
      const response = await fetch(n8nUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(process.env.N8N_WEBHOOK_SECRET ? { 'x-flowshare-secret': process.env.N8N_WEBHOOK_SECRET } : {}),
        },
        body: JSON.stringify({ sheetId, links }),
      });

      if (response.ok) {
        return NextResponse.json({ success: true });
      }
      console.warn(`n8n social-links POST webhook returned ${response.status}`);
    } catch (err) {
      console.warn('Could not reach n8n social-links webhook for POST, falling back:', err);
    }
  }

  // ─── Fallback: direct Google Sheets API ───
  try {
    const { google } = await import('googleapis');
    const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!serviceEmail || !privateKey) {
      return NextResponse.json({ error: 'Google Service Account credentials missing' }, { status: 500 });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: serviceEmail, private_key: privateKey },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    const values = [['platform', 'url']];
    links.forEach((link: { platform: string; url: string }) => {
      values.push([link.platform, link.url]);
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:B',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving social links:', error);
    return NextResponse.json({ error: 'Failed to save social links' }, { status: 500 });
  }
}
