import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/utils/trpc';
import type { DashboardStats, Product, Category, Order } from '../../../server/src/schema';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    price: 0,
    discount_price: null as number | null,
    category_id: 0,
    image_url: '',
    is_active: true,
    is_featured: false
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    is_active: true
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, productsData, categoriesData, ordersData] = await Promise.all([
        trpc.getDashboardStats.query(),
        trpc.getProducts.query(),
        trpc.getCategories.query(),
        trpc.getOrders.query()
      ]);
      
      setStats(statsData);
      setProducts(productsData);
      setCategories(categoriesData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await trpc.createProduct.mutate(productForm);
      loadDashboardData();
      setProductForm({
        name: '',
        slug: '',
        description: '',
        short_description: '',
        price: 0,
        discount_price: null,
        category_id: 0,
        image_url: '',
        is_active: true,
        is_featured: false
      });
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await trpc.createCategory.mutate(categoryForm);
      loadDashboardData();
      setCategoryForm({
        name: '',
        slug: '',
        description: '',
        image_url: '',
        is_active: true
      });
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const DashboardOverview = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">📊 Dashboard Overview</h2>
        <Button onClick={onLogout} variant="outline">
          Logout
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_products || 0}</div>
            <p className="text-xs text-muted-foreground">Digital products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_customers || 0}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_orders || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.pending_orders || 0} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.total_revenue?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📦 Recent Products</CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No products created yet</p>
            ) : (
              <div className="space-y-4">
                {products.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
                    </div>
                    <Badge variant={product.is_active ? 'default' : 'secondary'}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🛒 Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Order #{order.order_number}</p>
                      <p className="text-sm text-gray-500">
                        {order.created_at.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${order.total_amount.toFixed(2)}</p>
                      <Badge variant={
                        order.status === 'completed' ? 'default' : 
                        order.status === 'pending' ? 'secondary' : 'destructive'
                      }>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const ProductsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">📦 Products Management</h2>
      </div>

      {/* Create Product Form */}
      <Card>
        <CardHeader>
          <CardTitle>➕ Create New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateProduct} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product-name">Product Name</Label>
                <Input
                  id="product-name"
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="product-slug">Slug</Label>
                <Input
                  id="product-slug"
                  value={productForm.slug}
                  onChange={(e) => setProductForm(prev => ({ ...prev, slug: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="product-short-desc">Short Description</Label>
              <Input
                id="product-short-desc"
                value={productForm.short_description}
                onChange={(e) => setProductForm(prev => ({ ...prev, short_description: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="product-description">Description</Label>
              <Textarea
                id="product-description"
                value={productForm.description}
                onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="product-price">Price</Label>
                <Input
                  id="product-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={productForm.price}
                  onChange={(e) => setProductForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="product-discount">Discount Price</Label>
                <Input
                  id="product-discount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={productForm.discount_price || ''}
                  onChange={(e) => setProductForm(prev => ({ 
                    ...prev, 
                    discount_price: e.target.value ? parseFloat(e.target.value) : null 
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="product-category">Category</Label>
                <Select
                  value={productForm.category_id.toString()}
                  onValueChange={(value) => setProductForm(prev => ({ ...prev, category_id: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="product-image">Image URL</Label>
              <Input
                id="product-image"
                value={productForm.image_url}
                onChange={(e) => setProductForm(prev => ({ ...prev, image_url: e.target.value }))}
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={productForm.is_active}
                  onChange={(e) => setProductForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded"
                />
                <span>Active</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={productForm.is_featured}
                  onChange={(e) => setProductForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                  className="rounded"
                />
                <span>Featured</span>
              </label>
            </div>

            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create Product
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>📋 All Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No products created yet. Create your first product above!</p>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.short_description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="font-medium">${product.price.toFixed(2)}</span>
                      {product.discount_price && (
                        <span className="text-green-600">(${product.discount_price.toFixed(2)})</span>
                      )}
                      <Badge variant={product.is_active ? 'default' : 'secondary'}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {product.is_featured && <Badge variant="secondary">⭐ Featured</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const CategoriesTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">🗂️ Categories Management</h2>

      {/* Create Category Form */}
      <Card>
        <CardHeader>
          <CardTitle>➕ Create New Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category-slug">Slug</Label>
                <Input
                  id="category-slug"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category-description">Description</Label>
              <Textarea
                id="category-description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create Category
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle>📋 All Categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No categories created yet. Create your first category above!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription>{category.description || 'No description'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant={category.is_active ? 'default' : 'secondary'}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🔧 Admin Dashboard</h1>
          <p className="text-gray-600">Manage your digital products store</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
            <TabsTrigger value="products">📦 Products</TabsTrigger>
            <TabsTrigger value="categories">🗂️ Categories</TabsTrigger>
            <TabsTrigger value="orders">🛒 Orders</TabsTrigger>
            <TabsTrigger value="customers">👥 Customers</TabsTrigger>
            <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <ProductsTab />
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <CategoriesTab />
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold mb-4">🛒 Orders Management</h2>
              <p className="text-gray-600">Orders management interface coming soon!</p>
            </div>
          </TabsContent>

          <TabsContent value="customers" className="mt-6">
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold mb-4">👥 Customer Management</h2>
              <p className="text-gray-600">Customer management interface coming soon!</p>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold mb-4">⚙️ Settings</h2>
              <p className="text-gray-600">Settings interface coming soon!</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}