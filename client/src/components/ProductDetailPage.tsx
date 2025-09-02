import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/utils/trpc';
import type { Product, Review } from '../../../server/src/schema';
import { ShoppingCart, Star, Download, ArrowLeft } from 'lucide-react';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
}

export function ProductDetailPage({ product, onBack, onAddToCart }: ProductDetailPageProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const reviewsData = await trpc.getReviewsByProduct.query({ productId: product.id });
        setReviews(reviewsData);
      } catch (error) {
        console.error('Failed to load reviews:', error);
      }
    };
    loadReviews();
  }, [product.id]);

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      await onAddToCart(product);
    } finally {
      setIsLoading(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <Button 
          onClick={onBack}
          variant="ghost" 
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          ← Back to Shop
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div>
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center shadow-lg">
                <Download className="h-24 w-24 text-blue-600" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              {product.is_featured && (
                <Badge variant="secondary" className="mb-4">⭐ Featured Product</Badge>
              )}
              
              {/* Rating */}
              {reviews.length > 0 && (
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        className={`h-5 w-5 ${star <= averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({averageRating.toFixed(1)}) - {reviews.length} reviews
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center space-x-4 mb-6">
                {product.discount_price ? (
                  <>
                    <span className="text-3xl font-bold text-green-600">
                      ${product.discount_price.toFixed(2)}
                    </span>
                    <span className="text-xl text-gray-500 line-through">
                      ${product.price.toFixed(2)}
                    </span>
                    <Badge variant="destructive">
                      {Math.round(((product.price - product.discount_price) / product.price) * 100)}% OFF
                    </Badge>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-blue-600">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Short Description */}
              {product.short_description && (
                <p className="text-lg text-gray-700 mb-6">{product.short_description}</p>
              )}

              {/* Add to Cart Button */}
              <Button 
                onClick={handleAddToCart}
                disabled={isLoading}
                size="lg"
                className="w-full mb-6"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {isLoading ? 'Adding to Cart...' : 'Add to Cart'}
              </Button>

              {/* Download Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Download className="h-5 w-5 mr-2" />
                    💻 Digital Download
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>✅ Instant download after purchase</li>
                    <li>🔐 Secure download link</li>
                    <li>📱 Compatible with all devices</li>
                    <li>🎯 Lifetime access</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Product Description */}
        {product.description && (
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle>📋 Product Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {product.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>⭐ Customer Reviews ({reviews.length})</span>
                {averageRating > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star}
                          className={`h-4 w-4 ${star <= averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">{averageRating.toFixed(1)}</span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  🤔 No reviews yet. Be the first to review this product!
                </p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star}
                                className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="font-medium">Customer #{review.user_id}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {review.created_at.toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700">{review.comment}</p>
                      )}
                      <Separator className="mt-4" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}