import { serial, text, pgTable, timestamp, numeric, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const discountTypeEnum = pgEnum('discount_type', ['percentage', 'fixed']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'completed', 'failed', 'refunded']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed']);
export const settingTypeEnum = pgEnum('setting_type', ['string', 'number', 'boolean', 'json']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  first_name: text('first_name').notNull(),
  last_name: text('last_name').notNull(),
  phone: text('phone'),
  is_admin: boolean('is_admin').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Categories table
export const categoriesTable = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  image_url: text('image_url'),
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Products table
export const productsTable = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  short_description: text('short_description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  discount_price: numeric('discount_price', { precision: 10, scale: 2 }),
  category_id: integer('category_id').notNull().references(() => categoriesTable.id),
  image_url: text('image_url'),
  download_url: text('download_url'),
  license_key: text('license_key'),
  is_active: boolean('is_active').default(true).notNull(),
  is_featured: boolean('is_featured').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Coupons table
export const couponsTable = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  discount_type: discountTypeEnum('discount_type').notNull(),
  discount_value: numeric('discount_value', { precision: 10, scale: 2 }).notNull(),
  minimum_amount: numeric('minimum_amount', { precision: 10, scale: 2 }),
  usage_limit: integer('usage_limit'),
  used_count: integer('used_count').default(0).notNull(),
  expires_at: timestamp('expires_at'),
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Orders table
export const ordersTable = pgTable('orders', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => usersTable.id),
  order_number: text('order_number').notNull().unique(),
  status: orderStatusEnum('status').default('pending').notNull(),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  tax_amount: numeric('tax_amount', { precision: 10, scale: 2 }).default('0').notNull(),
  discount_amount: numeric('discount_amount', { precision: 10, scale: 2 }).default('0').notNull(),
  total_amount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  coupon_id: integer('coupon_id').references(() => couponsTable.id),
  payment_method: text('payment_method'),
  payment_status: paymentStatusEnum('payment_status').default('pending').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Order Items table
export const orderItemsTable = pgTable('order_items', {
  id: serial('id').primaryKey(),
  order_id: integer('order_id').notNull().references(() => ordersTable.id),
  product_id: integer('product_id').notNull().references(() => productsTable.id),
  quantity: integer('quantity').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Reviews table
export const reviewsTable = pgTable('reviews', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => usersTable.id),
  product_id: integer('product_id').notNull().references(() => productsTable.id),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  is_approved: boolean('is_approved').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Blog Posts table
export const blogPostsTable = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  featured_image: text('featured_image'),
  author_id: integer('author_id').notNull().references(() => usersTable.id),
  is_published: boolean('is_published').default(false).notNull(),
  published_at: timestamp('published_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Cart Items table
export const cartItemsTable = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => usersTable.id),
  product_id: integer('product_id').notNull().references(() => productsTable.id),
  quantity: integer('quantity').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Settings table
export const settingsTable = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  type: settingTypeEnum('type').default('string').notNull(),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  orders: many(ordersTable),
  reviews: many(reviewsTable),
  blogPosts: many(blogPostsTable),
  cartItems: many(cartItemsTable),
}));

export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
  products: many(productsTable),
}));

export const productsRelations = relations(productsTable, ({ one, many }) => ({
  category: one(categoriesTable, {
    fields: [productsTable.category_id],
    references: [categoriesTable.id],
  }),
  orderItems: many(orderItemsTable),
  reviews: many(reviewsTable),
  cartItems: many(cartItemsTable),
}));

export const ordersRelations = relations(ordersTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [ordersTable.user_id],
    references: [usersTable.id],
  }),
  coupon: one(couponsTable, {
    fields: [ordersTable.coupon_id],
    references: [couponsTable.id],
  }),
  orderItems: many(orderItemsTable),
}));

export const orderItemsRelations = relations(orderItemsTable, ({ one }) => ({
  order: one(ordersTable, {
    fields: [orderItemsTable.order_id],
    references: [ordersTable.id],
  }),
  product: one(productsTable, {
    fields: [orderItemsTable.product_id],
    references: [productsTable.id],
  }),
}));

export const reviewsRelations = relations(reviewsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [reviewsTable.user_id],
    references: [usersTable.id],
  }),
  product: one(productsTable, {
    fields: [reviewsTable.product_id],
    references: [productsTable.id],
  }),
}));

export const blogPostsRelations = relations(blogPostsTable, ({ one }) => ({
  author: one(usersTable, {
    fields: [blogPostsTable.author_id],
    references: [usersTable.id],
  }),
}));

export const cartItemsRelations = relations(cartItemsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [cartItemsTable.user_id],
    references: [usersTable.id],
  }),
  product: one(productsTable, {
    fields: [cartItemsTable.product_id],
    references: [productsTable.id],
  }),
}));

export const couponsRelations = relations(couponsTable, ({ many }) => ({
  orders: many(ordersTable),
}));

// Export all tables for relation queries
export const tables = {
  users: usersTable,
  categories: categoriesTable,
  products: productsTable,
  coupons: couponsTable,
  orders: ordersTable,
  orderItems: orderItemsTable,
  reviews: reviewsTable,
  blogPosts: blogPostsTable,
  cartItems: cartItemsTable,
  settings: settingsTable,
};