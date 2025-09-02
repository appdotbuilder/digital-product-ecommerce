import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { couponsTable } from '../db/schema';
import { getCoupons, validateCoupon } from '../handlers/get_coupons';
import { type CreateCouponInput } from '../schema';

describe('getCoupons', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no coupons exist', async () => {
    const result = await getCoupons();
    expect(result).toEqual([]);
  });

  it('should return all coupons ordered by creation date', async () => {
    // Create test coupons
    const coupon1Data = {
      code: 'TEST10',
      discount_type: 'percentage' as const,
      discount_value: '10.00',
      minimum_amount: '50.00',
      usage_limit: 100,
      used_count: 5,
      expires_at: new Date('2025-12-31'),
      is_active: true
    };

    const coupon2Data = {
      code: 'SAVE20',
      discount_type: 'fixed' as const,
      discount_value: '20.00',
      minimum_amount: null,
      usage_limit: null,
      used_count: 0,
      expires_at: null,
      is_active: false
    };

    await db.insert(couponsTable).values([coupon1Data, coupon2Data]).execute();

    const result = await getCoupons();

    expect(result).toHaveLength(2);
    
    // Verify numeric conversions
    const activeCoupon = result.find(c => c.code === 'TEST10');
    const inactiveCoupon = result.find(c => c.code === 'SAVE20');
    
    expect(activeCoupon).toBeDefined();
    expect(typeof activeCoupon!.discount_value).toBe('number');
    expect(activeCoupon!.discount_value).toEqual(10.00);
    expect(typeof activeCoupon!.minimum_amount).toBe('number');
    expect(activeCoupon!.minimum_amount).toEqual(50.00);
    expect(activeCoupon!.usage_limit).toEqual(100);
    expect(activeCoupon!.used_count).toEqual(5);
    expect(activeCoupon!.is_active).toBe(true);

    expect(inactiveCoupon).toBeDefined();
    expect(typeof inactiveCoupon!.discount_value).toBe('number');
    expect(inactiveCoupon!.discount_value).toEqual(20.00);
    expect(inactiveCoupon!.minimum_amount).toBeNull();
    expect(inactiveCoupon!.usage_limit).toBeNull();
    expect(inactiveCoupon!.is_active).toBe(false);
  });

  it('should handle coupons with different discount types', async () => {
    const percentageCoupon = {
      code: 'PERCENT15',
      discount_type: 'percentage' as const,
      discount_value: '15.50',
      minimum_amount: null,
      usage_limit: null,
      used_count: 0,
      expires_at: null,
      is_active: true
    };

    const fixedCoupon = {
      code: 'FIXED25',
      discount_type: 'fixed' as const,
      discount_value: '25.75',
      minimum_amount: '100.00',
      usage_limit: 50,
      used_count: 10,
      expires_at: new Date('2024-06-30'),
      is_active: true
    };

    await db.insert(couponsTable).values([percentageCoupon, fixedCoupon]).execute();

    const result = await getCoupons();

    expect(result).toHaveLength(2);
    
    const percentageCoup = result.find(c => c.code === 'PERCENT15');
    const fixedCoup = result.find(c => c.code === 'FIXED25');

    expect(percentageCoup!.discount_type).toEqual('percentage');
    expect(percentageCoup!.discount_value).toEqual(15.50);
    
    expect(fixedCoup!.discount_type).toEqual('fixed');
    expect(fixedCoup!.discount_value).toEqual(25.75);
    expect(fixedCoup!.minimum_amount).toEqual(100.00);
  });
});

