import { NextResponse } from 'next/server';
import { getUserByUsername, createUser } from '@/lib/google-sheets';
import { createSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    // Hash the password securely
    const passwordHash = await bcrypt.hash(password, 10);

    // Save user to Google Sheets
    await createUser(username, passwordHash);

    // Create a session cookie
    await createSession(username, username);

    return NextResponse.json({ success: true, message: 'User registered successfully' }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred during registration' },
      { status: 500 }
    );
  }
}
