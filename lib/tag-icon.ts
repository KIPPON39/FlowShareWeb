export function getIconBgFromTag(tag?: string) {
  if (!tag) return '/icons_pack/14_Other.png';
  const normalized = tag.toLowerCase().replace(/[^a-z0-9]+/g, '');

  if (normalized === 'email' || normalized === 'gmail') return '/icons_pack/03_Email.png';
  if (normalized === 'ai' || normalized === 'openai' || normalized === 'openaiapi') return '/icons_pack/01_AI.png';
  if (normalized === 'crm') return '/icons_pack/02_CRM.png';
  if (normalized === 'customer' || normalized === 'support') return '/icons_pack/04_Customer.png';
  if (normalized === 'marketing') return '/icons_pack/05_Marketing.png';
  if (normalized === 'sales' || normalized === 'sale') return '/icons_pack/06_Sales.png';
  if (normalized === 'data') return '/icons_pack/07_Data.png';
  if (normalized === 'scraping' || normalized === 'crawler') return '/icons_pack/08_Scraping.png';
  if (normalized === 'analytics' || normalized === 'analytic') return '/icons_pack/09_Analytics.png';
  if (normalized === 'devops') return '/icons_pack/10_DevOps.png';
  if (normalized === 'git') return '/icons_pack/11_Git.png';
  if (normalized === 'integration' || normalized === 'api') return '/icons_pack/12_Integration.png';
  if (normalized === 'finance' || normalized === 'stripe') return '/icons_pack/13_Finance.png';

  const t = normalized;
  if (t.includes('email') || t.includes('gmail')) return '/icons_pack/03_Email.png';
  if (t.includes('ai')) return '/icons_pack/01_AI.png';
  if (t.includes('crm')) return '/icons_pack/02_CRM.png';
  if (t.includes('customer') || t.includes('support')) return '/icons_pack/04_Customer.png';
  if (t.includes('marketing')) return '/icons_pack/05_Marketing.png';
  if (t.includes('sale')) return '/icons_pack/06_Sales.png';
  if (t.includes('data')) return '/icons_pack/07_Data.png';
  if (t.includes('scraping') || t.includes('crawler')) return '/icons_pack/08_Scraping.png';
  if (t.includes('analytic')) return '/icons_pack/09_Analytics.png';
  if (t.includes('devops')) return '/icons_pack/10_DevOps.png';
  if (t.includes('git')) return '/icons_pack/11_Git.png';
  if (t.includes('integration') || t.includes('api')) return '/icons_pack/12_Integration.png';
  if (t.includes('finance') || t.includes('stripe')) return '/icons_pack/13_Finance.png';

  return '/icons_pack/14_Other.png';
}
