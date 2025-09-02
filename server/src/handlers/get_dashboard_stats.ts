import { db } from '../db';
import { categoriesTable, productsTable, usersTable, ordersTable } from '../db/schema';
import { type DashboardStats } from '../schema';
import { count, eq, sum, sql } from 'drizzle-orm';

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Get total counts for basic entities
    const [
      totalCategories,
      totalProducts,
      totalCustomers,
      totalOrders
    ] = await Promise.all([
      db.select({ count: count() }).from(categoriesTable).execute(),
      db.select({ count: count() }).from(productsTable).execute(),
      db.select({ count: count() }).from(usersTable).where(eq(usersTable.is_admin, false)).execute(),
      db.select({ count: count() }).from(ordersTable).execute()
    ]);

    // Get revenue calculation (sum of total_amount from completed orders)
    const revenueResult = await db.select({
      revenue: sum(ordersTable.total_amount)
    })
      .from(ordersTable)
      .where(eq(ordersTable.status, 'completed'))
      .execute();

    // Get order status counts
    const [pendingOrdersResult, completedOrdersResult] = await Promise.all([
      db.select({ count: count() })
        .from(ordersTable)
        .where(eq(ordersTable.status, 'pending'))
        .execute(),
      db.select({ count: count() })
        .from(ordersTable)
        .where(eq(ordersTable.status, 'completed'))
        .execute()
    ]);

    // Convert numeric fields and handle null values
    const totalRevenue = revenueResult[0]?.revenue ? parseFloat(revenueResult[0].revenue) : 0;

    return {
      total_categories: totalCategories[0].count,
      total_products: totalProducts[0].count,
      total_customers: totalCustomers[0].count,
      total_orders: totalOrders[0].count,
      total_revenue: totalRevenue,
      pending_orders: pendingOrdersResult[0].count,
      completed_orders: completedOrdersResult[0].count
    };
  } catch (error) {
    console.error('Dashboard stats fetch failed:', error);
    throw error;
  }
};