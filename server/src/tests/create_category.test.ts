import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { type CreateCategoryInput } from '../schema';
import { createCategory } from '../handlers/create_category';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateCategoryInput = {
  name: 'Software Tools',
  slug: 'software-tools',
  description: 'Professional software and development tools',
  image_url: 'https://example.com/software-tools.jpg',
  is_active: true
};

describe('createCategory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a category with all fields', async () => {
    const result = await createCategory(testInput);

    // Basic field validation
    expect(result.name).toEqual('Software Tools');
    expect(result.slug).toEqual('software-tools');
    expect(result.description).toEqual('Professional software and development tools');
    expect(result.image_url).toEqual('https://example.com/software-tools.jpg');
    expect(result.is_active).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a category with minimal fields', async () => {
    const minimalInput: CreateCategoryInput = {
      name: 'Basic Category',
      slug: 'basic-category'
    };

    const result = await createCategory(minimalInput);

    expect(result.name).toEqual('Basic Category');
    expect(result.slug).toEqual('basic-category');
    expect(result.description).toBeNull();
    expect(result.image_url).toBeNull();
    expect(result.is_active).toEqual(true); // Should default to true
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should handle null description and image_url', async () => {
    const nullFieldsInput: CreateCategoryInput = {
      name: 'Null Fields Category',
      slug: 'null-fields-category',
      description: null,
      image_url: null,
      is_active: false
    };

    const result = await createCategory(nullFieldsInput);

    expect(result.name).toEqual('Null Fields Category');
    expect(result.description).toBeNull();
    expect(result.image_url).toBeNull();
    expect(result.is_active).toEqual(false);
  });

  it('should save category to database', async () => {
    const result = await createCategory(testInput);

    // Query using proper drizzle syntax
    const categories = await db.select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, result.id))
      .execute();

    expect(categories).toHaveLength(1);
    expect(categories[0].name).toEqual('Software Tools');
    expect(categories[0].slug).toEqual('software-tools');
    expect(categories[0].description).toEqual('Professional software and development tools');
    expect(categories[0].image_url).toEqual('https://example.com/software-tools.jpg');
    expect(categories[0].is_active).toEqual(true);
    expect(categories[0].created_at).toBeInstanceOf(Date);
    expect(categories[0].updated_at).toBeInstanceOf(Date);
  });

  it('should enforce unique slug constraint', async () => {
    // Create first category
    await createCategory(testInput);

    // Try to create second category with same slug
    const duplicateSlugInput: CreateCategoryInput = {
      name: 'Different Name',
      slug: 'software-tools' // Same slug as first category
    };

    await expect(createCategory(duplicateSlugInput)).rejects.toThrow(/duplicate key value/i);
  });

  it('should create multiple categories with different slugs', async () => {
    const category1 = await createCategory(testInput);

    const input2: CreateCategoryInput = {
      name: 'Web Development',
      slug: 'web-development',
      description: 'Web development tools and frameworks',
      is_active: false
    };

    const category2 = await createCategory(input2);

    // Both should be created successfully
    expect(category1.id).not.toEqual(category2.id);
    expect(category1.slug).toEqual('software-tools');
    expect(category2.slug).toEqual('web-development');
    expect(category1.is_active).toEqual(true);
    expect(category2.is_active).toEqual(false);

    // Verify both exist in database
    const allCategories = await db.select()
      .from(categoriesTable)
      .execute();

    expect(allCategories).toHaveLength(2);
  });

  it('should handle undefined optional fields correctly', async () => {
    const undefinedFieldsInput: CreateCategoryInput = {
      name: 'Undefined Fields Category',
      slug: 'undefined-fields-category',
      description: undefined,
      image_url: undefined,
      is_active: undefined
    };

    const result = await createCategory(undefinedFieldsInput);

    expect(result.name).toEqual('Undefined Fields Category');
    expect(result.description).toBeNull();
    expect(result.image_url).toBeNull();
    expect(result.is_active).toEqual(true); // Should use default value
  });
});