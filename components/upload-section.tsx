'use client';

import { Upload, Send, Plus, X, Bot, Database, Terminal, CloudUpload, Lightbulb, UserPlus, Tag } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';

interface FlowStep {
  id: string;
  title: string;
  nodeName: string;
}

interface EnvKey {
  id: string;
  name: string;
}

type JsonRecord = Record<string, any>;

function nameFromEmail(email: string) {
  return email.split('@')[0]?.trim() || 'Creator';
}

function cleanNodeType(value: unknown) {
  if (typeof value !== 'string') return '';
  return value.replace(/^n8n-nodes-base\./, '').replace(/([a-z])([A-Z])/g, '$1 $2');
}

function toTitleCase(value: string) {
  const acronyms = new Set(['api', 'ai', 'aws', 'crm', 'ftp', 'http', 'https', 'imap', 'oauth', 'pdf', 's3', 'smtp', 'sql', 'ssh', 'url']);

  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => (acronyms.has(word.toLowerCase()) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ');
}

function credentialTypeToPlatform(value: unknown) {
  if (typeof value !== 'string') return '';

  const normalized = value
    .replace(/^n8n-nodes-base\./, '')
    .replace(/OAuth2Api$/i, '')
    .replace(/OAuth1Api$/i, '')
    .replace(/OAuth2$/i, '')
    .replace(/OAuth1$/i, '')
    .replace(/Api$/i, '')
    .replace(/Credentials?$/i, '')
    .replace(/Account$/i, '')
    .replace(/Auth$/i, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();

  return normalized ? toTitleCase(normalized) : '';
}

function extractCredentialPlatform(credential: JsonRecord | string) {
  if (typeof credential === 'string') return credentialTypeToPlatform(credential) || credential;
  return credentialTypeToPlatform(credential.type || credential.service || credential.platform || credential.app || credential.name || credential.id);
}

function extractNodeCredentials(nodes: JsonRecord[]) {
  const names = new Set<string>();

  nodes.forEach((node) => {
    const credentials = node.credentials;
    if (!credentials || typeof credentials !== 'object') return;

    Object.entries(credentials).forEach(([credentialType, credentialValue]) => {
      if (credentialValue && typeof credentialValue === 'object') {
        const platform = credentialTypeToPlatform(credentialType) || extractCredentialPlatform(credentialValue as JsonRecord);
        if (platform) {
          names.add(platform);
          return;
        }
      }

      names.add(credentialTypeToPlatform(credentialType) || credentialType);
    });
  });

  return Array.from(names);
}

function extractCredentialPlatformsFromNodes(nodes: JsonRecord[]) {
  const ignoredNodeTypes = new Set([
    'code',
    'execute workflow',
    'filter',
    'form trigger',
    'http request',
    'if',
    'manual trigger',
    'merge',
    'no operation, do nothing',
    'respond to webhook',
    'schedule trigger',
    'set',
    'sticky note',
    'switch',
    'wait',
    'webhook',
  ]);
  const platformAllowList = new Set([
    'airtable',
    'aws',
    'discord',
    'facebook',
    'github',
    'gmail',
    'google analytics',
    'google calendar',
    'google drive',
    'google gemini',
    'google palm',
    'google sheets',
    'hubspot',
    'jira',
    'line',
    'mailchimp',
    'microsoft excel',
    'microsoft outlook',
    'mysql',
    'notion',
    'open ai',
    'postgres',
    'postgresql',
    'salesforce',
    'slack',
    'stripe',
    'telegram',
    'twilio',
    'x',
    'zendesk',
    'zoom',
  ]);

  return nodes.reduce<string[]>((platforms, node) => {
    const platform = credentialTypeToPlatform(node.type || node.nodeName || node.app || node.service);
    if (!platform || ignoredNodeTypes.has(platform.toLowerCase())) return platforms;
    if (!platformAllowList.has(platform.toLowerCase())) return platforms;
    if (!platforms.includes(platform)) platforms.push(platform);
    return platforms;
  }, []);
}

export function SkeletonCard() {
  return (
    <div className="shimmer grid min-h-[140px] gap-3.5 rounded-2xl border border-[var(--border)] bg-linear-to-br from-[var(--surface)] to-[var(--surface-alt)] p-6 shadow-[var(--panel-inset)] opacity-50 text-left">
      <div className="h-3 w-3/5 rounded-lg bg-[var(--skeleton-base)]" />
      <div className="h-3 w-full rounded-lg bg-[var(--skeleton-base)]" />
      <div className="h-3 w-4/5 rounded-lg bg-[var(--skeleton-base)]" />
      <div className="h-3 w-2/5 rounded-lg bg-[var(--skeleton-base)]" />
    </div>
  );
}

export function UploadSection() {
  const { t } = useI18n();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [steps, setSteps] = useState<FlowStep[]>([]);
  const [keys, setKeys] = useState<EnvKey[]>([]);
  const [newStep, setNewStep] = useState({ title: '', nodeName: '' });
  const [newKey, setNewKey] = useState('');
  const [creatorEmail, setCreatorEmail] = useState('');
  const [contributors, setContributors] = useState<{ id: string; name: string; email: string }[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [submitState, setSubmitState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [rawJson, setRawJson] = useState<unknown>(null);
  const canShipWorkflow = Boolean(rawJson && title && description && creatorEmail.includes('@'));

  const addTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t2 => t2 !== tag));
  };

  const shipDisabledReason = !rawJson
    ? t('upload.upload_json_first')
    : !creatorEmail.includes('@')
      ? t('upload.add_email_first')
      : !title || !description
        ? t('upload.add_title_desc')
        : '';

  const applyJsonWorkflow = (data: JsonRecord) => {
    setRawJson(data);

    const source = data.workflow || data;
    const importedTitle = source.title || source.name || source.workflowName;
    const importedDescription = source.description || source.summary || source.notes;
    const importedNodes = Array.isArray(source.nodes) ? source.nodes : Array.isArray(source.steps) ? source.steps : [];
    const importedCredentials = Array.isArray(source.credentials)
      ? source.credentials
      : Array.isArray(source.keys)
        ? source.keys
        : [];
    const nodeCredentials = extractNodeCredentials(importedNodes);
    const nodePlatforms = extractCredentialPlatformsFromNodes(importedNodes);

    if (importedTitle) setTitle(String(importedTitle));
    if (importedDescription) setDescription(String(importedDescription));

    if (importedNodes.length) {
      setSteps(
        importedNodes.map((node: JsonRecord, index: number) => ({
          id: String(node.id || index + 1),
          title: String(node.title || node.name || node.label || `Step ${index + 1}`),
          nodeName: String(node.nodeName || cleanNodeType(node.type) || node.app || node.service || 'Workflow Node'),
        })),
      );
    }

    if (importedCredentials.length || nodeCredentials.length || nodePlatforms.length) {
      const credentialNames = [
        ...importedCredentials.map(extractCredentialPlatform),
        ...nodeCredentials,
        ...nodePlatforms,
      ].filter(Boolean);

      setKeys(
        Array.from(new Set(credentialNames)).map((name, index) => ({
          id: String(index + 1),
          name,
        })),
      );
    }

    setSubmitState('idle');
    setStatusMessage(t('upload.json_imported'));
  };

  const handleJsonFile = async (file?: File) => {
    if (!file) return;

    try {
      const text = await file.text();
      applyJsonWorkflow(JSON.parse(text));
    } catch {
      setSubmitState('error');
      setStatusMessage('Could not parse that JSON file. Please check the file format.');
    }
  };

  const addContributor = () => {
    if (newEmail && newEmail.includes('@')) {
      const name = nameFromEmail(newEmail);
      setContributors([...contributors, { id: Math.random().toString(), name, email: newEmail }]);
      setNewEmail('');
    }
  };

  const removeContributor = (id: string) => {
    setContributors(contributors.filter(c => c.id !== id));
  };

  const addStep = () => {
    if (newStep.title && newStep.nodeName) {
      setSteps([...steps, { id: Math.random().toString(), ...newStep }]);
      setNewStep({ title: '', nodeName: '' });
    }
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  const addKey = () => {
    if (newKey) {
      setKeys([...keys, { id: Math.random().toString(), name: newKey }]);
      setNewKey('');
    }
  };

  const removeKey = (id: string) => {
    setKeys(keys.filter(k => k.id !== id));
  };

  const submitWorkflow = async () => {
    setSubmitState('saving');
    setStatusMessage(t('upload.sending'));

    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          tags,
          keys: keys.map((key) => key.name),
          creators: [
            {
              name: nameFromEmail(creatorEmail),
              email: creatorEmail,
              role: 'creator',
            },
            ...contributors.map((contributor) => ({
              name: contributor.name,
              email: contributor.email,
              role: 'contributor',
            })),
          ],
          steps,
          rawJson,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        const n8nStatus = data.n8nStatus ? ` n8n status: ${data.n8nStatus}` : '';
        const detail = data.detail ? ` Detail: ${data.detail}` : '';
        throw new Error(`${data.error || 'Workflow save failed.'}${n8nStatus}.${detail}`);
      }

      setSubmitState('saved');
      setStatusMessage(t('upload.saved'));
    } catch (error) {
      setSubmitState('error');
      setStatusMessage(error instanceof Error ? error.message : 'Workflow save failed.');
    }
  };

  return (
    <section id="upload" className="grid gap-8 sm:gap-10 my-8 sm:my-14 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-left">
          <div className="h-14 w-14 flex flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)] text-white shadow-xl shadow-[var(--accent-glow)]">
            <CloudUpload size={28} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-[var(--text)]">{t('upload.title')}</h1>
            <p className="mt-2 text-[var(--muted)] font-medium text-sm sm:text-base">{t('upload.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10">
        {/* Editor Side */}
        <div className="grid gap-6 sm:gap-8 order-2 lg:order-1">
          <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-8 shadow-2xl shadow-black/[0.02] shadow-[var(--panel-inset)]">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--accent)] mb-6 flex items-center gap-2">
              <div className="h-1 w-6 bg-[var(--accent)] rounded-full" />
              {t('upload.basic_info')}
            </h2>
            
            <div className="grid gap-6 text-left">
              <label className="upload-zone block rounded-2xl border-2 border-dashed border-[var(--border-strong)] bg-[var(--surface-alt)]/20 p-10 text-center shadow-[var(--panel-inset)] transition-all hover:border-[var(--accent)] group cursor-pointer">
                <input
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(event) => handleJsonFile(event.target.files?.[0])}
                />
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] group-hover:scale-110 transition-transform shadow-sm">
                  <Upload size={24} />
                </div>
                <div className="mt-5 text-base sm:text-lg font-bold">
                  {t('upload.drop_json')} <span className="text-[var(--accent)]">{t('upload.browse')}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--muted)] font-medium">
                  {t('upload.auto_extract')}
                </p>
              </label>

              <div className="grid gap-4">
                <input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-5 py-4 text-lg font-bold tracking-tight outline-hidden focus:ring-4 focus:ring-[var(--accent-soft)] focus:border-[var(--accent)] transition-all text-[var(--text)]" 
                  placeholder={t('upload.flow_title')} 
                />
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3} 
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-5 py-4 text-[1rem] font-medium leading-relaxed outline-hidden focus:ring-4 focus:ring-[var(--accent-soft)] focus:border-[var(--accent)] transition-all resize-none text-[var(--text)]" 
                  placeholder={t('upload.flow_desc')}
                />
                {/* Tags Input */}
                <div className="grid gap-2">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, i) => (
                      <span key={i} className="tag-item">
                        {tag}
                        <button onClick={() => removeTag(tag)} type="button">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-5 py-3 focus-within:ring-4 focus-within:ring-[var(--accent-soft)] focus-within:border-[var(--accent)] transition-all">
                    <Tag size={18} className="text-[var(--muted-soft)]" />
                    <input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                      className="flex-1 bg-transparent text-sm font-bold outline-hidden placeholder:text-[var(--muted-light)] text-[var(--text)]"
                      placeholder={t('upload.tags_placeholder')}
                    />
                    <button onClick={addTag} type="button" className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] transition-all hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)]">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

            <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-8 shadow-2xl shadow-black/[0.02] shadow-[var(--panel-inset)]">
              <h2 className="text-xl font-black uppercase tracking-widest text-[var(--text)] mb-6 flex items-center gap-3">
                <div className="h-1 w-8 bg-[var(--accent)] rounded-full" />
                {t('upload.team')}
              </h2>
              
              <div className="grid gap-3">
                <div className="flex items-center gap-3 rounded-2xl border-2 border-dotted border-[var(--border)] bg-[var(--surface-alt)]/20 px-5 py-4 focus-within:border-[var(--accent)] transition-all">
                  <UserPlus size={18} className="text-[var(--muted)]" />
                  <input
                    value={creatorEmail}
                    onChange={(e) => setCreatorEmail(e.target.value)}
                    className="flex-1 bg-transparent text-sm font-bold opacity-80 outline-hidden placeholder:text-[var(--muted-light)] text-[var(--text)]"
                    placeholder={t('upload.creator_email')}
                    type="email"
                  />
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {creatorEmail && (
                    <div className="flex items-center gap-2 rounded-xl bg-[var(--accent-soft)] pl-3 pr-3 py-2 border border-[var(--accent)]/20">
                      <div className="h-6 w-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-[0.6rem] font-bold text-white">
                        {nameFromEmail(creatorEmail).charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-[var(--accent)]">{nameFromEmail(creatorEmail)}</span>
                      <span className="rounded-md bg-[var(--surface)] px-2 py-0.5 text-[0.55rem] font-black uppercase tracking-widest text-[var(--accent)]">{t('upload.creator')}</span>
                    </div>
                  )}
                  {contributors.map((c) => (
                    <div key={c.id} className="flex items-center gap-2 rounded-xl bg-[var(--surface-alt)] pl-3 pr-2 py-2 border border-[var(--border)]">
                      <div className="h-6 w-6 rounded-full bg-[var(--accent-soft)] flex items-center justify-center text-[0.6rem] font-bold text-[var(--accent)]">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-[var(--text-subtle)]">{c.name}</span>
                      <span className="rounded-md bg-[var(--surface)] px-2 py-0.5 text-[0.55rem] font-black uppercase tracking-widest text-[var(--muted)]">{t('upload.contributor')}</span>
                      <button onClick={() => removeContributor(c.id)} className="text-[var(--muted)] hover:text-red-500">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 rounded-2xl border-2 border-dotted border-[var(--border)] bg-[var(--surface-alt)]/20 px-5 py-4 focus-within:border-[var(--accent)] transition-all">
                  <UserPlus size={18} className="text-[var(--muted)]" />
                  <input 
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="flex-1 bg-transparent text-sm font-bold opacity-60 outline-hidden placeholder:text-[var(--muted-light)] text-[var(--text)]" 
                    placeholder={t('upload.invite')} 
                    onKeyDown={(e) => e.key === 'Enter' && addContributor()}
                  />
                  <button onClick={addContributor} className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] transition-all hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)]">
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-[var(--border)] bg-[color-mix(in_srgb,var(--accent)_5%,var(--surface))] p-5 sm:p-8 shadow-2xl shadow-[var(--panel-inset)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-6 w-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-white">
                  <Terminal size={12} />
                </div>
                <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-[var(--accent)]">{t('upload.backend')}</span>
              </div>
              <p className="text-sm text-[var(--text-subtle)] font-medium leading-relaxed">
                This workflow will be automatically synced with <span className="font-bold text-[var(--text)]">Google Sheets</span> and proxied via <span className="font-bold text-[var(--text)]">n8n</span> to handle Download & Speaker requests securely.
              </p>
            </div>

            <div className="grid gap-8 text-left">
              <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-8 shadow-2xl shadow-black/[0.02] shadow-[var(--panel-inset)]">
                <h2 className="text-xl font-black uppercase tracking-widest text-[var(--text)] mb-6 flex items-center gap-3">
                  <div className="h-1 w-8 bg-[var(--accent)] rounded-full" />
                  {t('upload.pipeline')}
                </h2>
              
              <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
                  {steps.map((step, i) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={step.id} 
                      className="group flex items-center gap-4 rounded-2xl bg-[var(--surface-alt)] p-5 border border-[var(--border)] transition-all hover:border-[var(--accent-soft)]"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--surface)] text-sm font-black text-[var(--accent)] border border-[var(--border)] shadow-sm">
                        {(i + 1).toString().padStart(2, '0')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-base font-bold text-[var(--text)]">{step.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Bot size={14} className="text-[var(--accent)] opacity-60" />
                          <span className="text-[0.7rem] font-bold text-[var(--accent)] uppercase tracking-widest opacity-80">{step.nodeName}</span>
                        </div>
                      </div>
                      <button onClick={() => removeStep(step.id)} className="h-10 w-10 flex items-center justify-center rounded-xl text-[var(--muted)] hover:bg-red-500/10 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                        <X size={20} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                <div className="mt-4 p-6 rounded-2xl border-2 border-dotted border-[var(--border)] bg-[var(--surface-alt)]/20 relative group-within:border-[var(--accent)] transition-all">
                  <div className="grid gap-4">
                    <input 
                      value={newStep.title}
                      onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
                      className="w-full bg-transparent text-base font-bold outline-hidden placeholder:text-[var(--muted-light)] text-[var(--text)]" 
                      placeholder={t('upload.step_do')} 
                    />
                    <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
                      <div className="flex items-center gap-3 flex-1">
                        <Terminal size={16} className="text-[var(--muted)]" />
                        <input 
                          value={newStep.nodeName}
                          onChange={(e) => setNewStep({ ...newStep, nodeName: e.target.value })}
                          className="flex-1 bg-transparent text-[0.7rem] font-black uppercase tracking-[0.2em] text-[var(--accent)] outline-hidden placeholder:text-[var(--accent)]/30" 
                          placeholder={t('upload.assign_node')} 
                        />
                      </div>
                      <button onClick={addStep} className="flex items-center gap-2 rounded-xl bg-[var(--text)] px-4 py-2 text-[0.65rem] font-black uppercase tracking-widest text-[var(--bg)] transition-all hover:scale-105 active:scale-95 shadow-lg">
                        <Plus size={16} />
                        <span>{t('upload.add_step')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-8 shadow-2xl shadow-black/[0.02] shadow-[var(--panel-inset)]">
              <h2 className="text-xl font-black uppercase tracking-widest text-[var(--text)] mb-6 flex items-center gap-3">
                <div className="h-1 w-8 bg-[var(--accent)] rounded-full" />
                {t('upload.credentials')}
              </h2>
              
              <div className="grid gap-3">
                <div className="flex flex-wrap gap-3 mb-4">
                  <AnimatePresence mode="popLayout">
                    {keys.map((key) => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={key.id} 
                        className="group flex items-center gap-3 rounded-xl bg-[var(--surface-alt)] pl-4 pr-2 py-2.5 border border-[var(--border)] shadow-sm hover:border-[var(--accent-soft)] transition-all"
                      >
                        <span className="text-xs font-black uppercase tracking-widest text-[var(--text-subtle)]">{key.name}</span>
                        <button onClick={() => removeKey(key.id)} className="h-6 w-6 flex items-center justify-center rounded-lg text-[var(--muted)] hover:bg-red-500/10 hover:text-red-500 transition-all">
                          <X size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                
                <div className="flex items-center gap-4 rounded-2xl border-2 border-dotted border-[var(--border)] bg-[var(--surface-alt)]/20 px-5 py-4 focus-within:border-[var(--accent)] transition-all">
                  <Database size={18} className="text-[var(--muted)]" />
                  <input 
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    className="flex-1 bg-transparent text-sm font-bold outline-hidden placeholder:text-[var(--muted-light)] text-[var(--text)]" 
                    placeholder={t('upload.add_key')} 
                    onKeyDown={(e) => e.key === 'Enter' && addKey()}
                  />
                  <button onClick={addKey} className="group flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] transition-all hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] shadow-sm">
                    <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Side */}
        <div className="relative text-left order-1 lg:order-2">
          <div className="lg:sticky lg:top-32 rounded-[2rem] border border-[var(--border)] bg-[var(--surface-alt)]/40 p-5 sm:p-8 backdrop-blur-2xl shadow-3xl shadow-black/10 ring-1 ring-white/10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-inner text-[var(--accent)]">
                  <Lightbulb size={20} />
                </div>
                <span className="font-black uppercase tracking-[0.2em] text-xs text-[var(--text)]">{t('upload.live_profile')}</span>
              </div>
              <div className="flex items-center gap-2 text-[0.65rem] font-black uppercase text-[var(--accent)] tracking-widest bg-[var(--accent-soft)] px-3 py-1 rounded-full border border-[var(--accent)]/20 animate-pulse">
                {t('upload.draft')}
              </div>
            </div>

            <div className="grid gap-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xl relative">
                  <div className="absolute inset-0 bg-linear-to-br from-[var(--accent)]/10 to-transparent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`min-h-[1.5rem] rounded-lg ${!title ? 'shimmer w-3/4' : ''}`}>
                    {title && <span className="font-black tracking-tight text-lg leading-none text-[var(--text)]">{title}</span>}
                  </div>
                  <div className="mt-2 text-[0.65rem] font-bold text-[var(--muted)] flex items-center gap-2">
                    <Database size={10} />
                    <span>PUBLIC SCHEMA v1.0</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-inner">
                <div className="flex items-center gap-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                   <span className="text-[0.65rem] font-black uppercase tracking-widest opacity-50">{t('upload.pipeline_summary')}</span>
                </div>
                <div className="grid gap-4">
                  {steps.length === 0 ? (
                    <div className="text-xs text-[var(--muted)] font-medium italic opacity-40">{t('upload.define_steps')}</div>
                  ) : (
                    steps.map((s, i) => (
                      <div key={s.id} className="flex gap-4">
                         <span className="text-[0.65rem] font-black text-[var(--accent)] opacity-40 leading-none mt-1">{(i+1).toString().padStart(2, '0')}</span>
                         <span className="text-xs font-bold leading-tight line-clamp-2 text-[var(--text)]">{s.title}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="grid gap-3 bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-inner">
                <div className="flex items-center gap-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                   <span className="text-[0.65rem] font-black uppercase tracking-widest opacity-50">{t('upload.required_creds')}</span>
                </div>
                {keys.length === 0 ? (
                  <div className="text-xs text-[var(--muted)] font-medium italic opacity-40">{t('upload.upload_json_creds')}</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {keys.map((key) => (
                      <span
                        key={key.id}
                        className="rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-wider text-[var(--text-subtle)]"
                      >
                        {key.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-3 p-1">
                <div className="flex items-center gap-2 mb-1">
                   <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                   <span className="text-[0.65rem] font-black uppercase tracking-widest opacity-50">{t('upload.contributors')}</span>
                </div>
                <div className="flex -space-x-3 overflow-hidden">
                  {creatorEmail && (
                    <div
                      className="inline-block h-8 w-8 rounded-xl ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-transparent bg-[var(--surface)] shadow-lg overflow-hidden border border-[var(--accent)]"
                      style={{ zIndex: contributors.length + 1 }}
                      title={`${nameFromEmail(creatorEmail)} (Creator)`}
                    >
                      <Image
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${nameFromEmail(creatorEmail)}`}
                        alt={nameFromEmail(creatorEmail)}
                        width={32}
                        height={32}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  {contributors.map((c, i) => (
                    <div 
                      key={c.id} 
                      className="inline-block h-8 w-8 rounded-xl ring-2 ring-[var(--surface-alt)] ring-offset-2 ring-offset-transparent bg-[var(--surface)] shadow-lg overflow-hidden border border-[var(--border)]"
                      style={{ zIndex: contributors.length - i }}
                      title={c.name}
                    >
                      <Image 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`} 
                        alt={c.name}
                        width={32}
                        height={32}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-[0.65rem] font-bold text-[var(--muted)]">
                  {creatorEmail
                    ? `${contributors.length + 1} ${t('upload.persons_assigned')}`
                    : t('upload.add_creator')}
                </div>
              </div>

              {statusMessage && (
                <div className={`rounded-2xl border px-4 py-3 text-xs font-bold leading-relaxed ${
                  submitState === 'error'
                    ? 'border-red-500/30 bg-red-500/10 text-red-500'
                    : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted-strong)]'
                }`}>
                  {statusMessage}
                </div>
              )}

              {!canShipWorkflow && (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-xs font-bold leading-relaxed text-[var(--muted-strong)]">
                  {shipDisabledReason}
                </div>
              )}

              <button
                onClick={submitWorkflow}
                disabled={submitState === 'saving' || !canShipWorkflow}
                className="group relative mt-2 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[var(--accent)] py-4.5 text-[0.8rem] font-bold uppercase tracking-[0.2em] text-white shadow-2xl shadow-[var(--accent-glow)] transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                <Send size={16} className="transition-transform group-hover:translate-x-1" />
                <span className="relative z-10">{submitState === 'saving' ? t('upload.shipping') : t('upload.ship_workflow')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
