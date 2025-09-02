import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, categoriesTable, productsTable, cartItemsTable } from '../db/schema';
import { getCartItems, getCartTotal } from '../handlers/get_cart';
import { eq } from 'drizzle-orm';

describe('getCartItems', () => {
  let testUserId: number;
  let testProductId1: number;
  let testProductId2: number;

  beforeEach(async () => {
    await createDB();
    
    // Create test user
    const userResult = await db.insert(usersTable).values({
      email: 'test@example.com',
      password_hash: 'hashedpassword',
      first_name: 'Test',
      last_name: 'User',
      phone: null,
      is_admin: false
    }).returning().execute();
    testUserId = userResult[0].id;

    // Create test category
    const categoryResult = await db.insert(categoriesTable).values({
      name: 'Test Category',
      slug: 'test-category',
      description: 'A test category',
      image_url: null,
      is_active: true
    }).returning().execute();

    // Create test products
    const product1Result = await db.insert(productsTable).values({
      name: 'Test Product 1',
      slug: 'test-product-1',
      description: 'First test product',
      short_description: 'Short desc 1',
      price: '19.99',
      discount_price: null,
      category_id: categoryResult[0].id,
      image_url: null,
      download_url: null,
      license_key: null,
      is_active: true,
      is_featured: false
    }).returning().execute();
    testProductId1 = product1Result[0].id;

    const product2Result = await db.insert(productsTable).values({
      name: 'Test Product 2',
      slug: 'test-product-2',
      description: 'Second test product',
      short_description: 'Short desc 2',
      price: '29.99',
      discount_price: '24.99',
      category_id: categoryResult[0].id,
      image_url: null,
      download_url: null,
      license_key: null,
      is_active: true,
      is_featured: false
    }).returning().execute();
    testProductId2 = product2Result[0].id;
  });

  afterEach(resetDB);

  it('should return empty array when user has no cart items', async () => {
    const result = await getCartItems(testUserId);

    expect(result).toEqual([]);
  });

  it('should fetch cart items for a user', async () => {
    // Add items to cart
    await db.insert(cartItemsTable).values([
      {
        user_id: testUserId,
        product_id: testProductId1,
        quantity: 2
      },
      {
        user_id: testUserId,
        product_id: testProductId2,
        quantity: 1
      }
    ]).execute();

    const result = await getCartItems(testUserId);

    expect(result).toHaveLength(2);
    expect(result[0].user_id).toEqual(testUserId);
    expect(result[0].product_id).toEqual(testProductId1);
    expect(result[0].quantity).toEqual(2);
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
    expect(result[1].user_id).toEqual(testUserId);
    expect(result[1].product_id).toEqual(testProductId2);
    expect(result[1].quantity).toEqual(1);
  });

  it('should only return cart items for the specified user', async () => {
    // Create another user
    const otherUserResult = await db.insert(usersTable).values({
      email: 'other@example.com',
      password_hash: 'hashedpassword',
      first_name: 'Other',
      last_name: 'User',
      phone: null,
      is_admin: false
    }).returning().execute();

    // Add items to both users' carts
    await db.insert(cartItemsTable).values([
      {
        user_id: testUserId,
        product_id: testProductId1,
        quantity: 1
      },
      {
        user_id: otherUserResult[0].id,
        product_id: testProductId2,
        quantity: 1
      }
    ]).execute();

    const result = await getCartItems(testUserId);

    expect(result).toHaveLength(1);
    expect(result[0].user_id).toEqual(testUserId);
    expect(result[0].product_id).toEqual(testProductId1);
  });

  it('should save cart items to database correctly', async () => {
    await db.insert(cartItemsTable).values({
      user_id: testUserId,
      product_id: testProductId1,
      quantity: 3
    }).execute();

    const result = await getCartItems(testUserId);
    
    // Verify data was saved and retrieved correctly
    const dbItems = await db.select()
      .from(cartItemsTable)
      .where(eq(cartItemsTable.user_id, testUserId))
      .execute();

    expect(dbItems).toHaveLength(1);
    expect(dbItems[0].user_id).toEqual(testUserId);
    expect(dbItems[0].quantity).toEqual(3);
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toEqual(3);
  });
});

