import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { type UpdateCategoryInput } from '../schema';
import { updateCategory } from '../handlers/update_category';
import { eq } from 'drizzle-orm';

describe('updateCategory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Create a test category to use in tests
  const createTestCategory = async () => {
    const result = await db.insert(categoriesTable)
      .values({
        name: 'Original Category',
        slug: 'original-category',
        description: 'Original description',
        image_url: 'http://example.com/original.jpg',
        is_active: true
      })
      .returning()
      .execute();
    
    return result[0];
  };

  it('should update all category fields', async () => {
    const category = await createTestCategory();
    
    const updateInput: UpdateCategoryInput = {
      id: category.id,
      name: 'Updated Category',
      slug: 'updated-category',
      description: 'Updated description',
      image_url: 'http://example.com/updated.jpg',
      is_active: false
    };

    const result = await updateCategory(updateInput);

    expect(result.id).toEqual(category.id);
    expect(result.name).toEqual('Updated Category');
    expect(result.slug).toEqual('updated-category');
    expect(result.description).toEqual('Updated description');
    expect(result.image_url).toEqual('http://example.com/updated.jpg');
    expect(result.is_active).toEqual(false);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(category.updated_at.getTime());
  });

  it('should update only specified fields', async () => {
    const category = await createTestCategory();
    
    const updateInput: UpdateCategoryInput = {
      id: category.id,
      name: 'Partially Updated Category',
      is_active: false
    };

    const result = await updateCategory(updateInput);

    expect(result.id).toEqual(category.id);
    expect(result.name).toEqual('Partially Updated Category');
    expect(result.slug).toEqual('original-category'); // Should remain unchanged
    expect(result.description).toEqual('Original description'); // Should remain unchanged
    expect(result.image_url).toEqual('http://example.com/original.jpg'); // Should remain unchanged
    expect(result.is_active).toEqual(false);
    expect(result.updated_at.getTime()).toBeGreaterThan(category.updated_at.getTime());
  });

  it('should handle null values correctly', async () => {
    const category = await createTestCategory();
    
    const updateInput: UpdateCategoryInput = {
      id: category.id,
      description: null,
      image_url: null
    };

    const result = await updateCategory(updateInput);

    expect(result.id).toEqual(category.id);
    expect(result.name).toEqual('Original Category'); // Should remain unchanged
    expect(result.slug).toEqual('original-category'); // Should remain unchanged
    expect(result.description).toBeNull();
    expect(result.image_url).toBeNull();
    expect(result.is_active).toEqual(true); // Should remain unchanged
  });

  it('should save changes to database', async () => {
    const category = await createTestCategory();
    
    const updateInput: UpdateCategoryInput = {
      id: category.id,
      name: 'Database Test Category',
      slug: 'database-test-category'
    };

    await updateCategory(updateInput);

    // Verify changes were saved in database
    const savedCategory = await db.select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, category.id))
      .execute();

    expect(savedCategory).toHaveLength(1);
    expect(savedCategory[0].name).toEqual('Database Test Category');
    expect(savedCategory[0].slug).toEqual('database-test-category');
    expect(savedCategory[0].description).toEqual('Original description');
    expect(savedCategory[0].updated_at.getTime()).toBeGreaterThan(category.updated_at.getTime());
  });

  it('should throw error when category does not exist', async () => {
    const updateInput: UpdateCategoryInput = {
      id: 999999, // Non-existent ID
      name: 'Non-existent Category'
    };

    await expect(updateCategory(updateInput)).rejects.toThrow(/Category with ID 999999 not found/i);
  });

  it('should handle empty update gracefully', async () => {
    const category = await createTestCategory();
    
    const updateInput: UpdateCategoryInput = {
      id: category.id
    };

    const result = await updateCategory(updateInput);

    // Should return category with only updated_at changed
    expect(result.id).toEqual(category.id);
    expect(result.name).toEqual('Original Category');
    expect(result.slug).toEqual('original-category');
    expect(result.description).toEqual('Original description');
    expect(result.image_url).toEqual('http://example.com/original.jpg');
    expect(result.is_active).toEqual(true);
    expect(result.updated_at.getTime()).toBeGreaterThan(category.updated_at.getTime());
  });

  it('should maintain referential integrity with products', async () => {
    const category = await createTestCategory();
    
    // Update should work even if we don't have products (no constraint violations)
    const updateInput: UpdateCategoryInput = {
      id: category.id,
      name: 'Category with Potential Products',
      is_active: false
    };

    const result = await updateCategory(updateInput);

    expect(result.name).toEqual('Category with Potential Products');
    expect(result.is_active).toEqual(false);
  });
});