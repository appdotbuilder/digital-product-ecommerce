import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput, type User } from '../schema';

export const createUser = async (input: CreateUserInput): Promise<User> => {
  try {
    // Hash the password using Bun's built-in password hashing
    const hashedPassword = await Bun.password.hash(input.password);

    // Insert user record
    const result = await db.insert(usersTable)
      .values({
        email: input.email,
        password_hash: hashedPassword,
        first_name: input.first_name,
        last_name: input.last_name,
        phone: input.phone || null,
        is_admin: input.is_admin || false
      })
      .returning()
      .execute();

    // Return the created user
    return result[0];
  } catch (error) {
    console.error('User creation failed:', error);
    throw error;
  }
};