'use client';

import { Upload, Send, Plus, X, Bot, Database, Terminal, CloudUpload, Lightbulb, UserPlus, Tag, ChevronDown, GripVertical, CheckCircle2, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

const PREDEFINED_TAGS = ['AI', 'CRM', 'Email', 'Customer', 'Marketing', 'Sales', 'Data', 'Scraping', 'Analytics', 'DevOps', 'Git', 'Integration', 'Finance', 'Other'];

function SortableStep({ step, index, removeStep }: { step: FlowStep; index: number; removeStep: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 rounded-2xl bg-[var(--surface-alt)] p-3.5 border transition-all ${isDragging ? 'border-[var(--accent)] shadow-lg scale-[1.02] bg-[var(--surface)]' : 'border-[var(--border)] hover:border-[var(--accent-soft)]'}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex h-8 w-6 cursor-grab items-center justify-center text-[var(--muted-soft)] hover:text-[var(--text)] active:cursor-grabbing touch-none"
      >
        <GripVertical size={16} />
      </div>
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--surface)] text-[0.8rem] font-black text-[var(--accent)] border border-[var(--border)] shadow-sm">
        {(index + 1).toString().padStart(2, '0')}
      </div>
      <div className="flex-1 min-w-0">
        <div className="truncate text-sm font-semibold text-[var(--text)]">{step.title}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <Bot size={12} className="text-[var(--accent)] opacity-60" />
          <span className="text-[0.65rem] font-semibold text-[var(--accent)] uppercase tracking-wider opacity-80">{step.nodeName}</span>
        </div>
      </div>
      <button onClick={() => removeStep(step.id)} className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--muted)] hover:bg-red-500/10 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  );
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
  const { t, lang } = useI18n();
  const isMobile = useIsMobile();
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
  const [uploadedFilename, setUploadedFilename] = useState('');
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const canShipWorkflow = Boolean(rawJson && title && description && creatorEmail.includes('@') && tags.length > 0);

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

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

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleJsonFile = async (file?: File) => {
    if (!file) return;

    try {
      const text = await file.text();
      applyJsonWorkflow(JSON.parse(text));
      setUploadedFilename(file.name);
    } catch {
      setSubmitState('error');
      setStatusMessage('Could not parse that JSON file. Please check the file format.');
    }
  };

  const removeUploadedFile = () => {
    setUploadedFilename('');
    setRawJson(null);
    setTitle('');
    setDescription('');
    setSteps([]);
    setKeys([]);
    setTags([]);
    setSubmitState('idle');
    setStatusMessage('');
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

    const finalContributors = [...contributors];
    if (newEmail.trim() && newEmail.includes('@')) {
      finalContributors.push({
        id: Math.random().toString(),
        name: nameFromEmail(newEmail),
        email: newEmail,
      });
      setNewEmail('');
    }

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
            ...finalContributors.map((contributor) => ({
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

  const isJsonMissing = hasAttemptedSubmit && !rawJson;
  const isTitleMissing = hasAttemptedSubmit && (!title || !description);
  const isTagsMissing = hasAttemptedSubmit && tags.length === 0;
  const isEmailMissing = hasAttemptedSubmit && !creatorEmail.includes('@');

  const requirements = [
    { id: 'upload-json', label: t('upload.upload_json_first'), isMet: Boolean(rawJson) },
    { id: 'upload-title', label: t('upload.add_title_desc'), isMet: Boolean(title && description) },
    { id: 'upload-tags', label: t('upload.select_tags_first'), isMet: tags.length > 0 },
    { id: 'upload-email', label: t('upload.add_email_first'), isMet: creatorEmail.includes('@') },
  ];

  const completedStepsCount = requirements.filter(r => r.isMet).length;
  const progressPercent = (completedStepsCount / requirements.length) * 100;

  const scrollToField = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
    }
  };

  return (
    <section id="upload" className="grid gap-8 my-8 sm:my-12 pb-28 lg:pb-12">
      {/* Progress Bar */}
      <div className="grid gap-2">
        <div className="flex items-center justify-between text-xs font-bold text-[var(--muted-strong)]">
          <span>{t('upload.completion_progress') || 'Completion Progress'}</span>
          <span className={completedStepsCount === requirements.length ? 'text-emerald-500' : ''}>
            {Math.round(progressPercent)}%
          </span>
        </div>
        <div className="w-full bg-[var(--surface-alt)] rounded-full h-1.5 border border-[var(--border)] overflow-hidden">
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%`, backgroundColor: completedStepsCount === requirements.length ? '#10b981' : 'var(--accent)' }}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 text-left">
        <div className="h-10 w-10 flex flex-shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-white">
          <CloudUpload size={20} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--text)]">{t('upload.title')}</h1>
          <p className="mt-1 text-[var(--muted)] text-[0.82rem]">{t('upload.subtitle')}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10">
        {/* Editor Side */}
        <div className="grid gap-6 sm:gap-8 order-1 lg:order-1">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-8 shadow-sm">
            <h2 className="text-[0.7rem] font-medium uppercase tracking-[0.15em] text-[var(--accent)] mb-5 flex items-center gap-2">
              <div className="h-px w-4 bg-[var(--accent)]" />
              {t('upload.basic_info')}
            </h2>

            <div className="grid gap-6 text-left">
              {uploadedFilename ? (
                <div className="flex items-center justify-between rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-5 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                      <CloudUpload size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[0.85rem] font-medium text-[var(--text)]">{uploadedFilename}</div>
                      <div className="text-[0.7rem] text-[var(--muted)] mt-0.5">{t('upload.json_imported')}</div>
                    </div>
                  </div>
                  <button onClick={removeUploadedFile} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-red-500/10 hover:text-red-500 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label
                  id="upload-json"
                  className={`futuristic-hover upload-zone block rounded-xl border-2 border-dashed ${isJsonMissing ? 'border-red-500/50 bg-red-500/5 hover:border-red-500' : 'border-[var(--border-strong)] bg-[var(--surface-alt)]/20 hover:border-[var(--accent)]'} p-8 text-center transition-all group cursor-pointer`}
                >
                  <input
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={(event) => handleJsonFile(event.target.files?.[0])}
                  />
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] group-hover:scale-105 transition-transform shadow-sm">
                    <Upload size={20} />
                  </div>
                  <div className="mt-4 text-base font-medium">
                    {t('upload.drop_json')} <span className="text-[var(--accent)]">{t('upload.browse')}</span>
                  </div>
                  <p className="mt-1.5 text-[0.8rem] text-[var(--muted)]">
                    {t('upload.auto_extract')}
                  </p>
                </label>
              )}

              <div className="grid gap-4">
                <input
                  id="upload-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`rounded-lg border ${hasAttemptedSubmit && !title ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-[var(--border)]'} bg-[var(--surface-alt)] px-4 py-3 text-base font-medium tracking-tight outline-hidden focus:ring-[3px] focus:ring-[var(--accent-soft)] focus:border-[var(--accent)] transition-all text-[var(--text)]`}
                  placeholder={t('upload.flow_title')}
                />
                {hasAttemptedSubmit && !title && (
                  <span className="text-red-500 text-[0.72rem] font-semibold mt-[-10px] pl-1">* {lang === 'th' ? 'กรุณากรอกชื่อเรื่อง' : 'Title is required'}</span>
                )}
                <textarea
                  id="upload-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={`rounded-lg border ${hasAttemptedSubmit && !description ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-[var(--border)]'} bg-[var(--surface-alt)] px-4 py-3 text-[0.9rem] leading-relaxed outline-hidden focus:ring-[3px] focus:ring-[var(--accent-soft)] focus:border-[var(--accent)] transition-all resize-none text-[var(--text)]`}
                  placeholder={t('upload.flow_desc')}
                />
                {hasAttemptedSubmit && !description && (
                  <span className="text-red-500 text-[0.72rem] font-semibold mt-[-10px] pl-1">* {lang === 'th' ? 'กรุณากรอกรายละเอียด' : 'Description is required'}</span>
                )}
                {/* Tags Input */}
                <div id="upload-tags" className={`grid gap-3 p-3 -m-3 rounded-xl transition-colors ${isTagsMissing ? 'bg-red-500/5 border border-red-500/20' : ''}`}>
                  <span className="text-[0.75rem] font-medium text-[var(--muted-strong)]">{t('upload.tags_placeholder')}</span>
                  {isTagsMissing && (
                    <span className="text-red-500 text-[0.72rem] font-semibold mt-[-8px] pl-1">* {lang === 'th' ? 'กรุณาเลือกอย่างน้อย 1 แท็ก' : 'Select at least 1 tag'}</span>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {PREDEFINED_TAGS.map((tag) => {
                      const isSelected = tags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1.5 rounded-lg text-[0.75rem] font-medium transition-all duration-200 border ${isSelected
                              ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm shadow-[var(--accent-glow)]'
                              : 'bg-[var(--surface-alt)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--accent-soft)] hover:text-[var(--text)]'
                            }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <details className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-8 shadow-sm" open={isEmailMissing ? true : undefined}>
            <summary className="list-none cursor-pointer flex items-center justify-between mb-2 group-open:mb-5 outline-hidden">
              <h2 className="text-[0.7rem] font-medium uppercase tracking-[0.15em] text-[var(--accent)] flex items-center gap-2">
                <div className="h-px w-4 bg-[var(--accent)]" />
                {t('upload.team')}
              </h2>
              <div className="text-[var(--accent)] transition-transform duration-300 group-open:-rotate-180">
                <ChevronDown size={16} />
              </div>
            </summary>

            <div className="grid gap-3">
              <div
                id="upload-email"
                className={`flex items-center gap-3 rounded-2xl border-2 border-dotted ${isEmailMissing ? 'border-red-500/50 bg-red-500/5 focus-within:border-red-500' : 'border-[var(--border)] bg-[var(--surface-alt)]/20 focus-within:border-[var(--accent)]'} px-5 py-4 transition-all`}
              >
                <UserPlus size={18} className={isEmailMissing ? 'text-red-500' : 'text-[var(--muted)]'} />
                <input
                  value={creatorEmail}
                  onChange={(e) => setCreatorEmail(e.target.value)}
                  className="flex-1 bg-transparent text-sm font-bold opacity-80 outline-hidden placeholder:text-[var(--muted-light)] text-[var(--text)]"
                  placeholder={t('upload.creator_email')}
                  type="email"
                />
              </div>
              {isEmailMissing && (
                <span className="text-red-500 text-[0.72rem] font-semibold mt-[-4px] pl-1">* {lang === 'th' ? 'กรุณากรอกอีเมลผู้สร้างให้ถูกต้อง' : 'Valid creator email is required'}</span>
              )}

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
          </details>

          <div className="grid gap-8 text-left">
            <details className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-8 shadow-sm">
              <summary className="list-none cursor-pointer flex items-center justify-between mb-2 group-open:mb-5 outline-hidden">
                <h2 className="text-[0.7rem] font-medium uppercase tracking-[0.15em] text-[var(--accent)] flex items-center gap-2">
                  <div className="h-px w-4 bg-[var(--accent)]" />
                  {t('upload.pipeline')}
                </h2>
                <div className="text-[var(--accent)] transition-transform duration-300 group-open:-rotate-180">
                  <ChevronDown size={16} />
                </div>
              </summary>

              <div className="grid gap-4">
                <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-2 grid gap-4 custom-scrollbar">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={steps.map(s => s.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {steps.map((step, i) => (
                        <SortableStep key={step.id} step={step} index={i} removeStep={removeStep} />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>

                <div className="mt-2 p-6 rounded-2xl border-2 border-dotted border-[var(--border)] bg-[var(--surface-alt)]/20 relative group-within:border-[var(--accent)] transition-all">
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
                      <button onClick={addStep} className="futuristic-hover flex items-center gap-2 rounded-xl bg-[var(--text)] px-4 py-2 text-[0.65rem] font-black uppercase tracking-widest text-[var(--bg)] transition-all hover:scale-105 active:scale-95 shadow-lg">
                        <Plus size={16} />
                        <span>{t('upload.add_step')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </details>

            <details className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-8 shadow-sm">
              <summary className="list-none cursor-pointer flex items-center justify-between mb-2 group-open:mb-5 outline-hidden">
                <h2 className="text-[0.7rem] font-medium uppercase tracking-[0.15em] text-[var(--accent)] flex items-center gap-2">
                  <div className="h-px w-4 bg-[var(--accent)]" />
                  {t('upload.credentials')}
                </h2>
                <div className="text-[var(--accent)] transition-transform duration-300 group-open:-rotate-180">
                  <ChevronDown size={16} />
                </div>
              </summary>

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
                  <button onClick={addKey} className="futuristic-hover group flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] transition-all hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] shadow-sm">
                    <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                  </button>
                </div>
              </div>
            </details>
          </div>
        </div>

        {/* Preview Side */}
        <div className="relative text-left order-2 lg:order-2 self-start lg:sticky lg:top-24 h-fit w-full grid gap-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)]/40 p-5 sm:p-8 backdrop-blur-2xl shadow-sm ring-1 ring-white/10 max-h-[calc(100vh-14rem)] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-inner text-[var(--accent)]">
                  <Lightbulb size={20} />
                </div>
                <span className="font-medium uppercase tracking-[0.15em] text-[0.7rem] text-[var(--text)]">{t('upload.live_profile')}</span>
              </div>
              <div className="flex items-center gap-2 text-[0.6rem] font-medium uppercase text-[var(--accent)] tracking-wider bg-[var(--accent-soft)] px-2.5 py-0.5 rounded-md border border-[var(--accent)]/15">
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
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 min-h-[1.25rem]">
                    <Tag size={10} className="text-[var(--muted)]" />
                    {tags.length > 0 ? (
                      tags.map((tag, idx) => (
                        <span key={idx} className="rounded-md bg-[var(--surface-alt)] px-1.5 py-0.5 text-[0.6rem] font-bold text-[var(--text-subtle)] border border-[var(--border)]">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-[0.65rem] font-bold text-[var(--muted-soft)]">No tags selected</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-inner">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                  <span className="text-[0.65rem] font-medium uppercase tracking-wider text-[var(--muted-soft)]">{t('upload.pipeline_summary')}</span>
                </div>
                <div className="grid gap-4">
                  {steps.length === 0 ? (
                    <div className="text-xs text-[var(--muted)] font-medium italic opacity-40">{t('upload.define_steps')}</div>
                  ) : (
                    steps.map((s, i) => (
                      <div key={s.id} className="flex gap-4">
                        <span className="text-[0.65rem] font-black text-[var(--accent)] opacity-40 leading-none mt-1">{(i + 1).toString().padStart(2, '0')}</span>
                        <span className="text-xs font-bold leading-tight line-clamp-2 text-[var(--text)]">{s.title}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="grid gap-3 bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-inner">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                  <span className="text-[0.65rem] font-medium uppercase tracking-wider text-[var(--muted-soft)]">{t('upload.required_creds')}</span>
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
                  <span className="text-[0.65rem] font-medium uppercase tracking-wider text-[var(--muted-soft)]">{t('upload.contributors')}</span>
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
            </div>
          </div>

          {/* Action Box */}
          <div className="hidden lg:flex rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 shadow-sm flex-col gap-4">
            {statusMessage && (
              <div className={`text-xs font-bold leading-relaxed ${submitState === 'error' ? 'text-red-500' : 'text-[var(--accent)]'}`}>
                {statusMessage}
              </div>
            )}

            <div className="grid gap-2 mb-2">
              {requirements.map(req => (
                <button
                  key={req.id}
                  onClick={() => !req.isMet && scrollToField(req.id)}
                  className={`flex items-center gap-2 text-left w-full p-2 -mx-2 rounded-lg transition-colors ${!req.isMet ? 'hover:bg-[var(--surface-alt)] cursor-pointer' : 'cursor-default'}`}
                >
                  {req.isMet ? (
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle size={16} className="text-red-500 shrink-0" />
                  )}
                  <span className={`text-[0.75rem] font-bold ${req.isMet ? 'text-[var(--text)]' : 'text-red-500'}`}>
                    {req.label}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={(e) => {
                if (!canShipWorkflow) {
                  e.preventDefault();
                  setHasAttemptedSubmit(true);
                  return;
                }
                submitWorkflow();
              }}
              disabled={submitState === 'saving'}
              className={`futuristic-hover group flex w-full items-center justify-center gap-2.5 rounded-xl bg-[var(--accent)] px-8 py-3.5 text-[0.85rem] font-bold text-white shadow-md shadow-[var(--accent-glow)] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 ${!canShipWorkflow ? 'opacity-40 cursor-not-allowed hover:scale-100' : 'hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]'}`}
            >
              <Send size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              <span className="uppercase tracking-widest">{submitState === 'saving' ? t('upload.shipping') : t('upload.ship_workflow')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)]/90 backdrop-blur-md border-t border-[var(--border)] p-4 px-6 shadow-2xl flex flex-col gap-3">
        {statusMessage && (
          <div className={`text-[0.7rem] font-bold text-center leading-relaxed ${submitState === 'error' ? 'text-red-500' : 'text-[var(--accent)]'}`}>
            {statusMessage}
          </div>
        )}
        <div className="flex items-center justify-between text-[0.7rem] font-bold text-[var(--muted-strong)]">
          <span>{t('upload.completion_progress') || 'Completion Progress'}</span>
          <span className={completedStepsCount === requirements.length ? 'text-emerald-500' : ''}>
            {Math.round(progressPercent)}%
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              const firstUnmet = requirements.find(r => !r.isMet);
              if (firstUnmet) {
                scrollToField(firstUnmet.id);
                setHasAttemptedSubmit(true);
              }
            }}
            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] py-3 text-[0.75rem] font-bold text-[var(--text-subtle)] text-center transition-all"
          >
            {completedStepsCount}/{requirements.length} {lang === 'th' ? 'เสร็จสิ้น' : 'Steps'}
          </button>
          <button
            onClick={(e) => {
              if (!canShipWorkflow) {
                e.preventDefault();
                setHasAttemptedSubmit(true);
                const firstUnmet = requirements.find(r => !r.isMet);
                if (firstUnmet) scrollToField(firstUnmet.id);
                return;
              }
              submitWorkflow();
            }}
            disabled={submitState === 'saving'}
            className={`flex-[2] futuristic-hover group flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-3 text-[0.8rem] font-bold text-white shadow-md shadow-[var(--accent-glow)] transition-all ${!canShipWorkflow ? 'opacity-50' : 'active:scale-95'}`}
          >
            <Send size={14} />
            <span className="uppercase tracking-wider">{submitState === 'saving' ? t('upload.shipping') : t('upload.ship_workflow')}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
