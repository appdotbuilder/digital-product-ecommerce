import { db } from '../db';
import { ordersTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type Order } from '../schema';

export const updateOrderStatus = async (orderId: number, status: 'pending' | 'completed' | 'failed' | 'refunded'): Promise<Order> => {
  try {
    // First check if the order exists
    const existingOrder = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId))
      .limit(1)
      .execute();

    if (existingOrder.length === 0) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    // Update the order status and payment status logic
    let paymentStatus: 'pending' | 'completed' | 'failed' = 'pending';
    if (status === 'completed') {
      paymentStatus = 'completed';
    } else if (status === 'failed') {
      paymentStatus = 'failed';
    }

    // Update the order with new status and updated timestamp
    const result = await db.update(ordersTable)
      .set({
        status: status,
        payment_status: paymentStatus,
        updated_at: new Date()
      })
      .where(eq(ordersTable.id, orderId))
      .returning()
      .execute();

    const updatedOrder = result[0];

    // Convert numeric fields back to numbers before returning
    return {
      ...updatedOrder,
      subtotal: parseFloat(updatedOrder.subtotal),
      tax_amount: parseFloat(updatedOrder.tax_amount),
      discount_amount: parseFloat(updatedOrder.discount_amount),
      total_amount: parseFloat(updatedOrder.total_amount)
    };
  } catch (error) {
    console.error('Order status update failed:', error);
    throw error;
  }
};