describe('validateCoupon', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null for non-existent coupon code', async () => {
    const result = await validateCoupon('NONEXISTENT');
    expect(result).toBeNull();
  });

  it('should return null for inactive coupon', async () => {
    const inactiveCoupon = {
      code: 'INACTIVE',
      discount_type: 'percentage' as const,
      discount_value: '10.00',
      minimum_amount: null,
      usage_limit: null,
      used_count: 0,
      expires_at: null,
      is_active: false
    };

    await db.insert(couponsTable).values(inactiveCoupon).execute();

    const result = await validateCoupon('INACTIVE');
    expect(result).toBeNull();
  });

  it('should return null for expired coupon', async () => {
    const expiredCoupon = {
      code: 'EXPIRED',
      discount_type: 'percentage' as const,
      discount_value: '10.00',
      minimum_amount: null,
      usage_limit: null,
      used_count: 0,
      expires_at: new Date('2020-01-01'), // Past date
      is_active: true
    };

    await db.insert(couponsTable).values(expiredCoupon).execute();

    const result = await validateCoupon('EXPIRED');
    expect(result).toBeNull();
  });

  it('should return null for coupon that reached usage limit', async () => {
    const limitReachedCoupon = {
      code: 'LIMITREACHED',
      discount_type: 'percentage' as const,
      discount_value: '10.00',
      minimum_amount: null,
      usage_limit: 5,
      used_count: 5, // Reached limit
      expires_at: null,
      is_active: true
    };

    await db.insert(couponsTable).values(limitReachedCoupon).execute();

    const result = await validateCoupon('LIMITREACHED');
    expect(result).toBeNull();
  });

  it('should return null for coupon that exceeded usage limit', async () => {
    const exceededCoupon = {
      code: 'EXCEEDED',
      discount_type: 'percentage' as const,
      discount_value: '10.00',
      minimum_amount: null,
      usage_limit: 3,
      used_count: 5, // Exceeded limit
      expires_at: null,
      is_active: true
    };

    await db.insert(couponsTable).values(exceededCoupon).execute();

    const result = await validateCoupon('EXCEEDED');
    expect(result).toBeNull();
  });

  it('should return valid active coupon with no expiry', async () => {
    const validCoupon = {
      code: 'VALID10',
      discount_type: 'percentage' as const,
      discount_value: '10.00',
      minimum_amount: '25.50',
      usage_limit: null,
      used_count: 0,
      expires_at: null,
      is_active: true
    };

    await db.insert(couponsTable).values(validCoupon).execute();

    const result = await validateCoupon('VALID10');

    expect(result).not.toBeNull();
    expect(result!.code).toEqual('VALID10');
    expect(result!.discount_type).toEqual('percentage');
    expect(typeof result!.discount_value).toBe('number');
    expect(result!.discount_value).toEqual(10.00);
    expect(typeof result!.minimum_amount).toBe('number');
    expect(result!.minimum_amount).toEqual(25.50);
    expect(result!.usage_limit).toBeNull();
    expect(result!.used_count).toEqual(0);
    expect(result!.expires_at).toBeNull();
    expect(result!.is_active).toBe(true);
  });

  it('should return valid active coupon with future expiry', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // 30 days from now

    const validCoupon = {
      code: 'FUTURE20',
      discount_type: 'fixed' as const,
      discount_value: '20.00',
      minimum_amount: null,
      usage_limit: 100,
      used_count: 25,
      expires_at: futureDate,
      is_active: true
    };

    await db.insert(couponsTable).values(validCoupon).execute();

    const result = await validateCoupon('FUTURE20');

    expect(result).not.toBeNull();
    expect(result!.code).toEqual('FUTURE20');
    expect(result!.discount_type).toEqual('fixed');
    expect(result!.discount_value).toEqual(20.00);
    expect(result!.minimum_amount).toBeNull();
    expect(result!.usage_limit).toEqual(100);
    expect(result!.used_count).toEqual(25);
    expect(result!.expires_at).toBeInstanceOf(Date);
    expect(result!.is_active).toBe(true);
  });

  it('should return valid coupon with usage limit not reached', async () => {
    const validLimitedCoupon = {
      code: 'LIMITED15',
      discount_type: 'percentage' as const,
      discount_value: '15.00',
      minimum_amount: '50.00',
      usage_limit: 10,
      used_count: 7, // Under limit
      expires_at: null,
      is_active: true
    };

    await db.insert(couponsTable).values(validLimitedCoupon).execute();

    const result = await validateCoupon('LIMITED15');

    expect(result).not.toBeNull();
    expect(result!.code).toEqual('LIMITED15');
    expect(result!.usage_limit).toEqual(10);
    expect(result!.used_count).toEqual(7);
  });

  it('should validate coupon code case-sensitively', async () => {
    const validCoupon = {
      code: 'CaseSensitive',
      discount_type: 'percentage' as const,
      discount_value: '10.00',
      minimum_amount: null,
      usage_limit: null,
      used_count: 0,
      expires_at: null,
      is_active: true
    };

    await db.insert(couponsTable).values(validCoupon).execute();

    // Exact match should work
    const exactMatch = await validateCoupon('CaseSensitive');
    expect(exactMatch).not.toBeNull();

    // Different case should not work
    const wrongCase = await validateCoupon('casesensitive');
    expect(wrongCase).toBeNull();

    const upperCase = await validateCoupon('CASESENSITIVE');
    expect(upperCase).toBeNull();
  });
});