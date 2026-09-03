import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface OfflineEntitlement {
  lessonId: string;
  userId: string;
  grantedAt: string;
  expiresAt: string;
  subscriptionEndDate: string;
}

export interface StoredOfflineLesson {
  lessonId: string;
  lessonData: {
    id: string;
    title: string;
    levelId?: { _id?: string; id?: string; code: string; label: string };
    subjectId?: { _id?: string; id?: string; name: string; icon?: string };
    week?: number;
    topic?: string;
  };
  pdfBlob: Blob;
  savedAt: string;
  entitlement: OfflineEntitlement;
}

interface RapidoFicheDB extends DBSchema {
  lessons: {
    key: string;
    value: StoredOfflineLesson;
    indexes: { 'by-saved': string };
  };
}

const DB_NAME = 'rapidofiche_offline_vault';
const DB_VERSION = 1;
const OFFLINE_GRACE_HOURS = 24; // Période de grâce technique (CDC Section 59)

class OfflineStorageService {
  private dbPromise: Promise<IDBPDatabase<RapidoFicheDB>>;

  constructor() {
    this.dbPromise = openDB<RapidoFicheDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('lessons')) {
          const store = db.createObjectStore('lessons', { keyPath: 'lessonId' });
          store.createIndex('by-saved', 'savedAt');
        }
      },
    });
  }

  public async saveLesson(
    lesson: StoredOfflineLesson['lessonData'],
    pdfBlob: Blob,
    userId: string,
    subscriptionEndDate: string
  ): Promise<void> {
    const db = await this.dbPromise;
    const now = new Date();

    const entitlement: OfflineEntitlement = {
      lessonId: lesson.id,
      userId,
      grantedAt: now.toISOString(),
      expiresAt: new Date(
        new Date(subscriptionEndDate).getTime() + OFFLINE_GRACE_HOURS * 60 * 60 * 1000
      ).toISOString(),
      subscriptionEndDate,
    };

    const item: StoredOfflineLesson = {
      lessonId: lesson.id,
      lessonData: lesson,
      pdfBlob,
      savedAt: now.toISOString(),
      entitlement,
    };

    await db.put('lessons', item);
  }

  public async getLesson(lessonId: string): Promise<StoredOfflineLesson | null> {
    const db = await this.dbPromise;
    const item = await db.get('lessons', lessonId);
    if (!item) return null;

    // Vérification de validité de la licence locale
    const now = new Date().getTime();
    const expiryTime = new Date(item.entitlement.expiresAt).getTime();

    if (now > expiryTime) {
      // Expiration du droit d'accès hors-ligne (CDC Section 59)
      await this.removeLesson(lessonId);
      return null;
    }

    return item;
  }

  public async isLessonSaved(lessonId: string): Promise<boolean> {
    const db = await this.dbPromise;
    const item = await db.get('lessons', lessonId);
    if (!item) return false;

    const now = new Date().getTime();
    return now <= new Date(item.entitlement.expiresAt).getTime();
  }

  public async removeLesson(lessonId: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('lessons', lessonId);
  }

  public async getAllSavedLessons(): Promise<StoredOfflineLesson[]> {
    const db = await this.dbPromise;
    const items = await db.getAll('lessons');
    const now = new Date().getTime();

    // Filtrer les éventuels éléments expirés
    const validItems: StoredOfflineLesson[] = [];
    for (const item of items) {
      if (now <= new Date(item.entitlement.expiresAt).getTime()) {
        validItems.push(item);
      } else {
        await this.removeLesson(item.lessonId);
      }
    }

    return validItems;
  }

  public async getSavedCount(): Promise<number> {
    const valid = await this.getAllSavedLessons();
    return valid.length;
  }
}

export const offlineStorage = new OfflineStorageService();
