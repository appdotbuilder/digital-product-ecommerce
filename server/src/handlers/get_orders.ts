import { db } from '../db';
import { ordersTable } from '../db/schema';
import { type Order } from '../schema';
import { eq, desc } from 'drizzle-orm';

export async function getOrders(): Promise<Order[]> {
  try {
    const results = await db.select()
      .from(ordersTable)
      .orderBy(desc(ordersTable.created_at))
      .execute();

    return results.map(order => ({
      ...order,
      subtotal: parseFloat(order.subtotal),
      tax_amount: parseFloat(order.tax_amount),
      discount_amount: parseFloat(order.discount_amount),
      total_amount: parseFloat(order.total_amount)
    }));
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    throw error;
  }
}

export async function getOrdersByUser(userId: number): Promise<Order[]> {
  try {
    const results = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.user_id, userId))
      .orderBy(desc(ordersTable.created_at))
      .execute();

    return results.map(order => ({
      ...order,
      subtotal: parseFloat(order.subtotal),
      tax_amount: parseFloat(order.tax_amount),
      discount_amount: parseFloat(order.discount_amount),
      total_amount: parseFloat(order.total_amount)
    }));
  } catch (error) {
    console.error('Failed to fetch orders for user:', error);
    throw error;
  }
}

export async function getOrderById(id: number): Promise<Order | null> {
  try {
    const results = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.id, id))
      .limit(1)
      .execute();

    if (results.length === 0) {
      return null;
    }

    const order = results[0];
    return {
      ...order,
      subtotal: parseFloat(order.subtotal),
      tax_amount: parseFloat(order.tax_amount),
      discount_amount: parseFloat(order.discount_amount),
      total_amount: parseFloat(order.total_amount)
    };
  } catch (error) {
    console.error('Failed to fetch order by ID:', error);
    throw error;
  }
}