import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, categoriesTable, productsTable, couponsTable, ordersTable, orderItemsTable } from '../db/schema';
import { type CreateOrderInput } from '../schema';
import { createOrder } from '../handlers/create_order';
import { eq } from 'drizzle-orm';

describe('createOrder', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testUser: { id: number };
  let testCategory: { id: number };
  let testProduct: { id: number };
  let testCoupon: { id: number };

  beforeEach(async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashed_password',
        first_name: 'John',
        last_name: 'Doe',
        phone: '1234567890',
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
        description: 'Test category description',
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
        description: 'Test product description',
        price: '29.99',
        category_id: testCategory.id,
        is_active: true,
        is_featured: false
      })
      .returning()
      .execute();
    testProduct = productResult[0];

    // Create test coupon
    const couponResult = await db.insert(couponsTable)
      .values({
        code: 'TESTCOUPON',
        discount_type: 'percentage',
        discount_value: '10.00',
        minimum_amount: '20.00',
        usage_limit: 100,
        used_count: 0,
        is_active: true
      })
      .returning()
      .execute();
    testCoupon = couponResult[0];
  });

  const createTestOrderInput = (overrides: Partial<CreateOrderInput> = {}): CreateOrderInput => ({
    user_id: testUser.id,
    subtotal: 29.99,
    tax_amount: 2.40,
    discount_amount: 0,
    total_amount: 32.39,
    coupon_id: null,
    payment_method: 'credit_card',
    items: [
      {
        product_id: testProduct.id,
        quantity: 1,
        price: 29.99
      }
    ],
    ...overrides
  });

  it('should create an order with order items', async () => {
    const input = createTestOrderInput();
    const result = await createOrder(input);

    // Verify order fields
    expect(result.user_id).toBe(testUser.id);
    expect(result.order_number).toMatch(/^ORD-\d+-[A-Z0-9]{9}$/);
    expect(result.status).toBe('pending');
    expect(result.subtotal).toBe(29.99);
    expect(result.tax_amount).toBe(2.40);
    expect(result.discount_amount).toBe(0);
    expect(result.total_amount).toBe(32.39);
    expect(result.payment_method).toBe('credit_card');
    expect(result.payment_status).toBe('pending');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(typeof result.subtotal).toBe('number');
    expect(typeof result.total_amount).toBe('number');
  });

  it('should save order to database', async () => {
    const input = createTestOrderInput();
    const result = await createOrder(input);

    // Verify order was saved
    const orders = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.id, result.id))
      .execute();

    expect(orders).toHaveLength(1);
    expect(orders[0].user_id).toBe(testUser.id);
    expect(orders[0].order_number).toBe(result.order_number);
    expect(parseFloat(orders[0].total_amount)).toBe(32.39);
  });

  it('should create order items', async () => {
    const input = createTestOrderInput({
      items: [
        {
          product_id: testProduct.id,
          quantity: 2,
          price: 29.99
        }
      ]
    });
    
    const result = await createOrder(input);

    // Verify order items were created
    const orderItems = await db.select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.order_id, result.id))
      .execute();

    expect(orderItems).toHaveLength(1);
    expect(orderItems[0].product_id).toBe(testProduct.id);
    expect(orderItems[0].quantity).toBe(2);
    expect(parseFloat(orderItems[0].price)).toBe(29.99);
  });

  it('should handle multiple order items', async () => {
    // Create second product
    const secondProduct = await db.insert(productsTable)
      .values({
        name: 'Second Product',
        slug: 'second-product',
        price: '19.99',
        category_id: testCategory.id,
        is_active: true,
        is_featured: false
      })
      .returning()
      .execute();

    const input = createTestOrderInput({
      items: [
        {
          product_id: testProduct.id,
          quantity: 1,
          price: 29.99
        },
        {
          product_id: secondProduct[0].id,
          quantity: 2,
          price: 19.99
        }
      ],
      subtotal: 69.97,
      total_amount: 72.37
    });

    const result = await createOrder(input);

    // Verify multiple order items were created
    const orderItems = await db.select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.order_id, result.id))
      .execute();

    expect(orderItems).toHaveLength(2);
  });

  it('should apply coupon when provided', async () => {
    const input = createTestOrderInput({
      coupon_id: testCoupon.id,
      discount_amount: 3.00,
      total_amount: 29.39
    });

    const result = await createOrder(input);

    expect(result.coupon_id).toBe(testCoupon.id);
    expect(result.discount_amount).toBe(3.00);
    expect(result.total_amount).toBe(29.39);
  });

  it('should handle order with default values', async () => {
    const input: CreateOrderInput = {
      user_id: testUser.id,
      subtotal: 29.99,
      total_amount: 29.99,
      items: [
        {
          product_id: testProduct.id,
          quantity: 1,
          price: 29.99
        }
      ]
    };

    const result = await createOrder(input);

    expect(result.tax_amount).toBe(0);
    expect(result.discount_amount).toBe(0);
    expect(result.coupon_id).toBeNull();
    expect(result.payment_method).toBeNull();
  });

  it('should throw error when user does not exist', async () => {
    const input = createTestOrderInput({
      user_id: 99999
    });

    expect(createOrder(input)).rejects.toThrow(/user not found/i);
  });

  it('should throw error when product does not exist', async () => {
    const input = createTestOrderInput({
      items: [
        {
          product_id: 99999,
          quantity: 1,
          price: 29.99
        }
      ]
    });

    expect(createOrder(input)).rejects.toThrow(/product with id 99999 not found/i);
  });

  it('should throw error when product is not active', async () => {
    // Create inactive product
    const inactiveProduct = await db.insert(productsTable)
      .values({
        name: 'Inactive Product',
        slug: 'inactive-product',
        price: '29.99',
        category_id: testCategory.id,
        is_active: false,
        is_featured: false
      })
      .returning()
      .execute();

    const input = createTestOrderInput({
      items: [
        {
          product_id: inactiveProduct[0].id,
          quantity: 1,
          price: 29.99
        }
      ]
    });

    expect(createOrder(input)).rejects.toThrow(/product .* is not active/i);
  });

  it('should throw error when coupon does not exist', async () => {
    const input = createTestOrderInput({
      coupon_id: 99999
    });

    expect(createOrder(input)).rejects.toThrow(/coupon not found/i);
  });

  it('should throw error when coupon is not active', async () => {
    // Create inactive coupon
    const inactiveCoupon = await db.insert(couponsTable)
      .values({
        code: 'INACTIVE',
        discount_type: 'percentage',
        discount_value: '10.00',
        is_active: false
      })
      .returning()
      .execute();

    const input = createTestOrderInput({
      coupon_id: inactiveCoupon[0].id
    });

    expect(createOrder(input)).rejects.toThrow(/coupon is not active/i);
  });

  it('should throw error when coupon has expired', async () => {
    // Create expired coupon
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const expiredCoupon = await db.insert(couponsTable)
      .values({
        code: 'EXPIRED',
        discount_type: 'percentage',
        discount_value: '10.00',
        expires_at: yesterday,
        is_active: true
      })
      .returning()
      .execute();

    const input = createTestOrderInput({
      coupon_id: expiredCoupon[0].id
    });

    expect(createOrder(input)).rejects.toThrow(/coupon has expired/i);
  });

  it('should throw error when coupon usage limit exceeded', async () => {
    // Create coupon with usage limit reached
    const limitedCoupon = await db.insert(couponsTable)
      .values({
        code: 'LIMITED',
        discount_type: 'percentage',
        discount_value: '10.00',
        usage_limit: 1,
        used_count: 1,
        is_active: true
      })
      .returning()
      .execute();

    const input = createTestOrderInput({
      coupon_id: limitedCoupon[0].id
    });

    expect(createOrder(input)).rejects.toThrow(/coupon usage limit exceeded/i);
  });
});