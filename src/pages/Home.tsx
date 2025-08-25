import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, FileText, Zap, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import heroImage from '@/assets/hero-security.jpg';

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-subtle">
        <div className="absolute inset-0 opacity-10">
          <img
            src={heroImage}
            alt="Secure sharing platform"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center space-y-6 sm:space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium animate-scale-in">
              <Shield className="w-4 h-4" />
              End-to-End Security
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Share Files & Code
              <br />
              <span className="gradient-primary bg-clip-text text-transparent">
                Securely
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
              Password-protected sharing for your sensitive files and code snippets. 
              No accounts required, just secure sharing in seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Link to="/send">
                <Button size="lg" className="gradient-primary hover:shadow-medium transition-all duration-300 hover-scale">
                  <Upload className="w-5 h-5 mr-2" />
                  Start Sharing
                </Button>
              </Link>
              <Link to="/get">
                <Button variant="outline" size="lg" className="hover-scale">
                  <Download className="w-5 h-5 mr-2" />
                  Access Content
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Sendix?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built with security and simplicity in mind, Sendix makes secure sharing effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="p-8 text-center space-y-4 shadow-soft hover:shadow-medium transition-all duration-300 hover-scale animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 mx-auto gradient-primary rounded-xl flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Password Protected</h3>
              <p className="text-muted-foreground">
                Every share requires a password. Your content stays private and secure with no unauthorized access.
              </p>
            </Card>
            
            <Card className="p-8 text-center space-y-4 shadow-soft hover:shadow-medium transition-all duration-300 hover-scale animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 mx-auto gradient-accent rounded-xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Files & Code</h3>
              <p className="text-muted-foreground">
                Share any file type or code snippets with syntax highlighting support and easy copying.
              </p>
            </Card>
            
            <Card className="p-8 text-center space-y-4 shadow-soft hover:shadow-medium transition-all duration-300 hover-scale animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="w-16 h-16 mx-auto bg-success rounded-xl flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">No Registration</h3>
              <p className="text-muted-foreground">
                Start sharing immediately. No accounts, no hassle, just secure sharing that works.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* About Ropebit Labs Section */}
      <section className="py-16 sm:py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Shield className="w-4 h-4" />
                Ropebit Labs
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                Innovation Through Security
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                At Ropebit Labs, we believe that powerful technology should be accessible, secure, and user-friendly. 
                Our team specializes in creating digital solutions that prioritize privacy without compromising on functionality.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">Security-first approach to all our applications</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">Open-source commitment to transparency</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">User privacy as a fundamental right</p>
                </div>
              </div>
            </div>
            <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Card className="p-6 shadow-soft border border-border/50">
                <h3 className="text-xl font-semibold text-foreground mb-3">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To democratize secure technology by building tools that protect user privacy while 
                  delivering exceptional experiences. Every line of code we write is guided by principles 
                  of security, transparency, and accessibility.
                </p>
              </Card>
              <Card className="p-6 shadow-soft border border-border/50">
                <h3 className="text-xl font-semibold text-foreground mb-3">Why Choose Us?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  With years of experience in cybersecurity and software development, we understand 
                  the importance of building trust through technology. Our solutions are battle-tested, 
                  regularly audited, and continuously improved.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 gradient-subtle">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
            Ready to Share Securely?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of users who trust Sendix for their secure sharing needs.
          </p>
          <Link to="/send">
            <Button size="lg" className="gradient-primary hover:shadow-medium transition-all duration-300 hover-scale">
              <Upload className="w-5 h-5 mr-2" />
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;