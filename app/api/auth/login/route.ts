import { NextResponse } from 'next/server';
import { getUserByUsername } from '@/lib/google-sheets';
import { createSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Fetch user from Google Sheets
    const user = await getUserByUsername(username);
    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Passwords match, create session
    await createSession(username, username);

    return NextResponse.json({ success: true, message: 'Logged in successfully' }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred during login' },
      { status: 500 }
    );
  }
}
