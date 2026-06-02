import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ approved: false, message: 'ไม่พบไฟล์ในคำขอ' }, { status: 400 });
    }

    const fileName = file.name || '';
    const ext = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
    const fileSize = file.size;

    // 1. ตรวจสอบเบื้องต้นฝั่ง Server (เพื่อความปลอดภัย)
    if (ext !== '.json') {
      return NextResponse.json({ approved: false, message: `นามสกุล ${ext} ไม่อนุญาต ต้องเป็นไฟล์ .json เท่านั้น` }, { status: 400 });
    }

    // อ่านเนื้อหาไฟล์เป็น text ครั้งเดียว (ใช้ทั้ง n8n และ fallback)
    const fileText = await file.text();

    // 2. พยายามเรียก n8n validator webhook — ส่งเป็น JSON body แทน binary
    //    เพื่อหลีกเลี่ยงปัญหา binary encoding ของ n8n (binaryMode: separate)
    const n8nValidatorUrl = process.env.N8N_VALIDATOR_WEBHOOK_URL || 'http://localhost:5678/webhook/check-file';
    
    const { getAdminSettings } = await import('@/lib/admin-settings');
    const settings = getAdminSettings();
    const sheetId = settings.sheetIdFlows || process.env.GOOGLE_SHEET_ID_FLOWS || '';
    
    try {
      const n8nResponse = await fetch(n8nValidatorUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(process.env.N8N_WEBHOOK_SECRET 
            ? { 'x-flowshare-secret': process.env.N8N_WEBHOOK_SECRET, 'x-api-key': process.env.N8N_WEBHOOK_SECRET } 
            : { 'x-api-key': 'your-secret-api-key-1', 'x-flowshare-secret': 'your-secret-api-key-1' }),
        },
        body: JSON.stringify({
          fileName,
          fileSize,
          mimeType: file.type || 'application/json',
          fileContent: fileText,
          sheetId,
        }),
      });

      if (n8nResponse.ok) {
        const result = await n8nResponse.json();
        return NextResponse.json(result);
      }
      
      // n8n ตอบ 400/401/429 — ส่งผลลัพธ์กลับให้ client โดยตรง (ไม่ fallback)
      let errorResult;
      try {
        errorResult = await n8nResponse.json();
      } catch {
        errorResult = { approved: false, message: `n8n returned status ${n8nResponse.status}` };
      }
      return NextResponse.json(errorResult, { status: n8nResponse.status });
      
    } catch (err) {
      console.warn('Could not reach n8n validator, falling back to local server-side parser:', err);
    }

    // 3. Local Fallback Parser (หากติดต่อ n8n ไม่ได้)
    try {
      const parsed = JSON.parse(fileText);

      if (!parsed.nodes && !parsed.connections) {
        return NextResponse.json({
          approved: false,
          message: 'ไฟล์ JSON ไม่ใช่รูปแบบ n8n workflow (ไม่พบข้อมูล nodes หรือ connections)'
        }, { status: 422 });
      }

      return NextResponse.json({
        approved: true,
        message: 'ไฟล์ผ่านการตรวจสอบโครงสร้างแล้ว (Local Server)',
        fileName,
        fileSize,
        mimeType: 'application/json',
        virusScan: 'skipped',
        checkedAt: new Date().toISOString()
      });

    } catch (e) {
      return NextResponse.json({
        approved: false,
        message: 'ไฟล์ไม่ใช่ JSON หรือเนื้อหาเสียหาย: ' + (e instanceof Error ? e.message : String(e))
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error during validation route:', error);
    return NextResponse.json({
      approved: false,
      message: 'เกิดข้อผิดพลาดภายในระบบในระหว่างการตรวจสอบไฟล์'
    }, { status: 500 });
  }
}
