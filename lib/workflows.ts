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
    creators: [{ name: 'Jordan Kim' }],
    nodes: 5,
  },
  {
    id: 'revenue-alerts',
    title: 'Real-time Revenue Monitoring to Slack',
    description: 'Stay on top of your business health. Sync Stripe subscription events directly to a dedicated Slack channel with daily growth reports.',
    tags: ['Finance', 'Slack', 'Ops'],
    keys: ['Stripe', 'Slack Bot'],
    creators: [{ name: 'Priya Desai' }],
    nodes: 3,
  },
  {
    id: 'landing-tracker',
    title: 'Competitor Intelligence & Website Tracking',
    description: 'Monitor competitor landing pages weekly. Automatically scrape changes and summarize technical shifts using GPT-4o.',
    tags: ['Scraping', 'AI', 'Marketing'],
    keys: ['OpenAI', 'Crawler API'],
    creators: [{ name: 'Ren Ito' }],
    nodes: 4,
  },
  {
    id: 'feedback-notion',
    title: 'User Feedback Aggregator to Notion',
    description: 'Collect user reviews and feedback from various sources, clean the data with AI, and maintain an organized roadmap in Notion.',
    tags: ['AI', 'Notion', 'Product'],
    keys: ['OpenAI', 'Notion API'],
    creators: [{ name: 'Elisa Gomez' }],
    nodes: 6,
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
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [];
}
