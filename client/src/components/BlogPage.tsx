import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { trpc } from '@/utils/trpc';
import type { BlogPost } from '../../../server/src/schema';
import { Calendar, User, Search, ArrowRight } from 'lucide-react';

interface BlogPageProps {
  onBack: () => void;
}

export function BlogPage({ onBack }: BlogPageProps) {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    const loadBlogPosts = async () => {
      try {
        const posts = await trpc.getBlogPosts.query();
        setBlogPosts(posts);
      } catch (error) {
        console.error('Failed to load blog posts:', error);
      }
    };
    loadBlogPosts();
  }, []);

  const filteredPosts = blogPosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const BlogPostDetail = ({ post }: { post: BlogPost }) => (
    <div className="max-w-4xl mx-auto">
      <Button 
        onClick={() => setSelectedPost(null)}
        variant="ghost" 
        className="mb-6"
      >
        ← Back to Blog
      </Button>

      <article>
        {post.featured_image && (
          <img 
            src={post.featured_image} 
            alt={post.title}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
        )}

        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="flex items-center text-gray-600 space-x-4">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Author #{post.author_id}
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {post.published_at ? post.published_at.toLocaleDateString() : 'Draft'}
            </div>
            <Badge variant={post.is_published ? 'default' : 'secondary'}>
              {post.is_published ? 'Published' : 'Draft'}
            </Badge>
          </div>
        </header>

        <div className="prose max-w-none">
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 text-gray-700 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </div>
  );

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-white py-8 px-4">
        <BlogPostDetail post={selectedPost} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📝 DigitalHub Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest trends in digital products, app development, 
            and technology insights from our expert team.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Blog Posts */}
        {blogPosts.length === 0 ? (
          <div className="text-center py-20">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <CardTitle>📚 Blog Coming Soon!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  We're preparing amazing content about digital products, app development tips, 
                  industry insights, and technology trends. Stay tuned!
                </p>
                <div className="space-y-3 text-left">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Mobile App Development Best Practices
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Latest Web Development Trends
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    Digital Product Strategy Guides
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                    Success Stories & Case Studies
                  </div>
                </div>
                <div className="mt-6">
                  <Button onClick={onBack} variant="outline" className="w-full">
                    🔔 Subscribe for Updates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {filteredPosts.length > 0 && filteredPosts[0] && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">⭐ Featured Article</h2>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedPost(filteredPosts[0])}>
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      {filteredPosts[0].featured_image ? (
                        <img 
                          src={filteredPosts[0].featured_image} 
                          alt={filteredPosts[0].title}
                          className="w-full h-64 md:h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-64 md:h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <span className="text-4xl">📱</span>
                        </div>
                      )}
                    </div>
                    <div className="md:w-2/3 p-8">
                      <div className="flex items-center mb-4 space-x-4">
                        <Badge variant="default">Featured</Badge>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {filteredPosts[0].published_at?.toLocaleDateString()}
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        {filteredPosts[0].title}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {filteredPosts[0].excerpt || filteredPosts[0].content.substring(0, 200) + '...'}
                      </p>
                      <Button variant="ghost" className="p-0">
                        Read More <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Blog Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.slice(1).map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedPost(post)}>
                  <CardHeader>
                    {post.featured_image ? (
                      <img 
                        src={post.featured_image} 
                        alt={post.title}
                        className="w-full h-48 object-cover rounded-md mb-4"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-md flex items-center justify-center mb-4">
                        <span className="text-3xl">📄</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {post.published_at?.toLocaleDateString()}
                      </div>
                      <Badge variant={post.is_published ? 'default' : 'secondary'}>
                        {post.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="mb-2 hover:text-blue-600 transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="mb-4">
                      {post.excerpt || post.content.substring(0, 100) + '...'}
                    </CardDescription>
                    <Button variant="ghost" className="p-0 text-blue-600 hover:text-blue-700">
                      Read More <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No Results */}
            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">🔍 No blog posts found matching "{searchTerm}"</p>
              </div>
            )}
          </>
        )}

        {/* Categories/Topics */}
        <div className="mt-16 bg-white rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🏷️ Topics We Cover
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: '📱 Mobile Apps', color: 'bg-blue-100 text-blue-800' },
              { name: '🌐 Web Development', color: 'bg-green-100 text-green-800' },
              { name: '⚡ Performance', color: 'bg-yellow-100 text-yellow-800' },
              { name: '🔒 Security', color: 'bg-red-100 text-red-800' },
              { name: '🎨 UI/UX Design', color: 'bg-purple-100 text-purple-800' },
              { name: '🚀 Startup Tips', color: 'bg-indigo-100 text-indigo-800' },
              { name: '📊 Analytics', color: 'bg-pink-100 text-pink-800' },
              { name: '🛠️ Tools & Resources', color: 'bg-gray-100 text-gray-800' }
            ].map((topic, index) => (
              <div key={index} className={`${topic.color} px-3 py-2 rounded-full text-sm font-medium text-center`}>
                {topic.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}