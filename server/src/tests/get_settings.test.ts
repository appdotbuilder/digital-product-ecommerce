import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { settingsTable } from '../db/schema';
import { getSettings, getSettingByKey } from '../handlers/get_settings';

describe('getSettings', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no settings exist', async () => {
    const result = await getSettings();
    
    expect(result).toEqual([]);
  });

  it('should return all settings when they exist', async () => {
    // Create test settings
    await db.insert(settingsTable)
      .values([
        {
          key: 'site_name',
          value: 'My E-commerce Store',
          type: 'string',
          description: 'The name of the website'
        },
        {
          key: 'tax_rate',
          value: '0.08',
          type: 'number',
          description: 'Default tax rate'
        },
        {
          key: 'maintenance_mode',
          value: 'false',
          type: 'boolean',
          description: 'Enable maintenance mode'
        }
      ])
      .execute();

    const result = await getSettings();

    expect(result).toHaveLength(3);
    
    // Check first setting
    const siteName = result.find(setting => setting.key === 'site_name');
    expect(siteName).toBeDefined();
    expect(siteName!.value).toBe('My E-commerce Store');
    expect(siteName!.type).toBe('string');
    expect(siteName!.description).toBe('The name of the website');
    expect(siteName!.id).toBeDefined();
    expect(siteName!.created_at).toBeInstanceOf(Date);
    expect(siteName!.updated_at).toBeInstanceOf(Date);

    // Check second setting
    const taxRate = result.find(setting => setting.key === 'tax_rate');
    expect(taxRate).toBeDefined();
    expect(taxRate!.value).toBe('0.08');
    expect(taxRate!.type).toBe('number');

    // Check third setting
    const maintenance = result.find(setting => setting.key === 'maintenance_mode');
    expect(maintenance).toBeDefined();
    expect(maintenance!.value).toBe('false');
    expect(maintenance!.type).toBe('boolean');
  });

  it('should return settings in consistent order', async () => {
    // Create multiple settings
    await db.insert(settingsTable)
      .values([
        { key: 'setting_c', value: 'value_c', type: 'string', description: null },
        { key: 'setting_a', value: 'value_a', type: 'string', description: null },
        { key: 'setting_b', value: 'value_b', type: 'string', description: null }
      ])
      .execute();

    const result = await getSettings();
    
    expect(result).toHaveLength(3);
    // Verify all settings are returned
    const keys = result.map(setting => setting.key).sort();
    expect(keys).toEqual(['setting_a', 'setting_b', 'setting_c']);
  });
});

describe('getSettingByKey', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null when setting does not exist', async () => {
    const result = await getSettingByKey('non_existent_key');
    
    expect(result).toBeNull();
  });

  it('should return specific setting when it exists', async () => {
    // Create multiple settings
    await db.insert(settingsTable)
      .values([
        {
          key: 'site_name',
          value: 'My E-commerce Store',
          type: 'string',
          description: 'The name of the website'
        },
        {
          key: 'tax_rate',
          value: '0.08',
          type: 'number',
          description: 'Default tax rate'
        }
      ])
      .execute();

    const result = await getSettingByKey('site_name');

    expect(result).not.toBeNull();
    expect(result!.key).toBe('site_name');
    expect(result!.value).toBe('My E-commerce Store');
    expect(result!.type).toBe('string');
    expect(result!.description).toBe('The name of the website');
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return correct setting among multiple settings', async () => {
    // Create multiple settings
    await db.insert(settingsTable)
      .values([
        {
          key: 'site_name',
          value: 'My E-commerce Store',
          type: 'string',
          description: 'The name of the website'
        },
        {
          key: 'tax_rate',
          value: '0.08',
          type: 'number',
          description: 'Default tax rate'
        },
        {
          key: 'maintenance_mode',
          value: 'false',
          type: 'boolean',
          description: 'Enable maintenance mode'
        }
      ])
      .execute();

    const taxRate = await getSettingByKey('tax_rate');
    
    expect(taxRate).not.toBeNull();
    expect(taxRate!.key).toBe('tax_rate');
    expect(taxRate!.value).toBe('0.08');
    expect(taxRate!.type).toBe('number');
    expect(taxRate!.description).toBe('Default tax rate');
  });

  it('should handle settings with null descriptions', async () => {
    await db.insert(settingsTable)
      .values({
        key: 'simple_setting',
        value: 'simple_value',
        type: 'string',
        description: null
      })
      .execute();

    const result = await getSettingByKey('simple_setting');

    expect(result).not.toBeNull();
    expect(result!.key).toBe('simple_setting');
    expect(result!.value).toBe('simple_value');
    expect(result!.type).toBe('string');
    expect(result!.description).toBeNull();
  });

  it('should handle JSON type settings', async () => {
    await db.insert(settingsTable)
      .values({
        key: 'api_config',
        value: '{"endpoint": "https://api.example.com", "timeout": 30}',
        type: 'json',
        description: 'API configuration settings'
      })
      .execute();

    const result = await getSettingByKey('api_config');

    expect(result).not.toBeNull();
    expect(result!.key).toBe('api_config');
    expect(result!.value).toBe('{"endpoint": "https://api.example.com", "timeout": 30}');
    expect(result!.type).toBe('json');
    expect(result!.description).toBe('API configuration settings');
  });

  it('should be case sensitive for keys', async () => {
    await db.insert(settingsTable)
      .values({
        key: 'CaseSensitive',
        value: 'test_value',
        type: 'string',
        description: null
      })
      .execute();

    const upperResult = await getSettingByKey('CaseSensitive');
    const lowerResult = await getSettingByKey('casesensitive');

    expect(upperResult).not.toBeNull();
    expect(upperResult!.value).toBe('test_value');
    expect(lowerResult).toBeNull();
  });
});