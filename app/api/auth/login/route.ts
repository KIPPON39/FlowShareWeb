import { NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';
import { getAdminSettings } from '@/lib/admin-settings';
import bcrypt from 'bcryptjs';

function pickPasswordHash(user: Record<string, unknown>) {
  const direct =
    user.passwordHash ||
    user.PasswordHash ||
    user.password_hash ||
    user.passwordhash;

  if (typeof direct === 'string' && direct.trim()) {
    return direct.trim();
  }

  for (const [key, value] of Object.entries(user)) {
    const normalized = key.replace(/[^a-z0-9]/gi, '').toLowerCase();
    if (normalized === 'passwordhash' && typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

function pickFirstString(user: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = user[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

export async function POST(request: Request) {
  try {
    const loginWebhookUrl = process.env.N8N_WEBHOOK_LOGIN_URL;

    if (!loginWebhookUrl) {
      return NextResponse.json(
        { error: 'Missing N8N_WEBHOOK_LOGIN_URL in .env' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Superadmin bypass
    const superadminEmail = process.env.SUPERADMIN_EMAIL?.toLowerCase();
    const superadminPassword = process.env.SUPERADMIN_PASSWORD;

    if (
      superadminEmail &&
      superadminPassword &&
      email === superadminEmail &&
      password === superadminPassword
    ) {
      await createSession('Superadmin', 'Superadmin', superadminEmail, '', 'Admin');
      return NextResponse.json({ success: true, message: 'Logged in successfully as Superadmin' }, { status: 200 });
    }

    const settings = await getAdminSettings();
    const sheetId = settings.sheetIdUsers || process.env.GOOGLE_SHEET_ID_USERS || '';

    const n8nResponse = await fetch(loginWebhookUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(process.env.N8N_WEBHOOK_SECRET ? { 'x-flowshare-secret': process.env.N8N_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify({ email, sheetId }),
    });

    let data: Record<string, any> = {};
    let rawText = '';
    try {
      rawText = await n8nResponse.text();
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      data = {};
    }

    if (!n8nResponse.ok) {
      return NextResponse.json(
        { error: data.error || 'Invalid username or password' },
        { status: n8nResponse.status === 404 ? 401 : n8nResponse.status }
      );
    }

    let user = (data.user || data) as Record<string, unknown>;
    if (Array.isArray(user) && user.length > 0) {
      user = user[0];
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const passwordHash = pickPasswordHash(user);
    if (!passwordHash) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, passwordHash);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const userEmail =
      pickFirstString(user, ['email', 'Email', 'userEmail', 'user_email']) || email;
    const fetchedUsername = 
      pickFirstString(user, ['username', 'Username', 'userName', 'user_name']) || email;
    const userImageUrl = pickFirstString(user, [
      'imageUrl',
      'image_url',
      'ImageUrl',
      'Image_url',
      'profileImage',
      'avatar',
    ]);
    const rawRole = pickFirstString(user, ['role', 'Role', 'userRole']) || 'User';
    const userRole = rawRole.replace(/[^a-zA-Z]/g, '');

    await createSession(fetchedUsername, fetchedUsername, userEmail, userImageUrl, userRole);

    return NextResponse.json({ success: true, message: 'Logged in successfully' }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred during login' },
      { status: 500 }
    );
  }
}
