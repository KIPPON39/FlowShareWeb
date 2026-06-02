import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getAdminSettings } from '@/lib/admin-settings';
import { getSession } from '@/lib/auth';

const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

async function getAuthClient() {
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    throw new Error('Google Service Account credentials missing in .env');
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: GOOGLE_PRIVATE_KEY,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export async function GET(request: NextRequest) {
  // const session = await getSession();
  // if (!session || session.role !== 'Admin') {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  const settings = getAdminSettings();
  if (!settings.sheetIdSocialLinks) {
    return NextResponse.json({ links: [] });
  }

  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: settings.sheetIdSocialLinks,
      range: 'Sheet1!A:B',
    });

    const rows = response.data.values;
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
    return NextResponse.json({ error: 'Failed to fetch social links' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // const session = await getSession();
  // if (!session || session.role !== 'Admin') {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  const settings = getAdminSettings();
  if (!settings.sheetIdSocialLinks) {
    return NextResponse.json({ error: 'Sheet ID for Social Links is not configured' }, { status: 400 });
  }

  try {
    const { links } = await request.json();
    if (!Array.isArray(links)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });

    // Prepare data for Google Sheets
    const values = [['platform', 'url']];
    links.forEach(link => {
      values.push([link.platform, link.url]);
    });

    // Clear existing data and rewrite
    await sheets.spreadsheets.values.update({
      spreadsheetId: settings.sheetIdSocialLinks,
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
