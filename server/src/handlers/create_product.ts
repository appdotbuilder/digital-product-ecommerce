import { db } from '../db';
import { productsTable, categoriesTable } from '../db/schema';
import { type CreateProductInput, type Product } from '../schema';
import { eq } from 'drizzle-orm';

export const createProduct = async (input: CreateProductInput): Promise<Product> => {
  try {
    // Verify that the category exists before creating the product
    const categoryExists = await db.select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, input.category_id))
      .execute();

    if (categoryExists.length === 0) {
      throw new Error(`Category with id ${input.category_id} does not exist`);
    }

    // Insert product record
    const result = await db.insert(productsTable)
      .values({
        name: input.name,
        slug: input.slug,
        description: input.description || null,
        short_description: input.short_description || null,
        price: input.price.toString(), // Convert number to string for numeric column
        discount_price: input.discount_price ? input.discount_price.toString() : null,
        category_id: input.category_id,
        image_url: input.image_url || null,
        download_url: input.download_url || null,
        license_key: input.license_key || null,
        is_active: input.is_active !== undefined ? input.is_active : true,
        is_featured: input.is_featured !== undefined ? input.is_featured : false
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const product = result[0];
    return {
      ...product,
      price: parseFloat(product.price), // Convert string back to number
      discount_price: product.discount_price ? parseFloat(product.discount_price) : null
    };
  } catch (error) {
    console.error('Product creation failed:', error);
    throw error;
  }
};