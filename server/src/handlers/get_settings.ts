import { db } from '../db';
import { settingsTable } from '../db/schema';
import { type Setting } from '../schema';
import { eq } from 'drizzle-orm';

export async function getSettings(): Promise<Setting[]> {
  try {
    const results = await db.select()
      .from(settingsTable)
      .execute();

    return results;
  } catch (error) {
    console.error('Settings retrieval failed:', error);
    throw error;
  }
}

export async function getSettingByKey(key: string): Promise<Setting | null> {
  try {
    const results = await db.select()
      .from(settingsTable)
      .where(eq(settingsTable.key, key))
      .execute();

    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Setting retrieval by key failed:', error);
    throw error;
  }
}