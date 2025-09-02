import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type CreateBlogPostInput, type BlogPost } from '../schema';

export const createBlogPost = async (input: CreateBlogPostInput): Promise<BlogPost> => {
  try {
    // Determine if publication date should be set
    const published_at = input.is_published ? new Date() : null;

    // Insert blog post record
    const result = await db.insert(blogPostsTable)
      .values({
        title: input.title,
        slug: input.slug,
        content: input.content,
        excerpt: input.excerpt ?? null,
        featured_image: input.featured_image ?? null,
        author_id: input.author_id,
        is_published: input.is_published || false,
        published_at: published_at
      })
      .returning()
      .execute();

    const blogPost = result[0];
    return blogPost;
  } catch (error) {
    console.error('Blog post creation failed:', error);
    throw error;
  }
};