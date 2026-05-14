'use client';

import { 
  Download, 
  UserPlus, 
  Bot, 
  ChevronDown, 
  Eye, 
  Share2, 
  Database, 
  Cpu, 
  Mail, 
  CloudUpload,
  CreditCard,
  Globe,
  Terminal
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';

export function TimelineStep({ index, title, nodeName }: { index: number, title: string, nodeName: string }) {
  return (
    <div className="timeline-step flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[color-mix(in_srgb,var(--accent)_5%,transparent)] transition-transform hover:translate-x-1">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--surface-alt)] text-base font-black text-[var(--accent)] border border-[var(--border)] shadow-sm">
        {String(index).padStart(2, '0')}
      </div>
      <div className="grid gap-1 flex-1 min-w-0">
        <div className="text-[0.95rem] font-bold text-[var(--text)] tracking-tight leading-tight">{title}</div>
        <div className="flex items-center gap-2 text-[0.7rem] text-[var(--muted-strong)] mt-1">
          <Bot size={14} className="text-[var(--accent)]" />
          <span className="font-bold text-[var(--accent)] uppercase tracking-widest text-[0.6rem]">Node</span>
          <span className="rounded-md border border-[var(--border)] bg-[var(--surface-alt)] px-2 py-0.5 text-[0.65rem] font-bold text-[var(--text-subtle)]">
            {nodeName}
          </span>
        </div>
      </div>
    </div>
  );
}

