import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Code, 
  Users, 
  Heart, 
  Target, 
  Rocket, 
  Shield,
  Star,
  CheckCircle
} from 'lucide-react';

interface AboutPageProps {
  onContactClick: () => void;
  onShopClick: () => void;
}

export function AboutPage({ onContactClick, onShopClick }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-8">
            <Code className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            About DigitalHub 🚀
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            We're passionate about transforming businesses through innovative digital solutions. 
            From cutting-edge mobile apps to scalable web platforms, we deliver technology that drives success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={onContactClick} size="lg">
              💬 Get in Touch
            </Button>
            <Button onClick={onShopClick} size="lg" variant="outline">
              🛍️ View Our Products
            </Button>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="text-center">
              <CardHeader>
                <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">🎯 Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-lg">
                  To empower businesses of all sizes with exceptional digital solutions that 
                  drive growth, enhance user experience, and create lasting value in the digital age.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Rocket className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">🌟 Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-lg">
                  To be the leading provider of innovative digital products and development services, 
                  recognized for quality, reliability, and transformative impact on businesses worldwide.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            📖 Our Story
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Founded in 2020, DigitalHub emerged from a simple belief: that every business deserves 
              access to world-class digital solutions. What started as a small team of passionate 
              developers has grown into a comprehensive digital services company.
            </p>
            <p className="text-gray-600 mb-6">
              Our journey began when we noticed the gap between businesses' digital aspirations and 
              their actual capabilities. We set out to bridge this gap by creating affordable, 
              high-quality digital products and providing expert development services.
            </p>
            <p className="text-gray-600">
              Today, we've helped hundreds of businesses transform their operations, reach new customers, 
              and achieve their digital goals. Our commitment to excellence and innovation continues to 
              drive everything we do.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            💎 Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">❤️ Passion</h3>
              <p className="text-gray-600">
                We're passionate about technology and committed to delivering solutions that make a difference.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">🛡️ Quality</h3>
              <p className="text-gray-600">
                Every product and service we deliver meets the highest standards of quality and reliability.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">🤝 Collaboration</h3>
              <p className="text-gray-600">
                We work closely with our clients as partners to ensure their success and satisfaction.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Rocket className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">🚀 Innovation</h3>
              <p className="text-gray-600">
                We embrace cutting-edge technologies and innovative approaches to solve complex challenges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            👥 Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Alex Johnson',
                role: 'CEO & Lead Developer',
                image: '👨‍💼',
                description: 'Full-stack developer with 8+ years of experience in building scalable applications.'
              },
              {
                name: 'Sarah Chen',
                role: 'UI/UX Designer',
                image: '👩‍🎨',
                description: 'Creative designer focused on creating intuitive and beautiful user experiences.'
              },
              {
                name: 'Mike Rodriguez',
                role: 'Mobile App Specialist',
                image: '👨‍💻',
                description: 'Expert in iOS and Android development with a passion for mobile innovation.'
              },
              {
                name: 'Emily Davis',
                role: 'Project Manager',
                image: '👩‍💼',
                description: 'Experienced project manager ensuring smooth delivery and client satisfaction.'
              },
              {
                name: 'David Kim',
                role: 'Backend Engineer',
                image: '👨‍🔧',
                description: 'Database and server architecture expert building robust backend systems.'
              },
              {
                name: 'Lisa Wang',
                role: 'QA Engineer',
                image: '👩‍🔬',
                description: 'Quality assurance specialist ensuring bug-free and reliable software delivery.'
              }
            ].map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-6xl mb-4">{member.image}</div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <CardDescription className="text-blue-600 font-semibold">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            🌟 Why Choose DigitalHub?
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-6">🏆 What Sets Us Apart</h3>
              <div className="space-y-4">
                {[
                  'Expert team with 50+ combined years of experience',
                  '100% client satisfaction rate',
                  'Agile development methodology',
                  '24/7 support and maintenance',
                  'Cutting-edge technology stack',
                  'Transparent pricing and communication'
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-6">📊 Our Track Record</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                  <p className="text-gray-600">Projects Completed</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
                  <p className="text-gray-600">Client Satisfaction</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                  <p className="text-gray-600">Support Available</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">4.9</div>
                  <div className="flex justify-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600">Average Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technologies */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            🛠️ Technologies We Use
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'React', category: 'Frontend' },
              { name: 'Node.js', category: 'Backend' },
              { name: 'React Native', category: 'Mobile' },
              { name: 'TypeScript', category: 'Language' },
              { name: 'PostgreSQL', category: 'Database' },
              { name: 'AWS', category: 'Cloud' },
              { name: 'Docker', category: 'DevOps' },
              { name: 'Next.js', category: 'Framework' },
              { name: 'Swift', category: 'iOS' },
              { name: 'Kotlin', category: 'Android' },
              { name: 'Python', category: 'AI/ML' },
              { name: 'GraphQL', category: 'API' }
            ].map((tech, index) => (
              <Card key={index} className="text-center p-4 hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">⚙️</div>
                <h3 className="font-semibold text-sm">{tech.name}</h3>
                <p className="text-xs text-gray-500">{tech.category}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Transform Your Business? 🚀
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Let's discuss how we can help you achieve your digital goals and take your business to the next level.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onContactClick}
              size="lg" 
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              💬 Start a Conversation
            </Button>
            <Button 
              onClick={onShopClick}
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              🛍️ Browse Our Products
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}