import { z } from 'zod';

// User/Customer schemas
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  password_hash: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  phone: z.string().nullable(),
  is_admin: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

export const createUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  first_name: z.string(),
  last_name: z.string(),
  phone: z.string().nullable().optional(),
  is_admin: z.boolean().optional()
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export type LoginInput = z.infer<typeof loginInputSchema>;

// Category schemas
export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  image_url: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Category = z.infer<typeof categorySchema>;

export const createCategoryInputSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  is_active: z.boolean().optional()
});

export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;

export const updateCategoryInputSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  is_active: z.boolean().optional()
});

export type UpdateCategoryInput = z.infer<typeof updateCategoryInputSchema>;

// Product schemas
export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  short_description: z.string().nullable(),
  price: z.number(),
  discount_price: z.number().nullable(),
  category_id: z.number(),
  image_url: z.string().nullable(),
  download_url: z.string().nullable(),
  license_key: z.string().nullable(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Product = z.infer<typeof productSchema>;

export const createProductInputSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  short_description: z.string().nullable().optional(),
  price: z.number().positive(),
  discount_price: z.number().positive().nullable().optional(),
  category_id: z.number(),
  image_url: z.string().nullable().optional(),
  download_url: z.string().nullable().optional(),
  license_key: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional()
});

export type CreateProductInput = z.infer<typeof createProductInputSchema>;

export const updateProductInputSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  short_description: z.string().nullable().optional(),
  price: z.number().positive().optional(),
  discount_price: z.number().positive().nullable().optional(),
  category_id: z.number().optional(),
  image_url: z.string().nullable().optional(),
  download_url: z.string().nullable().optional(),
  license_key: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional()
});

export type UpdateProductInput = z.infer<typeof updateProductInputSchema>;

// Coupon schemas
export const couponSchema = z.object({
  id: z.number(),
  code: z.string(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number(),
  minimum_amount: z.number().nullable(),
  usage_limit: z.number().nullable(),
  used_count: z.number(),
  expires_at: z.coerce.date().nullable(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Coupon = z.infer<typeof couponSchema>;

export const createCouponInputSchema = z.object({
  code: z.string(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().positive(),
  minimum_amount: z.number().positive().nullable().optional(),
  usage_limit: z.number().int().positive().nullable().optional(),
  expires_at: z.coerce.date().nullable().optional(),
  is_active: z.boolean().optional()
});

export type CreateCouponInput = z.infer<typeof createCouponInputSchema>;

// Order schemas
export const orderStatusEnum = z.enum(['pending', 'completed', 'failed', 'refunded']);

export const orderSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  order_number: z.string(),
  status: orderStatusEnum,
  subtotal: z.number(),
  tax_amount: z.number(),
  discount_amount: z.number(),
  total_amount: z.number(),
  coupon_id: z.number().nullable(),
  payment_method: z.string().nullable(),
  payment_status: z.enum(['pending', 'completed', 'failed']),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Order = z.infer<typeof orderSchema>;

export const createOrderInputSchema = z.object({
  user_id: z.number(),
  subtotal: z.number(),
  tax_amount: z.number().optional(),
  discount_amount: z.number().optional(),
  total_amount: z.number(),
  coupon_id: z.number().nullable().optional(),
  payment_method: z.string().nullable().optional(),
  items: z.array(z.object({
    product_id: z.number(),
    quantity: z.number().int().positive(),
    price: z.number().positive()
  }))
});

export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;

// Order Item schemas
export const orderItemSchema = z.object({
  id: z.number(),
  order_id: z.number(),
  product_id: z.number(),
  quantity: z.number().int(),
  price: z.number(),
  created_at: z.coerce.date()
});

export type OrderItem = z.infer<typeof orderItemSchema>;

// Review schemas
export const reviewSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  product_id: z.number(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable(),
  is_approved: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Review = z.infer<typeof reviewSchema>;

export const createReviewInputSchema = z.object({
  user_id: z.number(),
  product_id: z.number(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable().optional()
});

export type CreateReviewInput = z.infer<typeof createReviewInputSchema>;

export const updateReviewInputSchema = z.object({
  id: z.number(),
  is_approved: z.boolean()
});

export type UpdateReviewInput = z.infer<typeof updateReviewInputSchema>;

// Blog schemas
export const blogPostSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string().nullable(),
  featured_image: z.string().nullable(),
  author_id: z.number(),
  is_published: z.boolean(),
  published_at: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type BlogPost = z.infer<typeof blogPostSchema>;

export const createBlogPostInputSchema = z.object({
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string().nullable().optional(),
  featured_image: z.string().nullable().optional(),
  author_id: z.number(),
  is_published: z.boolean().optional()
});

export type CreateBlogPostInput = z.infer<typeof createBlogPostInputSchema>;

// Cart schemas
export const cartItemSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  product_id: z.number(),
  quantity: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type CartItem = z.infer<typeof cartItemSchema>;

export const addToCartInputSchema = z.object({
  user_id: z.number(),
  product_id: z.number(),
  quantity: z.number().int().positive().optional()
});

export type AddToCartInput = z.infer<typeof addToCartInputSchema>;

// Settings schemas
export const settingSchema = z.object({
  id: z.number(),
  key: z.string(),
  value: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'json']),
  description: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Setting = z.infer<typeof settingSchema>;

export const updateSettingInputSchema = z.object({
  key: z.string(),
  value: z.string()
});

export type UpdateSettingInput = z.infer<typeof updateSettingInputSchema>;

// Dashboard statistics schemas
export const dashboardStatsSchema = z.object({
  total_categories: z.number(),
  total_products: z.number(),
  total_customers: z.number(),
  total_orders: z.number(),
  total_revenue: z.number(),
  pending_orders: z.number(),
  completed_orders: z.number()
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;