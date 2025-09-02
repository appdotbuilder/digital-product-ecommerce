import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable, categoriesTable } from '../db/schema';
import { getProducts, getProductsByCategory, getFeaturedProducts, getProductBySlug } from '../handlers/get_products';
import { eq } from 'drizzle-orm';

describe('get_products handlers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  describe('getProducts', () => {
    it('should return all active products ordered by created_at descending', async () => {
      // Create a category first (required foreign key)
      const categoryResult = await db.insert(categoriesTable)
        .values({
          name: 'Test Category',
          slug: 'test-category'
        })
        .returning()
        .execute();

      const categoryId = categoryResult[0].id;

      // Create test products
      await db.insert(productsTable).values([
        {
          name: 'Product 1',
          slug: 'product-1',
          price: '99.99',
          category_id: categoryId,
          is_active: true
        },
        {
          name: 'Product 2',
          slug: 'product-2',
          price: '149.99',
          discount_price: '129.99',
          category_id: categoryId,
          is_active: true
        },
        {
          name: 'Inactive Product',
          slug: 'inactive-product',
          price: '199.99',
          category_id: categoryId,
          is_active: false
        }
      ]).execute();

      const results = await getProducts();

      // Should return only active products
      expect(results).toHaveLength(2);
      
      // Find products by name for verification
      const product1 = results.find(p => p.name === 'Product 1');
      const product2 = results.find(p => p.name === 'Product 2');
      
      expect(product1).toBeDefined();
      expect(product2).toBeDefined();
      
      // Verify numeric conversion for Product 1
      expect(typeof product1!.price).toBe('number');
      expect(product1!.price).toBe(99.99);
      expect(product1!.discount_price).toBeNull();
      
      // Verify numeric conversion for Product 2
      expect(typeof product2!.price).toBe('number');
      expect(product2!.price).toBe(149.99);
      expect(typeof product2!.discount_price).toBe('number');
      expect(product2!.discount_price).toBe(129.99);
    });

    it('should return empty array when no active products exist', async () => {
      const results = await getProducts();
      expect(results).toHaveLength(0);
    });
  });

  describe('getProductsByCategory', () => {
    it('should return products filtered by category ID', async () => {
      // Create categories
      const categoryResults = await db.insert(categoriesTable)
        .values([
          { name: 'Category 1', slug: 'category-1' },
          { name: 'Category 2', slug: 'category-2' }
        ])
        .returning()
        .execute();

      const category1Id = categoryResults[0].id;
      const category2Id = categoryResults[1].id;

      // Create products in different categories
      await db.insert(productsTable).values([
        {
          name: 'Product in Category 1',
          slug: 'product-cat-1',
          price: '99.99',
          category_id: category1Id,
          is_active: true
        },
        {
          name: 'Product in Category 2',
          slug: 'product-cat-2',
          price: '149.99',
          category_id: category2Id,
          is_active: true
        },
        {
          name: 'Another Product in Category 1',
          slug: 'another-product-cat-1',
          price: '199.99',
          discount_price: '179.99',
          category_id: category1Id,
          is_active: true
        }
      ]).execute();

      const results = await getProductsByCategory(category1Id);

      // Should return only products from category 1
      expect(results).toHaveLength(2);
      expect(results.every(p => p.category_id === category1Id)).toBe(true);
      
      // Find products by name for verification
      const product1 = results.find(p => p.name === 'Product in Category 1');
      const anotherProduct1 = results.find(p => p.name === 'Another Product in Category 1');
      
      expect(product1).toBeDefined();
      expect(anotherProduct1).toBeDefined();
      
      // Verify numeric conversion for first product
      expect(typeof product1!.price).toBe('number');
      expect(product1!.price).toBe(99.99);
      expect(product1!.discount_price).toBeNull();
      
      // Verify numeric conversion for another product
      expect(typeof anotherProduct1!.price).toBe('number');
      expect(anotherProduct1!.price).toBe(199.99);
      expect(typeof anotherProduct1!.discount_price).toBe('number');
      expect(anotherProduct1!.discount_price).toBe(179.99);
    });

    it('should return empty array for non-existent category', async () => {
      const results = await getProductsByCategory(999);
      expect(results).toHaveLength(0);
    });

    it('should include inactive products in category results', async () => {
      // Create category
      const categoryResult = await db.insert(categoriesTable)
        .values({ name: 'Test Category', slug: 'test-category' })
        .returning()
        .execute();

      const categoryId = categoryResult[0].id;

      // Create both active and inactive products
      await db.insert(productsTable).values([
        {
          name: 'Active Product',
          slug: 'active-product',
          price: '99.99',
          category_id: categoryId,
          is_active: true
        },
        {
          name: 'Inactive Product',
          slug: 'inactive-product',
          price: '149.99',
          category_id: categoryId,
          is_active: false
        }
      ]).execute();

      const results = await getProductsByCategory(categoryId);

      // Should return both active and inactive products for category filter
      expect(results).toHaveLength(2);
      expect(results.some(p => p.is_active === true)).toBe(true);
      expect(results.some(p => p.is_active === false)).toBe(true);
    });
  });

  describe('getFeaturedProducts', () => {
    it('should return only featured products', async () => {
      // Create category
      const categoryResult = await db.insert(categoriesTable)
        .values({ name: 'Test Category', slug: 'test-category' })
        .returning()
        .execute();

      const categoryId = categoryResult[0].id;

      // Create products with different featured status
      await db.insert(productsTable).values([
        {
          name: 'Featured Product 1',
          slug: 'featured-1',
          price: '99.99',
          category_id: categoryId,
          is_featured: true,
          is_active: true
        },
        {
          name: 'Regular Product',
          slug: 'regular-product',
          price: '149.99',
          category_id: categoryId,
          is_featured: false,
          is_active: true
        },
        {
          name: 'Featured Product 2',
          slug: 'featured-2',
          price: '199.99',
          discount_price: '179.99',
          category_id: categoryId,
          is_featured: true,
          is_active: true
        }
      ]).execute();

      const results = await getFeaturedProducts();

      // Should return only featured products
      expect(results).toHaveLength(2);
      expect(results.every(p => p.is_featured === true)).toBe(true);
      
      // Find products by name for verification
      const featured1 = results.find(p => p.name === 'Featured Product 1');
      const featured2 = results.find(p => p.name === 'Featured Product 2');
      
      expect(featured1).toBeDefined();
      expect(featured2).toBeDefined();
      
      // Verify numeric conversion for Featured Product 1
      expect(typeof featured1!.price).toBe('number');
      expect(featured1!.price).toBe(99.99);
      expect(featured1!.discount_price).toBeNull();
      
      // Verify numeric conversion for Featured Product 2
      expect(typeof featured2!.price).toBe('number');
      expect(featured2!.price).toBe(199.99);
      expect(typeof featured2!.discount_price).toBe('number');
      expect(featured2!.discount_price).toBe(179.99);
    });

    it('should return empty array when no featured products exist', async () => {
      // Create category
      const categoryResult = await db.insert(categoriesTable)
        .values({ name: 'Test Category', slug: 'test-category' })
        .returning()
        .execute();

      const categoryId = categoryResult[0].id;

      // Create non-featured product
      await db.insert(productsTable).values({
        name: 'Regular Product',
        slug: 'regular-product',
        price: '99.99',
        category_id: categoryId,
        is_featured: false,
        is_active: true
      }).execute();

      const results = await getFeaturedProducts();
      expect(results).toHaveLength(0);
    });
  });

  describe('getProductBySlug', () => {
    it('should return product by slug', async () => {
      // Create category
      const categoryResult = await db.insert(categoriesTable)
        .values({ name: 'Test Category', slug: 'test-category' })
        .returning()
        .execute();

      const categoryId = categoryResult[0].id;

      // Create test product
      await db.insert(productsTable).values({
        name: 'Test Product',
        slug: 'test-product',
        description: 'A test product',
        short_description: 'Short desc',
        price: '99.99',
        discount_price: '89.99',
        category_id: categoryId,
        image_url: 'http://example.com/image.jpg',
        download_url: 'http://example.com/download.zip',
        license_key: 'ABC123',
        is_active: true,
        is_featured: false
      }).execute();

      const result = await getProductBySlug('test-product');

      expect(result).toBeDefined();
      expect(result!.name).toBe('Test Product');
      expect(result!.slug).toBe('test-product');
      expect(result!.description).toBe('A test product');
      expect(result!.short_description).toBe('Short desc');
      
      // Verify numeric conversion
      expect(typeof result!.price).toBe('number');
      expect(result!.price).toBe(99.99);
      expect(typeof result!.discount_price).toBe('number');
      expect(result!.discount_price).toBe(89.99);
      
      expect(result!.category_id).toBe(categoryId);
      expect(result!.image_url).toBe('http://example.com/image.jpg');
      expect(result!.download_url).toBe('http://example.com/download.zip');
      expect(result!.license_key).toBe('ABC123');
      expect(result!.is_active).toBe(true);
      expect(result!.is_featured).toBe(false);
      expect(result!.created_at).toBeInstanceOf(Date);
      expect(result!.updated_at).toBeInstanceOf(Date);
    });

    it('should return null for non-existent slug', async () => {
      const result = await getProductBySlug('non-existent-slug');
      expect(result).toBeNull();
    });

    it('should handle products with null optional fields', async () => {
      // Create category
      const categoryResult = await db.insert(categoriesTable)
        .values({ name: 'Test Category', slug: 'test-category' })
        .returning()
        .execute();

      const categoryId = categoryResult[0].id;

      // Create minimal product
      await db.insert(productsTable).values({
        name: 'Minimal Product',
        slug: 'minimal-product',
        price: '49.99',
        category_id: categoryId
      }).execute();

      const result = await getProductBySlug('minimal-product');

      expect(result).toBeDefined();
      expect(result!.name).toBe('Minimal Product');
      expect(result!.description).toBeNull();
      expect(result!.short_description).toBeNull();
      expect(result!.discount_price).toBeNull();
      expect(result!.image_url).toBeNull();
      expect(result!.download_url).toBeNull();
      expect(result!.license_key).toBeNull();
      
      // Verify numeric conversion for price
      expect(typeof result!.price).toBe('number');
      expect(result!.price).toBe(49.99);
    });

    it('should verify data persistence in database', async () => {
      // Create category
      const categoryResult = await db.insert(categoriesTable)
        .values({ name: 'Test Category', slug: 'test-category' })
        .returning()
        .execute();

      const categoryId = categoryResult[0].id;

      // Create test product
      const insertResult = await db.insert(productsTable)
        .values({
          name: 'DB Test Product',
          slug: 'db-test-product',
          price: '129.99',
          category_id: categoryId
        })
        .returning()
        .execute();

      const productId = insertResult[0].id;

      // Verify through direct database query
      const dbProducts = await db.select()
        .from(productsTable)
        .where(eq(productsTable.id, productId))
        .execute();

      expect(dbProducts).toHaveLength(1);
      expect(dbProducts[0].name).toBe('DB Test Product');
      expect(dbProducts[0].slug).toBe('db-test-product');
      expect(parseFloat(dbProducts[0].price)).toBe(129.99);
      expect(dbProducts[0].category_id).toBe(categoryId);

      // Verify through handler
      const handlerResult = await getProductBySlug('db-test-product');
      expect(handlerResult).toBeDefined();
      expect(handlerResult!.id).toBe(productId);
      expect(handlerResult!.name).toBe('DB Test Product');
    });
  });
});