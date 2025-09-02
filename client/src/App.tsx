import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import type { Product, Category, User } from '../../server/src/schema';

// Import page components
import { BlogPage } from '@/components/BlogPage';
import { AboutPage } from '@/components/AboutPage';
import { ContactPage } from '@/components/ContactPage';
import { CartPage } from '@/components/CartPage';
import { AuthPage } from '@/components/AuthPage';
import { AdminDashboard } from '@/components/AdminDashboard';
import { ProductDetailPage } from '@/components/ProductDetailPage';

// Import icons from Lucide React (assumed to be available)
import { 
  ShoppingCart, 
  User as UserIcon, 
  Menu, 
  X, 
  Star,
  Code,
  Smartphone,
  Globe,
  Zap,
  Shield
} from 'lucide-react';

interface AppState {
  currentView: 'home' | 'shop' | 'blog' | 'about' | 'contact' | 'cart' | 'auth' | 'admin' | 'product-detail';
  user: User | null;
  isMenuOpen: boolean;
  cartItems: number;
  selectedProduct: Product | null;
  selectedCategory: number | null;
  authMode: 'login' | 'register';
  adminSection: 'dashboard' | 'products' | 'categories' | 'orders' | 'customers' | 'coupons' | 'reviews' | 'settings';
}

function App() {
  const [state, setState] = useState<AppState>({
    currentView: 'home',
    user: null,
    isMenuOpen: false,
    cartItems: 0,
    selectedProduct: null,
    selectedCategory: null,
    authMode: 'login',
    adminSection: 'dashboard'
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          trpc.getProducts.query(),
          trpc.getCategories.query()
        ]);

        // Since backend returns empty arrays, let's add some sample data for demo
        if (productsData.length === 0) {
          const sampleProducts: Product[] = [
            {
              id: 1,
              name: 'Premium Mobile App Template',
              slug: 'premium-mobile-app-template',
              description: 'A complete React Native app template with authentication, navigation, and modern UI components. Perfect for building your next mobile application with pre-built screens, components, and functionality.',
              short_description: 'Complete React Native app template with authentication and modern UI',
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
            },
            {
              id: 2,
              name: 'E-commerce Dashboard UI Kit',
              slug: 'ecommerce-dashboard-ui-kit',
              description: 'Professional dashboard UI components for e-commerce applications. Includes charts, tables, forms, and all the essential components you need for building admin dashboards.',
              short_description: 'Professional dashboard UI kit for e-commerce platforms',
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
            },
            {
              id: 3,
              name: 'SaaS Landing Page Template',
              slug: 'saas-landing-page-template',
              description: 'Modern and responsive landing page template designed specifically for SaaS products. Includes pricing sections, feature highlights, testimonials, and conversion-optimized design.',
              short_description: 'Modern SaaS landing page with pricing and testimonials',
              price: 59.99,
              discount_price: 39.99,
              category_id: 3,
              image_url: null,
              download_url: '/downloads/saas-landing-template.zip',
              license_key: null,
              is_active: true,
              is_featured: true,
              created_at: new Date(),
              updated_at: new Date()
            }
          ];
          setProducts(sampleProducts);
        } else {
          setProducts(productsData);
        }

        if (categoriesData.length === 0) {
          const sampleCategories: Category[] = [
            {
              id: 1,
              name: 'Mobile Apps',
              slug: 'mobile-apps',
              description: 'React Native and native mobile app templates',
              image_url: null,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date()
            },
            {
              id: 2,
              name: 'Web Templates',
              slug: 'web-templates',
              description: 'Modern web application templates and UI kits',
              image_url: null,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date()
            },
            {
              id: 3,
              name: 'Landing Pages',
              slug: 'landing-pages',
              description: 'Conversion-optimized landing page templates',
              image_url: null,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date()
            }
          ];
          setCategories(sampleCategories);
        } else {
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        // Still set sample data on error for demo purposes
        const fallbackProducts: Product[] = [
          {
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
        ];
        setProducts(fallbackProducts);
      }
    };
    loadData();
  }, []);

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const Header = () => (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button 
              onClick={() => updateState({ currentView: 'home' })}
              className="flex items-center space-x-2"
            >
              <Code className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">DigitalHub 🚀</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <button 
              onClick={() => updateState({ currentView: 'home' })}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                state.currentView === 'home' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              🏠 Home
            </button>
            <button 
              onClick={() => updateState({ currentView: 'shop' })}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                state.currentView === 'shop' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              🛍️ Shop
            </button>
            <button 
              onClick={() => updateState({ currentView: 'blog' })}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                state.currentView === 'blog' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              📝 Blog
            </button>
            <button 
              onClick={() => updateState({ currentView: 'about' })}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                state.currentView === 'about' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              ℹ️ About
            </button>
            <button 
              onClick={() => updateState({ currentView: 'contact' })}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                state.currentView === 'contact' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              📞 Contact
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => updateState({ currentView: 'cart' })}
              className="relative p-2 text-gray-700 hover:text-blue-600"
            >
              <ShoppingCart className="h-6 w-6" />
              {state.cartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {state.cartItems}
                </span>
              )}
            </button>
            
            {state.user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">👋 {state.user.first_name}</span>
                {state.user.is_admin && (
                  <Button 
                    onClick={() => updateState({ currentView: 'admin' })}
                    size="sm"
                    variant="outline"
                  >
                    🔧 Admin
                  </Button>
                )}
                <Button 
                  onClick={() => updateState({ user: null })}
                  size="sm"
                  variant="ghost"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => updateState({ currentView: 'auth' })}
                size="sm"
              >
                <UserIcon className="h-4 w-4 mr-2" />
                Login
              </Button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => updateState({ isMenuOpen: !state.isMenuOpen })}
              className="md:hidden p-2 text-gray-700"
            >
              {state.isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {state.isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
              <button 
                onClick={() => updateState({ currentView: 'home', isMenuOpen: false })}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600"
              >
                🏠 Home
              </button>
              <button 
                onClick={() => updateState({ currentView: 'shop', isMenuOpen: false })}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600"
              >
                🛍️ Shop
              </button>
              <button 
                onClick={() => updateState({ currentView: 'blog', isMenuOpen: false })}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600"
              >
                📝 Blog
              </button>
              <button 
                onClick={() => updateState({ currentView: 'about', isMenuOpen: false })}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600"
              >
                ℹ️ About
              </button>
              <button 
                onClick={() => updateState({ currentView: 'contact', isMenuOpen: false })}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600"
              >
                📞 Contact
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );

  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            🚀 Digital Products & App Development Services
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your business with our premium digital solutions. From mobile apps to web platforms, 
            we deliver cutting-edge technology that drives results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => updateState({ currentView: 'shop' })}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              🛍️ Explore Products
            </Button>
            <Button 
              onClick={() => updateState({ currentView: 'contact' })}
              size="lg"
              variant="outline"
            >
              💬 Get Custom Solution
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            🎯 Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Smartphone className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>📱 Mobile App Development</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Native iOS & Android apps with cutting-edge features and seamless user experience.</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Globe className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>🌐 Web Development</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Modern web applications built with React, Next.js, and other cutting-edge technologies.</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Code className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>⚡ Custom Software</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Tailored software solutions to automate and optimize your business processes.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">⭐ Featured Products</h2>
            <Button 
              onClick={() => updateState({ currentView: 'shop' })}
              variant="outline"
            >
              View All Products →
            </Button>
          </div>
          
          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-white rounded-lg shadow-sm">
                <Code className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">🚧 Products Coming Soon!</h3>
                <p className="text-gray-600">We're preparing amazing digital products for you. Stay tuned!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.slice(0, 6).map((product: Product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => updateState({ selectedProduct: product, currentView: 'product-detail' })}>
                  <CardHeader>
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover rounded-md" />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-md flex items-center justify-center">
                        <Code className="h-16 w-16 text-blue-600" />
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="mb-2">{product.name}</CardTitle>
                    <CardDescription className="mb-4">
                      {product.short_description || product.description?.substring(0, 100) + '...'}
                    </CardDescription>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        {product.discount_price ? (
                          <>
                            <span className="text-lg font-bold text-green-600">${product.discount_price.toFixed(2)}</span>
                            <span className="text-sm text-gray-500 line-through">${product.price.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-blue-600">${product.price.toFixed(2)}</span>
                        )}
                      </div>
                      {product.is_featured && (
                        <Badge variant="secondary">⭐ Featured</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            🌟 Why Choose DigitalHub?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">⚡ Fast Delivery</h3>
              <p className="text-gray-600">Quick turnaround times without compromising quality</p>
            </div>
            <div className="text-center">
              <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">🛡️ Secure & Reliable</h3>
              <p className="text-gray-600">Enterprise-grade security and 99.9% uptime</p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-blue-500 text-xl">🕒</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">🕒 24/7 Support</h3>
              <p className="text-gray-600">Round-the-clock customer support</p>
            </div>
            <div className="text-center">
              <Star className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">⭐ Premium Quality</h3>
              <p className="text-gray-600">High-quality solutions built by experts</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const ShopPage = () => (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🛍️ Digital Products Shop</h1>
          <div className="flex items-center space-x-4">
            <select 
              className="border rounded-md px-3 py-2"
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                updateState({ selectedCategory: e.target.value ? parseInt(e.target.value) : null })
              }
            >
              <option value="">All Categories</option>
              {categories.map((category: Category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <CardTitle>🚧 Store Opening Soon!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  We're preparing an amazing collection of digital products for you. 
                  From mobile apps to custom software solutions!
                </p>
                <Button onClick={() => updateState({ currentView: 'contact' })}>
                  🔔 Get Notified When We Launch
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products
              .filter((product: Product) => !state.selectedCategory || product.category_id === state.selectedCategory)
              .map((product: Product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => updateState({ selectedProduct: product, currentView: 'product-detail' })}>
                  <CardHeader>
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover rounded-md" />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-md flex items-center justify-center">
                        <Code className="h-12 w-12 text-blue-600" />
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="mb-2">{product.name}</CardTitle>
                    <CardDescription className="mb-4">
                      {product.short_description || product.description?.substring(0, 100) + '...'}
                    </CardDescription>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-2">
                        {product.discount_price ? (
                          <>
                            <span className="text-lg font-bold text-green-600">${product.discount_price.toFixed(2)}</span>
                            <span className="text-sm text-gray-500 line-through">${product.price.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-blue-600">${product.price.toFixed(2)}</span>
                        )}
                      </div>
                      {product.is_featured && (
                        <Badge variant="secondary">⭐ Featured</Badge>
                      )}
                    </div>
                    <Button className="w-full" size="sm">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render the appropriate view
  const renderCurrentView = () => {
    switch (state.currentView) {
      case 'home':
        return <HomePage />;
      case 'shop':
        return <ShopPage />;
      case 'blog':
        return <BlogPage onBack={() => updateState({ currentView: 'home' })} />;
      case 'about':
        return (
          <AboutPage 
            onContactClick={() => updateState({ currentView: 'contact' })}
            onShopClick={() => updateState({ currentView: 'shop' })}
          />
        );
      case 'contact':
        return <ContactPage onBack={() => updateState({ currentView: 'home' })} />;
      case 'cart':
        return (
          <CartPage 
            onBack={() => updateState({ currentView: 'shop' })}
            onCheckout={() => updateState({ currentView: 'auth' })}
          />
        );
      case 'auth':
        return (
          <AuthPage 
            onLogin={(user: User) => updateState({ user, currentView: 'home' })}
            onBack={() => updateState({ currentView: 'home' })}
          />
        );
      case 'admin':
        return (
          <AdminDashboard 
            onLogout={() => updateState({ user: null, currentView: 'home' })}
          />
        );
      case 'product-detail':
        return state.selectedProduct ? (
          <ProductDetailPage 
            product={state.selectedProduct}
            onBack={() => updateState({ currentView: 'shop' })}
            onAddToCart={(product: Product) => {
              updateState({ cartItems: state.cartItems + 1 });
              // Here you would typically call the actual add to cart API
              console.log('Added to cart:', product);
            }}
          />
        ) : <ShopPage />;
      default:
        return <HomePage />;
    }
  };



  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        {renderCurrentView()}
      </main>
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-300">
            © 2024 DigitalHub. Built with ❤️ for digital innovation.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;