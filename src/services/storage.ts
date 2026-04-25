import localforage from 'localforage';
import type { Inspection, Photo } from '../types/inspection';
import { inspectionSchema } from '../validation/schemas';
import { z } from 'zod';
import { preferencesService } from './preferences';

const DRAFTS_KEY = 'inspection_drafts';
const AUTO_SAVE_KEY = 'inspection_autosave';
const PHOTOS_PREFIX = 'photos';
const COUNTERS_KEY = 'reference_counters';

interface ReferenceCounters {
  [projectId: string]: {
    defectCounter: number;
    riskCounter: number;
  };
}

export const storageService = {
  init: async () => {
    await localforage.config({
      name: 'BuildwellAI',
      storeName: 'inspections'
    });
  },

  generateReferenceId: async (projectId: string, category: 'Defect' | 'Risk'): Promise<string> => {
    const counters = await localforage.getItem<ReferenceCounters>(COUNTERS_KEY) || {};
    if (!counters[projectId]) {
      counters[projectId] = { defectCounter: 0, riskCounter: 0 };
    }

    const year = new Date().getFullYear();
    const counterKey = category === 'Defect' ? 'defectCounter' : 'riskCounter';
    counters[projectId][counterKey]++;
    
    await localforage.setItem(COUNTERS_KEY, counters);
    
    const prefix = category === 'Defect' ? 'DEF' : 'RISK';
    const paddedCounter = String(counters[projectId][counterKey]).padStart(3, '0');
    return `${prefix}-${year}-${paddedCounter}`;
  },

  saveDraft: async (inspection: Inspection): Promise<void> => {
    try {
      const validatedInspection = inspectionSchema.parse(inspection) as unknown as Inspection;
      const drafts = await storageService.getDrafts();
      const existingIndex = drafts.findIndex(d => d.id === inspection.id);
      
      if (existingIndex >= 0) {
        drafts[existingIndex] = validatedInspection;
      } else {
        drafts.push(validatedInspection);
      }

      await localforage.setItem(DRAFTS_KEY, drafts);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('Invalid inspection data: ' + error.errors.map(e => e.message).join(', '));
      }
      throw new Error('Failed to save draft: ' + (error as Error).message);
    }
  },

  getDrafts: async (): Promise<Inspection[]> => {
    try {
      const drafts = await localforage.getItem<Inspection[]>(DRAFTS_KEY);
      return drafts || [];
    } catch (error) {
      console.error('Error reading drafts:', error);
      return [];
    }
  },

  saveAutoSave: async (inspection: Partial<Inspection>): Promise<void> => {
    try {
      await localforage.setItem(AUTO_SAVE_KEY, inspection);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  },

  getAutoSave: async (): Promise<Partial<Inspection> | null> => {
    try {
      return await localforage.getItem(AUTO_SAVE_KEY);
    } catch (error) {
      console.error('Error reading auto-save:', error);
      return null;
    }
  },

  clearAutoSave: async (): Promise<void> => {
    try {
      await localforage.removeItem(AUTO_SAVE_KEY);
    } catch (error) {
      console.error('Error clearing auto-save:', error);
    }
  },

  savePhoto: async (projectId: string, photo: Photo): Promise<void> => {
    try {
      const prefs = await preferencesService.getPreferences();
      const key = `${PHOTOS_PREFIX}_${projectId}_${photo.id}`;
      
      // Generate reference ID for defects and risks if not already present
      if ((photo.category === 'Defect' || photo.category === 'Risk') && !photo.referenceId) {
        photo.referenceId = await storageService.generateReferenceId(projectId, photo.category);
      }

      // Apply compression if needed
      if (prefs.storage.compressionQuality < 1 && photo.uri.startsWith('data:image')) {
        photo.uri = await compressImage(photo.uri, prefs.storage.compressionQuality);
      }

      await localforage.setItem(key, photo);
    } catch (error) {
      console.error('Error saving photo:', error);
      throw new Error('Failed to save photo');
    }
  },

  getPhotos: async (projectId: string): Promise<Photo[]> => {
    try {
      const keys = await localforage.keys();
      const photoKeys = keys.filter(key => key.startsWith(`${PHOTOS_PREFIX}_${projectId}_`));
      
      const photos: Photo[] = [];
      for (const key of photoKeys) {
        const photo = await localforage.getItem<Photo>(key);
        if (photo) photos.push(photo);
      }

      return photos.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } catch (error) {
      console.error('Error reading photos:', error);
      return [];
    }
  },

  removePhoto: async (projectId: string, photoId: string): Promise<void> => {
    try {
      const key = `${PHOTOS_PREFIX}_${projectId}_${photoId}`;
      await localforage.removeItem(key);
    } catch (error) {
      console.error('Error removing photo:', error);
      throw new Error('Failed to remove photo');
    }
  }
};

async function compressImage(dataUrl: string, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}