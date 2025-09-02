import { db } from '../db';
import { cartItemsTable, usersTable, productsTable } from '../db/schema';
import { type AddToCartInput, type CartItem } from '../schema';
import { eq, and } from 'drizzle-orm';

export async function addToCart(input: AddToCartInput): Promise<CartItem> {
  try {
    // Verify user exists
    const user = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, input.user_id))
      .execute();

    if (user.length === 0) {
      throw new Error(`User with id ${input.user_id} not found`);
    }

    // Verify product exists
    const product = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, input.product_id))
      .execute();

    if (product.length === 0) {
      throw new Error(`Product with id ${input.product_id} not found`);
    }

    const quantity = input.quantity || 1;

    // Check if item already exists in cart
    const existingItem = await db.select()
      .from(cartItemsTable)
      .where(and(
        eq(cartItemsTable.user_id, input.user_id),
        eq(cartItemsTable.product_id, input.product_id)
      ))
      .execute();

    if (existingItem.length > 0) {
      // Update existing item quantity
      const result = await db.update(cartItemsTable)
        .set({
          quantity: existingItem[0].quantity + quantity,
          updated_at: new Date()
        })
        .where(eq(cartItemsTable.id, existingItem[0].id))
        .returning()
        .execute();

      return result[0];
    } else {
      // Insert new cart item
      const result = await db.insert(cartItemsTable)
        .values({
          user_id: input.user_id,
          product_id: input.product_id,
          quantity: quantity
        })
        .returning()
        .execute();

      return result[0];
    }
  } catch (error) {
    console.error('Add to cart failed:', error);
    throw error;
  }
}

export async function removeFromCart(userId: number, productId: number): Promise<boolean> {
  try {
    // Verify user exists
    const user = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .execute();

    if (user.length === 0) {
      throw new Error(`User with id ${userId} not found`);
    }

    // Remove the specific item from cart
    const result = await db.delete(cartItemsTable)
      .where(and(
        eq(cartItemsTable.user_id, userId),
        eq(cartItemsTable.product_id, productId)
      ))
      .returning()
      .execute();

    return result.length > 0;
  } catch (error) {
    console.error('Remove from cart failed:', error);
    throw error;
  }
}

export async function clearCart(userId: number): Promise<boolean> {
  try {
    // Verify user exists
    const user = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .execute();

    if (user.length === 0) {
      throw new Error(`User with id ${userId} not found`);
    }

    // Remove all items from user's cart
    const result = await db.delete(cartItemsTable)
      .where(eq(cartItemsTable.user_id, userId))
      .returning()
      .execute();

    return true; // Return true even if no items were deleted (cart was already empty)
  } catch (error) {
    console.error('Clear cart failed:', error);
    throw error;
  }
}