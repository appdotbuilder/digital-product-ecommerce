import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, ordersTable, categoriesTable, productsTable } from '../db/schema';
import { updateOrderStatus } from '../handlers/update_order_status';
import { eq } from 'drizzle-orm';

describe('updateOrderStatus', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update order status to completed', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Test',
        last_name: 'User',
        phone: null,
        is_admin: false
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create test order
    const orderResult = await db.insert(ordersTable)
      .values({
        user_id: userId,
        order_number: 'ORD-123456',
        status: 'pending',
        subtotal: '100.00',
        tax_amount: '10.00',
        discount_amount: '0.00',
        total_amount: '110.00',
        coupon_id: null,
        payment_method: 'credit_card',
        payment_status: 'pending'
      })
      .returning()
      .execute();

    const orderId = orderResult[0].id;

    // Update order status to completed
    const result = await updateOrderStatus(orderId, 'completed');

    // Verify the response
    expect(result.id).toBe(orderId);
    expect(result.status).toBe('completed');
    expect(result.payment_status).toBe('completed');
    expect(result.subtotal).toBe(100.00);
    expect(result.tax_amount).toBe(10.00);
    expect(result.total_amount).toBe(110.00);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify database was updated
    const updatedOrder = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId))
      .execute();

    expect(updatedOrder[0].status).toBe('completed');
    expect(updatedOrder[0].payment_status).toBe('completed');
  });

  it('should update order status to failed', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Test',
        last_name: 'User',
        phone: null,
        is_admin: false
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create test order
    const orderResult = await db.insert(ordersTable)
      .values({
        user_id: userId,
        order_number: 'ORD-789012',
        status: 'pending',
        subtotal: '50.00',
        tax_amount: '5.00',
        discount_amount: '10.00',
        total_amount: '45.00',
        coupon_id: null,
        payment_method: 'paypal',
        payment_status: 'pending'
      })
      .returning()
      .execute();

    const orderId = orderResult[0].id;

    // Update order status to failed
    const result = await updateOrderStatus(orderId, 'failed');

    // Verify the response
    expect(result.id).toBe(orderId);
    expect(result.status).toBe('failed');
    expect(result.payment_status).toBe('failed');
    expect(result.subtotal).toBe(50.00);
    expect(result.tax_amount).toBe(5.00);
    expect(result.discount_amount).toBe(10.00);
    expect(result.total_amount).toBe(45.00);

    // Verify database was updated
    const updatedOrder = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId))
      .execute();

    expect(updatedOrder[0].status).toBe('failed');
    expect(updatedOrder[0].payment_status).toBe('failed');
  });

  it('should update order status to refunded', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Test',
        last_name: 'User',
        phone: null,
        is_admin: false
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create test order that was previously completed
    const orderResult = await db.insert(ordersTable)
      .values({
        user_id: userId,
        order_number: 'ORD-345678',
        status: 'completed',
        subtotal: '200.00',
        tax_amount: '20.00',
        discount_amount: '0.00',
        total_amount: '220.00',
        coupon_id: null,
        payment_method: 'credit_card',
        payment_status: 'completed'
      })
      .returning()
      .execute();

    const orderId = orderResult[0].id;

    // Update order status to refunded
    const result = await updateOrderStatus(orderId, 'refunded');

    // Verify the response
    expect(result.id).toBe(orderId);
    expect(result.status).toBe('refunded');
    expect(result.payment_status).toBe('pending'); // Refunded orders keep payment_status as pending
    expect(result.total_amount).toBe(220.00);

    // Verify database was updated
    const updatedOrder = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId))
      .execute();

    expect(updatedOrder[0].status).toBe('refunded');
    expect(updatedOrder[0].payment_status).toBe('pending');
  });

  it('should keep payment status as pending for pending orders', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Test',
        last_name: 'User',
        phone: null,
        is_admin: false
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create test order
    const orderResult = await db.insert(ordersTable)
      .values({
        user_id: userId,
        order_number: 'ORD-555666',
        status: 'completed',
        subtotal: '75.00',
        tax_amount: '7.50',
        discount_amount: '5.00',
        total_amount: '77.50',
        coupon_id: null,
        payment_method: 'bank_transfer',
        payment_status: 'completed'
      })
      .returning()
      .execute();

    const orderId = orderResult[0].id;

    // Update order status back to pending
    const result = await updateOrderStatus(orderId, 'pending');

    // Verify the response
    expect(result.id).toBe(orderId);
    expect(result.status).toBe('pending');
    expect(result.payment_status).toBe('pending');
    expect(result.subtotal).toBe(75.00);
    expect(result.tax_amount).toBe(7.50);

    // Verify database was updated
    const updatedOrder = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId))
      .execute();

    expect(updatedOrder[0].status).toBe('pending');
    expect(updatedOrder[0].payment_status).toBe('pending');
  });

  it('should throw error for non-existent order', async () => {
    const nonExistentOrderId = 99999;

    await expect(updateOrderStatus(nonExistentOrderId, 'completed'))
      .rejects.toThrow(/Order with ID 99999 not found/i);
  });

  it('should update the updated_at timestamp', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Test',
        last_name: 'User',
        phone: null,
        is_admin: false
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create test order with known timestamp
    const initialTimestamp = new Date('2023-01-01T10:00:00Z');
    const orderResult = await db.insert(ordersTable)
      .values({
        user_id: userId,
        order_number: 'ORD-777888',
        status: 'pending',
        subtotal: '30.00',
        tax_amount: '3.00',
        discount_amount: '0.00',
        total_amount: '33.00',
        coupon_id: null,
        payment_method: 'credit_card',
        payment_status: 'pending',
        created_at: initialTimestamp,
        updated_at: initialTimestamp
      })
      .returning()
      .execute();

    const orderId = orderResult[0].id;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    // Update order status
    const result = await updateOrderStatus(orderId, 'completed');

    // Verify updated_at was changed
    expect(result.updated_at.getTime()).toBeGreaterThan(initialTimestamp.getTime());

    // Verify in database
    const updatedOrder = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId))
      .execute();

    expect(updatedOrder[0].updated_at.getTime()).toBeGreaterThan(initialTimestamp.getTime());
  });

  it('should preserve all other order fields', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Test',
        last_name: 'User',
        phone: null,
        is_admin: false
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create test order with all fields populated
    const orderResult = await db.insert(ordersTable)
      .values({
        user_id: userId,
        order_number: 'ORD-999000',
        status: 'pending',
        subtotal: '150.00',
        tax_amount: '15.00',
        discount_amount: '25.00',
        total_amount: '140.00',
        coupon_id: null,
        payment_method: 'stripe',
        payment_status: 'pending'
      })
      .returning()
      .execute();

    const orderId = orderResult[0].id;
    const originalOrder = orderResult[0];

    // Update order status
    const result = await updateOrderStatus(orderId, 'completed');

    // Verify all other fields are preserved
    expect(result.user_id).toBe(originalOrder.user_id);
    expect(result.order_number).toBe(originalOrder.order_number);
    expect(result.subtotal).toBe(150.00); // Numeric conversion check
    expect(result.tax_amount).toBe(15.00);
    expect(result.discount_amount).toBe(25.00);
    expect(result.total_amount).toBe(140.00);
    expect(result.coupon_id).toBe(originalOrder.coupon_id);
    expect(result.payment_method).toBe(originalOrder.payment_method);
    expect(result.created_at).toEqual(originalOrder.created_at);
    
    // Only status, payment_status, and updated_at should change
    expect(result.status).toBe('completed');
    expect(result.payment_status).toBe('completed');
    expect(result.updated_at.getTime()).toBeGreaterThan(originalOrder.updated_at.getTime());
  });
});