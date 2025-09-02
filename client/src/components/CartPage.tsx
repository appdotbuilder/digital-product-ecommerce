import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/utils/trpc';
import type { CartItem, Product, Coupon } from '../../../server/src/schema';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  CreditCard,
  Tag,
  Gift,
  Shield,
  Download
} from 'lucide-react';

interface CartPageProps {
  onBack: () => void;
  onCheckout: () => void;
}

interface CartItemWithProduct extends CartItem {
  product: Product;
}

export function CartPage({ onBack, onCheckout }: CartPageProps) {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sample cart data (in real app, this would be loaded from backend)
  useEffect(() => {
    // For demo purposes, we'll simulate some cart items
    const sampleCartItems: CartItemWithProduct[] = [
      {
        id: 1,
        user_id: 1,
        product_id: 1,
        quantity: 1,
        created_at: new Date(),
        updated_at: new Date(),
        product: {
          id: 1,
          name: 'Premium Mobile App Template',
          slug: 'premium-mobile-app-template',
          description: 'A complete React Native app template with authentication, navigation, and modern UI components.',
          short_description: 'Complete React Native app template',
          price: 199.99,
          discount_price: 149.99,
          category_id: 1,
          image_url: null,
          download_url: '/downloads/mobile-app-template.zip',
          license_key: null,
          is_active: true,
          is_featured: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      },
      {
        id: 2,
        user_id: 1,
        product_id: 2,
        quantity: 2,
        created_at: new Date(),
        updated_at: new Date(),
        product: {
          id: 2,
          name: 'E-commerce Dashboard UI Kit',
          slug: 'ecommerce-dashboard-ui-kit',
          description: 'Professional dashboard UI components for e-commerce applications.',
          short_description: 'Professional dashboard UI kit',
          price: 89.99,
          discount_price: null,
          category_id: 2,
          image_url: null,
          download_url: '/downloads/dashboard-ui-kit.zip',
          license_key: null,
          is_active: true,
          is_featured: false,
          created_at: new Date(),
          updated_at: new Date()
        }
      }
    ];
    setCartItems(sampleCartItems);
  }, []);

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (itemId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsLoading(true);
    try {
      const coupon = await trpc.validateCoupon.query({ code: couponCode });
      setAppliedCoupon(coupon);
    } catch (error) {
      console.error('Invalid coupon:', error);
      // In a real app, show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => {
    const price = item.product.discount_price || item.product.price;
    return total + (price * item.quantity);
  }, 0);

  const discountAmount = appliedCoupon 
    ? appliedCoupon.discount_type === 'percentage' 
      ? subtotal * (appliedCoupon.discount_value / 100)
      : appliedCoupon.discount_value
    : 0;

  const taxAmount = (subtotal - discountAmount) * 0.08; // 8% tax
  const total = subtotal - discountAmount + taxAmount;

  const EmptyCart = () => (
    <div className="text-center py-20">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ShoppingCart className="h-8 w-8 text-gray-400" />
          </div>
          <CardTitle>🛒 Your Cart is Empty</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Discover our amazing collection of digital products and app development services!
          </p>
          <div className="space-y-3 text-left mb-6">
            <div className="flex items-center text-sm text-gray-500">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Mobile App Templates
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Web Development Tools
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
              UI/UX Design Resources
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
              Custom Development Services
            </div>
          </div>
          <Button onClick={onBack} className="w-full">
            🛍️ Start Shopping
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Button 
            onClick={onBack}
            variant="ghost" 
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            ← Continue Shopping
          </Button>
          <EmptyCart />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button 
              onClick={onBack}
              variant="ghost" 
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              ← Continue Shopping
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">🛒 Shopping Cart</h1>
          </div>
          <div className="text-sm text-gray-600">
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in cart
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Download className="h-8 w-8 text-blue-600" />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{item.product.name}</h3>
                          <p className="text-gray-600 text-sm">{item.product.short_description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="secondary">📥 Digital Download</Badge>
                            {item.product.is_featured && (
                              <Badge variant="default">⭐ Featured</Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Price and Quantity */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-4">
                          {item.product.discount_price ? (
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-green-600">
                                ${item.product.discount_price.toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                ${item.product.price.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span className="font-bold text-blue-600">
                              ${item.product.price.toFixed(2)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="text-right mt-2">
                        <span className="font-bold">
                          ${((item.product.discount_price || item.product.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Coupon Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="h-5 w-5 mr-2" />
                  🏷️ Coupon Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <Gift className="h-5 w-5 text-green-600 mr-2" />
                      <div>
                        <span className="font-medium text-green-800">{appliedCoupon.code}</span>
                        <p className="text-sm text-green-600">
                          {appliedCoupon.discount_type === 'percentage' 
                            ? `${appliedCoupon.discount_value}% off` 
                            : `$${appliedCoupon.discount_value.toFixed(2)} off`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeCoupon}
                      className="text-green-700 hover:text-green-800"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCouponCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={applyCoupon}
                      disabled={isLoading || !couponCode.trim()}
                    >
                      {isLoading ? 'Applying...' : 'Apply'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>📊 Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <Button 
                  onClick={onCheckout}
                  className="w-full" 
                  size="lg"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  💳 Proceed to Checkout
                </Button>

                {/* Security & Benefits */}
                <div className="mt-6 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-green-600" />
                    <span>🔒 Secure 256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center">
                    <Download className="h-4 w-4 mr-2 text-blue-600" />
                    <span>📥 Instant download after payment</span>
                  </div>
                  <div className="flex items-center">
                    <Gift className="h-4 w-4 mr-2 text-purple-600" />
                    <span>🎯 Lifetime access & updates</span>
                  </div>
                </div>

                {/* Money Back Guarantee */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl mb-2">💰</div>
                    <h4 className="font-semibold text-blue-900">30-Day Money Back Guarantee</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Not satisfied? Get a full refund within 30 days.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}