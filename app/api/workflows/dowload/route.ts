import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const n8nUrl = process.env.N8N_DOWNLOAD_REQUEST_URL;
  
  // ตรวจสอบว่ามีการตั้งค่า URL ใน .env หรือยัง
  if (!n8nUrl) {
    return NextResponse.json(
      { error: 'Missing N8N_DOWNLOAD_REQUEST_URL in .env' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    
    // ตรวจสอบข้อมูลเบื้องต้นที่ส่งมาจากหน้าเว็บ
    if (!body.workflowId || !body.requesterEmail) {
      return NextResponse.json(
        { error: 'Workflow ID and Requester Email are required.' },
        { status: 400 }
      );
    }

    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId: crypto.randomUUID(),
        workflowId: body.workflowId,
        requesterEmail: body.requesterEmail,
        ownerEmail: body.ownerEmail,
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n responded with status ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Download request error:', error);
    return NextResponse.json(
      { error: 'Failed to send download request to n8n' },
      { status: 500 }
    );
  }
}