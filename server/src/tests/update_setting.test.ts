import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { settingsTable } from '../db/schema';
import { type UpdateSettingInput } from '../schema';
import { updateSetting } from '../handlers/update_setting';
import { eq } from 'drizzle-orm';

describe('updateSetting', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a string setting', async () => {
    // Create a test setting first
    await db.insert(settingsTable)
      .values({
        key: 'site_name',
        value: 'Old Site Name',
        type: 'string',
        description: 'The name of the site'
      })
      .execute();

    const input: UpdateSettingInput = {
      key: 'site_name',
      value: 'New Site Name'
    };

    const result = await updateSetting(input);

    expect(result.key).toEqual('site_name');
    expect(result.value).toEqual('New Site Name');
    expect(result.type).toEqual('string');
    expect(result.description).toEqual('The name of the site');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update a number setting with valid value', async () => {
    // Create a test number setting
    await db.insert(settingsTable)
      .values({
        key: 'max_items',
        value: '10',
        type: 'number',
        description: 'Maximum items per page'
      })
      .execute();

    const input: UpdateSettingInput = {
      key: 'max_items',
      value: '25'
    };

    const result = await updateSetting(input);

    expect(result.key).toEqual('max_items');
    expect(result.value).toEqual('25');
    expect(result.type).toEqual('number');
  });

  it('should update a boolean setting with valid value', async () => {
    // Create a test boolean setting
    await db.insert(settingsTable)
      .values({
        key: 'maintenance_mode',
        value: 'false',
        type: 'boolean',
        description: 'Enable maintenance mode'
      })
      .execute();

    const input: UpdateSettingInput = {
      key: 'maintenance_mode',
      value: 'true'
    };

    const result = await updateSetting(input);

    expect(result.key).toEqual('maintenance_mode');
    expect(result.value).toEqual('true');
    expect(result.type).toEqual('boolean');
  });

  it('should update a JSON setting with valid value', async () => {
    // Create a test JSON setting
    await db.insert(settingsTable)
      .values({
        key: 'theme_config',
        value: '{"color": "blue"}',
        type: 'json',
        description: 'Theme configuration'
      })
      .execute();

    const input: UpdateSettingInput = {
      key: 'theme_config',
      value: '{"color": "red", "size": "large"}'
    };

    const result = await updateSetting(input);

    expect(result.key).toEqual('theme_config');
    expect(result.value).toEqual('{"color": "red", "size": "large"}');
    expect(result.type).toEqual('json');
  });

  it('should save updated setting to database', async () => {
    // Create a test setting
    await db.insert(settingsTable)
      .values({
        key: 'site_email',
        value: 'old@example.com',
        type: 'string',
        description: 'Site contact email'
      })
      .execute();

    const input: UpdateSettingInput = {
      key: 'site_email',
      value: 'new@example.com'
    };

    await updateSetting(input);

    // Verify it was saved in the database
    const settings = await db.select()
      .from(settingsTable)
      .where(eq(settingsTable.key, 'site_email'))
      .execute();

    expect(settings).toHaveLength(1);
    expect(settings[0].value).toEqual('new@example.com');
    expect(settings[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent setting', async () => {
    const input: UpdateSettingInput = {
      key: 'non_existent_key',
      value: 'some value'
    };

    await expect(updateSetting(input)).rejects.toThrow(/Setting with key 'non_existent_key' not found/i);
  });

  it('should throw error for invalid number value', async () => {
    // Create a number setting
    await db.insert(settingsTable)
      .values({
        key: 'port_number',
        value: '3000',
        type: 'number',
        description: 'Server port'
      })
      .execute();

    const input: UpdateSettingInput = {
      key: 'port_number',
      value: 'not-a-number'
    };

    await expect(updateSetting(input)).rejects.toThrow(/Invalid number value: not-a-number/i);
  });

  it('should throw error for invalid boolean value', async () => {
    // Create a boolean setting
    await db.insert(settingsTable)
      .values({
        key: 'debug_mode',
        value: 'false',
        type: 'boolean',
        description: 'Enable debug mode'
      })
      .execute();

    const input: UpdateSettingInput = {
      key: 'debug_mode',
      value: 'maybe'
    };

    await expect(updateSetting(input)).rejects.toThrow(/Invalid boolean value: maybe/i);
  });

  it('should throw error for invalid JSON value', async () => {
    // Create a JSON setting
    await db.insert(settingsTable)
      .values({
        key: 'api_config',
        value: '{"url": "https://api.example.com"}',
        type: 'json',
        description: 'API configuration'
      })
      .execute();

    const input: UpdateSettingInput = {
      key: 'api_config',
      value: '{invalid json'
    };

    await expect(updateSetting(input)).rejects.toThrow(/Invalid JSON value/i);
  });

  it('should accept decimal numbers for number type', async () => {
    // Create a number setting
    await db.insert(settingsTable)
      .values({
        key: 'tax_rate',
        value: '0.08',
        type: 'number',
        description: 'Tax rate percentage'
      })
      .execute();

    const input: UpdateSettingInput = {
      key: 'tax_rate',
      value: '0.095'
    };

    const result = await updateSetting(input);

    expect(result.value).toEqual('0.095');
    expect(result.type).toEqual('number');
  });

  it('should preserve setting metadata during update', async () => {
    // Create a setting with description
    await db.insert(settingsTable)
      .values({
        key: 'company_name',
        value: 'Old Company',
        type: 'string',
        description: 'The company name displayed on the site'
      })
      .execute();

    const input: UpdateSettingInput = {
      key: 'company_name',
      value: 'New Company'
    };

    const result = await updateSetting(input);

    // Metadata should be preserved
    expect(result.description).toEqual('The company name displayed on the site');
    expect(result.type).toEqual('string');
    expect(result.created_at).toBeInstanceOf(Date);
  });
});