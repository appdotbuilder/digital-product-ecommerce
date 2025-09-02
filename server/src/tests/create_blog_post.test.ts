import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable, usersTable } from '../db/schema';
import { type CreateBlogPostInput } from '../schema';
import { createBlogPost } from '../handlers/create_blog_post';
import { eq } from 'drizzle-orm';

// Test user data for foreign key relationships
const testUser = {
  email: 'author@test.com',
  password_hash: 'hashed_password',
  first_name: 'Test',
  last_name: 'Author',
  phone: null,
  is_admin: false
};

// Test blog post input
const testInput: CreateBlogPostInput = {
  title: 'Test Blog Post',
  slug: 'test-blog-post',
  content: 'This is the full content of the test blog post with multiple paragraphs.',
  excerpt: 'This is a short excerpt of the blog post.',
  featured_image: 'https://example.com/image.jpg',
  author_id: 1, // Will be set after creating user
  is_published: false
};

describe('createBlogPost', () => {
  beforeEach(async () => {
    await createDB();
    
    // Create a test user first for foreign key relationship
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    
    // Update test input with actual user ID
    testInput.author_id = userResult[0].id;
  });
  
  afterEach(resetDB);

  it('should create a blog post with all fields', async () => {
    const result = await createBlogPost(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Blog Post');
    expect(result.slug).toEqual('test-blog-post');
    expect(result.content).toEqual(testInput.content);
    expect(result.excerpt).toEqual('This is a short excerpt of the blog post.');
    expect(result.featured_image).toEqual('https://example.com/image.jpg');
    expect(result.author_id).toEqual(testInput.author_id);
    expect(result.is_published).toEqual(false);
    expect(result.published_at).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save blog post to database', async () => {
    const result = await createBlogPost(testInput);

    // Query database to verify persistence
    const blogPosts = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, result.id))
      .execute();

    expect(blogPosts).toHaveLength(1);
    expect(blogPosts[0].title).toEqual('Test Blog Post');
    expect(blogPosts[0].slug).toEqual('test-blog-post');
    expect(blogPosts[0].content).toEqual(testInput.content);
    expect(blogPosts[0].excerpt).toEqual(testInput.excerpt ?? null);
    expect(blogPosts[0].featured_image).toEqual(testInput.featured_image ?? null);
    expect(blogPosts[0].author_id).toEqual(testInput.author_id);
    expect(blogPosts[0].is_published).toEqual(false);
    expect(blogPosts[0].published_at).toBeNull();
    expect(blogPosts[0].created_at).toBeInstanceOf(Date);
    expect(blogPosts[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create published blog post with published_at date', async () => {
    const publishedInput: CreateBlogPostInput = {
      ...testInput,
      is_published: true
    };

    const result = await createBlogPost(publishedInput);

    expect(result.is_published).toEqual(true);
    expect(result.published_at).toBeInstanceOf(Date);
    expect(result.published_at).not.toBeNull();
    
    // Verify published_at is recent (within last few seconds)
    const now = new Date();
    const timeDiff = now.getTime() - result.published_at!.getTime();
    expect(timeDiff).toBeLessThan(5000); // Less than 5 seconds
  });

  it('should create blog post with minimal required fields', async () => {
    const minimalInput: CreateBlogPostInput = {
      title: 'Minimal Post',
      slug: 'minimal-post',
      content: 'Minimal content only.',
      author_id: testInput.author_id
    };

    const result = await createBlogPost(minimalInput);

    expect(result.title).toEqual('Minimal Post');
    expect(result.slug).toEqual('minimal-post');
    expect(result.content).toEqual('Minimal content only.');
    expect(result.excerpt).toBeNull();
    expect(result.featured_image).toBeNull();
    expect(result.author_id).toEqual(testInput.author_id);
    expect(result.is_published).toEqual(false);
    expect(result.published_at).toBeNull();
    expect(result.id).toBeDefined();
  });

  it('should handle null optional fields correctly', async () => {
    const inputWithNulls: CreateBlogPostInput = {
      title: 'Post with Nulls',
      slug: 'post-with-nulls',
      content: 'Content with null fields.',
      author_id: testInput.author_id,
      is_published: false
    };

    const result = await createBlogPost(inputWithNulls);

    expect(result.excerpt).toBeNull();
    expect(result.featured_image).toBeNull();
    expect(result.is_published).toEqual(false);
    expect(result.published_at).toBeNull();
  });

  it('should create multiple blog posts with different slugs', async () => {
    const input1: CreateBlogPostInput = {
      ...testInput,
      title: 'First Post',
      slug: 'first-post'
    };

    const input2: CreateBlogPostInput = {
      ...testInput,
      title: 'Second Post',
      slug: 'second-post'
    };

    const result1 = await createBlogPost(input1);
    const result2 = await createBlogPost(input2);

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.slug).toEqual('first-post');
    expect(result2.slug).toEqual('second-post');

    // Verify both posts exist in database
    const allPosts = await db.select().from(blogPostsTable).execute();
    expect(allPosts).toHaveLength(2);
  });

  it('should throw error for invalid author_id', async () => {
    const invalidInput: CreateBlogPostInput = {
      ...testInput,
      author_id: 999 // Non-existent user ID
    };

    await expect(createBlogPost(invalidInput)).rejects.toThrow(/violates foreign key constraint|does not exist/i);
  });

  it('should throw error for duplicate slug', async () => {
    // Create first blog post
    await createBlogPost(testInput);

    // Try to create second blog post with same slug
    const duplicateInput: CreateBlogPostInput = {
      ...testInput,
      title: 'Different Title'
    };

    await expect(createBlogPost(duplicateInput)).rejects.toThrow(/duplicate key|unique constraint/i);
  });
});