describe('getCartTotal', () => {
  let testUserId: number;
  let testProductId1: number;
  let testProductId2: number;

  beforeEach(async () => {
    await createDB();
    
    // Create test user
    const userResult = await db.insert(usersTable).values({
      email: 'test@example.com',
      password_hash: 'hashedpassword',
      first_name: 'Test',
      last_name: 'User',
      phone: null,
      is_admin: false
    }).returning().execute();
    testUserId = userResult[0].id;

    // Create test category
    const categoryResult = await db.insert(categoriesTable).values({
      name: 'Test Category',
      slug: 'test-category',
      description: 'A test category',
      image_url: null,
      is_active: true
    }).returning().execute();

    // Create test products
    const product1Result = await db.insert(productsTable).values({
      name: 'Test Product 1',
      slug: 'test-product-1',
      description: 'First test product',
      short_description: 'Short desc 1',
      price: '19.99',
      discount_price: null,
      category_id: categoryResult[0].id,
      image_url: null,
      download_url: null,
      license_key: null,
      is_active: true,
      is_featured: false
    }).returning().execute();
    testProductId1 = product1Result[0].id;

    const product2Result = await db.insert(productsTable).values({
      name: 'Test Product 2',
      slug: 'test-product-2',
      description: 'Second test product',
      short_description: 'Short desc 2',
      price: '29.99',
      discount_price: '24.99',
      category_id: categoryResult[0].id,
      image_url: null,
      download_url: null,
      license_key: null,
      is_active: true,
      is_featured: false
    }).returning().execute();
    testProductId2 = product2Result[0].id;
  });

  afterEach(resetDB);

  it('should return 0 when user has no cart items', async () => {
    const result = await getCartTotal(testUserId);

    expect(result).toEqual(0);
  });

  it('should calculate cart total using regular prices', async () => {
    // Add items to cart (product1: $19.99 * 2 = $39.98)
    await db.insert(cartItemsTable).values({
      user_id: testUserId,
      product_id: testProductId1,
      quantity: 2
    }).execute();

    const result = await getCartTotal(testUserId);

    expect(result).toEqual(39.98);
  });

  it('should use discount price when available', async () => {
    // Add items to cart (product2: $24.99 * 1 = $24.99, uses discount_price instead of $29.99)
    await db.insert(cartItemsTable).values({
      user_id: testUserId,
      product_id: testProductId2,
      quantity: 1
    }).execute();

    const result = await getCartTotal(testUserId);

    expect(result).toEqual(24.99);
  });

  it('should calculate total for multiple items with mixed pricing', async () => {
    // Add multiple items to cart
    await db.insert(cartItemsTable).values([
      {
        user_id: testUserId,
        product_id: testProductId1,
        quantity: 2  // $19.99 * 2 = $39.98
      },
      {
        user_id: testUserId,
        product_id: testProductId2,
        quantity: 1  // $24.99 * 1 = $24.99 (discount price)
      }
    ]).execute();

    const result = await getCartTotal(testUserId);

    // Total: $39.98 + $24.99 = $64.97
    expect(result).toEqual(64.97);
  });

  it('should only calculate total for the specified user', async () => {
    // Create another user
    const otherUserResult = await db.insert(usersTable).values({
      email: 'other@example.com',
      password_hash: 'hashedpassword',
      first_name: 'Other',
      last_name: 'User',
      phone: null,
      is_admin: false
    }).returning().execute();

    // Add items to both users' carts
    await db.insert(cartItemsTable).values([
      {
        user_id: testUserId,
        product_id: testProductId1,
        quantity: 1  // $19.99
      },
      {
        user_id: otherUserResult[0].id,
        product_id: testProductId2,
        quantity: 10  // Should not be included
      }
    ]).execute();

    const result = await getCartTotal(testUserId);

    expect(result).toEqual(19.99);
  });

  it('should handle numeric conversions correctly', async () => {
    await db.insert(cartItemsTable).values({
      user_id: testUserId,
      product_id: testProductId1,
      quantity: 1
    }).execute();

    const result = await getCartTotal(testUserId);

    expect(typeof result).toEqual('number');
    expect(result).toEqual(19.99);
  });
});