import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/utils/trpc';
import type { LoginInput, CreateUserInput, User } from '../../../server/src/schema';
import { Mail, Lock, User as UserIcon, Phone, ArrowLeft } from 'lucide-react';

interface AuthPageProps {
  onLogin: (user: User) => void;
  onBack: () => void;
}

export function AuthPage({ onLogin, onBack }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginForm, setLoginForm] = useState<LoginInput>({
    email: '',
    password: ''
  });

  // Register form state
  const [registerForm, setRegisterForm] = useState<CreateUserInput>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: null,
    is_admin: false
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await trpc.login.mutate(loginForm);
      onLogin(user);
    } catch (error) {
      setError('Invalid email or password. Please try again.');
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await trpc.createUser.mutate(registerForm);
      onLogin(user);
    } catch (error) {
      setError('Registration failed. Please try again.');
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <Button 
          onClick={onBack}
          variant="ghost" 
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          ← Back to Home
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <UserIcon className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Welcome to DigitalHub 🚀</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one to start shopping
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">🔐 Login</TabsTrigger>
                <TabsTrigger value="register">✨ Register</TabsTrigger>
              </TabsList>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">⚠️ {error}</p>
                </div>
              )}

              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginForm.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setLoginForm(prev => ({ ...prev, email: e.target.value }))
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setLoginForm(prev => ({ ...prev, password: e.target.value }))
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : '🚀 Sign In'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button 
                      onClick={() => setActiveTab('register')}
                      className="text-blue-600 hover:underline"
                    >
                      Create one here
                    </button>
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="register" className="mt-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-first-name">First Name</Label>
                      <Input
                        id="register-first-name"
                        placeholder="John"
                        value={registerForm.first_name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setRegisterForm(prev => ({ ...prev, first_name: e.target.value }))
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-last-name">Last Name</Label>
                      <Input
                        id="register-last-name"
                        placeholder="Doe"
                        value={registerForm.last_name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setRegisterForm(prev => ({ ...prev, last_name: e.target.value }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="john@example.com"
                        value={registerForm.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setRegisterForm(prev => ({ ...prev, email: e.target.value }))
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-phone">Phone Number (Optional)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={registerForm.phone || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setRegisterForm(prev => ({ 
                            ...prev, 
                            phone: e.target.value || null 
                          }))
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Create a strong password"
                        value={registerForm.password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setRegisterForm(prev => ({ ...prev, password: e.target.value }))
                        }
                        className="pl-10"
                        minLength={8}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Password must be at least 8 characters long
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : '✨ Create Account'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <button 
                      onClick={() => setActiveTab('login')}
                      className="text-blue-600 hover:underline"
                    >
                      Sign in here
                    </button>
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Demo Login */}
            <div className="mt-6 pt-6 border-t">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-3">🎯 Quick Demo Access</p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setLoginForm({ email: 'demo@customer.com', password: 'demo123' });
                      setActiveTab('login');
                    }}
                  >
                    👤 Demo Customer
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setLoginForm({ email: 'admin@digitalhub.com', password: 'admin123' });
                      setActiveTab('login');
                    }}
                  >
                    🔧 Demo Admin
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 text-center">
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
            <div>🔒 Secure Login</div>
            <div>⚡ Instant Access</div>
            <div>🎯 Easy Setup</div>
          </div>
        </div>
      </div>
    </div>
  );
}