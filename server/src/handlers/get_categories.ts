import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { type Category } from '../schema';
import { eq, asc } from 'drizzle-orm';

export async function getCategories(): Promise<Category[]> {
  try {
    // Fetch all active categories ordered by name
    const results = await db.select()
      .from(categoriesTable)
      .where(eq(categoriesTable.is_active, true))
      .orderBy(asc(categoriesTable.name))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    throw error;
  }
}