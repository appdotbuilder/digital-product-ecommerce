import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { 
  categoriesTable, 
  productsTable, 
  usersTable, 
  ordersTable 
} from '../db/schema';
import { getDashboardStats } from '../handlers/get_dashboard_stats';

describe('getDashboardStats', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return zero stats for empty database', async () => {
    const stats = await getDashboardStats();

    expect(stats.total_categories).toBe(0);
    expect(stats.total_products).toBe(0);
    expect(stats.total_customers).toBe(0);
    expect(stats.total_orders).toBe(0);
    expect(stats.total_revenue).toBe(0);
    expect(stats.pending_orders).toBe(0);
    expect(stats.completed_orders).toBe(0);
  });

  it('should count categories and products correctly', async () => {
    // Create test categories
    const categories = await db.insert(categoriesTable)
      .values([
        { name: 'Category 1', slug: 'cat-1' },
        { name: 'Category 2', slug: 'cat-2' },
        { name: 'Category 3', slug: 'cat-3' }
      ])
      .returning()
      .execute();

    // Create test products
    await db.insert(productsTable)
      .values([
        { 
          name: 'Product 1', 
          slug: 'prod-1', 
          price: '29.99', 
          category_id: categories[0].id 
        },
        { 
          name: 'Product 2', 
          slug: 'prod-2', 
          price: '39.99', 
          category_id: categories[1].id 
        }
      ])
      .execute();

    const stats = await getDashboardStats();

    expect(stats.total_categories).toBe(3);
    expect(stats.total_products).toBe(2);
  });

  it('should count only non-admin users as customers', async () => {
    // Create test users (mix of admin and regular users)
    await db.insert(usersTable)
      .values([
        {
          email: 'admin@test.com',
          password_hash: 'hash1',
          first_name: 'Admin',
          last_name: 'User',
          is_admin: true
        },
        {
          email: 'customer1@test.com',
          password_hash: 'hash2',
          first_name: 'Customer',
          last_name: 'One',
          is_admin: false
        },
        {
          email: 'customer2@test.com',
          password_hash: 'hash3',
          first_name: 'Customer',
          last_name: 'Two',
          is_admin: false
        }
      ])
      .execute();

    const stats = await getDashboardStats();

    expect(stats.total_customers).toBe(2); // Only non-admin users
  });

  it('should calculate revenue from completed orders only', async () => {
    // Create test user
    const users = await db.insert(usersTable)
      .values({
        email: 'customer@test.com',
        password_hash: 'hash',
        first_name: 'Test',
        last_name: 'Customer',
        is_admin: false
      })
      .returning()
      .execute();

    // Create orders with different statuses
    await db.insert(ordersTable)
      .values([
        {
          user_id: users[0].id,
          order_number: 'ORD-001',
          status: 'completed',
          subtotal: '100.00',
          total_amount: '110.00'
        },
        {
          user_id: users[0].id,
          order_number: 'ORD-002',
          status: 'completed',
          subtotal: '200.00',
          total_amount: '220.00'
        },
        {
          user_id: users[0].id,
          order_number: 'ORD-003',
          status: 'pending',
          subtotal: '50.00',
          total_amount: '55.00'
        },
        {
          user_id: users[0].id,
          order_number: 'ORD-004',
          status: 'failed',
          subtotal: '75.00',
          total_amount: '80.00'
        }
      ])
      .execute();

    const stats = await getDashboardStats();

    expect(stats.total_orders).toBe(4);
    expect(stats.total_revenue).toBe(330.00); // Only completed orders: 110 + 220
    expect(stats.completed_orders).toBe(2);
    expect(stats.pending_orders).toBe(1);
  });

  it('should handle complex dashboard scenario', async () => {
    // Create comprehensive test data
    const categories = await db.insert(categoriesTable)
      .values([
        { name: 'Software', slug: 'software' },
        { name: 'Tools', slug: 'tools' }
      ])
      .returning()
      .execute();

    await db.insert(productsTable)
      .values([
        { 
          name: 'App 1', 
          slug: 'app-1', 
          price: '99.99', 
          category_id: categories[0].id 
        },
        { 
          name: 'Tool 1', 
          slug: 'tool-1', 
          price: '49.99', 
          category_id: categories[1].id 
        },
        { 
          name: 'App 2', 
          slug: 'app-2', 
          price: '149.99', 
          category_id: categories[0].id,
          is_active: false // Inactive product should still be counted
        }
      ])
      .execute();

    const users = await db.insert(usersTable)
      .values([
        {
          email: 'admin@store.com',
          password_hash: 'hash1',
          first_name: 'Store',
          last_name: 'Admin',
          is_admin: true
        },
        {
          email: 'buyer1@test.com',
          password_hash: 'hash2',
          first_name: 'Buyer',
          last_name: 'One',
          is_admin: false
        },
        {
          email: 'buyer2@test.com',
          password_hash: 'hash3',
          first_name: 'Buyer',
          last_name: 'Two',
          is_admin: false
        }
      ])
      .returning()
      .execute();

    const customer1 = users.find(u => u.email === 'buyer1@test.com')!;
    const customer2 = users.find(u => u.email === 'buyer2@test.com')!;

    await db.insert(ordersTable)
      .values([
        {
          user_id: customer1.id,
          order_number: 'ORD-100',
          status: 'completed',
          subtotal: '99.99',
          total_amount: '107.99'
        },
        {
          user_id: customer1.id,
          order_number: 'ORD-101',
          status: 'pending',
          subtotal: '49.99',
          total_amount: '53.99'
        },
        {
          user_id: customer2.id,
          order_number: 'ORD-102',
          status: 'completed',
          subtotal: '149.99',
          total_amount: '161.99'
        },
        {
          user_id: customer2.id,
          order_number: 'ORD-103',
          status: 'failed',
          subtotal: '199.99',
          total_amount: '215.99'
        },
        {
          user_id: customer2.id,
          order_number: 'ORD-104',
          status: 'refunded',
          subtotal: '99.99',
          total_amount: '107.99'
        }
      ])
      .execute();

    const stats = await getDashboardStats();

    expect(stats.total_categories).toBe(2);
    expect(stats.total_products).toBe(3);
    expect(stats.total_customers).toBe(2); // Only non-admin users
    expect(stats.total_orders).toBe(5);
    expect(stats.total_revenue).toBe(269.98); // Only completed: 107.99 + 161.99
    expect(stats.completed_orders).toBe(2);
    expect(stats.pending_orders).toBe(1);
  });

  it('should handle null revenue gracefully', async () => {
    // Create test data but no completed orders
    const users = await db.insert(usersTable)
      .values({
        email: 'customer@test.com',
        password_hash: 'hash',
        first_name: 'Test',
        last_name: 'Customer',
        is_admin: false
      })
      .returning()
      .execute();

    await db.insert(ordersTable)
      .values([
        {
          user_id: users[0].id,
          order_number: 'ORD-001',
          status: 'pending',
          subtotal: '100.00',
          total_amount: '110.00'
        },
        {
          user_id: users[0].id,
          order_number: 'ORD-002',
          status: 'failed',
          subtotal: '200.00',
          total_amount: '220.00'
        }
      ])
      .execute();

    const stats = await getDashboardStats();

    expect(stats.total_orders).toBe(2);
    expect(stats.total_revenue).toBe(0); // No completed orders
    expect(stats.completed_orders).toBe(0);
    expect(stats.pending_orders).toBe(1);
  });
});