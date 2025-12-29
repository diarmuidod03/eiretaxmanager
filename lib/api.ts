// API client for syncing tax data with backend

import { useAppStore, AppState } from './store';

const API_BASE = '/api';

export async function syncDataToServer(userId: string, data: Partial<AppState>) {
  try {
    const response = await fetch(`${API_BASE}/user-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        data,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to sync data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error syncing data:', error);
    throw error;
  }
}

export async function loadDataFromServer(userId: string): Promise<Partial<AppState> | null> {
  try {
    const response = await fetch(`${API_BASE}/user-data?userId=${userId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // No data yet
      }
      throw new Error('Failed to load data');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error loading data:', error);
    return null;
  }
}

