'use client';

import { useState, useEffect, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Save, Download, Plus, Trash2, Loader2, RefreshCw, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { useI18n } from '@/lib/i18n';

export default function AdminPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingUsers, setIsSavingUsers] = useState(false);
  const [isSavingFlows, setIsSavingFlows] = useState(false);
  const [isSavingDownloadRequests, setIsSavingDownloadRequests] = useState(false);
  const [isSavingSpeakerRequests, setIsSavingSpeakerRequests] = useState(false);
  const [isSavingSocial, setIsSavingSocial] = useState(false);
  const [isSavingLinks, setIsSavingLinks] = useState(false);

  // Confirm Modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmInputValue, setConfirmInputValue] = useState('');
  const [pendingSaveAction, setPendingSaveAction] = useState<(() => Promise<void>) | null>(null);
  const [confirmDetails, setConfirmDetails] = useState({ keyLabel: '', oldVal: '', newVal: '' });
  const [mounted, setMounted] = useState(false);
  const [visibleIds, setVisibleIds] = useState<Record<string, boolean>>({});

  const toggleVisibility = (key: string) => {
    setVisibleIds(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Settings state
  const [settings, setSettings] = useState({
    sheetIdUsers: '',
    sheetIdFlows: '',
    sheetIdDownloadRequests: '',
    sheetIdSpeakerRequests: '',
    sheetIdSocialLinks: '',
  });

  const [currentSettings, setCurrentSettings] = useState({
    sheetIdUsers: '',
    sheetIdFlows: '',
    sheetIdDownloadRequests: '',
    sheetIdSpeakerRequests: '',
    sheetIdSocialLinks: '',
  });

  // Social Links state
  const [socialLinks, setSocialLinks] = useState<{ platform: string, url: string }[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sessionData, settingsData, linksData] = await Promise.all([
        fetch('/api/auth/session').then(res => res.json()),
        fetch('/api/admin/settings').then(res => res.json()),
        fetch('/api/admin/social-links').then(res => res.json())
      ]);

      if (!sessionData?.user || sessionData.user.role?.toLowerCase() !== 'admin') {
        router.replace('/');
        return;
      }

      if (settingsData && !settingsData.error) {
        const loadedSettings = {
          sheetIdUsers: settingsData.sheetIdUsers || '',
          sheetIdFlows: settingsData.sheetIdFlows || '',
          sheetIdDownloadRequests: settingsData.sheetIdDownloadRequests || '',
          sheetIdSpeakerRequests: settingsData.sheetIdSpeakerRequests || '',
          sheetIdSocialLinks: settingsData.sheetIdSocialLinks || '',
        };
        setSettings(loadedSettings);
        setCurrentSettings(loadedSettings);
      }
      if (linksData && linksData.links) {
        setSocialLinks(linksData.links);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [router]);

  const handleSaveSetting = async (e: MouseEvent<HTMLButtonElement>, key: keyof typeof settings, value: string, label: string, setSavingState: (s: boolean) => void) => {
    // Open the modal and set the pending action
    setConfirmInputValue('');
    setConfirmDetails({
      keyLabel: label,
      oldVal: currentSettings[key] || t('admin.no_data'),
      newVal: value
    });
    setPendingSaveAction(() => async () => {
      setSavingState(true);
      try {
        const updatedSettings = { ...currentSettings, [key]: value };
        const res = await fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedSettings),
        });
        if (res.ok) {
          alert('บันทึกการตั้งค่าสำเร็จ!');
          setCurrentSettings(updatedSettings);
          // Refresh social links in case sheet ID changed
          if (key === 'sheetIdSocialLinks') {
            const linksRes = await fetch('/api/admin/social-links');
            const linksData = await linksRes.json();
            if (linksData.links) setSocialLinks(linksData.links);
          }
        } else {
          alert('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า');
        }
      } catch (e) {
        alert('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า');
      } finally {
        setSavingState(false);
      }
    });
    setIsConfirmModalOpen(true);
  };

  const executePendingSave = async () => {
    const input = confirmInputValue.trim().toLowerCase();
    if (input !== 'ยืนยัน' && input !== 'confirm') {
      return;
    }
    setIsConfirmModalOpen(false);
    if (pendingSaveAction) {
      await pendingSaveAction();
      setPendingSaveAction(null);
    }
  };

  const handleSaveSocialLinks = async () => {
    setIsSavingLinks(true);
    try {
      const res = await fetch('/api/admin/social-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links: socialLinks.filter(l => l.platform.trim() !== '') }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('บันทึกลิงก์โซเชียลสำเร็จ!');
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการบันทึกลิงก์โซเชียล');
      }
    } catch (e) {
      alert('เกิดข้อผิดพลาดในการบันทึกลิงก์โซเชียล');
    } finally {
      setIsSavingLinks(false);
    }
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: '', url: '' }]);
  };

  const removeSocialLink = (index: number) => {
    const newLinks = [...socialLinks];
    newLinks.splice(index, 1);
    setSocialLinks(newLinks);
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    const newLinks = [...socialLinks];
    newLinks[index][field] = value;
    setSocialLinks(newLinks);
  };

  const downloadTemplate = (filename: string) => {
    window.location.href = `/templates/${filename}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[var(--accent)] mb-4" size={32} />
        <p className="text-[var(--text)] font-medium">{t('admin.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Navbar />

      {/* Confirm Modal (Centered via Portal) */}
      {isConfirmModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsConfirmModalOpen(false)}></div>
          <div className="relative bg-[var(--surface)] w-full max-w-md rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-[var(--text)] mb-3">{t('admin.confirm_modal_title')}</h3>
              
              <div className="mb-5 p-4 bg-[var(--background)] rounded-xl border border-[var(--border)] shadow-inner">
                <p className="text-sm font-semibold text-[var(--text)] mb-3 border-b border-[var(--border)] pb-2">
                  📄 กำลังเปลี่ยนแปลง: <span className="text-[var(--accent)]">{confirmDetails.keyLabel}</span>
                </p>
                <div className="flex flex-col gap-3 text-sm break-all">
                  <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
                    <span className="text-xs font-bold tracking-wider opacity-90">🔴 จากเดิม (Old)</span>
                    <span className="font-medium">{confirmDetails.oldVal}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <span className="text-xs font-bold tracking-wider opacity-90">🟢 เปลี่ยนเป็น (New)</span>
                    <span className="font-medium">{confirmDetails.newVal}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-[var(--muted)] mb-4">{t('admin.confirm_modal_desc')}</p>
              
              <input
                type="text"
                value={confirmInputValue}
                onChange={(e) => setConfirmInputValue(e.target.value)}
                placeholder={t('admin.confirm_modal_placeholder')}
                className="w-full bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (confirmInputValue.trim().toLowerCase() === 'ยืนยัน' || confirmInputValue.trim().toLowerCase() === 'confirm')) {
                    executePendingSave();
                  }
                }}
              />
            </div>
            <div className="flex items-center justify-end gap-3 bg-[var(--surface-alt)] px-6 py-4 border-t border-[var(--border)]">
              <button
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setPendingSaveAction(null);
                }}
                className="px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                {t('admin.confirm_modal_cancel')}
              </button>
              <button
                onClick={executePendingSave}
                disabled={confirmInputValue.trim().toLowerCase() !== 'ยืนยัน' && confirmInputValue.trim().toLowerCase() !== 'confirm'}
                className="px-4 py-2 text-sm font-medium bg-[var(--accent)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {t('admin.confirm_modal_confirm')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8 border-b border-[var(--border)] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text)]">{t('admin.title')}</h1>
            <p className="text-sm text-[var(--muted)] mt-2">{t('admin.subtitle')}</p>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text)] px-4 py-2 rounded-lg font-medium hover:bg-[var(--border)] transition-colors"
          >
            <RefreshCw size={16} />
            {t('admin.refresh')}
          </button>
        </div>

        <div className="space-y-10">

          {/* Section 1: Sheet IDs */}
          <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[var(--text)]">{t('admin.sheet_settings')}</h2>
                <p className="text-sm text-[var(--muted)] mt-1">{t('admin.sheet_desc')}</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Users Sheet */}
              <div className="bg-[var(--surface-alt)] p-4 rounded-xl border border-[var(--border)]">
                <label className="block text-sm font-semibold text-[var(--text)] mb-2">{t('admin.users_sheet')}</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="text-[0.8rem] text-[var(--muted)] flex items-center gap-2">
                      <span>{t('admin.current_id')} {currentSettings.sheetIdUsers ? <span className="font-mono text-[var(--text)]">{visibleIds.sheetIdUsers ? currentSettings.sheetIdUsers : '••••••••••••••••••••'}</span> : <span className="text-[var(--text)]">{t('admin.no_data')}</span>}</span>
                      {currentSettings.sheetIdUsers && (
                        <a href={`https://docs.google.com/spreadsheets/d/${currentSettings.sheetIdUsers}`} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline flex items-center gap-1">
                          {t('admin.open_sheet')} <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={visibleIds.sheetIdUsers ? "text" : "password"}
                        value={settings.sheetIdUsers}
                        onChange={(e) => setSettings({ ...settings, sheetIdUsers: e.target.value })}
                        className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 pr-10 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                        placeholder="e.g. 1BxiMVs0XRYFgwnm..."
                      />
                      <button type="button" onClick={() => toggleVisibility('sheetIdUsers')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)]">
                        {visibleIds.sheetIdUsers ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={(e) => handleSaveSetting(e, 'sheetIdUsers', settings.sheetIdUsers, t('admin.users_sheet'), setIsSavingUsers)}
                      disabled={isSavingUsers || settings.sheetIdUsers === currentSettings.sheetIdUsers}
                      className="flex items-center gap-2 bg-[var(--accent)] text-white px-5 py-2 h-[42px] rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isSavingUsers ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {t('admin.save')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Flows Sheet */}
              <div className="bg-[var(--surface-alt)] p-4 rounded-xl border border-[var(--border)]">
                <label className="block text-sm font-semibold text-[var(--text)] mb-2">{t('admin.flows_sheet')}</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="text-[0.8rem] text-[var(--muted)] flex items-center gap-2">
                      <span>{t('admin.current_id')} {currentSettings.sheetIdFlows ? <span className="font-mono text-[var(--text)]">{visibleIds.sheetIdFlows ? currentSettings.sheetIdFlows : '••••••••••••••••••••'}</span> : <span className="text-[var(--text)]">{t('admin.no_data')}</span>}</span>
                      {currentSettings.sheetIdFlows && (
                        <a href={`https://docs.google.com/spreadsheets/d/${currentSettings.sheetIdFlows}`} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline flex items-center gap-1">
                          {t('admin.open_sheet')} <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={visibleIds.sheetIdFlows ? "text" : "password"}
                        value={settings.sheetIdFlows}
                        onChange={(e) => setSettings({ ...settings, sheetIdFlows: e.target.value })}
                        className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 pr-10 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                        placeholder="e.g. 1BxiMVs0XRYFgwnm..."
                      />
                      <button type="button" onClick={() => toggleVisibility('sheetIdFlows')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)]">
                        {visibleIds.sheetIdFlows ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={(e) => handleSaveSetting(e, 'sheetIdFlows', settings.sheetIdFlows, t('admin.flows_sheet'), setIsSavingFlows)}
                      disabled={isSavingFlows || settings.sheetIdFlows === currentSettings.sheetIdFlows}
                      className="flex items-center gap-2 bg-[var(--accent)] text-white px-5 py-2 h-[42px] rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isSavingFlows ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {t('admin.save')}
                    </button>
                  </div>
                </div>
              </div>

              {/* DownloadRequests Sheet */}
              <div className="bg-[var(--surface-alt)] p-4 rounded-xl border border-[var(--border)]">
                <label className="block text-sm font-semibold text-[var(--text)] mb-2">{t('admin.download_requests_sheet')}</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="text-[0.8rem] text-[var(--muted)] flex items-center gap-2">
                      <span>{t('admin.current_id')} {currentSettings.sheetIdDownloadRequests ? <span className="font-mono text-[var(--text)]">{visibleIds.sheetIdDownloadRequests ? currentSettings.sheetIdDownloadRequests : '••••••••••••••••••••'}</span> : <span className="text-[var(--text)]">{t('admin.no_data')}</span>}</span>
                      {currentSettings.sheetIdDownloadRequests && (
                        <a href={`https://docs.google.com/spreadsheets/d/${currentSettings.sheetIdDownloadRequests}`} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline flex items-center gap-1">
                          {t('admin.open_sheet')} <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={visibleIds.sheetIdDownloadRequests ? "text" : "password"}
                        value={settings.sheetIdDownloadRequests}
                        onChange={(e) => setSettings({ ...settings, sheetIdDownloadRequests: e.target.value })}
                        className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 pr-10 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                        placeholder="e.g. 1BxiMVs0XRYFgwnm..."
                      />
                      <button type="button" onClick={() => toggleVisibility('sheetIdDownloadRequests')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)]">
                        {visibleIds.sheetIdDownloadRequests ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={(e) => handleSaveSetting(e, 'sheetIdDownloadRequests', settings.sheetIdDownloadRequests, t('admin.download_requests_sheet'), setIsSavingDownloadRequests)}
                      disabled={isSavingDownloadRequests || settings.sheetIdDownloadRequests === currentSettings.sheetIdDownloadRequests}
                      className="flex items-center gap-2 bg-[var(--accent)] text-white px-5 py-2 h-[42px] rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isSavingDownloadRequests ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {t('admin.save')}
                    </button>
                  </div>
                </div>
              </div>

              {/* SpeakerRequests Sheet */}
              <div className="bg-[var(--surface-alt)] p-4 rounded-xl border border-[var(--border)]">
                <label className="block text-sm font-semibold text-[var(--text)] mb-2">{t('admin.speaker_requests_sheet')}</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="text-[0.8rem] text-[var(--muted)] flex items-center gap-2">
                      <span>{t('admin.current_id')} {currentSettings.sheetIdSpeakerRequests ? <span className="font-mono text-[var(--text)]">{visibleIds.sheetIdSpeakerRequests ? currentSettings.sheetIdSpeakerRequests : '••••••••••••••••••••'}</span> : <span className="text-[var(--text)]">{t('admin.no_data')}</span>}</span>
                      {currentSettings.sheetIdSpeakerRequests && (
                        <a href={`https://docs.google.com/spreadsheets/d/${currentSettings.sheetIdSpeakerRequests}`} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline flex items-center gap-1">
                          {t('admin.open_sheet')} <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={visibleIds.sheetIdSpeakerRequests ? "text" : "password"}
                        value={settings.sheetIdSpeakerRequests}
                        onChange={(e) => setSettings({ ...settings, sheetIdSpeakerRequests: e.target.value })}
                        className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 pr-10 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                        placeholder="e.g. 1BxiMVs0XRYFgwnm..."
                      />
                      <button type="button" onClick={() => toggleVisibility('sheetIdSpeakerRequests')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)]">
                        {visibleIds.sheetIdSpeakerRequests ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={(e) => handleSaveSetting(e, 'sheetIdSpeakerRequests', settings.sheetIdSpeakerRequests, t('admin.speaker_requests_sheet'), setIsSavingSpeakerRequests)}
                      disabled={isSavingSpeakerRequests || settings.sheetIdSpeakerRequests === currentSettings.sheetIdSpeakerRequests}
                      className="flex items-center gap-2 bg-[var(--accent)] text-white px-5 py-2 h-[42px] rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isSavingSpeakerRequests ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {t('admin.save')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Social Links Sheet */}
              <div className="bg-[var(--surface-alt)] p-4 rounded-xl border border-[var(--border)]">
                <label className="block text-sm font-semibold text-[var(--text)] mb-2">{t('admin.social_sheet')}</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="text-[0.8rem] text-[var(--muted)] flex items-center gap-2">
                      <span>{t('admin.current_id')} {currentSettings.sheetIdSocialLinks ? <span className="font-mono text-[var(--text)]">{visibleIds.sheetIdSocialLinks ? currentSettings.sheetIdSocialLinks : '••••••••••••••••••••'}</span> : <span className="text-[var(--text)]">{t('admin.no_data')}</span>}</span>
                      {currentSettings.sheetIdSocialLinks && (
                        <a href={`https://docs.google.com/spreadsheets/d/${currentSettings.sheetIdSocialLinks}`} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline flex items-center gap-1">
                          {t('admin.open_sheet')} <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={visibleIds.sheetIdSocialLinks ? "text" : "password"}
                        value={settings.sheetIdSocialLinks}
                        onChange={(e) => setSettings({ ...settings, sheetIdSocialLinks: e.target.value })}
                        className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 pr-10 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
                        placeholder="e.g. 1BxiMVs0XRYFgwnm..."
                      />
                      <button type="button" onClick={() => toggleVisibility('sheetIdSocialLinks')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)]">
                        {visibleIds.sheetIdSocialLinks ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={(e) => handleSaveSetting(e, 'sheetIdSocialLinks', settings.sheetIdSocialLinks, t('admin.social_sheet'), setIsSavingSocial)}
                      disabled={isSavingSocial || settings.sheetIdSocialLinks === currentSettings.sheetIdSocialLinks}
                      className="flex items-center gap-2 bg-[var(--accent)] text-white px-5 py-2 h-[42px] rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isSavingSocial ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {t('admin.save')}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Section 2: Social Links */}
          <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[var(--text)]">{t('admin.social_title')}</h2>
                <p className="text-sm text-[var(--muted)] mt-1">{t('admin.social_desc')}</p>
              </div>
              <button
                onClick={addSocialLink}
                className="flex w-max items-center gap-2 bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text)] px-4 py-2 rounded-lg font-medium hover:bg-[var(--border)] transition-colors"
              >
                <Plus size={16} />
                {t('admin.add_link')}
              </button>
            </div>

            <div className="space-y-3">
              {socialLinks.length === 0 ? (
                <p className="text-sm text-[var(--muted)] text-center py-6 bg-[var(--surface-alt)] rounded-lg border border-[var(--border)] border-dashed">
                  {t('admin.no_social')}
                </p>
              ) : (
                socialLinks.map((link, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-[var(--surface-alt)] p-3 rounded-lg border border-[var(--border)]">
                    <div className="w-full sm:w-1/3">
                      <input
                        type="text"
                        value={link.platform}
                        onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                        placeholder={t('admin.platform')}
                        className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-md px-3 py-1.5 text-sm text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                      />
                    </div>
                    <div className="w-full sm:w-flex-1 flex-1 flex gap-2 items-center">
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                        placeholder={t('admin.url')}
                        className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-md px-3 py-1.5 text-sm text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                      />
                      <button
                        onClick={() => removeSocialLink(index)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors flex-shrink-0"
                        title={t('admin.remove_link')}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveSocialLinks}
                disabled={isSavingLinks || socialLinks.length === 0}
                className="flex items-center gap-2 bg-[var(--accent)] text-white px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSavingLinks ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {t('admin.save_all_links')}
              </button>
            </div>
          </section>

          {/* Section 3: CSV Templates */}
          <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[var(--text)]">{t('admin.templates_title')}</h2>
              <p className="text-sm text-[var(--muted)] mt-1">{t('admin.templates_desc')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => downloadTemplate('users-template.csv')}
                className="flex flex-col items-center justify-center p-6 bg-[var(--surface-alt)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] hover:shadow-md transition-all group"
              >
                <div className="h-12 w-12 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Download size={24} />
                </div>
                <span className="font-medium text-[var(--text)]">Users Sheet</span>
                <span className="text-xs text-[var(--muted)] mt-1">users-template.csv</span>
              </button>

              <button
                onClick={() => downloadTemplate('flows-template.csv')}
                className="flex flex-col items-center justify-center p-6 bg-[var(--surface-alt)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] hover:shadow-md transition-all group"
              >
                <div className="h-12 w-12 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Download size={24} />
                </div>
                <span className="font-medium text-[var(--text)]">Flows Sheet</span>
                <span className="text-xs text-[var(--muted)] mt-1">flows-template.csv</span>
              </button>

              <button
                onClick={() => downloadTemplate('social-links-template.csv')}
                className="flex flex-col items-center justify-center p-6 bg-[var(--surface-alt)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] hover:shadow-md transition-all group"
              >
                <div className="h-12 w-12 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Download size={24} />
                </div>
                <span className="font-medium text-[var(--text)]">Social Links Sheet</span>
                <span className="text-xs text-[var(--muted)] mt-1">social-links-template.csv</span>
              </button>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
