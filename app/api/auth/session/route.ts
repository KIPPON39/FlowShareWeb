import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }
    
    return NextResponse.json(
      {
        user: {
          username: session.username,
          email: session.email || '',
          imageUrl: session.imageUrl || '',
          role: session.role || 'User',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
