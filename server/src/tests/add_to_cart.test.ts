import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { cartItemsTable, usersTable, productsTable, categoriesTable } from '../db/schema';
import { type AddToCartInput } from '../schema';
import { addToCart, removeFromCart, clearCart } from '../handlers/add_to_cart';
import { eq, and } from 'drizzle-orm';

describe('Cart Handlers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testUser: any;
  let testCategory: any;
  let testProduct: any;

  beforeEach(async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashedpassword123',
        first_name: 'Test',
        last_name: 'User',
        phone: null,
        is_admin: false
      })
      .returning()
      .execute();
    testUser = userResult[0];

    // Create test category
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        slug: 'test-category',
        description: 'A test category',
        image_url: null,
        is_active: true
      })
      .returning()
      .execute();
    testCategory = categoryResult[0];

    // Create test product
    const productResult = await db.insert(productsTable)
      .values({
        name: 'Test Product',
        slug: 'test-product',
        description: 'A test product',
        short_description: 'Short description',
        price: '29.99',
        discount_price: null,
        category_id: testCategory.id,
        image_url: null,
        download_url: null,
        license_key: null,
        is_active: true,
        is_featured: false
      })
      .returning()
      .execute();
    testProduct = productResult[0];
  });

  describe('addToCart', () => {
    it('should add new item to cart', async () => {
      const input: AddToCartInput = {
        user_id: testUser.id,
        product_id: testProduct.id,
        quantity: 2
      };

      const result = await addToCart(input);

      expect(result.user_id).toEqual(testUser.id);
      expect(result.product_id).toEqual(testProduct.id);
      expect(result.quantity).toEqual(2);
      expect(result.id).toBeDefined();
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
    });

    it('should use default quantity of 1 when not specified', async () => {
      const input: AddToCartInput = {
        user_id: testUser.id,
        product_id: testProduct.id
      };

      const result = await addToCart(input);

      expect(result.quantity).toEqual(1);
    });

    it('should update existing cart item quantity', async () => {
      // Add item first time
      const input: AddToCartInput = {
        user_id: testUser.id,
        product_id: testProduct.id,
        quantity: 2
      };

      await addToCart(input);

      // Add same item again
      const secondInput: AddToCartInput = {
        user_id: testUser.id,
        product_id: testProduct.id,
        quantity: 3
      };

      const result = await addToCart(secondInput);

      expect(result.quantity).toEqual(5); // 2 + 3
      expect(result.user_id).toEqual(testUser.id);
      expect(result.product_id).toEqual(testProduct.id);

      // Verify only one item exists in cart
      const cartItems = await db.select()
        .from(cartItemsTable)
        .where(and(
          eq(cartItemsTable.user_id, testUser.id),
          eq(cartItemsTable.product_id, testProduct.id)
        ))
        .execute();

      expect(cartItems).toHaveLength(1);
      expect(cartItems[0].quantity).toEqual(5);
    });

    it('should save cart item to database', async () => {
      const input: AddToCartInput = {
        user_id: testUser.id,
        product_id: testProduct.id,
        quantity: 3
      };

      const result = await addToCart(input);

      const cartItems = await db.select()
        .from(cartItemsTable)
        .where(eq(cartItemsTable.id, result.id))
        .execute();

      expect(cartItems).toHaveLength(1);
      expect(cartItems[0].user_id).toEqual(testUser.id);
      expect(cartItems[0].product_id).toEqual(testProduct.id);
      expect(cartItems[0].quantity).toEqual(3);
      expect(cartItems[0].created_at).toBeInstanceOf(Date);
    });

    it('should throw error for non-existent user', async () => {
      const input: AddToCartInput = {
        user_id: 99999,
        product_id: testProduct.id,
        quantity: 1
      };

      expect(addToCart(input)).rejects.toThrow(/User with id 99999 not found/i);
    });

    it('should throw error for non-existent product', async () => {
      const input: AddToCartInput = {
        user_id: testUser.id,
        product_id: 99999,
        quantity: 1
      };

      expect(addToCart(input)).rejects.toThrow(/Product with id 99999 not found/i);
    });
  });

  describe('removeFromCart', () => {
    beforeEach(async () => {
      // Add an item to cart for removal tests
      await db.insert(cartItemsTable)
        .values({
          user_id: testUser.id,
          product_id: testProduct.id,
          quantity: 2
        })
        .execute();
    });

    it('should remove item from cart', async () => {
      const result = await removeFromCart(testUser.id, testProduct.id);

      expect(result).toBe(true);

      // Verify item was removed
      const cartItems = await db.select()
        .from(cartItemsTable)
        .where(and(
          eq(cartItemsTable.user_id, testUser.id),
          eq(cartItemsTable.product_id, testProduct.id)
        ))
        .execute();

      expect(cartItems).toHaveLength(0);
    });

    it('should return false when item does not exist', async () => {
      // Try to remove non-existent item
      const result = await removeFromCart(testUser.id, 99999);

      expect(result).toBe(false);
    });

    it('should throw error for non-existent user', async () => {
      expect(removeFromCart(99999, testProduct.id)).rejects.toThrow(/User with id 99999 not found/i);
    });
  });

  describe('clearCart', () => {
    beforeEach(async () => {
      // Create a second product
      const secondProduct = await db.insert(productsTable)
        .values({
          name: 'Second Product',
          slug: 'second-product',
          description: 'Another test product',
          short_description: 'Short description',
          price: '19.99',
          discount_price: null,
          category_id: testCategory.id,
          image_url: null,
          download_url: null,
          license_key: null,
          is_active: true,
          is_featured: false
        })
        .returning()
        .execute();

      // Add multiple items to cart
      await db.insert(cartItemsTable)
        .values([
          {
            user_id: testUser.id,
            product_id: testProduct.id,
            quantity: 2
          },
          {
            user_id: testUser.id,
            product_id: secondProduct[0].id,
            quantity: 1
          }
        ])
        .execute();
    });

    it('should clear all items from user cart', async () => {
      const result = await clearCart(testUser.id);

      expect(result).toBe(true);

      // Verify all items were removed
      const cartItems = await db.select()
        .from(cartItemsTable)
        .where(eq(cartItemsTable.user_id, testUser.id))
        .execute();

      expect(cartItems).toHaveLength(0);
    });

    it('should return true even when cart is already empty', async () => {
      // Clear cart first
      await clearCart(testUser.id);

      // Try to clear empty cart
      const result = await clearCart(testUser.id);

      expect(result).toBe(true);
    });

    it('should throw error for non-existent user', async () => {
      expect(clearCart(99999)).rejects.toThrow(/User with id 99999 not found/i);
    });

    it('should only clear items for specified user', async () => {
      // Create another user with cart items
      const anotherUser = await db.insert(usersTable)
        .values({
          email: 'another@example.com',
          password_hash: 'hashedpassword456',
          first_name: 'Another',
          last_name: 'User',
          phone: null,
          is_admin: false
        })
        .returning()
        .execute();

      await db.insert(cartItemsTable)
        .values({
          user_id: anotherUser[0].id,
          product_id: testProduct.id,
          quantity: 1
        })
        .execute();

      // Clear first user's cart
      await clearCart(testUser.id);

      // Verify second user's cart is unaffected
      const otherUserCartItems = await db.select()
        .from(cartItemsTable)
        .where(eq(cartItemsTable.user_id, anotherUser[0].id))
        .execute();

      expect(otherUserCartItems).toHaveLength(1);
    });
  });
});