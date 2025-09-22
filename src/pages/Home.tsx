import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, FileText, Zap, Upload, Download, Wifi, Cloud } from 'lucide-react';
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
        
        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium animate-scale-in">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              End-to-End Security
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight px-2">
              Share Any Size File
              <br />
              <span className="gradient-primary bg-clip-text text-transparent">
                Securely
              </span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4 sm:px-6">
              Hybrid cloud + P2P system for unlimited file sharing. Small files use cloud storage, large files use direct transfer.
              No size limits, no accounts required!
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mt-6 sm:mt-8 px-4">
              <Link to="/send" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto gradient-primary hover:shadow-medium transition-all duration-300 hover-scale px-6 py-3 text-sm sm:text-base">
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Start Sharing
                </Button>
              </Link>
              <Link to="/get" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto hover-scale px-6 py-3 text-sm sm:text-base">
                  <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Access Content
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-2">
              Why Choose Sendix?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Built with security and simplicity in mind, Sendix makes secure sharing effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <Card className="p-4 sm:p-6 lg:p-8 text-center space-y-3 sm:space-y-4 shadow-soft hover:shadow-medium transition-all duration-300 hover-scale animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto bg-blue-500 rounded-xl flex items-center justify-center">
                <Cloud className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground">Cloud Mode (≤100MB)</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Small files are stored securely in the cloud with 4-digit access codes. Perfect for documents, images, and code snippets.
              </p>
            </Card>
            
            <Card className="p-4 sm:p-6 lg:p-8 text-center space-y-3 sm:space-y-4 shadow-soft hover:shadow-medium transition-all duration-300 hover-scale animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto bg-purple-500 rounded-xl flex items-center justify-center">
                <Wifi className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground">P2P Mode ({'>'} 100MB)</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Large files use direct peer-to-peer transfer with end-to-end encryption. No size limits - share movies, games, or any large content!
              </p>
            </Card>
            
            <Card className="p-4 sm:p-6 lg:p-8 text-center space-y-3 sm:space-y-4 shadow-soft hover:shadow-medium transition-all duration-300 hover-scale animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto gradient-primary rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary-foreground" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground">Smart Fallback</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                If P2P fails due to network restrictions, files automatically fallback to temporary cloud storage with 24h auto-delete.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* About Ropebit Labs Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6 animate-fade-in px-2">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                Ropebit Labs
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground">
                Innovation Through Security
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
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
              
              {/* Team Section */}
              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-card/50 rounded-lg border border-border/30">
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4 text-center">Our Leadership Team</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <h4 className="text-sm sm:text-base font-bold text-primary">Sai Amarnadh</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">Founder</p>
                  </div>
                  <div className="text-center p-3 bg-accent/5 rounded-lg border border-accent/10">
                    <h4 className="text-sm sm:text-base font-bold text-accent">Sravan Kumar</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">CTO</p>
                  </div>
                  <div className="text-center p-3 bg-success/5 rounded-lg border border-success/10">
                    <h4 className="text-sm sm:text-base font-bold text-success">Mohith</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">CMO</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4 sm:space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Card className="p-4 sm:p-6 shadow-soft border border-border/50">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">Our Mission</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  To democratize secure technology by building tools that protect user privacy while 
                  delivering exceptional experiences. Every line of code we write is guided by principles 
                  of security, transparency, and accessibility.
                </p>
              </Card>
              <Card className="p-4 sm:p-6 shadow-soft border border-border/50">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">Why Choose Us?</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
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
      <section className="py-12 sm:py-16 lg:py-20 gradient-subtle">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 text-center space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
          <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground px-2">
            Ready to Share Unlimited Files?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Experience the future of file sharing with our hybrid cloud + P2P system.
          </p>
          <Link to="/send" className="inline-block">
            <Button size="lg" className="gradient-primary hover:shadow-medium transition-all duration-300 hover-scale px-6 py-3 text-sm sm:text-base">
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Start Sharing Now
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;