import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable, usersTable, categoriesTable } from '../db/schema';
import { getBlogPosts, getBlogPostBySlug, getAllBlogPostsForAdmin } from '../handlers/get_blog_posts';

// Test user data
const testUser = {
  email: 'author@test.com',
  password_hash: 'hashedpassword123',
  first_name: 'John',
  last_name: 'Author',
  phone: '+1234567890',
  is_admin: false
};

// Test blog post data
const publishedPost = {
  title: 'Published Post',
  slug: 'published-post',
  content: 'This is a published blog post content.',
  excerpt: 'This is an excerpt',
  featured_image: 'https://example.com/image.jpg',
  author_id: 1,
  is_published: true,
  published_at: new Date()
};

const draftPost = {
  title: 'Draft Post',
  slug: 'draft-post',
  content: 'This is a draft blog post content.',
  excerpt: 'Draft excerpt',
  featured_image: null,
  author_id: 1,
  is_published: false,
  published_at: null
};

const anotherPublishedPost = {
  title: 'Another Published Post',
  slug: 'another-published-post',
  content: 'Another published post content.',
  excerpt: null,
  featured_image: null,
  author_id: 1,
  is_published: true,
  published_at: new Date(Date.now() + 86400000) // tomorrow
};

describe('getBlogPosts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no published posts exist', async () => {
    const result = await getBlogPosts();
    expect(result).toEqual([]);
  });

  it('should return only published blog posts sorted by publication date', async () => {
    // Create test user first
    const users = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    
    const userId = users[0].id;

    // Create blog posts
    await db.insert(blogPostsTable)
      .values([
        { ...publishedPost, author_id: userId },
        { ...draftPost, author_id: userId },
        { ...anotherPublishedPost, author_id: userId }
      ])
      .execute();

    const result = await getBlogPosts();

    // Should return only published posts, sorted by publication date (desc)
    expect(result).toHaveLength(2);
    expect(result[0].title).toEqual('Another Published Post');
    expect(result[1].title).toEqual('Published Post');
    
    // Verify all returned posts are published
    result.forEach(post => {
      expect(post.is_published).toBe(true);
      expect(post.published_at).toBeInstanceOf(Date);
    });
  });

  it('should include all blog post fields', async () => {
    // Create test user
    const users = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    // Create published post
    await db.insert(blogPostsTable)
      .values({ ...publishedPost, author_id: users[0].id })
      .execute();

    const result = await getBlogPosts();

    expect(result).toHaveLength(1);
    const post = result[0];
    expect(post.id).toBeDefined();
    expect(post.title).toEqual('Published Post');
    expect(post.slug).toEqual('published-post');
    expect(post.content).toEqual('This is a published blog post content.');
    expect(post.excerpt).toEqual('This is an excerpt');
    expect(post.featured_image).toEqual('https://example.com/image.jpg');
    expect(post.author_id).toEqual(users[0].id);
    expect(post.is_published).toBe(true);
    expect(post.published_at).toBeInstanceOf(Date);
    expect(post.created_at).toBeInstanceOf(Date);
    expect(post.updated_at).toBeInstanceOf(Date);
  });
});

