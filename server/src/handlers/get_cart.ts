import { db } from '../db';
import { cartItemsTable, productsTable } from '../db/schema';
import { type CartItem } from '../schema';
import { eq } from 'drizzle-orm';

export async function getCartItems(userId: number): Promise<CartItem[]> {
  try {
    const results = await db.select()
      .from(cartItemsTable)
      .where(eq(cartItemsTable.user_id, userId))
      .execute();

    return results.map(item => ({
      ...item,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));
  } catch (error) {
    console.error('Failed to fetch cart items:', error);
    throw error;
  }
}

export async function getCartTotal(userId: number): Promise<number> {
  try {
    const results = await db.select()
      .from(cartItemsTable)
      .innerJoin(productsTable, eq(cartItemsTable.product_id, productsTable.id))
      .where(eq(cartItemsTable.user_id, userId))
      .execute();

    const total = results.reduce((sum, result) => {
      const cartItem = result.cart_items;
      const product = result.products;
      
      // Use discount price if available, otherwise use regular price
      const price = product.discount_price ? parseFloat(product.discount_price) : parseFloat(product.price);
      return sum + (price * cartItem.quantity);
    }, 0);

    return total;
  } catch (error) {
    console.error('Failed to calculate cart total:', error);
    throw error;
  }
}