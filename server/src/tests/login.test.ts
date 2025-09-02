import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type LoginInput } from '../schema';
import { login } from '../handlers/login';
import { createHash } from 'crypto';

// Helper function to hash passwords (same as used in handler)
const hashPassword = (password: string): string => {
  return createHash('sha256').update(password).digest('hex');
};

// Test user data
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
  first_name: 'John',
  last_name: 'Doe',
  phone: '+1234567890',
  is_admin: false
};

const testAdmin = {
  email: 'admin@example.com',
  password: 'adminpassword123',
  first_name: 'Admin',
  last_name: 'User',
  phone: null,
  is_admin: true
};

describe('login', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should authenticate user with valid credentials', async () => {
    // Create test user with hashed password
    const hashedPassword = hashPassword(testUser.password);
    
    const insertResult = await db.insert(usersTable)
      .values({
        email: testUser.email,
        password_hash: hashedPassword,
        first_name: testUser.first_name,
        last_name: testUser.last_name,
        phone: testUser.phone,
        is_admin: testUser.is_admin
      })
      .returning()
      .execute();

    const createdUser = insertResult[0];

    // Test login
    const loginInput: LoginInput = {
      email: testUser.email,
      password: testUser.password
    };

    const result = await login(loginInput);

    // Verify returned user data
    expect(result.id).toEqual(createdUser.id);
    expect(result.email).toEqual(testUser.email);
    expect(result.first_name).toEqual(testUser.first_name);
    expect(result.last_name).toEqual(testUser.last_name);
    expect(result.phone).toEqual(testUser.phone);
    expect(result.is_admin).toEqual(testUser.is_admin);
    expect(result.password_hash).toEqual(hashedPassword);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should authenticate admin user with valid credentials', async () => {
    // Create test admin user
    const hashedPassword = hashPassword(testAdmin.password);
    
    await db.insert(usersTable)
      .values({
        email: testAdmin.email,
        password_hash: hashedPassword,
        first_name: testAdmin.first_name,
        last_name: testAdmin.last_name,
        phone: testAdmin.phone,
        is_admin: testAdmin.is_admin
      })
      .execute();

    // Test admin login
    const loginInput: LoginInput = {
      email: testAdmin.email,
      password: testAdmin.password
    };

    const result = await login(loginInput);

    // Verify admin status
    expect(result.email).toEqual(testAdmin.email);
    expect(result.is_admin).toEqual(true);
    expect(result.first_name).toEqual(testAdmin.first_name);
    expect(result.last_name).toEqual(testAdmin.last_name);
    expect(result.phone).toBeNull();
  });

  it('should reject login with invalid email', async () => {
    // Create test user
    const hashedPassword = hashPassword(testUser.password);
    
    await db.insert(usersTable)
      .values({
        email: testUser.email,
        password_hash: hashedPassword,
        first_name: testUser.first_name,
        last_name: testUser.last_name,
        phone: testUser.phone,
        is_admin: testUser.is_admin
      })
      .execute();

    // Test login with wrong email
    const loginInput: LoginInput = {
      email: 'wrong@example.com',
      password: testUser.password
    };

    await expect(login(loginInput)).rejects.toThrow(/invalid credentials/i);
  });

  it('should reject login with invalid password', async () => {
    // Create test user
    const hashedPassword = hashPassword(testUser.password);
    
    await db.insert(usersTable)
      .values({
        email: testUser.email,
        password_hash: hashedPassword,
        first_name: testUser.first_name,
        last_name: testUser.last_name,
        phone: testUser.phone,
        is_admin: testUser.is_admin
      })
      .execute();

    // Test login with wrong password
    const loginInput: LoginInput = {
      email: testUser.email,
      password: 'wrongpassword'
    };

    await expect(login(loginInput)).rejects.toThrow(/invalid credentials/i);
  });

  it('should reject login with empty email', async () => {
    const loginInput: LoginInput = {
      email: '',
      password: testUser.password
    };

    await expect(login(loginInput)).rejects.toThrow(/invalid credentials/i);
  });

  it('should handle user with null phone field', async () => {
    // Create user with null phone
    const hashedPassword = hashPassword(testUser.password);
    
    await db.insert(usersTable)
      .values({
        email: testUser.email,
        password_hash: hashedPassword,
        first_name: testUser.first_name,
        last_name: testUser.last_name,
        phone: null,
        is_admin: testUser.is_admin
      })
      .execute();

    const loginInput: LoginInput = {
      email: testUser.email,
      password: testUser.password
    };

    const result = await login(loginInput);

    expect(result.phone).toBeNull();
    expect(result.email).toEqual(testUser.email);
    expect(result.first_name).toEqual(testUser.first_name);
  });

  it('should handle malformed password hash gracefully', async () => {
    // Create user with invalid hash format
    await db.insert(usersTable)
      .values({
        email: testUser.email,
        password_hash: 'invalid-hash-format',
        first_name: testUser.first_name,
        last_name: testUser.last_name,
        phone: testUser.phone,
        is_admin: testUser.is_admin
      })
      .execute();

    const loginInput: LoginInput = {
      email: testUser.email,
      password: testUser.password
    };

    await expect(login(loginInput)).rejects.toThrow(/invalid credentials/i);
  });
});