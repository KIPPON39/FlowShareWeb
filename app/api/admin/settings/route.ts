import { NextRequest, NextResponse } from 'next/server';
import { getAdminSettings, updateAdminSettings } from '@/lib/admin-settings';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Authentication logic to protect this route
  const session = await getSession();
  if (!session || session.role !== 'Admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = getAdminSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Authentication logic to protect this route
  const session = await getSession();
  if (!session || session.role !== 'Admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updated = updateAdminSettings(body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating admin settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
