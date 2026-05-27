import { NextRequest, NextResponse } from 'next/server';
import { searchUsers } from '@/lib/google-sheets';
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
    const users = await searchUsers(q, 10);

    // Exclude current user from results
    const currentUsername = String(session.username || '').toLowerCase();
    const filtered = users.filter(
      (u) => u.username.toLowerCase() !== currentUsername
    );

    return NextResponse.json({ users: filtered });
  } catch (error) {
    console.error('Search users error:', error);
    return NextResponse.json({ users: [] });
  }
}
