import { db } from '../db';
import { blogPostsTable, usersTable } from '../db/schema';
import { type BlogPost } from '../schema';
import { eq, desc, and, isNotNull } from 'drizzle-orm';

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    // Fetch all published blog posts with author information, sorted by publication date
    const results = await db.select()
      .from(blogPostsTable)
      .innerJoin(usersTable, eq(blogPostsTable.author_id, usersTable.id))
      .where(and(
        eq(blogPostsTable.is_published, true),
        isNotNull(blogPostsTable.published_at)
      ))
      .orderBy(desc(blogPostsTable.published_at))
      .execute();

    // Map the joined results to BlogPost format
    return results.map(result => ({
      ...result.blog_posts,
      // No numeric conversions needed for blog posts
    }));
  } catch (error) {
    console.error('Failed to fetch published blog posts:', error);
    throw error;
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    // Fetch a single published blog post by slug
    const results = await db.select()
      .from(blogPostsTable)
      .innerJoin(usersTable, eq(blogPostsTable.author_id, usersTable.id))
      .where(and(
        eq(blogPostsTable.slug, slug),
        eq(blogPostsTable.is_published, true),
        isNotNull(blogPostsTable.published_at)
      ))
      .limit(1)
      .execute();

    if (results.length === 0) {
      return null;
    }

    // Return the blog post data
    return {
      ...results[0].blog_posts,
      // No numeric conversions needed for blog posts
    };
  } catch (error) {
    console.error('Failed to fetch blog post by slug:', error);
    throw error;
  }
}

export async function getAllBlogPostsForAdmin(): Promise<BlogPost[]> {
  try {
    // Fetch all blog posts (published and draft) for admin management
    const results = await db.select()
      .from(blogPostsTable)
      .innerJoin(usersTable, eq(blogPostsTable.author_id, usersTable.id))
      .orderBy(desc(blogPostsTable.created_at))
      .execute();

    // Map the joined results to BlogPost format
    return results.map(result => ({
      ...result.blog_posts,
      // No numeric conversions needed for blog posts
    }));
  } catch (error) {
    console.error('Failed to fetch all blog posts for admin:', error);
    throw error;
  }
}