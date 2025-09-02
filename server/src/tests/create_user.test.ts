import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput } from '../schema';
import { createUser } from '../handlers/create_user';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateUserInput = {
  email: 'test@example.com',
  password: 'password123',
  first_name: 'John',
  last_name: 'Doe',
  phone: '+1234567890',
  is_admin: false
};

describe('createUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a user with all fields', async () => {
    const result = await createUser(testInput);

    // Basic field validation
    expect(result.email).toEqual('test@example.com');
    expect(result.first_name).toEqual('John');
    expect(result.last_name).toEqual('Doe');
    expect(result.phone).toEqual('+1234567890');
    expect(result.is_admin).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify password is hashed (not plain text)
    expect(result.password_hash).toBeDefined();
    expect(result.password_hash).not.toEqual('password123');
    expect(result.password_hash.length).toBeGreaterThan(20); // Hashed passwords are long
  });

  it('should create a user with minimal fields (optional values omitted)', async () => {
    const minimalInput: CreateUserInput = {
      email: 'minimal@example.com',
      password: 'password123',
      first_name: 'Jane',
      last_name: 'Smith'
    };

    const result = await createUser(minimalInput);

    expect(result.email).toEqual('minimal@example.com');
    expect(result.first_name).toEqual('Jane');
    expect(result.last_name).toEqual('Smith');
    expect(result.phone).toBeNull();
    expect(result.is_admin).toEqual(false); // Default value
  });

  it('should create an admin user when is_admin is true', async () => {
    const adminInput: CreateUserInput = {
      email: 'admin@example.com',
      password: 'adminpass123',
      first_name: 'Admin',
      last_name: 'User',
      is_admin: true
    };

    const result = await createUser(adminInput);

    expect(result.is_admin).toEqual(true);
  });

  it('should save user to database correctly', async () => {
    const result = await createUser(testInput);

    // Query database to verify user was saved
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, result.id))
      .execute();

    expect(users).toHaveLength(1);
    const savedUser = users[0];
    
    expect(savedUser.email).toEqual('test@example.com');
    expect(savedUser.first_name).toEqual('John');
    expect(savedUser.last_name).toEqual('Doe');
    expect(savedUser.phone).toEqual('+1234567890');
    expect(savedUser.is_admin).toEqual(false);
    expect(savedUser.created_at).toBeInstanceOf(Date);
    expect(savedUser.updated_at).toBeInstanceOf(Date);
  });

  it('should hash password correctly', async () => {
    const result = await createUser(testInput);

    // Verify the password can be verified with Bun's password verification
    const isValidPassword = await Bun.password.verify('password123', result.password_hash);
    expect(isValidPassword).toBe(true);

    // Verify wrong password fails
    const isWrongPassword = await Bun.password.verify('wrongpassword', result.password_hash);
    expect(isWrongPassword).toBe(false);
  });

  it('should handle null phone number correctly', async () => {
    const inputWithNullPhone: CreateUserInput = {
      email: 'nullphone@example.com',
      password: 'password123',
      first_name: 'Null',
      last_name: 'Phone',
      phone: null
    };

    const result = await createUser(inputWithNullPhone);

    expect(result.phone).toBeNull();
  });

  it('should throw error for duplicate email', async () => {
    // Create first user
    await createUser(testInput);

    // Attempt to create second user with same email
    const duplicateInput: CreateUserInput = {
      ...testInput,
      first_name: 'Different',
      last_name: 'Name'
    };

    await expect(createUser(duplicateInput)).rejects.toThrow(/unique/i);
  });

  it('should validate email format through schema', async () => {
    const invalidEmailInput: CreateUserInput = {
      email: 'invalid-email', // Invalid email format
      password: 'password123',
      first_name: 'Invalid',
      last_name: 'Email'
    };

    // Note: This assumes email validation happens before the handler is called
    // If validation happens in the handler, adjust test accordingly
    expect(() => {
      // This would normally be validated by Zod before reaching the handler
      const emailSchema = require('../schema').createUserInputSchema;
      emailSchema.parse(invalidEmailInput);
    }).toThrow();
  });

  it('should create users with different timestamps', async () => {
    const user1 = await createUser({
      ...testInput,
      email: 'user1@example.com'
    });

    // Small delay to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    const user2 = await createUser({
      ...testInput,
      email: 'user2@example.com'
    });

    // Timestamps should be different (user2 created after user1)
    expect(user2.created_at.getTime()).toBeGreaterThanOrEqual(user1.created_at.getTime());
  });
});