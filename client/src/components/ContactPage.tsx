import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageSquare,
  Code,
  Smartphone,
  Globe,
  CheckCircle
} from 'lucide-react';

interface ContactPageProps {
  onBack: () => void;
}

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  budget: string;
  message: string;
  timeline: string;
}

export function ContactPage({ onBack }: ContactPageProps) {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    budget: '',
    message: '',
    timeline: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">✅ Message Sent!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Thank you for reaching out! We've received your message and will get back to you within 24 hours.
            </p>
            <div className="space-y-3 text-sm text-gray-500 mb-6">
              <p>📧 Confirmation sent to {formData.email}</p>
              <p>⏰ Expected response: 2-24 hours</p>
              <p>📱 For urgent matters: +1 (555) 123-4567</p>
            </div>
            <Button onClick={onBack} className="w-full">
              🏠 Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📞 Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to transform your business with cutting-edge digital solutions? 
            Let's discuss your project and bring your vision to life.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            {/* Contact Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  📋 Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">hello@digitalhub.com</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-red-600 mt-1" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-gray-600">
                      123 Tech Street<br />
                      San Francisco, CA 94105
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-purple-600 mt-1" />
                  <div>
                    <p className="font-medium">Business Hours</p>
                    <p className="text-gray-600">
                      Mon - Fri: 9:00 AM - 6:00 PM PST<br />
                      Sat - Sun: Emergency support only
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle>🎯 Our Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-5 w-5 text-blue-600" />
                    <span>Mobile App Development</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-green-600" />
                    <span>Web Development</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Code className="h-5 w-5 text-purple-600" />
                    <span>Custom Software Development</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-yellow-600">🎨</span>
                    <span>UI/UX Design</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-red-600">☁️</span>
                    <span>Cloud Solutions</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-indigo-600">🔧</span>
                    <span>Technical Consulting</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card>
              <CardHeader>
                <CardTitle>⏰ Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>General Inquiries</span>
                    <span className="text-green-600 font-medium">24 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Project Quotes</span>
                    <span className="text-blue-600 font-medium">48 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Support Requests</span>
                    <span className="text-purple-600 font-medium">2-4 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Emergency Support</span>
                    <span className="text-red-600 font-medium">1 hour</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">💬 Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          handleInputChange('name', e.target.value)
                        }
                        required
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          handleInputChange('email', e.target.value)
                        }
                        required
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          handleInputChange('phone', e.target.value)
                        }
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company Name</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          handleInputChange('company', e.target.value)
                        }
                        placeholder="Your Company Inc."
                      />
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="service">Service Needed</Label>
                      <Select onValueChange={(value) => handleInputChange('service', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mobile-app">📱 Mobile App Development</SelectItem>
                          <SelectItem value="web-app">🌐 Web Application</SelectItem>
                          <SelectItem value="custom-software">⚡ Custom Software</SelectItem>
                          <SelectItem value="ui-ux">🎨 UI/UX Design</SelectItem>
                          <SelectItem value="consulting">🔧 Technical Consulting</SelectItem>
                          <SelectItem value="other">❓ Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="budget">Project Budget</Label>
                      <Select onValueChange={(value) => handleInputChange('budget', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                          <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                          <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                          <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                          <SelectItem value="100k+">$100,000+</SelectItem>
                          <SelectItem value="discuss">💬 Let's discuss</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="timeline">Project Timeline</Label>
                    <Select onValueChange={(value) => handleInputChange('timeline', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="When do you need this completed?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asap">⚡ ASAP (Rush job)</SelectItem>
                        <SelectItem value="1-month">📅 Within 1 month</SelectItem>
                        <SelectItem value="2-3-months">🗓️ 2-3 months</SelectItem>
                        <SelectItem value="3-6-months">⏰ 3-6 months</SelectItem>
                        <SelectItem value="6+ months">🔮 6+ months</SelectItem>
                        <SelectItem value="flexible">🤝 Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Project Description *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                        handleInputChange('message', e.target.value)
                      }
                      required
                      placeholder="Please describe your project, goals, and any specific requirements..."
                      rows={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      The more details you provide, the better we can help you!
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        🚀 Send Message
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By submitting this form, you agree to our privacy policy. 
                    We'll never share your information with third parties.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">❓ Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-2">How long does a typical project take?</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Project timelines vary based on complexity. Simple apps: 1-2 months, 
                    complex platforms: 3-6 months. We'll provide detailed estimates after our initial consultation.
                  </p>
                  
                  <h3 className="font-semibold mb-2">What's your development process?</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    We follow Agile methodology with weekly sprints, regular client updates, 
                    and continuous testing to ensure quality and timeline adherence.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Do you provide ongoing support?</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Yes! We offer comprehensive maintenance packages including bug fixes, 
                    updates, security patches, and feature enhancements.
                  </p>
                  
                  <h3 className="font-semibold mb-2">What technologies do you specialize in?</h3>
                  <p className="text-gray-600 text-sm">
                    We specialize in React, React Native, Node.js, TypeScript, Python, 
                    and cloud platforms like AWS. We always choose the best tech for your specific needs.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}