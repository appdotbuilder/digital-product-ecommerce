import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable, categoriesTable } from '../db/schema';
import { type CreateProductInput } from '../schema';
import { createProduct } from '../handlers/create_product';
import { eq } from 'drizzle-orm';

// Test category data
const testCategory = {
  name: 'Software',
  slug: 'software',
  description: 'Software category',
  is_active: true
};

// Complete test input with all fields
const testInput: CreateProductInput = {
  name: 'Test Product',
  slug: 'test-product',
  description: 'A product for testing',
  short_description: 'Test product short description',
  price: 19.99,
  discount_price: 15.99,
  category_id: 1, // Will be set dynamically after creating category
  image_url: 'https://example.com/image.jpg',
  download_url: 'https://example.com/download.zip',
  license_key: 'TEST-LICENSE-KEY-123',
  is_active: true,
  is_featured: false
};

describe('createProduct', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a product with all fields', async () => {
    // Create test category first
    const categoryResult = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();
    
    const input = { ...testInput, category_id: categoryResult[0].id };
    const result = await createProduct(input);

    // Verify all fields are correctly set
    expect(result.name).toEqual('Test Product');
    expect(result.slug).toEqual('test-product');
    expect(result.description).toEqual('A product for testing');
    expect(result.short_description).toEqual('Test product short description');
    expect(result.price).toEqual(19.99);
    expect(typeof result.price).toBe('number');
    expect(result.discount_price).toEqual(15.99);
    expect(typeof result.discount_price).toBe('number');
    expect(result.category_id).toEqual(categoryResult[0].id);
    expect(result.image_url).toEqual('https://example.com/image.jpg');
    expect(result.download_url).toEqual('https://example.com/download.zip');
    expect(result.license_key).toEqual('TEST-LICENSE-KEY-123');
    expect(result.is_active).toBe(true);
    expect(result.is_featured).toBe(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save product to database correctly', async () => {
    // Create test category first
    const categoryResult = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();
    
    const input = { ...testInput, category_id: categoryResult[0].id };
    const result = await createProduct(input);

    // Query database to verify product was saved
    const products = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, result.id))
      .execute();

    expect(products).toHaveLength(1);
    const savedProduct = products[0];
    
    expect(savedProduct.name).toEqual('Test Product');
    expect(savedProduct.slug).toEqual('test-product');
    expect(savedProduct.description).toEqual('A product for testing');
    expect(parseFloat(savedProduct.price)).toEqual(19.99);
    expect(parseFloat(savedProduct.discount_price!)).toEqual(15.99);
    expect(savedProduct.category_id).toEqual(categoryResult[0].id);
    expect(savedProduct.is_active).toBe(true);
    expect(savedProduct.is_featured).toBe(false);
  });

  it('should handle minimal input with defaults', async () => {
    // Create test category first
    const categoryResult = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();

    const minimalInput: CreateProductInput = {
      name: 'Minimal Product',
      slug: 'minimal-product',
      price: 9.99,
      category_id: categoryResult[0].id
    };

    const result = await createProduct(minimalInput);

    expect(result.name).toEqual('Minimal Product');
    expect(result.slug).toEqual('minimal-product');
    expect(result.price).toEqual(9.99);
    expect(result.description).toBeNull();
    expect(result.short_description).toBeNull();
    expect(result.discount_price).toBeNull();
    expect(result.image_url).toBeNull();
    expect(result.download_url).toBeNull();
    expect(result.license_key).toBeNull();
    expect(result.is_active).toBe(true); // Should default to true
    expect(result.is_featured).toBe(false); // Should default to false
  });

  it('should handle null optional fields', async () => {
    // Create test category first
    const categoryResult = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();

    const inputWithNulls: CreateProductInput = {
      name: 'Product with Nulls',
      slug: 'product-with-nulls',
      price: 29.99,
      category_id: categoryResult[0].id,
      description: null,
      short_description: null,
      discount_price: null,
      image_url: null,
      download_url: null,
      license_key: null
    };

    const result = await createProduct(inputWithNulls);

    expect(result.description).toBeNull();
    expect(result.short_description).toBeNull();
    expect(result.discount_price).toBeNull();
    expect(result.image_url).toBeNull();
    expect(result.download_url).toBeNull();
    expect(result.license_key).toBeNull();
  });

  it('should handle boolean flags correctly', async () => {
    // Create test category first
    const categoryResult = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();

    const inputWithFlags: CreateProductInput = {
      name: 'Featured Inactive Product',
      slug: 'featured-inactive-product',
      price: 99.99,
      category_id: categoryResult[0].id,
      is_active: false,
      is_featured: true
    };

    const result = await createProduct(inputWithFlags);

    expect(result.is_active).toBe(false);
    expect(result.is_featured).toBe(true);
  });

  it('should handle large numeric values correctly', async () => {
    // Create test category first
    const categoryResult = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();

    const inputWithLargeNumbers: CreateProductInput = {
      name: 'Expensive Product',
      slug: 'expensive-product',
      price: 999.99,
      discount_price: 899.95,
      category_id: categoryResult[0].id
    };

    const result = await createProduct(inputWithLargeNumbers);

    expect(result.price).toEqual(999.99);
    expect(result.discount_price).toEqual(899.95);
    expect(typeof result.price).toBe('number');
    expect(typeof result.discount_price).toBe('number');
  });

  it('should throw error when category does not exist', async () => {
    const inputWithInvalidCategory: CreateProductInput = {
      name: 'Invalid Category Product',
      slug: 'invalid-category-product', 
      price: 19.99,
      category_id: 999 // Non-existent category
    };

    await expect(createProduct(inputWithInvalidCategory)).rejects.toThrow(/Category with id 999 does not exist/i);
  });

  it('should preserve timestamps correctly', async () => {
    // Create test category first
    const categoryResult = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();
    
    const input = { ...testInput, category_id: categoryResult[0].id };
    const beforeCreate = new Date();
    const result = await createProduct(input);
    const afterCreate = new Date();

    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    expect(result.updated_at.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    expect(result.updated_at.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
  });
});