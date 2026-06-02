import fs from 'fs';
import path from 'path';

export interface AdminSettings {
  sheetIdUsers: string;
  sheetIdFlows: string;
  sheetIdDownloadRequests: string;
  sheetIdSpeakerRequests: string;
  sheetIdSocialLinks: string;
  [key: string]: string;
}

const SETTINGS_FILE_PATH = path.join(process.cwd(), 'data', 'settings.json');

/**
 * Ensures the settings file exists. If not, creates it with empty values.
 */
function ensureSettingsFile() {
  const dir = path.dirname(SETTINGS_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(SETTINGS_FILE_PATH)) {
    const defaultSettings: AdminSettings = {
      sheetIdUsers: '',
      sheetIdFlows: '',
      sheetIdDownloadRequests: '',
      sheetIdSpeakerRequests: '',
      sheetIdSocialLinks: '',
    };
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(defaultSettings, null, 2), 'utf8');
  }
}

/**
 * Gets the current admin settings.
 */
export function getAdminSettings(): AdminSettings {
  ensureSettingsFile();
  try {
    const data = fs.readFileSync(SETTINGS_FILE_PATH, 'utf8');
    return JSON.parse(data) as AdminSettings;
  } catch (error) {
    console.error('Error reading settings.json:', error);
    return { 
      sheetIdUsers: '', 
      sheetIdFlows: '', 
      sheetIdDownloadRequests: '', 
      sheetIdSpeakerRequests: '', 
      sheetIdSocialLinks: '' 
    };
  }
}

/**
 * Updates the admin settings.
 */
export function updateAdminSettings(newSettings: Partial<AdminSettings>): AdminSettings {
  const current = getAdminSettings();
  const updated = { ...current, ...newSettings };
  try {
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(updated, null, 2), 'utf8');
    return updated;
  } catch (error) {
    console.error('Error writing to settings.json:', error);
    throw new Error('Failed to save settings');
  }
}
