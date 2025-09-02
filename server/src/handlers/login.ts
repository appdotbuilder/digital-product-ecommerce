import { db } from '../db';
import { usersTable } from '../db/schema';
import { type LoginInput, type User } from '../schema';
import { eq } from 'drizzle-orm';
import { createHash, timingSafeEqual } from 'crypto';

// Simple password verification using crypto.createHash
// In a real application, you'd use proper bcrypt/scrypt/argon2
const verifyPassword = (password: string, hashedPassword: string): boolean => {
  try {
    // For this implementation, assume password is stored as SHA-256 hash
    // This is NOT recommended for production - use bcrypt/scrypt/argon2 instead
    const hash = createHash('sha256').update(password).digest('hex');
    
    // Use timingSafeEqual to prevent timing attacks
    if (hash.length !== hashedPassword.length) {
      return false;
    }
    
    const hashBuffer = Buffer.from(hash, 'hex');
    const storedBuffer = Buffer.from(hashedPassword, 'hex');
    
    return timingSafeEqual(hashBuffer, storedBuffer);
  } catch (error) {
    return false;
  }
};

export const login = async (input: LoginInput): Promise<User> => {
  try {
    // Find user by email
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, input.email))
      .execute();

    if (users.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = users[0];

    // Verify password
    const isValidPassword = verifyPassword(input.password, user.password_hash);
    
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Return user data
    return {
      id: user.id,
      email: user.email,
      password_hash: user.password_hash,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      is_admin: user.is_admin,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};