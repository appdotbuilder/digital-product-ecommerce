import { db } from '../db';
import { productsTable } from '../db/schema';
import { type Product } from '../schema';
import { eq, desc } from 'drizzle-orm';

export async function getProducts(): Promise<Product[]> {
  try {
    const results = await db.select()
      .from(productsTable)
      .where(eq(productsTable.is_active, true))
      .orderBy(desc(productsTable.created_at))
      .execute();

    // Convert numeric fields back to numbers before returning
    return results.map(product => ({
      ...product,
      price: parseFloat(product.price),
      discount_price: product.discount_price ? parseFloat(product.discount_price) : null
    }));
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
}

export async function getProductsByCategory(categoryId: number): Promise<Product[]> {
  try {
    const results = await db.select()
      .from(productsTable)
      .where(eq(productsTable.category_id, categoryId))
      .orderBy(desc(productsTable.created_at))
      .execute();

    // Convert numeric fields back to numbers before returning
    return results.map(product => ({
      ...product,
      price: parseFloat(product.price),
      discount_price: product.discount_price ? parseFloat(product.discount_price) : null
    }));
  } catch (error) {
    console.error('Failed to fetch products by category:', error);
    throw error;
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const results = await db.select()
      .from(productsTable)
      .where(eq(productsTable.is_featured, true))
      .orderBy(desc(productsTable.created_at))
      .execute();

    // Convert numeric fields back to numbers before returning
    return results.map(product => ({
      ...product,
      price: parseFloat(product.price),
      discount_price: product.discount_price ? parseFloat(product.discount_price) : null
    }));
  } catch (error) {
    console.error('Failed to fetch featured products:', error);
    throw error;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const results = await db.select()
      .from(productsTable)
      .where(eq(productsTable.slug, slug))
      .execute();

    if (results.length === 0) {
      return null;
    }

    const product = results[0];
    
    // Convert numeric fields back to numbers before returning
    return {
      ...product,
      price: parseFloat(product.price),
      discount_price: product.discount_price ? parseFloat(product.discount_price) : null
    };
  } catch (error) {
    console.error('Failed to fetch product by slug:', error);
    throw error;
  }
}