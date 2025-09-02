import { db } from '../db';
import { ordersTable, orderItemsTable, usersTable, productsTable, couponsTable } from '../db/schema';
import { type CreateOrderInput, type Order } from '../schema';
import { eq, sql } from 'drizzle-orm';

export const createOrder = async (input: CreateOrderInput): Promise<Order> => {
  try {
    // Verify user exists
    const userExists = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, input.user_id))
      .execute();

    if (userExists.length === 0) {
      throw new Error('User not found');
    }

    // Verify all products exist and get their details
    for (const item of input.items) {
      const product = await db.select()
        .from(productsTable)
        .where(eq(productsTable.id, item.product_id))
        .execute();

      if (product.length === 0) {
        throw new Error(`Product with ID ${item.product_id} not found`);
      }

      if (!product[0].is_active) {
        throw new Error(`Product ${product[0].name} is not active`);
      }
    }

    // Verify coupon exists and is valid if provided
    if (input.coupon_id) {
      const coupon = await db.select()
        .from(couponsTable)
        .where(eq(couponsTable.id, input.coupon_id))
        .execute();

      if (coupon.length === 0) {
        throw new Error('Coupon not found');
      }

      if (!coupon[0].is_active) {
        throw new Error('Coupon is not active');
      }

      // Check if coupon has expired
      if (coupon[0].expires_at && new Date() > coupon[0].expires_at) {
        throw new Error('Coupon has expired');
      }

      // Check usage limit
      if (coupon[0].usage_limit && coupon[0].used_count >= coupon[0].usage_limit) {
        throw new Error('Coupon usage limit exceeded');
      }
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const orderResult = await db.insert(ordersTable)
      .values({
        user_id: input.user_id,
        order_number: orderNumber,
        status: 'pending',
        subtotal: input.subtotal.toString(),
        tax_amount: (input.tax_amount || 0).toString(),
        discount_amount: (input.discount_amount || 0).toString(),
        total_amount: input.total_amount.toString(),
        coupon_id: input.coupon_id || null,
        payment_method: input.payment_method || null,
        payment_status: 'pending'
      })
      .returning()
      .execute();

    const order = orderResult[0];

    // Create order items
    for (const item of input.items) {
      await db.insert(orderItemsTable)
        .values({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price.toString()
        })
        .execute();
    }

    // Update coupon used count if coupon was applied
    if (input.coupon_id) {
      await db.update(couponsTable)
        .set({
          used_count: sql`${couponsTable.used_count} + 1`
        })
        .where(eq(couponsTable.id, input.coupon_id))
        .execute();
    }

    // Convert numeric fields back to numbers before returning
    return {
      ...order,
      subtotal: parseFloat(order.subtotal),
      tax_amount: parseFloat(order.tax_amount),
      discount_amount: parseFloat(order.discount_amount),
      total_amount: parseFloat(order.total_amount)
    };
  } catch (error) {
    console.error('Order creation failed:', error);
    throw error;
  }
};