export function WorkflowDetail() {
  const [isJsonOpen, setIsJsonOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'technical'>('overview');
  const [showAllPipeline, setShowAllPipeline] = useState(false);
  const [showAllCreds, setShowAllCreds] = useState(false);
  const [isBriefExpanded, setIsBriefExpanded] = useState(false);
  const { t } = useI18n();

  const fullBrief = "This enterprise-grade workflow monitors high-value renewal accounts by continuously scanning Google Sheets list, enriching them with real-time product usage statistics from HubSpot, and utilizing Gemini Pro 1.5 to calculate automated sentiment scores from support ticket history. It identifies churn risks with 92% accuracy and automatically generates prioritized success playbooks in your CRM while notifying relevant account managers via Slack with executive-level summaries and recommended action items.";
  const shortBrief = "Monitors high-value renewal accounts, enriches usage data, and uses AI to predict churn risks with automated CRM playbooks.";

  const pipeline = [
    { title: "Authorize deep search across Google Workspace", node: "Auth Pro" },
    { title: "Extract renewal dates and contract values from PDF invoices", node: "AI Vision" },
    { title: "Query HubSpot for previous support engagement scores", node: "CRM Sync" },
    { title: "Match usage patterns with high-churn historical data", node: "Data Lake" },
    { title: "Run Gemini Pro 1.5 analysis on sentiment of ticket replies", node: "Gemini AI" },
    { title: "Generate personalized recovery strategies for each account", node: "Strategy Eng" },
    { title: "Trigger internal Slack alert for accounts with >80% churn risk", node: "Alert Node" },
    { title: "Auto-assign priority tasks to CSMs based on workload", node: "Dispatcher" },
    { title: "Log all risk scores in a master analytics dashboard", node: "Analytics" },
    { title: "Wait 48 hours for CSM response before escalation", node: "Utility" },
    { title: "If no response, escalate to VP of Customer Success", node: "Escalation" },
    { title: "Finalize weekly health report and email to Stakeholders", node: "Reporting" },
  ];

  const credentials = [
    { name: 'Google Sheets v4', icon: Database },
    { name: 'HubSpot CRM API', icon: Database },
    { name: 'Slack Bot Token', icon: Share2 },
    { name: 'OpenAI GPT-4o Key', icon: Cpu },
    { name: 'Stripe Secret Key', icon: CreditCard },
    { name: 'AWS S3 Bucket', icon: Globe },
    { name: 'PostgreSQL DB', icon: Database },
    { name: 'Redis Cache', icon: Cpu },
    { name: 'Mailchimp API', icon: Mail },
    { name: 'Salesforce OAuth', icon: Database },
    { name: 'Zendesk Key', icon: Share2 },
    { name: 'Github Personal Token', icon: Terminal },
    { name: 'Twilio SID', icon: Share2 },
    { name: 'Airtable Base ID', icon: Database },
  ];

  const displayedPipeline = showAllPipeline ? pipeline : pipeline.slice(0, 5);
  const displayedCreds = showAllCreds ? credentials : credentials.slice(0, 6);

  return (
    <section id="detail" className="grid gap-8 my-8 sm:my-14">
      <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-64 w-64 bg-[var(--accent)] opacity-[0.03] blur-3xl rounded-full" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start justify-between gap-8 text-left">
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text)] leading-tight">AI Renewal Health Monitor</h1>
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <span className="rounded-full bg-[var(--accent-soft)] px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[var(--accent)]">{t('detail.featured')}</span>
              <span className="rounded-full bg-[var(--tag-alt-bg)] px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[var(--tag-alt-text)]">{t('detail.automation')}</span>
              <div className="ml-2 flex items-center gap-2 text-sm text-[var(--muted-strong)]">
                <Eye size={18} />
                <span className="font-bold">12.4k {t('detail.views')}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2.5 self-center sm:self-start">
            <button className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[color-mix(in_srgb,var(--accent)_20%,transparent)]">
              <Download size={14} /> 
              <span>{t('detail.download')}</span>
            </button>
            <button className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-5 py-2.5 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[var(--text)] transition-all hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] hover:border-[var(--accent)] active:scale-95">
              <UserPlus size={14} /> 
              <span>{t('detail.invite')}</span>
            </button>
          </div>
        </div>

        {/* Futuristic Tabs */}
        <div className="mt-10 relative z-10 flex border-b border-[var(--border)] text-left">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-8 py-4 text-[0.7rem] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'overview' ? 'text-[var(--accent)]' : 'text-[var(--muted-soft)] hover:text-[var(--text)]'}`}
          >
            {t('detail.overview')}
            {activeTab === 'overview' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]" />}
          </button>
          <button 
            onClick={() => setActiveTab('technical')}
            className={`px-8 py-4 text-[0.7rem] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'technical' ? 'text-[var(--accent)]' : 'text-[var(--muted-soft)] hover:text-[var(--text)]'}`}
          >
            {t('detail.technical')}
            {activeTab === 'technical' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]" />}
          </button>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_300px] relative z-10">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid gap-10"
            >
              {activeTab === 'overview' ? (
                <>
                  <section className="text-left">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-black uppercase tracking-widest text-[var(--text)] flex items-center gap-2.5">
                        <div className="h-1 w-5 bg-[var(--accent)] rounded-full" />
                        {t('detail.brief')}
                      </h2>
                      <button 
                        onClick={() => setIsBriefExpanded(!isBriefExpanded)}
                        className="text-[0.6rem] font-bold uppercase tracking-widest text-[var(--accent)] hover:underline"
                      >
                        {isBriefExpanded ? t('detail.collapse') : t('detail.read_more')}
                      </button>
                    </div>
                    <motion.div 
                      layout
                      className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)]/30 p-5 leading-relaxed text-[0.9rem] text-[var(--text-subtle)] font-medium transition-all"
                    >
                      {isBriefExpanded ? fullBrief : shortBrief}
                    </motion.div>
                  </section>

                  <section className="grid gap-4 text-left">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-black uppercase tracking-widest text-[var(--text)] flex items-center gap-2.5">
                        <div className="h-1 w-5 bg-[var(--accent)] rounded-full" />
                        {t('detail.pipeline')}
                      </h2>
                      <button 
                        onClick={() => setShowAllPipeline(!showAllPipeline)}
                        className="text-[0.6rem] font-bold uppercase tracking-widest text-[var(--accent)] hover:underline"
                      >
                        {showAllPipeline ? t('detail.show_less') : `${t('detail.view_full')} (${pipeline.length})`}
                      </button>
                    </div>
                    <div className="grid gap-2.5">
                      {displayedPipeline.map((step, i) => (
                        <TimelineStep key={i} index={i + 1} title={step.title} nodeName={step.node} />
                      ))}
                    </div>
                  </section>
                </>
              ) : (
                <section className="text-left">
                   <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] p-6">
                     <h2 className="text-base font-black uppercase tracking-widest text-[var(--text)] mb-4">{t('detail.arch')}</h2>
                     <p className="text-xs text-[var(--muted)] mb-6 font-medium leading-normal">{t('detail.arch_desc')}</p>
                     
                     <div className="grid gap-5">
                        <div className="grid gap-2">
                           <span className="text-[0.6rem] font-black uppercase tracking-widest text-[var(--accent)]">{t('detail.backend_sync')}</span>
                           <div className="bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)] font-mono text-[0.75rem] text-[var(--muted-strong)] flex items-center justify-between">
                             <span>n8n_integration_id: flw_882</span>
                             <span className="text-[var(--accent)]">Active</span>
                           </div>
                        </div>
                        <div className="grid gap-2">
                           <span className="text-[0.6rem] font-black uppercase tracking-widest text-[var(--accent)]">{t('detail.data_dest')}</span>
                           <div className="bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)] font-mono text-[0.75rem] text-[var(--muted-strong)]">
                             G-Sheets: &quot;ai_renewal_health_monitor_v1&quot;
                           </div>
                        </div>
                        <div className="grid gap-2">
                           <span className="text-[0.6rem] font-black uppercase tracking-widest text-[var(--accent)]">{t('detail.error_handling')}</span>
                           <div className="bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)] font-mono text-[0.75rem] text-[var(--muted-strong)]">
                             on_failure: retry_with_exponential_backoff(max=3)
                           </div>
                        </div>
                     </div>
                   </div>
                </section>
              )}
            </motion.div>
          </AnimatePresence>

          <aside className="grid gap-6 self-start text-left">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)]/50 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-[var(--muted-soft)]">{t('detail.credentials')}</h3>
                <button 
                  onClick={() => setShowAllCreds(!showAllCreds)}
                  className="text-[0.6rem] font-black uppercase tracking-widest text-[var(--accent)]"
                >
                  {showAllCreds ? t('detail.less') : t('detail.all')}
                </button>
              </div>
              <div className="grid gap-3.5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {displayedCreds.map((k, i) => (
                  <div key={i} className="flex items-center gap-3 group/item">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--surface)] border border-[var(--border)] shadow-sm group-hover/item:border-[var(--accent)] transition-colors">
                      <k.icon size={16} className="text-[var(--accent)]" />
                    </div>
                    <span className="text-xs font-bold text-[var(--text-subtle)] tracking-tight">{k.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)]/50 p-5 backdrop-blur-sm">
              <h3 className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-[var(--muted-soft)] mb-5">{t('detail.team')}</h3>
              <div className="grid gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {['Sofia Park', 'Liam Chen', 'Emma Wilson', 'Marcus Thorne', 'Aria Vane'].map((name, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-[var(--surface)] bg-[var(--surface-alt)] shadow-sm">
                      <Image 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} 
                        alt={name}
                        width={40}
                        height={40}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-[var(--text)] tracking-tight leading-tight">{name}</span>
                      <span className="text-[0.6rem] font-bold text-[var(--muted)] uppercase tracking-widest mt-0.5">{t('upload.contributor')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)]/50 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-5 w-5 rounded-full bg-[var(--accent)] flex items-center justify-center text-white">
                  <Terminal size={10} />
                </div>
                <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-[var(--accent)]">{t('detail.automated_bridge')}</span>
              </div>
              <p className="text-[0.65rem] text-[var(--muted-strong)] font-bold leading-relaxed">
                Requests are handled via <span className="text-[var(--text)]">n8n</span> & recorded in <span className="text-[var(--text)]">G-Sheets</span>.
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)]/30 backdrop-blur-md">
          <button 
            onClick={() => setIsJsonOpen(!isJsonOpen)}
            className="flex w-full items-center gap-3 px-8 py-5 font-black uppercase tracking-[0.15em] text-[0.8rem] transition-colors hover:text-[var(--accent)] text-[var(--muted-strong)]"
          >
            <ChevronDown size={20} className={`transition-transform duration-300 ${isJsonOpen ? '' : '-rotate-90'}`} />
            <span>{t('detail.json_preview')}</span>
          </button>
          
          <AnimatePresence>
            {isJsonOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-8 pt-0 text-left">
                  <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-[0.9rem] text-[var(--muted-strong)] leading-relaxed shadow-inner">
                    <pre className="font-mono">
                      {`{
  "workflow_id": "renewal-health-ai",
  "nodes": [
    {"id": "sheet", "type": "GoogleSheets"},
    {"id": "usage", "type": "HubSpot"},
    {"id": "ai", "type": "Gemini"},
    {"id": "slack", "type": "Slack"}
  ]
}`}
                    </pre>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
