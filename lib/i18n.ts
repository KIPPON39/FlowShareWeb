'use client';

import { createContext, useContext } from 'react';

export type Language = 'th' | 'en';

export interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

export const I18nContext = createContext<I18nContextType>({
  lang: 'th',
  setLang: () => {},
  t: (key: string) => key,
});

export function useI18n() {
  return useContext(I18nContext);
}

export const translations: Record<Language, Record<string, string>> = {
  th: {
    // Navbar
    'nav.explore': 'สำรวจ',
    'nav.create': 'สร้าง',

    // Hero
    'hero.title.1': 'เทมเพลต',
    'hero.title.2': 'ระบบอัตโนมัติ',
    'hero.title.3': 'สำหรับทุกทีม',
    'hero.search': 'ค้นหา automation flows...',
    'hero.ecosystem': 'สำรวจระบบนิเวศของเรา',
    'hero.flows_live': 'flows ที่ใช้งานอยู่',

    // Main page
    'main.collections': 'คอลเลกชัน',
    'main.all_templates': 'เทมเพลตทั้งหมด',
    'main.build_together': 'สร้างร่วมกัน',
    'main.build_together_desc': 'FlowShare สร้างจากรูปแบบการทำงานอัตโนมัติที่ขับเคลื่อนโดยชุมชน',
    'main.submit_template': 'ส่งเทมเพลต',
    'main.browse_templates': 'เรียกดูเทมเพลต',
    'main.browse_desc': 'บล็อคสำเร็จรูปพร้อมใช้งานสำหรับสแต็คของคุณ',
    'main.syncing': 'กำลังซิงค์เทมเพลต...',
    'main.showing': 'แสดง',
    'main.templates': 'เทมเพลต',
    'main.no_workflows': 'ยังไม่มี workflow จาก Google Sheet',
    'main.no_workflows_desc': 'อัปโหลด JSON workflow จากหน้าสร้าง หรือตรวจสอบว่า n8n list webhook ส่งข้อมูล workflows array กลับมา',
    'main.footer': 'เทมเพลตพร้อมใช้งาน สำหรับนักพัฒนา โดย FlowShare',

    // Upload section
    'upload.title': 'สร้าง Flow ใหม่',
    'upload.subtitle': 'ชัดเจนก่อนซับซ้อน กำหนดตรรกะอัตโนมัติของคุณ',
    'upload.basic_info': 'ข้อมูลพื้นฐาน',
    'upload.drop_json': 'วาง JSON workflow ของคุณ',
    'upload.browse': 'เลือกไฟล์',
    'upload.auto_extract': 'เราจะดึง steps และ credentials ให้อัตโนมัติ',
    'upload.flow_title': 'ชื่อ Flow (เช่น AI Renewal Health Monitor)',
    'upload.flow_desc': 'สรุปสั้นๆ Flow นี้แก้ปัญหาอะไร?',
    'upload.tags': 'แท็ก (กด Enter เพื่อเพิ่ม)',
    'upload.tags_placeholder': 'เลือกหมวดหมู่ที่เกี่ยวข้อง (จำเป็น)',
    'upload.select_tags_first': 'โปรดเลือกอย่างน้อย 1 แท็กก่อนส่ง',
    'upload.team': 'ทีม Workflow',
    'upload.creator_email': 'อีเมลผู้สร้าง (จำเป็น)',
    'upload.creator': 'ผู้สร้าง',
    'upload.contributor': 'ผู้ร่วม',
    'upload.invite': 'เชิญด้วยอีเมล (เช่น teammate@flow.com)',
    'upload.backend': 'เชื่อมต่อ Backend',
    'upload.backend_desc': 'Workflow นี้จะซิงค์อัตโนมัติกับ',
    'upload.backend_desc2': 'เพื่อจัดการคำขอ Download และ Speaker อย่างปลอดภัย',
    'upload.pipeline': 'ขั้นตอน Pipeline',
    'upload.step_do': 'ขั้นตอนนี้ทำอะไร?',
    'upload.assign_node': 'กำหนด NODE (เช่น GEMINI AI)',
    'upload.add_step': 'เพิ่มขั้นตอน',
    'upload.credentials': 'Credentials ที่ต้องการ',
    'upload.add_key': 'ขาด key? เพิ่มที่นี่ (เช่น Stripe API)',
    'upload.live_profile': 'โปรไฟล์สด',
    'upload.draft': 'แบบร่าง',
    'upload.public_schema': 'PUBLIC SCHEMA v1.0',
    'upload.pipeline_summary': 'สรุป Flow Pipeline',
    'upload.define_steps': 'กำหนดขั้นตอนในตัวแก้ไขเพื่อดูที่นี่...',
    'upload.required_creds': 'Credentials ที่ต้องการ',
    'upload.upload_json_creds': 'อัปโหลด JSON หรือเพิ่ม credentials เพื่อดูที่นี่...',
    'upload.contributors': 'ผู้ร่วมสร้าง Flow',
    'upload.persons_assigned': 'คนที่ได้รับมอบหมายใน flow นี้',
    'upload.add_creator': 'เพิ่มอีเมลผู้สร้างก่อนส่ง flow นี้',
    'upload.json_imported': 'นำเข้า JSON แล้ว ตรวจสอบตัวอย่าง แล้วส่งไปยัง Google Sheet ผ่าน n8n',
    'upload.sending': 'กำลังส่ง workflow ไปยัง n8n...',
    'upload.saved': 'บันทึกแล้ว n8n ได้รับข้อมูลและสามารถเพิ่มไปยัง Google Sheet ได้แล้ว',
    'upload.shipping': 'กำลังส่ง...',
    'upload.ship_workflow': 'ส่ง Workflow',
    'upload.upload_json_first': 'อัปโหลด JSON workflow ก่อนส่ง',
    'upload.add_email_first': 'เพิ่มอีเมลผู้สร้างก่อนส่ง',
    'upload.add_title_desc': 'เพิ่มชื่อและรายละเอียดก่อนส่ง',

    // Workflow card
    'card.nodes': 'โหนด',
    'card.contributors': 'ผู้ร่วมสร้าง',
    'card.required_env': 'สภาพแวดล้อมที่ต้องการ',
    'card.download': 'ดาวน์โหลด Flow',
    'card.invite_speaker': 'เชิญ Speaker',
    'card.view': 'ดู',

    // Workflow detail
    'detail.featured': 'แนะนำ',
    'detail.automation': 'อัตโนมัติ',
    'detail.views': 'ผู้เข้าชม',
    'detail.download': 'ดาวน์โหลด Flow',
    'detail.invite': 'เชิญ Speaker',
    'detail.overview': 'ภาพรวม',
    'detail.technical': 'สเปคเทคนิค',
    'detail.brief': 'คำอธิบาย',
    'detail.read_more': 'อ่านเพิ่มเติม',
    'detail.collapse': 'ย่อ',
    'detail.pipeline': 'ไปป์ไลน์',
    'detail.show_less': 'แสดงน้อยลง',
    'detail.view_full': 'ดูทั้งหมด',
    'detail.credentials': 'Credentials',
    'detail.all': 'ทั้งหมด',
    'detail.less': 'น้อยลง',
    'detail.team': 'ทีม Workflow',
    'detail.automated_bridge': 'สะพานอัตโนมัติ',
    'detail.bridge_desc': 'คำขอถูกจัดการผ่าน',
    'detail.bridge_desc2': 'และบันทึกใน',
    'detail.arch': 'สถาปัตยกรรม Workflow',
    'detail.arch_desc': 'Flow นี้เชื่อมต่อข้อมูล edge ผ่าน n8n ไปยัง Google Sheets สำหรับการบันทึกถาวรและ audit logging',
    'detail.backend_sync': 'ซิงค์ Backend',
    'detail.data_dest': 'ปลายทางข้อมูล',
    'detail.error_handling': 'จัดการข้อผิดพลาด',
    'detail.json_preview': 'JSON / YAML Preview',
    'detail.node': 'โหนด',

    // Breadcrumb
    'breadcrumb.go_back': 'ย้อนกลับ',
    'breadcrumb.creator_space': 'พื้นที่ผู้สร้าง',
    'breadcrumb.new_workflow': 'Workflow ใหม่',
    'breadcrumb.workflows': 'Workflows',
    'breadcrumb.detail': 'รายละเอียด',

    // Loading
    'loading.title': 'กำลังโหลด',
    'loading.subtitle': 'กำลังเตรียมพื้นที่ทำงานของคุณ',
  },
  en: {
    // Navbar
    'nav.explore': 'Explore',
    'nav.create': 'Create',

    // Hero
    'hero.title.1': 'Automation',
    'hero.title.2': 'Templates',
    'hero.title.3': 'for every team',
    'hero.search': 'Search automation flows...',
    'hero.ecosystem': 'Explore Our Ecosystem',
    'hero.flows_live': 'flows live',

    // Main page
    'main.collections': 'Collections',
    'main.all_templates': 'All Templates',
    'main.build_together': 'Build Together',
    'main.build_together_desc': 'FlowShare is built on community-driven automation patterns.',
    'main.submit_template': 'Submit Template',
    'main.browse_templates': 'Browse Templates',
    'main.browse_desc': 'Ready-to-use building blocks for your stack.',
    'main.syncing': 'Syncing templates...',
    'main.showing': 'Showing',
    'main.templates': 'templates',
    'main.no_workflows': 'No workflows from Google Sheet yet',
    'main.no_workflows_desc': 'Upload a JSON workflow from the Create page, or check that your n8n list webhook returns a workflows array.',
    'main.footer': 'Workspace-ready, developer-first templates with FlowShare.',

    // Upload section
    'upload.title': 'Ship New Flow',
    'upload.subtitle': 'Clarity before complexity. Define your automation logic.',
    'upload.basic_info': 'Basic Information',
    'upload.drop_json': 'Drop your JSON workflow',
    'upload.browse': 'browse',
    'upload.auto_extract': "We'll automatically extract steps and credentials.",
    'upload.flow_title': 'Flow Title (e.g. AI Renewal Health Monitor)',
    'upload.flow_desc': 'The executive summary. What problem does this solve?',
    'upload.tags': 'Tags (press Enter to add)',
    'upload.tags_placeholder': 'Select categories (required)',
    'upload.select_tags_first': 'Please select at least 1 tag before shipping.',
    'upload.team': 'Workflow Team',
    'upload.creator_email': 'Creator email (required)',
    'upload.creator': 'Creator',
    'upload.contributor': 'Contributor',
    'upload.invite': 'Invite by email (e.g. teammate@flow.com)',
    'upload.backend': 'Backend Bridge',
    'upload.backend_desc': 'This workflow will be automatically synced with',
    'upload.backend_desc2': 'to handle Download & Speaker requests securely.',
    'upload.pipeline': 'Pipeline Steps',
    'upload.step_do': 'What should this step do?',
    'upload.assign_node': 'ASSIGN NODE (E.G. GEMINI AI)',
    'upload.add_step': 'Add Step',
    'upload.credentials': 'Required Credentials',
    'upload.add_key': 'Missing a key? Add it here (e.g. Stripe API)',
    'upload.live_profile': 'Live Profile',
    'upload.draft': 'Draft',
    'upload.public_schema': 'PUBLIC SCHEMA v1.0',
    'upload.pipeline_summary': 'Flow Pipeline Summary',
    'upload.define_steps': 'Define steps in the editor to see them here...',
    'upload.required_creds': 'Required Credentials',
    'upload.upload_json_creds': 'Upload JSON or add credentials to see them here...',
    'upload.contributors': 'Flow Contributors',
    'upload.persons_assigned': 'person(s) assigned to this flow',
    'upload.add_creator': 'Add a creator email before shipping this flow',
    'upload.json_imported': 'JSON imported. Review the preview, then ship it to Google Sheet via n8n.',
    'upload.sending': 'Sending workflow to n8n...',
    'upload.saved': 'Saved. n8n received it and can append it to Google Sheet now.',
    'upload.shipping': 'Shipping...',
    'upload.ship_workflow': 'Ship Workflow',
    'upload.upload_json_first': 'Upload a JSON workflow before shipping.',
    'upload.add_email_first': 'Add the creator email before shipping.',
    'upload.add_title_desc': 'Add a title and description before shipping.',

    // Workflow card
    'card.nodes': 'Nodes',
    'card.contributors': 'Contributors',
    'card.required_env': 'Required Environment',
    'card.download': 'Download Flow',
    'card.invite_speaker': 'Invite Speaker',
    'card.view': 'View',

    // Workflow detail
    'detail.featured': 'Featured',
    'detail.automation': 'Automation',
    'detail.views': 'Views',
    'detail.download': 'Download Flow',
    'detail.invite': 'Invite Speaker',
    'detail.overview': 'Overview',
    'detail.technical': 'Technical Specs',
    'detail.brief': 'Brief',
    'detail.read_more': 'Read More',
    'detail.collapse': 'Collapse',
    'detail.pipeline': 'Pipeline',
    'detail.show_less': 'Show Less',
    'detail.view_full': 'View Full',
    'detail.credentials': 'Credentials',
    'detail.all': 'All',
    'detail.less': 'Less',
    'detail.team': 'Workflow Team',
    'detail.automated_bridge': 'Automated Bridge',
    'detail.bridge_desc': 'Requests are handled via',
    'detail.bridge_desc2': '& recorded in',
    'detail.arch': 'Workflow Architecture',
    'detail.arch_desc': 'This flow bridges edge data via n8n to Google Sheets for permanent record keeping and audit logging.',
    'detail.backend_sync': 'Backend Sync',
    'detail.data_dest': 'Data Destination',
    'detail.error_handling': 'Error Handling',
    'detail.json_preview': 'JSON / YAML Preview',
    'detail.node': 'Node',

    // Breadcrumb
    'breadcrumb.go_back': 'Go Back',
    'breadcrumb.creator_space': 'Creator Space',
    'breadcrumb.new_workflow': 'New Workflow',
    'breadcrumb.workflows': 'Workflows',
    'breadcrumb.detail': 'Detail View',

    // Loading
    'loading.title': 'Loading',
    'loading.subtitle': 'Preparing your workspace',
  },
};

export function getTranslation(lang: Language) {
  const dict = translations[lang];
  return (key: string) => dict[key] || key;
}
