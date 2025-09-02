import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  createUserInputSchema,
  loginInputSchema,
  createCategoryInputSchema,
  updateCategoryInputSchema,
  createProductInputSchema,
  updateProductInputSchema,
  createCouponInputSchema,
  createOrderInputSchema,
  addToCartInputSchema,
  createReviewInputSchema,
  updateReviewInputSchema,
  createBlogPostInputSchema,
  updateSettingInputSchema
} from './schema';

// Import handlers
import { createUser } from './handlers/create_user';
import { login } from './handlers/login';
import { getCategories } from './handlers/get_categories';
import { createCategory } from './handlers/create_category';
import { updateCategory } from './handlers/update_category';
import { getProducts, getProductsByCategory, getFeaturedProducts, getProductBySlug } from './handlers/get_products';
import { createProduct } from './handlers/create_product';
import { updateProduct } from './handlers/update_product';
import { getCoupons, validateCoupon } from './handlers/get_coupons';
import { createCoupon } from './handlers/create_coupon';
import { getOrders, getOrdersByUser, getOrderById } from './handlers/get_orders';
import { createOrder } from './handlers/create_order';
import { updateOrderStatus } from './handlers/update_order_status';
import { getCartItems, getCartTotal } from './handlers/get_cart';
import { addToCart, removeFromCart, clearCart } from './handlers/add_to_cart';
import { getReviews, getReviewsByProduct, getPendingReviews } from './handlers/get_reviews';
import { createReview } from './handlers/create_review';
import { updateReview } from './handlers/update_review';
import { getBlogPosts, getBlogPostBySlug, getAllBlogPostsForAdmin } from './handlers/get_blog_posts';
import { createBlogPost } from './handlers/create_blog_post';
import { getDashboardStats } from './handlers/get_dashboard_stats';
import { getSettings, getSettingByKey } from './handlers/get_settings';
import { updateSetting } from './handlers/update_setting';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Authentication routes
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),
  
  login: publicProcedure
    .input(loginInputSchema)
    .mutation(({ input }) => login(input)),

  // Category routes
  getCategories: publicProcedure
    .query(() => getCategories()),
  
  createCategory: publicProcedure
    .input(createCategoryInputSchema)
    .mutation(({ input }) => createCategory(input)),
  
  updateCategory: publicProcedure
    .input(updateCategoryInputSchema)
    .mutation(({ input }) => updateCategory(input)),

  // Product routes
  getProducts: publicProcedure
    .query(() => getProducts()),
  
  getProductsByCategory: publicProcedure
    .input(z.object({ categoryId: z.number() }))
    .query(({ input }) => getProductsByCategory(input.categoryId)),
  
  getFeaturedProducts: publicProcedure
    .query(() => getFeaturedProducts()),
  
  getProductBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => getProductBySlug(input.slug)),
  
  createProduct: publicProcedure
    .input(createProductInputSchema)
    .mutation(({ input }) => createProduct(input)),
  
  updateProduct: publicProcedure
    .input(updateProductInputSchema)
    .mutation(({ input }) => updateProduct(input)),

  // Coupon routes
  getCoupons: publicProcedure
    .query(() => getCoupons()),
  
  validateCoupon: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(({ input }) => validateCoupon(input.code)),
  
  createCoupon: publicProcedure
    .input(createCouponInputSchema)
    .mutation(({ input }) => createCoupon(input)),

  // Order routes
  getOrders: publicProcedure
    .query(() => getOrders()),
  
  getOrdersByUser: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(({ input }) => getOrdersByUser(input.userId)),
  
  getOrderById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getOrderById(input.id)),
  
  createOrder: publicProcedure
    .input(createOrderInputSchema)
    .mutation(({ input }) => createOrder(input)),
  
  updateOrderStatus: publicProcedure
    .input(z.object({ 
      orderId: z.number(), 
      status: z.enum(['pending', 'completed', 'failed', 'refunded']) 
    }))
    .mutation(({ input }) => updateOrderStatus(input.orderId, input.status)),

  // Cart routes
  getCartItems: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(({ input }) => getCartItems(input.userId)),
  
  getCartTotal: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(({ input }) => getCartTotal(input.userId)),
  
  addToCart: publicProcedure
    .input(addToCartInputSchema)
    .mutation(({ input }) => addToCart(input)),
  
  removeFromCart: publicProcedure
    .input(z.object({ userId: z.number(), productId: z.number() }))
    .mutation(({ input }) => removeFromCart(input.userId, input.productId)),
  
  clearCart: publicProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(({ input }) => clearCart(input.userId)),

  // Review routes
  getReviews: publicProcedure
    .query(() => getReviews()),
  
  getReviewsByProduct: publicProcedure
    .input(z.object({ productId: z.number() }))
    .query(({ input }) => getReviewsByProduct(input.productId)),
  
  getPendingReviews: publicProcedure
    .query(() => getPendingReviews()),
  
  createReview: publicProcedure
    .input(createReviewInputSchema)
    .mutation(({ input }) => createReview(input)),
  
  updateReview: publicProcedure
    .input(updateReviewInputSchema)
    .mutation(({ input }) => updateReview(input)),

  // Blog routes
  getBlogPosts: publicProcedure
    .query(() => getBlogPosts()),
  
  getBlogPostBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => getBlogPostBySlug(input.slug)),
  
  getAllBlogPostsForAdmin: publicProcedure
    .query(() => getAllBlogPostsForAdmin()),
  
  createBlogPost: publicProcedure
    .input(createBlogPostInputSchema)
    .mutation(({ input }) => createBlogPost(input)),

  // Dashboard routes
  getDashboardStats: publicProcedure
    .query(() => getDashboardStats()),

  // Settings routes
  getSettings: publicProcedure
    .query(() => getSettings()),
  
  getSettingByKey: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(({ input }) => getSettingByKey(input.key)),
  
  updateSetting: publicProcedure
    .input(updateSettingInputSchema)
    .mutation(({ input }) => updateSetting(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();