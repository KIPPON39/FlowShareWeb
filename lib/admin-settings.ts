import { get } from '@vercel/edge-config';

export interface AdminSettings {
  sheetIdUsers: string;
  sheetIdFlows: string;
  sheetIdDownloadRequests: string;
  sheetIdSpeakerRequests: string;
  sheetIdSocialLinks: string;
  [key: string]: string;
}

/**
 * Gets the current admin settings from Edge Config or Environment Variables.
 */
export async function getAdminSettings(): Promise<AdminSettings> {
  try {
    let parsed: Partial<AdminSettings> = {};
    if (process.env.EDGE_CONFIG) {
      parsed = (await get('adminSettings')) || {};
    }
    
    return {
      sheetIdUsers: parsed.sheetIdUsers || process.env.GOOGLE_SHEET_ID_USERS || '',
      sheetIdFlows: parsed.sheetIdFlows || process.env.GOOGLE_SHEET_ID_FLOWS || '',
      sheetIdDownloadRequests: parsed.sheetIdDownloadRequests || process.env.GOOGLE_SHEET_ID_DOWNLOAD_REQUESTS || '',
      sheetIdSpeakerRequests: parsed.sheetIdSpeakerRequests || process.env.GOOGLE_SHEET_ID_SPEAKER_REQUESTS || '',
      sheetIdSocialLinks: parsed.sheetIdSocialLinks || process.env.GOOGLE_SHEET_ID_SOCIAL_LINKS || '',
      ...parsed,
    };
  } catch (error) {
    console.error('Error reading from Edge Config:', error);
    return {
      sheetIdUsers: process.env.GOOGLE_SHEET_ID_USERS || '',
      sheetIdFlows: process.env.GOOGLE_SHEET_ID_FLOWS || '',
      sheetIdDownloadRequests: process.env.GOOGLE_SHEET_ID_DOWNLOAD_REQUESTS || '',
      sheetIdSpeakerRequests: process.env.GOOGLE_SHEET_ID_SPEAKER_REQUESTS || '',
      sheetIdSocialLinks: process.env.GOOGLE_SHEET_ID_SOCIAL_LINKS || ''
    };
  }
}

/**
 * Updates the admin settings in Edge Config via Vercel REST API.
 */
export async function updateAdminSettings(newSettings: Partial<AdminSettings>): Promise<AdminSettings> {
  const current = await getAdminSettings();
  const updated = { ...current, ...newSettings } as AdminSettings;

  if (!process.env.EDGE_CONFIG || !process.env.VERCEL_API_TOKEN) {
    console.warn('EDGE_CONFIG or VERCEL_API_TOKEN missing, cannot update Edge Config. Returning updated object without saving.');
    return updated; 
  }

  try {
    // Extract Edge Config ID from URL
    // e.g. https://edge-config.vercel.com/ecfg_xxxxxxxx?token=...
    const url = new URL(process.env.EDGE_CONFIG);
    const edgeConfigId = url.pathname.split('/')[1];

    const updateResponse = await fetch(`https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            operation: 'upsert',
            key: 'adminSettings',
            value: updated,
          },
        ],
      }),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('Failed to update Edge Config:', updateResponse.status, errorText);
      throw new Error('Failed to update Edge Config');
    }

    return updated;
  } catch (error) {
    console.error('Error updating Edge Config:', error);
    throw new Error('Failed to save settings');
  }
}
