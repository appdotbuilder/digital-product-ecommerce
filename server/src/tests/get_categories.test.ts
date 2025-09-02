import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { type CreateCategoryInput } from '../schema';
import { getCategories } from '../handlers/get_categories';

// Test category data
const testCategories: CreateCategoryInput[] = [
  {
    name: 'Web Development',
    slug: 'web-development',
    description: 'Tools and templates for web development',
    image_url: 'https://example.com/web-dev.jpg',
    is_active: true
  },
  {
    name: 'Mobile Apps',
    slug: 'mobile-apps',
    description: 'Mobile application templates',
    image_url: null,
    is_active: true
  },
  {
    name: 'Inactive Category',
    slug: 'inactive-category',
    description: 'This category is inactive',
    image_url: null,
    is_active: false
  }
];

describe('getCategories', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no categories exist', async () => {
    const result = await getCategories();
    expect(result).toEqual([]);
  });

  it('should fetch all active categories', async () => {
    // Create test categories
    await db.insert(categoriesTable)
      .values(testCategories)
      .execute();

    const result = await getCategories();

    // Should only return active categories
    expect(result).toHaveLength(2);
    
    // Verify categories are active
    result.forEach(category => {
      expect(category.is_active).toBe(true);
    });
  });

  it('should exclude inactive categories', async () => {
    // Create test categories including inactive one
    await db.insert(categoriesTable)
      .values(testCategories)
      .execute();

    const result = await getCategories();

    // Should not include inactive category
    const inactiveCategory = result.find(cat => cat.slug === 'inactive-category');
    expect(inactiveCategory).toBeUndefined();
  });

  it('should return categories sorted by name', async () => {
    // Create categories in different order
    const unsortedCategories = [
      {
        name: 'Zebra Category',
        slug: 'zebra-category',
        description: 'Last alphabetically',
        is_active: true
      },
      {
        name: 'Alpha Category',
        slug: 'alpha-category',
        description: 'First alphabetically',
        is_active: true
      },
      {
        name: 'Beta Category',
        slug: 'beta-category',
        description: 'Middle alphabetically',
        is_active: true
      }
    ];

    await db.insert(categoriesTable)
      .values(unsortedCategories)
      .execute();

    const result = await getCategories();

    // Should be sorted alphabetically by name
    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('Alpha Category');
    expect(result[1].name).toBe('Beta Category');
    expect(result[2].name).toBe('Zebra Category');
  });

  it('should return categories with all required fields', async () => {
    await db.insert(categoriesTable)
      .values([testCategories[0]])
      .execute();

    const result = await getCategories();
    const category = result[0];

    // Verify all fields are present and correct types
    expect(category.id).toBeDefined();
    expect(typeof category.id).toBe('number');
    expect(category.name).toBe('Web Development');
    expect(category.slug).toBe('web-development');
    expect(category.description).toBe('Tools and templates for web development');
    expect(category.image_url).toBe('https://example.com/web-dev.jpg');
    expect(category.is_active).toBe(true);
    expect(category.created_at).toBeInstanceOf(Date);
    expect(category.updated_at).toBeInstanceOf(Date);
  });

  it('should handle categories with null optional fields', async () => {
    const categoryWithNulls = {
      name: 'Test Category',
      slug: 'test-category',
      description: null,
      image_url: null,
      is_active: true
    };

    await db.insert(categoriesTable)
      .values([categoryWithNulls])
      .execute();

    const result = await getCategories();
    const category = result[0];

    expect(category.description).toBeNull();
    expect(category.image_url).toBeNull();
  });
});