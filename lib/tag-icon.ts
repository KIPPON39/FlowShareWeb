export function getIconBgFromTag(tag?: string) {
  if (!tag) return '/icons_pack/14_Other.svg';
  const normalized = tag.toLowerCase().replace(/[^a-z0-9]+/g, '');

  if (normalized === 'email' || normalized === 'gmail') return '/icons_pack/03_Email.svg';
  if (normalized === 'ai' || normalized === 'openai' || normalized === 'openaiapi') return '/icons_pack/01_AI.svg';
  if (normalized === 'crm') return '/icons_pack/02_CRM.svg';
  if (normalized === 'customer' || normalized === 'support') return '/icons_pack/04_Customer.svg';
  if (normalized === 'marketing') return '/icons_pack/05_Marketing.svg';
  if (normalized === 'sales' || normalized === 'sale') return '/icons_pack/06_Sales.svg';
  if (normalized === 'data') return '/icons_pack/07_Data.svg';
  if (normalized === 'scraping' || normalized === 'crawler') return '/icons_pack/08_Scraping.svg';
  if (normalized === 'analytics' || normalized === 'analytic') return '/icons_pack/09_Analytics.svg';
  if (normalized === 'devops') return '/icons_pack/10_DevOps.svg';
  if (normalized === 'git') return '/icons_pack/11_Git.svg';
  if (normalized === 'integration' || normalized === 'api') return '/icons_pack/12_Integration.svg';
  if (normalized === 'finance' || normalized === 'stripe') return '/icons_pack/13_Finance.svg';

  const t = normalized;
  if (t.includes('email') || t.includes('gmail')) return '/icons_pack/03_Email.svg';
  if (t.includes('ai')) return '/icons_pack/01_AI.svg';
  if (t.includes('crm')) return '/icons_pack/02_CRM.svg';
  if (t.includes('customer') || t.includes('support')) return '/icons_pack/04_Customer.svg';
  if (t.includes('marketing')) return '/icons_pack/05_Marketing.svg';
  if (t.includes('sale')) return '/icons_pack/06_Sales.svg';
  if (t.includes('data')) return '/icons_pack/07_Data.svg';
  if (t.includes('scraping') || t.includes('crawler')) return '/icons_pack/08_Scraping.svg';
  if (t.includes('analytic')) return '/icons_pack/09_Analytics.svg';
  if (t.includes('devops')) return '/icons_pack/10_DevOps.svg';
  if (t.includes('git')) return '/icons_pack/11_Git.svg';
  if (t.includes('integration') || t.includes('api')) return '/icons_pack/12_Integration.svg';
  if (t.includes('finance') || t.includes('stripe')) return '/icons_pack/13_Finance.svg';

  return '/icons_pack/14_Other.svg';
}
