import { google } from 'googleapis';

// Ensure these are set in your .env
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
// Handle newlines in the private key from .env correctly
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const GOOGLE_SHEET_ID_USERS = process.env.GOOGLE_SHEET_ID_USERS;

let cachedAuth: any = null;

async function getAuthClient() {
  if (cachedAuth) return cachedAuth;
  
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    throw new Error('Google Service Account credentials missing in .env');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: GOOGLE_PRIVATE_KEY,
    },
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  });

  cachedAuth = auth;
  return auth;
}

/**
 * Gets a user by username from the Google Sheet.
 * Assumes Sheet1 with columns: Username | PasswordHash | CreatedAt
 */
export async function getUserByUsername(username: string) {
  if (!GOOGLE_SHEET_ID_USERS) {
    console.warn('GOOGLE_SHEET_ID_USERS is not set.');
    return null;
  }

  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Read the sheet. Adjust range to A:F to include Email, ImageUrl, and Role.
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID_USERS,
      range: 'Sheet1!A:F',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return null;

    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] === username) {
        return {
          username: row[0],
          passwordHash: row[1],
          createdAt: row[2],
          email: row[3] || '',
          imageUrl: row[4] || '',
          role: row[5] || 'User',
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching user from Google Sheets:', error);
    return null;
  }
}

/**
 * Creates a new user in the Google Sheet.
 */
export async function createUser(username: string, passwordHash: string, email: string = '', imageUrl: string = '', role: string = 'User') {
  if (!GOOGLE_SHEET_ID_USERS) {
    throw new Error('GOOGLE_SHEET_ID_USERS is not set.');
  }

  const auth = await getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });

  const createdAt = new Date().toISOString();

  await sheets.spreadsheets.values.append({
    spreadsheetId: GOOGLE_SHEET_ID_USERS,
    range: 'Sheet1!A:F',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [
        [username, passwordHash, createdAt, email, imageUrl, role],
      ],
    },
  });

  return { username, createdAt, email, imageUrl, role };
}

/**
 * Search users by username or email (partial match).
 * Reads columns A:F assuming: Username | PasswordHash | CreatedAt | Email | ImageUrl | Role
 * (n8n register webhook saves email/imageUrl in additional columns)
 */
export async function searchUsers(query: string, limit = 10) {
  if (!GOOGLE_SHEET_ID_USERS) {
    console.warn('GOOGLE_SHEET_ID_USERS is not set.');
    return [];
  }

  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID_USERS,
      range: 'Sheet1!A:F',
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return [];

    const q = query.toLowerCase().trim();
    const results: { username: string; email: string; imageUrl: string }[] = [];

    // Skip header row
    for (let i = 1; i < rows.length && results.length < limit; i++) {
      const row = rows[i];
      const username = (row[0] || '').trim();
      const email = (row[3] || '').trim();
      const imageUrl = (row[4] || '').trim();

      if (
        username.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q)
      ) {
        results.push({ username, email, imageUrl });
      }
    }

    return results;
  } catch (error) {
    console.error('Error searching users from Google Sheets:', error);
    return [];
  }
}
