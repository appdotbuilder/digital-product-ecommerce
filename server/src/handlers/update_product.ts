import { db } from '../db';
import { productsTable, categoriesTable } from '../db/schema';
import { type UpdateProductInput, type Product } from '../schema';
import { eq } from 'drizzle-orm';

export const updateProduct = async (input: UpdateProductInput): Promise<Product> => {
  try {
    // First verify the product exists
    const existingProduct = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, input.id))
      .execute();

    if (existingProduct.length === 0) {
      throw new Error(`Product with id ${input.id} not found`);
    }

    // If category_id is being updated, verify it exists
    if (input.category_id !== undefined) {
      const category = await db.select()
        .from(categoriesTable)
        .where(eq(categoriesTable.id, input.category_id))
        .execute();

      if (category.length === 0) {
        throw new Error(`Category with id ${input.category_id} not found`);
      }
    }

    // Prepare update data, converting numeric fields to strings
    const updateData: any = {
      updated_at: new Date()
    };

    // Only include fields that are actually being updated
    if (input.name !== undefined) updateData['name'] = input.name;
    if (input.slug !== undefined) updateData['slug'] = input.slug;
    if (input.description !== undefined) updateData['description'] = input.description;
    if (input.short_description !== undefined) updateData['short_description'] = input.short_description;
    if (input.price !== undefined) updateData['price'] = input.price.toString(); // Convert number to string
    if (input.discount_price !== undefined) updateData['discount_price'] = input.discount_price?.toString() || null;
    if (input.category_id !== undefined) updateData['category_id'] = input.category_id;
    if (input.image_url !== undefined) updateData['image_url'] = input.image_url;
    if (input.download_url !== undefined) updateData['download_url'] = input.download_url;
    if (input.license_key !== undefined) updateData['license_key'] = input.license_key;
    if (input.is_active !== undefined) updateData['is_active'] = input.is_active;
    if (input.is_featured !== undefined) updateData['is_featured'] = input.is_featured;

    // Update the product
    const result = await db.update(productsTable)
      .set(updateData)
      .where(eq(productsTable.id, input.id))
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const updatedProduct = result[0];
    return {
      ...updatedProduct,
      price: parseFloat(updatedProduct.price), // Convert string back to number
      discount_price: updatedProduct.discount_price ? parseFloat(updatedProduct.discount_price) : null
    };
  } catch (error) {
    console.error('Product update failed:', error);
    throw error;
  }
};