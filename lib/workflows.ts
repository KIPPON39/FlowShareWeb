export interface WorkflowContributor {
  name: string;
  email?: string;
  avatar?: string;
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
  const enriched = new Set<string>(tags.map(t => t.trim()));
  const contentToSearch = `${title} ${description} ${keys.join(' ')}`.toLowerCase();

  // 1. AI Automation -> tags: 'AI'
  if (
    contentToSearch.includes('ai') ||
    contentToSearch.includes('openai') ||
    contentToSearch.includes('gpt') ||
    contentToSearch.includes('gemini') ||
    contentToSearch.includes('claude') ||
    contentToSearch.includes('llm') ||
    contentToSearch.includes('intelligence') ||
    contentToSearch.includes('sentiment')
  ) {
    enriched.add('AI');
  }

  // 2. Customer Operations -> tags: 'CRM', 'Email', 'Customer'
  if (
    contentToSearch.includes('crm') ||
    contentToSearch.includes('hubspot') ||
    contentToSearch.includes('salesforce')
  ) {
    enriched.add('CRM');
  }
  if (
    contentToSearch.includes('email') ||
    contentToSearch.includes('gmail') ||
    contentToSearch.includes('mail') ||
    contentToSearch.includes('outlook')
  ) {
    enriched.add('Email');
  }
  if (
    contentToSearch.includes('customer') ||
    contentToSearch.includes('support') ||
    contentToSearch.includes('feedback') ||
    contentToSearch.includes('client') ||
    contentToSearch.includes('chat') ||
    contentToSearch.includes('user')
  ) {
    enriched.add('Customer');
  }

  // 3. Sales & Marketing -> tags: 'Marketing', 'Sales'
  if (
    contentToSearch.includes('marketing') ||
    contentToSearch.includes('campaign') ||
    contentToSearch.includes('social') ||
    contentToSearch.includes('ad') ||
    contentToSearch.includes('twitter') ||
    contentToSearch.includes('facebook') ||
    contentToSearch.includes('instagram') ||
    contentToSearch.includes('lead')
  ) {
    enriched.add('Marketing');
  }
  if (
    contentToSearch.includes('sales') ||
    contentToSearch.includes('deal') ||
    contentToSearch.includes('revenue') ||
    contentToSearch.includes('stripe') ||
    contentToSearch.includes('payment') ||
    contentToSearch.includes('invoice')
  ) {
    enriched.add('Sales');
  }

  // 4. Data Engineering -> tags: 'Data', 'Scraping', 'Analytics'
  if (
    contentToSearch.includes('data') ||
    contentToSearch.includes('database') ||
    contentToSearch.includes('sql') ||
    contentToSearch.includes('postgres') ||
    contentToSearch.includes('notion') ||
    contentToSearch.includes('sheet') ||
    contentToSearch.includes('excel') ||
    contentToSearch.includes('airtable')
  ) {
    enriched.add('Data');
  }
  if (
    contentToSearch.includes('scraping') ||
    contentToSearch.includes('scraper') ||
    contentToSearch.includes('scrape') ||
    contentToSearch.includes('crawl') ||
    contentToSearch.includes('crawler') ||
    contentToSearch.includes('web')
  ) {
    enriched.add('Scraping');
  }
  if (
    contentToSearch.includes('analytics') ||
    contentToSearch.includes('dashboard') ||
    contentToSearch.includes('report') ||
    contentToSearch.includes('metric') ||
    contentToSearch.includes('monitor')
  ) {
    enriched.add('Analytics');
  }

  // 5. DevOps & Git -> tags: 'DevOps', 'Git', 'Integration'
  if (
    contentToSearch.includes('devops') ||
    contentToSearch.includes('docker') ||
    contentToSearch.includes('kubernetes') ||
    contentToSearch.includes('ci/cd') ||
    contentToSearch.includes('cloud') ||
    contentToSearch.includes('deploy') ||
    contentToSearch.includes('server')
  ) {
    enriched.add('DevOps');
  }
  if (
    contentToSearch.includes('git') ||
    contentToSearch.includes('github') ||
    contentToSearch.includes('gitlab') ||
    contentToSearch.includes('commit') ||
    contentToSearch.includes('repo')
  ) {
    enriched.add('Git');
  }
  if (
    contentToSearch.includes('integration') ||
    contentToSearch.includes('sync') ||
    contentToSearch.includes('bridge') ||
    contentToSearch.includes('webhook') ||
    contentToSearch.includes('api')
  ) {
    enriched.add('Integration');
  }

  // 6. Financial Ops -> tags: 'Finance'
  if (
    contentToSearch.includes('finance') ||
    contentToSearch.includes('stripe') ||
    contentToSearch.includes('payment') ||
    contentToSearch.includes('revenue') ||
    contentToSearch.includes('billing') ||
    contentToSearch.includes('invoice') ||
    contentToSearch.includes('accounting') ||
    contentToSearch.includes('subscription')
  ) {
    enriched.add('Finance');
  }

  return Array.from(enriched);
}

export function slugifyWorkflowTitle(title: string) {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  return slug || `workflow-${Date.now()}`;
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