describe('getBlogPostBySlug', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null when blog post does not exist', async () => {
    const result = await getBlogPostBySlug('non-existent-slug');
    expect(result).toBe(null);
  });

  it('should return null when blog post exists but is not published', async () => {
    // Create test user
    const users = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    // Create draft post
    await db.insert(blogPostsTable)
      .values({ ...draftPost, author_id: users[0].id })
      .execute();

    const result = await getBlogPostBySlug('draft-post');
    expect(result).toBe(null);
  });

  it('should return published blog post by slug', async () => {
    // Create test user
    const users = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    // Create published post
    await db.insert(blogPostsTable)
      .values({ ...publishedPost, author_id: users[0].id })
      .execute();

    const result = await getBlogPostBySlug('published-post');

    expect(result).not.toBe(null);
    expect(result!.title).toEqual('Published Post');
    expect(result!.slug).toEqual('published-post');
    expect(result!.content).toEqual('This is a published blog post content.');
    expect(result!.is_published).toBe(true);
    expect(result!.published_at).toBeInstanceOf(Date);
  });

  it('should return complete blog post data including all fields', async () => {
    // Create test user
    const users = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    // Create published post
    await db.insert(blogPostsTable)
      .values({ ...publishedPost, author_id: users[0].id })
      .execute();

    const result = await getBlogPostBySlug('published-post');

    expect(result).not.toBe(null);
    expect(result!.id).toBeDefined();
    expect(result!.author_id).toEqual(users[0].id);
    expect(result!.excerpt).toEqual('This is an excerpt');
    expect(result!.featured_image).toEqual('https://example.com/image.jpg');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });
});

describe('getAllBlogPostsForAdmin', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no posts exist', async () => {
    const result = await getAllBlogPostsForAdmin();
    expect(result).toEqual([]);
  });

  it('should return all blog posts (published and draft) for admin', async () => {
    // Create test user
    const users = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    
    const userId = users[0].id;

    // Create both published and draft posts
    await db.insert(blogPostsTable)
      .values([
        { ...publishedPost, author_id: userId },
        { ...draftPost, author_id: userId },
        { ...anotherPublishedPost, author_id: userId }
      ])
      .execute();

    const result = await getAllBlogPostsForAdmin();

    // Should return all posts (both published and draft)
    expect(result).toHaveLength(3);
    
    // Find posts in result by title
    const published = result.find(p => p.title === 'Published Post');
    const draft = result.find(p => p.title === 'Draft Post');
    const another = result.find(p => p.title === 'Another Published Post');

    expect(published).toBeDefined();
    expect(published!.is_published).toBe(true);
    
    expect(draft).toBeDefined();
    expect(draft!.is_published).toBe(false);
    expect(draft!.published_at).toBe(null);
    
    expect(another).toBeDefined();
    expect(another!.is_published).toBe(true);
  });

  it('should sort posts by created_at in descending order', async () => {
    // Create test user
    const users = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    
    const userId = users[0].id;

    // Create posts with different creation times
    const olderPost = {
      ...publishedPost,
      title: 'Older Post',
      slug: 'older-post',
      author_id: userId
    };

    const newerPost = {
      ...draftPost,
      title: 'Newer Post',
      slug: 'newer-post',
      author_id: userId
    };

    // Insert older post first
    await db.insert(blogPostsTable)
      .values(olderPost)
      .execute();

    // Wait a moment and insert newer post
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await db.insert(blogPostsTable)
      .values(newerPost)
      .execute();

    const result = await getAllBlogPostsForAdmin();

    expect(result).toHaveLength(2);
    // Newer post should be first (sorted by created_at desc)
    expect(result[0].title).toEqual('Newer Post');
    expect(result[1].title).toEqual('Older Post');
  });

  it('should include all blog post fields for admin view', async () => {
    // Create test user
    const users = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    // Create a blog post
    await db.insert(blogPostsTable)
      .values({ ...publishedPost, author_id: users[0].id })
      .execute();

    const result = await getAllBlogPostsForAdmin();

    expect(result).toHaveLength(1);
    const post = result[0];
    
    // Verify all fields are present
    expect(post.id).toBeDefined();
    expect(post.title).toEqual('Published Post');
    expect(post.slug).toEqual('published-post');
    expect(post.content).toEqual('This is a published blog post content.');
    expect(post.excerpt).toEqual('This is an excerpt');
    expect(post.featured_image).toEqual('https://example.com/image.jpg');
    expect(post.author_id).toEqual(users[0].id);
    expect(post.is_published).toBe(true);
    expect(post.published_at).toBeInstanceOf(Date);
    expect(post.created_at).toBeInstanceOf(Date);
    expect(post.updated_at).toBeInstanceOf(Date);
  });
});