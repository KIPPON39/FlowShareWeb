import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function unescapeUnicode(str: string) {
  return str.replace(/\\u([0-9a-fA-F]{4})/g, (match, grp) => {
    return String.fromCharCode(parseInt(grp, 16));
  });
}

function cleanAndParseGeminiResponse(rawText: string) {
  const cleaned = rawText.replace(/```json|```/g, '').trim();
  
  // 1. Try standard JSON parse
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === 'object') {
      const keysList = Object.keys(parsed);
      
      // ค้นหาคีย์สำหรับ description (รองรับภาษาไทยกรณี AI แปลคีย์)
      let descKey = keysList.find(k => k.toLowerCase() === 'description');
      if (!descKey && keysList.length > 0) {
        descKey = keysList.find(k => 
          k.toLowerCase().includes('desc') || 
          k.includes('อธิบาย') || 
          k.includes('รายละเอียด') || 
          k.includes('สรุป')
        );
        if (!descKey) descKey = keysList[0]; // ใช้คีย์แรกเป็นตัวเลือกสำรอง
      }
      
      let desc = '';
      if (descKey) {
        const val = parsed[descKey];
        if (typeof val === 'string') {
          desc = val;
        } else if (typeof val === 'object' && val !== null) {
          desc = val.description || val.text || JSON.stringify(val);
        }
      }
      
      // ค้นหาคีย์สำหรับ howToUse (รองรับภาษาไทยกรณี AI แปลคีย์)
      let howToUseKey = keysList.find(k => k.toLowerCase() === 'howtouse');
      if (!howToUseKey && keysList.length > 1) {
        howToUseKey = keysList.find(k => 
          k.toLowerCase().includes('use') || 
          k.toLowerCase().includes('how') || 
          k.includes('ขั้นตอน') || 
          k.includes('วิธี')
        );
        if (!howToUseKey) {
          howToUseKey = keysList.find(k => k !== descKey) || keysList[1];
        }
      }
      
      let steps: string[] = [];
      if (howToUseKey) {
        const val = parsed[howToUseKey];
        if (Array.isArray(val)) {
          steps = val.map((s: any) => String(s));
        } else if (typeof val === 'string') {
          steps = [val];
        }
      }
      
      return {
        description: desc.trim(),
        howToUse: steps
      };
    }
  } catch (e) {
    console.warn('Standard JSON parse failed, trying regex extraction...', e);
  }

  // 2. Regex fallback if JSON parsing fails (พร้อมรองรับการสกัด Unicode และคีย์ภาษาไทย)
  let description = '';
  const descRegex = /"(description|คำอธิบาย|รายละเอียด|สรุป)"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/i;
  const descMatch = cleaned.match(descRegex);
  if (descMatch && descMatch[2]) {
    description = unescapeUnicode(descMatch[2])
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t');
  } else {
    const looseDescRegex = /"(description|คำอธิบาย|รายละเอียด|สรุป)"\s*:\s*([^,}\]]+)/i;
    const looseDescMatch = cleaned.match(looseDescRegex);
    if (looseDescMatch && looseDescMatch[2]) {
      description = unescapeUnicode(looseDescMatch[2].trim().replace(/^["']|["']$/g, ''));
    }
  }

  let howToUse: string[] = [];
  const howToUseRegex = /"(howToUse|ขั้นตอน|วิธีใช้งาน|วิธีการใช้งาน)"\s*:\s*\[([\s\S]*?)\]/i;
  const howToUseMatch = cleaned.match(howToUseRegex);
  if (howToUseMatch && howToUseMatch[2]) {
    const arrayContent = howToUseMatch[2];
    const stringMatches = Array.from(arrayContent.matchAll(/"([^"\\]*(?:\\.[^"\\]*)*)"/g));
    for (const m of stringMatches) {
      if (m[1]) {
        howToUse.push(
          unescapeUnicode(m[1])
            .replace(/\\"/g, '"')
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
        );
      }
    }
  }

  // If both failed to extract anything useful, clean any JSON structure from rawText
  if (!description && !howToUse.length) {
    let plainText = cleaned
      .replace(/\{([\s\S]*?)\}/g, '$1')
      .replace(/"(description|คำอธิบาย|รายละเอียด|สรุป)"\s*:\s*/gi, '')
      .replace(/"(howToUse|ขั้นตอน|วิธีใช้งาน|วิธีการใช้งาน)"\s*:\s*/gi, '')
      .replace(/[\[\]"{}]/g, '')
      .replace(/^\s*,/gm, '')
      .trim();
    
    description = plainText.split('\n')[0] || plainText;
  }

  return {
    description: description.trim(),
    howToUse: howToUse.filter(Boolean)
  };
}

export async function POST(request: Request) {
  try {
    const { sessionId, topic, context, language } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ success: false, message: 'ไม่พบ sessionId' }, { status: 400 });
    }

    const isThaiLang = language === 'th';

    // 1. พยายามเรียก n8n generator webhook
    const n8nGeneratorUrl = process.env.N8N_GENERATOR_WEBHOOK_URL || 'http://localhost:5678/webhook/generate-description';

    const { getAdminSettings } = await import('@/lib/admin-settings');
    const settings = getAdminSettings();
    const sheetId = settings.sheetIdFlows || process.env.GOOGLE_SHEET_ID_FLOWS || '';

    function cleanDescription(desc: string, currentTopic: string) {
        if (!desc || !currentTopic) return desc;
        const escapedTopic = currentTopic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(
            `(?:ระบบอัตโนมัติ\\s*n8n|ระบบอัตโนมัติ|Workflow\\s*นี้|Workflow|The n8n automation system|This workflow|The workflow)?\\s*["']?${escapedTopic}["']?\\s*(?:ถูกออกแบบมาเพื่อ|ออกแบบมาเพื่อ|มีจุดประสงค์เพื่อ|ช่วยให้|ช่วย|คือ|เป็น|is designed to|is created to|helps to|is)?`, 
            'gi'
        );
        let cleaned = desc.replace(pattern, '').trim();
        cleaned = cleaned.replace(/^[\s,;:-]+/, ''); // Remove leading punctuation
        if (cleaned.length > 0) {
            cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        }
        return cleaned;
    }

    try {
      const n8nResponse = await fetch(n8nGeneratorUrl, {
        method: 'POST',
        headers: { 
          'content-type': 'application/json',
          ...(process.env.N8N_WEBHOOK_SECRET 
            ? { 'x-flowshare-secret': process.env.N8N_WEBHOOK_SECRET, 'x-api-key': process.env.N8N_WEBHOOK_SECRET } 
            : { 'x-api-key': 'your-secret-api-key-1', 'x-flowshare-secret': 'your-secret-api-key-1' }),
        },
        body: JSON.stringify({ sessionId, topic, context, language, sheetId }),
      });

      if (n8nResponse.ok) {
        const result = await n8nResponse.json();
        // Check if n8n returned a parse error or if it failed to get a proper description
        const hasParseError = result && Array.isArray(result.howToUse) && 
          result.howToUse.some((step: string) => step.includes('ไม่สามารถ parse') || step.includes('กรุณาลองใหม่'));
        
        if (!hasParseError && result.description && result.description.length >= 200) {
          result.description = cleanDescription(result.description, topic);
          return NextResponse.json(result);
        }
        console.warn('n8n returned a parse error, an incomplete response, or an empty description. Falling back to direct Gemini API.');
      } else {
        console.warn(`n8n generator webhook returned status ${n8nResponse.status}. Falling back to direct Gemini API.`);
      }
    } catch (err) {
      console.warn('Could not reach n8n generator, falling back to direct Gemini API:', err);
    }

    // 2. Direct Gemini Fallback (หากติดต่อ n8n ไม่ได้)
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json({
        success: false,
        message: 'ไม่สามารถติดต่อ n8n ได้ และไม่ได้ระบุ GEMINI_API_KEY ในระบบ'
      }, { status: 500 });
    }

    // ── Structured prompt ──
    // description = สรุปสั้นๆ (แค่ "Flow นี้ทำอะไร") → จะแสดงในช่อง Description
    // howToUse = ขั้นตอนการ Setup / Customize → จะแสดงใน Pipeline Steps
    const fullPrompt = isThaiLang
      ? `คุณคือผู้เชี่ยวชาญด้านระบบอัตโนมัติและนักเขียนเทคนิคระดับมืออาชีพ ภาษาไทย
ฉันมี n8n automation workflow ชื่อ "${topic}" ต้องการให้คุณเขียนคำอธิบายและขั้นตอนอย่างมืออาชีพ

ข้อมูลโหนดและ Credentials ของ workflow:
${context || 'ไม่ได้ระบุ'}

กรุณาสร้างเนื้อหาทั้งหมดเป็น **ภาษาไทย** โดยมีข้อกำหนดดังนี้อย่างเคร่งครัด:
1. **คีย์ "description" ต้องมีความยาวอย่างน้อย 200-500 คำ** (อธิบายกระบวนการทำงานแบบละเอียด ประโยชน์ ผู้ใช้ที่เหมาะสม ปัญหาที่แก้ไขได้ และตัวอย่างสถานการณ์การใช้งาน — ห้ามย่อกระชับเกินไป ต้องให้ข้อมูลเชิงลึกที่เป็นประโยชน์)
2. **ห้ามแปลชื่อคีย์ใน JSON เด็ดขาด!** ต้องใช้คีย์ภาษาอังกฤษ "description" และ "howToUse" ตามโครงสร้าง JSON ด้านล่างเท่านั้น
3. **ห้ามกล่าวถึงหรือทวนชื่อ Workflow ในเนื้อหาคำอธิบายเด็ดขาด** (เช่น ห้ามพูดว่า "ระบบอัตโนมัติ n8n [ชื่อโฟลว] ถูกออกแบบมา...") ให้เริ่มอธิบายประเด็นและเนื้อหาสำคัญได้เลย
4. ผลลัพธ์ต้องตอบกลับเฉพาะ JSON ที่ถูกต้องสมบูรณ์แบบเท่านั้น ห้ามใส่ markdown block (เช่น \`\`\`json) และไม่มีข้อความเกริ่นนำหรือท้ายเรื่องใดๆ ทั้งสิ้น

## โครงสร้าง JSON ที่คุณต้องตอบกลับ:
{
  "description": "คำอธิบายความยาว 200-500 คำในภาษาไทย...",
  "howToUse": ["ขั้นตอนที่ 1...", "ขั้นตอนที่ 2..."]
}`
      : `You are a professional technical writer and automation expert.
I have an n8n automation workflow titled "${topic}". Write a professional description and setup steps.

Workflow node data & credentials:
${context || 'Not specified'}

Generate ALL content in **English** following this structure strictly:
1. **The "description" key MUST be 200-500 words long** (detailed, comprehensive, explaining the workflow process, who it's for, the problems it solves, use-case scenarios, and the value it brings — do NOT be too brief).
2. The response MUST be valid JSON using the English keys: "description" and "howToUse".
3. **Do NOT mention or repeat the workflow title in the description.** Start directly with explaining the concept, what it does, and how it works.
4. Return ONLY valid JSON. No conversational text, no markdown wrappers (like \`\`\`json), just raw JSON.

## JSON structure to return:
{
  "description": "Detailed description of 200-500 words in English...",
  "howToUse": ["Step 1...", "Step 2..."]
}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: fullPrompt }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 2500,
          temperature: 0.35,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API returned error status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let parsed = { description: '', howToUse: [] as string[] };
    try {
      parsed = cleanAndParseGeminiResponse(rawText);
    } catch {
      console.error('Failed to parse Gemini response text as JSON:', rawText);
      throw new Error(isThaiLang
        ? 'ไม่สามารถแยกวิเคราะห์ข้อมูลผลลัพธ์จาก AI ได้'
        : 'Could not parse AI response');
    }

    return NextResponse.json({
      success: true,
      description: cleanDescription(parsed.description || '', topic),
      howToUse: parsed.howToUse || [],
      quota: {
        used: 1,
        limit: 5,
        remaining: 4
      },
      tokenUsage: {
        totalTokens: data?.usageMetadata?.totalTokenCount || 0
      },
      source: 'Direct Gemini API Fallback'
    });

  } catch (error) {
    console.error('Error in generate description route:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเจเนอเรตคำอธิบายด้วย AI'
    }, { status: 500 });
  }
}
