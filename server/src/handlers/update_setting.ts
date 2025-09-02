import { db } from '../db';
import { settingsTable } from '../db/schema';
import { type UpdateSettingInput, type Setting } from '../schema';
import { eq } from 'drizzle-orm';

export const updateSetting = async (input: UpdateSettingInput): Promise<Setting> => {
  try {
    // First, check if the setting exists
    const existingSettings = await db.select()
      .from(settingsTable)
      .where(eq(settingsTable.key, input.key))
      .execute();

    if (existingSettings.length === 0) {
      throw new Error(`Setting with key '${input.key}' not found`);
    }

    const existingSetting = existingSettings[0];

    // Validate the value based on the setting's type
    validateValueForType(input.value, existingSetting.type);

    // Update the setting
    const result = await db.update(settingsTable)
      .set({
        value: input.value,
        updated_at: new Date()
      })
      .where(eq(settingsTable.key, input.key))
      .returning()
      .execute();

    const updatedSetting = result[0];
    
    // Return the setting with any numeric fields properly converted
    return {
      ...updatedSetting
    };
  } catch (error) {
    console.error('Setting update failed:', error);
    throw error;
  }
};

// Helper function to validate value based on setting type
function validateValueForType(value: string, type: string): void {
  switch (type) {
    case 'number':
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        throw new Error(`Invalid number value: ${value}`);
      }
      break;
    case 'boolean':
      if (value !== 'true' && value !== 'false') {
        throw new Error(`Invalid boolean value: ${value}. Must be 'true' or 'false'`);
      }
      break;
    case 'json':
      try {
        JSON.parse(value);
      } catch {
        throw new Error(`Invalid JSON value: ${value}`);
      }
      break;
    case 'string':
      // String values are always valid
      break;
    default:
      throw new Error(`Unknown setting type: ${type}`);
  }
}