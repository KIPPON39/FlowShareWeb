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
  rawJson?: unknown;
  jsonFileUrl?: string;
  createdAt?: string;
}

export const SAMPLE_WORKFLOWS: WorkflowTemplate[] = [
  {
    id: 'gmail-triage',
    title: 'Customer Support Triage with Sentiment Analysis',
    description: 'Automatically analyze incoming Gmail support requests using OpenAI, tag by sentiment, and route to the correct team.',
    tags: ['AI', 'Gmail', 'Support'],
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
    tags: ['Finance', 'Slack', 'Ops'],
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
    tags: ['Scraping', 'AI', 'Marketing'],
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
    tags: ['AI', 'Notion', 'Product'],
    keys: ['OpenAI', 'Notion API'],
    creators: [{ name: 'Elisa Gomez' }, { name: 'Bob' }, { name: 'Alice' }, { name: 'Eve' }],
    nodes: 6,
    views: 156,
    downloads: 18,
    updatedAt: '2026-04-28T16:45:00Z',
  },
];

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
