import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable, categoriesTable } from '../db/schema';
import { type UpdateProductInput } from '../schema';
import { updateProduct } from '../handlers/update_product';
import { eq } from 'drizzle-orm';

describe('updateProduct', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Create prerequisite data for tests
  const createTestCategory = async () => {
    const result = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        slug: 'test-category',
        description: 'Category for testing',
        image_url: null,
        is_active: true
      })
      .returning()
      .execute();
    return result[0];
  };

  const createSecondTestCategory = async () => {
    const result = await db.insert(categoriesTable)
      .values({
        name: 'Second Category',
        slug: 'second-category',
        description: 'Another category for testing',
        image_url: null,
        is_active: true
      })
      .returning()
      .execute();
    return result[0];
  };

  const createTestProduct = async (categoryId: number) => {
    const result = await db.insert(productsTable)
      .values({
        name: 'Original Product',
        slug: 'original-product',
        description: 'Original description',
        short_description: 'Short desc',
        price: '99.99', // String in database
        discount_price: '79.99',
        category_id: categoryId,
        image_url: 'original.jpg',
        download_url: 'download.zip',
        license_key: 'LICENSE123',
        is_active: true,
        is_featured: false
      })
      .returning()
      .execute();
    return result[0];
  };

  it('should update all product fields', async () => {
    const category = await createTestCategory();
    const secondCategory = await createSecondTestCategory();
    const product = await createTestProduct(category.id);

    const updateInput: UpdateProductInput = {
      id: product.id,
      name: 'Updated Product Name',
      slug: 'updated-product-slug',
      description: 'Updated description',
      short_description: 'Updated short desc',
      price: 149.99,
      discount_price: 129.99,
      category_id: secondCategory.id,
      image_url: 'updated.jpg',
      download_url: 'updated-download.zip',
      license_key: 'UPDATED-LICENSE',
      is_active: false,
      is_featured: true
    };

    const result = await updateProduct(updateInput);

    expect(result.id).toEqual(product.id);
    expect(result.name).toEqual('Updated Product Name');
    expect(result.slug).toEqual('updated-product-slug');
    expect(result.description).toEqual('Updated description');
    expect(result.short_description).toEqual('Updated short desc');
    expect(result.price).toEqual(149.99);
    expect(typeof result.price).toEqual('number'); // Verify numeric conversion
    expect(result.discount_price).toEqual(129.99);
    expect(typeof result.discount_price).toEqual('number');
    expect(result.category_id).toEqual(secondCategory.id);
    expect(result.image_url).toEqual('updated.jpg');
    expect(result.download_url).toEqual('updated-download.zip');
    expect(result.license_key).toEqual('UPDATED-LICENSE');
    expect(result.is_active).toEqual(false);
    expect(result.is_featured).toEqual(true);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update only specified fields', async () => {
    const category = await createTestCategory();
    const product = await createTestProduct(category.id);

    const updateInput: UpdateProductInput = {
      id: product.id,
      name: 'Partially Updated Product',
      price: 199.99,
      is_featured: true
    };

    const result = await updateProduct(updateInput);

    // Updated fields
    expect(result.name).toEqual('Partially Updated Product');
    expect(result.price).toEqual(199.99);
    expect(result.is_featured).toEqual(true);

    // Unchanged fields should remain the same
    expect(result.slug).toEqual('original-product');
    expect(result.description).toEqual('Original description');
    expect(result.short_description).toEqual('Short desc');
    expect(result.discount_price).toEqual(79.99); // Should remain as number
    expect(result.category_id).toEqual(category.id);
    expect(result.is_active).toEqual(true);
  });

  it('should set discount_price to null when provided', async () => {
    const category = await createTestCategory();
    const product = await createTestProduct(category.id);

    const updateInput: UpdateProductInput = {
      id: product.id,
      discount_price: null
    };

    const result = await updateProduct(updateInput);

    expect(result.discount_price).toBeNull();
    expect(result.price).toEqual(99.99); // Original price unchanged
  });

  it('should update product in database', async () => {
    const category = await createTestCategory();
    const product = await createTestProduct(category.id);

    const updateInput: UpdateProductInput = {
      id: product.id,
      name: 'Database Updated Product',
      price: 299.99
    };

    await updateProduct(updateInput);

    // Verify changes in database
    const updatedProductInDb = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, product.id))
      .execute();

    expect(updatedProductInDb).toHaveLength(1);
    expect(updatedProductInDb[0].name).toEqual('Database Updated Product');
    expect(parseFloat(updatedProductInDb[0].price)).toEqual(299.99); // Convert from DB string
    expect(updatedProductInDb[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when product does not exist', async () => {
    const updateInput: UpdateProductInput = {
      id: 999999, // Non-existent ID
      name: 'Updated Product'
    };

    await expect(updateProduct(updateInput)).rejects.toThrow(/Product with id 999999 not found/i);
  });

  it('should throw error when category does not exist', async () => {
    const category = await createTestCategory();
    const product = await createTestProduct(category.id);

    const updateInput: UpdateProductInput = {
      id: product.id,
      category_id: 999999 // Non-existent category ID
    };

    await expect(updateProduct(updateInput)).rejects.toThrow(/Category with id 999999 not found/i);
  });

  it('should handle nullable fields correctly', async () => {
    const category = await createTestCategory();
    const product = await createTestProduct(category.id);

    const updateInput: UpdateProductInput = {
      id: product.id,
      description: null,
      short_description: null,
      image_url: null,
      download_url: null,
      license_key: null
    };

    const result = await updateProduct(updateInput);

    expect(result.description).toBeNull();
    expect(result.short_description).toBeNull();
    expect(result.image_url).toBeNull();
    expect(result.download_url).toBeNull();
    expect(result.license_key).toBeNull();
  });

  it('should maintain original created_at timestamp', async () => {
    const category = await createTestCategory();
    const product = await createTestProduct(category.id);
    const originalCreatedAt = product.created_at;

    const updateInput: UpdateProductInput = {
      id: product.id,
      name: 'Updated Product'
    };

    const result = await updateProduct(updateInput);

    expect(result.created_at).toEqual(originalCreatedAt);
    expect(result.updated_at).not.toEqual(originalCreatedAt);
    expect(result.updated_at > originalCreatedAt).toBe(true);
  });
});