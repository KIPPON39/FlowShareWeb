import { NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const registerWebhookUrl = process.env.N8N_AUTH_REGISTER_WEBHOOK_URL;

    if (!registerWebhookUrl) {
      return NextResponse.json(
        { error: 'Missing N8N_AUTH_REGISTER_WEBHOOK_URL in .env' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const username = String(body.username || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const imageUrl = String(body.imageUrl || body.image_url || '').trim();
    const password = String(body.password || '');

    if (!username || !email || !imageUrl || !password) {
      return NextResponse.json({ error: 'Username, email, image URL and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const createdAt = new Date().toISOString();

    const n8nResponse = await fetch(registerWebhookUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(process.env.N8N_WEBHOOK_SECRET ? { 'x-flowshare-secret': process.env.N8N_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify({
        username,
        email,
        passwordHash,
        createdAt,
        image_url: imageUrl,
        imageUrl,
        role: 'User',
      }),
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
        { error: data.error || 'Failed to register' },
        { status: n8nResponse.status }
      );
    }

    const isRegisterSuccess =
      data.success === true ||
      String(data.message || '').toLowerCase().includes('register successful') ||
      rawText.trim() === '""' ||
      rawText.trim() === '';

    if (!isRegisterSuccess) {
      return NextResponse.json(
        { error: data.error || 'Register webhook did not confirm success.' },
        { status: 502 }
      );
    }

    await createSession(username, username, email, imageUrl);

    return NextResponse.json(
      {
        success: true,
        message: data.message || 'User registered successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred during registration' },
      { status: 500 }
    );
  }
}
