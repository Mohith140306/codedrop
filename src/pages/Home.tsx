import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, FileText, Code, Zap, Send, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import heroImage from '@/assets/hero-security.jpg';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 animate-fade-in" />
        <div className="container mx-auto max-w-6xl relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-in-left">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                  Secure File & Code
                  <span className="text-primary block">Sharing Platform</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Share your files and code snippets securely with password protection. 
                  No registration required - just upload, protect, and share.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/send">
                  <Button size="lg" className="w-full sm:w-auto hover:scale-105 transition-transform">
                    <Send className="w-5 h-5 mr-2" />
                    Send Files & Code
                  </Button>
                </Link>
                <Link to="/get">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto hover:scale-105 transition-transform">
                    <Download className="w-5 h-5 mr-2" />
                    Get Shared Content
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative animate-slide-in-right">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-2xl" />
              <img 
                src={heroImage} 
                alt="Secure sharing platform" 
                className="relative rounded-2xl shadow-2xl w-full h-auto hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Sendix?
            </h2>
            <p className="text-xl text-muted-foreground">
              Built with security and simplicity in mind
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Password Protected",
                description: "Every shared file and code snippet is protected with a password you set.",
                delay: "0ms"
              },
              {
                icon: Zap,
                title: "No Registration",
                description: "Start sharing immediately without creating an account or logging in.",
                delay: "100ms"
              },
              {
                icon: Lock,
                title: "Secure by Design",
                description: "Your content is encrypted and automatically expires when you want it to.",
                delay: "200ms"
              }
            ].map((feature, index) => (
              <Card 
                key={index} 
                className="p-8 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in border-border"
                style={{ animationDelay: feature.delay }}
              >
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10">
        <div className="container mx-auto max-w-4xl text-center animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Share Securely?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start sharing your files and code snippets with confidence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/send">
              <Button size="lg" className="w-full sm:w-auto hover:scale-105 transition-transform">
                <FileText className="w-5 h-5 mr-2" />
                Share a File
              </Button>
            </Link>
            <Link to="/send">
              <Button variant="outline" size="lg" className="w-full sm:w-auto hover:scale-105 transition-transform">
                <Code className="w-5 h-5 mr-2" />
                Share Code
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;