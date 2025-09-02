import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { type UpdateCategoryInput, type Category } from '../schema';
import { eq } from 'drizzle-orm';

export const updateCategory = async (input: UpdateCategoryInput): Promise<Category> => {
  try {
    // Check if category exists
    const existingCategory = await db.select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, input.id))
      .execute();

    if (existingCategory.length === 0) {
      throw new Error(`Category with ID ${input.id} not found`);
    }

    // Prepare update data - only include fields that are provided
    const updateData: any = {
      updated_at: new Date()
    };

    if (input.name !== undefined) {
      updateData['name'] = input.name;
    }
    if (input.slug !== undefined) {
      updateData['slug'] = input.slug;
    }
    if (input.description !== undefined) {
      updateData['description'] = input.description;
    }
    if (input.image_url !== undefined) {
      updateData['image_url'] = input.image_url;
    }
    if (input.is_active !== undefined) {
      updateData['is_active'] = input.is_active;
    }

    // Update the category
    const result = await db.update(categoriesTable)
      .set(updateData)
      .where(eq(categoriesTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Category update failed:', error);
    throw error;
  }
};