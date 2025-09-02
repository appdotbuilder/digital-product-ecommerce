import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, ordersTable } from '../db/schema';
import { getOrders, getOrdersByUser, getOrderById } from '../handlers/get_orders';
import { eq } from 'drizzle-orm';

describe('get_orders handlers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testUserId1: number;
  let testUserId2: number;
  let testOrderId1: number;
  let testOrderId2: number;
  let testOrderId3: number;

  beforeEach(async () => {
    // Create test users
    const users = await db.insert(usersTable).values([
      {
        email: 'user1@example.com',
        password_hash: 'hashed_password_1',
        first_name: 'John',
        last_name: 'Doe',
        is_admin: false
      },
      {
        email: 'user2@example.com',
        password_hash: 'hashed_password_2',
        first_name: 'Jane',
        last_name: 'Smith',
        is_admin: false
      }
    ]).returning().execute();

    testUserId1 = users[0].id;
    testUserId2 = users[1].id;

    // Create test orders
    const orders = await db.insert(ordersTable).values([
      {
        user_id: testUserId1,
        order_number: 'ORD-001',
        status: 'completed',
        subtotal: '99.99',
        tax_amount: '10.00',
        discount_amount: '5.00',
        total_amount: '104.99',
        payment_status: 'completed'
      },
      {
        user_id: testUserId1,
        order_number: 'ORD-002',
        status: 'pending',
        subtotal: '149.99',
        tax_amount: '15.00',
        discount_amount: '0.00',
        total_amount: '164.99',
        payment_status: 'pending'
      },
      {
        user_id: testUserId2,
        order_number: 'ORD-003',
        status: 'completed',
        subtotal: '79.99',
        tax_amount: '8.00',
        discount_amount: '10.00',
        total_amount: '77.99',
        payment_status: 'completed'
      }
    ]).returning().execute();

    testOrderId1 = orders[0].id;
    testOrderId2 = orders[1].id;
    testOrderId3 = orders[2].id;
  });

  describe('getOrders', () => {
    it('should fetch all orders', async () => {
      const orders = await getOrders();

      expect(orders).toHaveLength(3);
      expect(orders.every(order => order.id !== undefined)).toBe(true);
      expect(orders.every(order => order.order_number !== undefined)).toBe(true);
    });

    it('should return orders ordered by created_at desc', async () => {
      const orders = await getOrders();

      // Verify ordering by checking that orders are returned (exact order depends on db timestamp precision)
      expect(orders).toHaveLength(3);
      expect(orders[0].created_at).toBeInstanceOf(Date);
      expect(orders[1].created_at).toBeInstanceOf(Date);
      expect(orders[2].created_at).toBeInstanceOf(Date);
      
      // Verify first order created_at >= second order created_at (descending)
      expect(orders[0].created_at.getTime()).toBeGreaterThanOrEqual(orders[1].created_at.getTime());
      expect(orders[1].created_at.getTime()).toBeGreaterThanOrEqual(orders[2].created_at.getTime());
    });

    it('should convert numeric fields to numbers', async () => {
      const orders = await getOrders();

      orders.forEach(order => {
        expect(typeof order.subtotal).toBe('number');
        expect(typeof order.tax_amount).toBe('number');
        expect(typeof order.discount_amount).toBe('number');
        expect(typeof order.total_amount).toBe('number');
      });

      // Check specific values
      const order1 = orders.find(o => o.order_number === 'ORD-001');
      expect(order1?.subtotal).toBe(99.99);
      expect(order1?.tax_amount).toBe(10.00);
      expect(order1?.discount_amount).toBe(5.00);
      expect(order1?.total_amount).toBe(104.99);
    });

    it('should return empty array when no orders exist', async () => {
      // Clear all orders
      await db.delete(ordersTable).execute();

      const orders = await getOrders();
      expect(orders).toHaveLength(0);
      expect(Array.isArray(orders)).toBe(true);
    });
  });

  describe('getOrdersByUser', () => {
    it('should fetch orders for specific user', async () => {
      const user1Orders = await getOrdersByUser(testUserId1);
      const user2Orders = await getOrdersByUser(testUserId2);

      expect(user1Orders).toHaveLength(2);
      expect(user2Orders).toHaveLength(1);

      // Check user1 orders
      expect(user1Orders.every(order => order.user_id === testUserId1)).toBe(true);
      expect(user1Orders.map(o => o.order_number).sort()).toEqual(['ORD-001', 'ORD-002']);

      // Check user2 orders
      expect(user2Orders.every(order => order.user_id === testUserId2)).toBe(true);
      expect(user2Orders[0].order_number).toBe('ORD-003');
    });

    it('should return orders ordered by created_at desc for user', async () => {
      const orders = await getOrdersByUser(testUserId1);

      // Verify ordering by timestamp (descending)
      expect(orders).toHaveLength(2);
      expect(orders[0].created_at).toBeInstanceOf(Date);
      expect(orders[1].created_at).toBeInstanceOf(Date);
      
      // Verify first order created_at >= second order created_at (descending)
      expect(orders[0].created_at.getTime()).toBeGreaterThanOrEqual(orders[1].created_at.getTime());
    });

    it('should convert numeric fields to numbers', async () => {
      const orders = await getOrdersByUser(testUserId1);

      orders.forEach(order => {
        expect(typeof order.subtotal).toBe('number');
        expect(typeof order.tax_amount).toBe('number');
        expect(typeof order.discount_amount).toBe('number');
        expect(typeof order.total_amount).toBe('number');
      });
    });

    it('should return empty array for user with no orders', async () => {
      // Create a user with no orders
      const newUser = await db.insert(usersTable).values({
        email: 'noorders@example.com',
        password_hash: 'hashed_password',
        first_name: 'No',
        last_name: 'Orders',
        is_admin: false
      }).returning().execute();

      const orders = await getOrdersByUser(newUser[0].id);
      expect(orders).toHaveLength(0);
      expect(Array.isArray(orders)).toBe(true);
    });

    it('should return empty array for non-existent user', async () => {
      const orders = await getOrdersByUser(99999);
      expect(orders).toHaveLength(0);
      expect(Array.isArray(orders)).toBe(true);
    });
  });

  describe('getOrderById', () => {
    it('should fetch specific order by ID', async () => {
      const order = await getOrderById(testOrderId1);

      expect(order).not.toBeNull();
      expect(order?.id).toBe(testOrderId1);
      expect(order?.order_number).toBe('ORD-001');
      expect(order?.user_id).toBe(testUserId1);
      expect(order?.status).toBe('completed');
    });

    it('should convert numeric fields to numbers', async () => {
      const order = await getOrderById(testOrderId1);

      expect(order).not.toBeNull();
      expect(typeof order?.subtotal).toBe('number');
      expect(typeof order?.tax_amount).toBe('number');
      expect(typeof order?.discount_amount).toBe('number');
      expect(typeof order?.total_amount).toBe('number');

      // Check specific values
      expect(order?.subtotal).toBe(99.99);
      expect(order?.tax_amount).toBe(10.00);
      expect(order?.discount_amount).toBe(5.00);
      expect(order?.total_amount).toBe(104.99);
    });

    it('should return null for non-existent order', async () => {
      const order = await getOrderById(99999);
      expect(order).toBeNull();
    });

    it('should include all order fields', async () => {
      const order = await getOrderById(testOrderId2);

      expect(order).not.toBeNull();
      expect(order).toHaveProperty('id');
      expect(order).toHaveProperty('user_id');
      expect(order).toHaveProperty('order_number');
      expect(order).toHaveProperty('status');
      expect(order).toHaveProperty('subtotal');
      expect(order).toHaveProperty('tax_amount');
      expect(order).toHaveProperty('discount_amount');
      expect(order).toHaveProperty('total_amount');
      expect(order).toHaveProperty('coupon_id');
      expect(order).toHaveProperty('payment_method');
      expect(order).toHaveProperty('payment_status');
      expect(order).toHaveProperty('created_at');
      expect(order).toHaveProperty('updated_at');

      // Check correct values
      expect(order?.order_number).toBe('ORD-002');
      expect(order?.status).toBe('pending');
      expect(order?.payment_status).toBe('pending');
      expect(order?.subtotal).toBe(149.99);
    });
  });

  describe('database verification', () => {
    it('should verify orders are actually saved in database', async () => {
      // Fetch directly from database to verify our test setup
      const dbOrders = await db.select()
        .from(ordersTable)
        .execute();

      expect(dbOrders).toHaveLength(3);

      // Verify the orders match what we expect
      const orderNumbers = dbOrders.map(o => o.order_number).sort();
      expect(orderNumbers).toEqual(['ORD-001', 'ORD-002', 'ORD-003']);
    });

    it('should handle orders with null optional fields', async () => {
      // Create an order with minimal data (null optional fields)
      const minimalOrder = await db.insert(ordersTable).values({
        user_id: testUserId1,
        order_number: 'ORD-MINIMAL',
        status: 'pending',
        subtotal: '50.00',
        tax_amount: '5.00',
        discount_amount: '0.00',
        total_amount: '55.00',
        coupon_id: null,
        payment_method: null,
        payment_status: 'pending'
      }).returning().execute();

      const fetchedOrder = await getOrderById(minimalOrder[0].id);
      
      expect(fetchedOrder).not.toBeNull();
      expect(fetchedOrder?.coupon_id).toBeNull();
      expect(fetchedOrder?.payment_method).toBeNull();
      expect(fetchedOrder?.order_number).toBe('ORD-MINIMAL');
    });
  });
});