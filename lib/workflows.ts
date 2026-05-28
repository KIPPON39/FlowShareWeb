export interface WorkflowContributor {
  name: string;
  email?: string;
  avatar?: string;
  imageUrl?: string;
}

export interface WorkflowStep {
  id?: string;
  title: string;
  nodeName: string;
}

export interface WorkflowTemplate {
  id: string;
  title: string;
  description: string;
  tags: string[];
  keys: string[];
  creators: WorkflowContributor[];
  nodes?: number;
  views?: number;
  downloads?: number;
  updatedAt?: string;
  steps?: WorkflowStep[];
  rawJson?: Record<string, any>;
  jsonFileUrl?: string;
  createdAt?: string;
}

export interface CategoryMapping {
  en: string;
  th: string;
  tags: string[];
}

/** Centralized category filter definitions — single source of truth */
export const CATEGORY_MAPPINGS: CategoryMapping[] = [
  { en: 'All Templates', th: 'เทมเพลตทั้งหมด', tags: [] },
  { en: 'AI Automation', th: 'AI อัตโนมัติ', tags: ['AI'] },
  { en: 'Customer Operations', th: 'ปฏิบัติการลูกค้า', tags: ['CRM', 'Email', 'Customer'] },
  { en: 'Sales & Marketing', th: 'การขายและการตลาด', tags: ['Marketing', 'Sales'] },
  { en: 'Data Engineering', th: 'วิศวกรรมข้อมูล', tags: ['Data', 'Scraping', 'Analytics'] },
  { en: 'DevOps & Git', th: 'DevOps & Git', tags: ['DevOps', 'Git', 'Integration'] },
  { en: 'Financial Ops', th: 'การเงิน', tags: ['Finance'] },
];

export const SAMPLE_WORKFLOWS: WorkflowTemplate[] = [
  {
    id: 'gmail-triage',
    title: 'Customer Support Triage with Sentiment Analysis',
    description: 'Automatically analyze incoming Gmail support requests using OpenAI, tag by sentiment, and route to the correct team.',
    tags: ['AI', 'Gmail', 'Support', 'Customer', 'Email', 'Integration'],
    keys: ['OpenAI', 'Gmail API'],
    creators: [{ name: 'Jordan Kim' }, { name: 'Alex' }, { name: 'Sam' }],
    nodes: 5,
    views: 1250,
    downloads: 340,
    updatedAt: '2026-05-12T10:00:00Z',
  },
  {
    id: 'revenue-alerts',
    title: 'Real-time Revenue Monitoring to Slack',
    description: 'Stay on top of your business health. Sync Stripe subscription events directly to a dedicated Slack channel with daily growth reports.',
    tags: ['Finance', 'Slack', 'Ops', 'Sales', 'Customer', 'Integration'],
    keys: ['Stripe', 'Slack Bot'],
    creators: [{ name: 'Priya Desai' }, { name: 'John Doe' }],
    nodes: 3,
    views: 840,
    downloads: 125,
    updatedAt: '2026-05-10T14:30:00Z',
  },
  {
    id: 'landing-tracker',
    title: 'Competitor Intelligence & Website Tracking',
    description: 'Monitor competitor landing pages weekly. Automatically scrape changes and summarize technical shifts using GPT-4o.',
    tags: ['Scraping', 'AI', 'Marketing', 'Data', 'Analytics'],
    keys: ['OpenAI', 'Crawler API'],
    creators: [{ name: 'Ren Ito' }],
    nodes: 4,
    views: 320,
    downloads: 42,
    updatedAt: '2026-05-01T09:15:00Z',
  },
  {
    id: 'feedback-notion',
    title: 'User Feedback Aggregator to Notion',
    description: 'Collect user reviews and feedback from various sources, clean the data with AI, and maintain an organized roadmap in Notion.',
    tags: ['AI', 'Notion', 'Product', 'Data', 'Customer', 'Integration'],
    keys: ['OpenAI', 'Notion API'],
    creators: [{ name: 'Elisa Gomez' }, { name: 'Bob' }, { name: 'Alice' }, { name: 'Eve' }],
    nodes: 6,
    views: 156,
    downloads: 18,
    updatedAt: '2026-04-28T16:45:00Z',
  },
];

export function enrichWorkflowTags(title: string, description: string, keys: string[], tags: string[]): string[] {
  // Just return the original tags provided by the user.
  // We no longer auto-enrich based on keywords to respect the exact tags selected during creation.
  const uniqueTags = new Set<string>(tags.map(t => t.trim()));
  
  if (uniqueTags.size === 0) {
    uniqueTags.add('Community');
  }

  return Array.from(uniqueTags);
}

export function slugifyWorkflowTitle(title: string) {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  return slug || `workflow-${Date.now()}`;
}

/**
 * Generate a unique Flow ID: FW-YYMMDD-XXXXXXXX
 * e.g. FW-260527-A1B2C3D4
 */
export function generateFlowId(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const rand = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID().split('-')[0].toUpperCase() 
    : Math.random().toString(36).substring(2, 10).toUpperCase().padStart(8, '0');
  return `FW-${yy}${mm}${dd}-${rand}`;
}

export function normalizeList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).map(cleanListItem).filter(Boolean);
  }

  if (typeof value === 'string') {
    // Strip outer brackets like ["foo","bar"]
    const cleaned = value.replace(/^\[|\]$/g, '');
    return cleaned.split(',').map(cleanListItem).filter(Boolean);
  }

  return [];
}

function cleanListItem(item: string): string {
  return item
    .trim()
    .replace(/^["'\[]+|["'\]]+$/g, '')
    .trim();
}
