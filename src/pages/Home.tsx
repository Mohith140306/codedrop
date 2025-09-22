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
      <section className="relative overflow-hidden gradient-subtle min-h-[80vh] flex items-center">
        <div className="absolute inset-0 opacity-10">
          <img
            src={heroImage}
            alt="Secure sharing platform"
            className="w-full h-full object-cover filter blur-sm"
          />
        </div>
        
        {/* Elegant overlay pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/70 to-background/90"></div>
        
        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="text-center space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 glass-card text-elegant px-4 py-2 rounded-full text-xs sm:text-sm font-semibold animate-scale-in backdrop-blur-md">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              End-to-End Security
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight px-2">
              Share Any Size File
              <br />
              <span className="text-elegant">
                Securely
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4 sm:px-6 font-light">
              Hybrid cloud + P2P system for unlimited file sharing. Small files use cloud storage, large files use direct transfer.
              <span className="text-elegant font-medium">No size limits, no accounts required!</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mt-8 sm:mt-12 px-4">
              <Link to="/send" className="w-full sm:w-auto">
                <Button size="xl" variant="elegant" className="w-full sm:w-auto hover:shadow-elegant transition-elegant hover-lift px-8 py-4 text-base sm:text-lg">
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Start Sharing
                </Button>
              </Link>
              <Link to="/get" className="w-full sm:w-auto">
                <Button variant="outline" size="xl" className="w-full sm:w-auto hover-lift transition-elegant px-8 py-4 text-base sm:text-lg">
                  <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Access Content
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6 px-2">
              Why Choose Sendix?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4 font-light">
              Built with security and simplicity in mind, Sendix makes secure sharing effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            <Card className="p-6 sm:p-8 lg:p-10 text-center space-y-4 sm:space-y-6 shadow-elegant hover:shadow-strong transition-elegant hover-lift animate-fade-in glass-card" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 mx-auto gradient-primary rounded-2xl flex items-center justify-center shadow-elegant">
                <Cloud className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">Cloud Mode</h3>
              <div className="text-sm font-medium text-accent bg-accent/10 px-3 py-1 rounded-full inline-block">≤100MB</div>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-light">
                Small files are stored securely in the cloud with 4-digit access codes. Perfect for documents, images, and code snippets.
              </p>
            </Card>
            
            <Card className="p-6 sm:p-8 lg:p-10 text-center space-y-4 sm:space-y-6 shadow-elegant hover:shadow-strong transition-elegant hover-lift animate-fade-in glass-card" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 mx-auto gradient-accent rounded-2xl flex items-center justify-center shadow-elegant">
                <Wifi className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">P2P Mode</h3>
              <div className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full inline-block">{'>'}100MB</div>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-light">
                Large files use direct peer-to-peer transfer with end-to-end encryption. No size limits - share movies, games, or any large content!
              </p>
            </Card>
            
            <Card className="p-6 sm:p-8 lg:p-10 text-center space-y-4 sm:space-y-6 shadow-elegant hover:shadow-strong transition-elegant hover-lift animate-fade-in glass-card sm:col-span-2 lg:col-span-1" style={{ animationDelay: '0.3s' }}>
              <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 mx-auto gradient-elegant rounded-2xl flex items-center justify-center shadow-elegant">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">Smart Fallback</h3>
              <div className="text-sm font-medium text-success bg-success/10 px-3 py-1 rounded-full inline-block">Auto-Retry</div>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-light">
                If P2P fails due to network restrictions, files automatically fallback to temporary cloud storage with 24h auto-delete.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* About Ropebit Labs Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-muted/30 to-accent/5">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-center">
            <div className="space-y-4 sm:space-y-6 animate-fade-in px-2">
              <div className="inline-flex items-center gap-2 glass-card text-elegant px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                Ropebit Labs
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground">
                Innovation Through Security
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-light">
                At Ropebit Labs, we believe that powerful technology should be accessible, secure, and user-friendly. 
                Our team specializes in creating digital solutions that prioritize privacy without compromising on functionality.
              </p>
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 gradient-elegant rounded-full mt-2 flex-shrink-0 shadow-elegant"></div>
                  <p className="text-muted-foreground text-base">Security-first approach to all our applications</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 gradient-elegant rounded-full mt-2 flex-shrink-0 shadow-elegant"></div>
                  <p className="text-muted-foreground text-base">Open-source commitment to transparency</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 gradient-elegant rounded-full mt-2 flex-shrink-0 shadow-elegant"></div>
                  <p className="text-muted-foreground text-base">User privacy as a fundamental right</p>
                </div>
              </div>
              
              {/* Team Section */}
              <div className="mt-8 sm:mt-10 p-6 sm:p-8 glass-card rounded-2xl border border-border/20 shadow-elegant">
                <h3 className="text-xl sm:text-2xl font-bold text-elegant mb-6 text-center">Our Leadership Team</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="text-center p-4 glass-card rounded-xl border border-primary/20 hover-lift transition-elegant">
                    <h4 className="text-base sm:text-lg font-bold text-elegant">Sai Amarnadh</h4>
                    <p className="text-sm text-muted-foreground font-medium">Founder</p>
                  </div>
                  <div className="text-center p-4 glass-card rounded-xl border border-accent/20 hover-lift transition-elegant">
                    <h4 className="text-base sm:text-lg font-bold text-elegant">Sravan Kumar</h4>
                    <p className="text-sm text-muted-foreground font-medium">CTO</p>
                  </div>
                  <div className="text-center p-4 glass-card rounded-xl border border-success/20 hover-lift transition-elegant sm:col-span-3 lg:col-span-1">
                    <h4 className="text-base sm:text-lg font-bold text-elegant">Mohith</h4>
                    <p className="text-sm text-muted-foreground font-medium">CMO</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4 sm:space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Card className="p-6 sm:p-8 shadow-elegant border border-border/30 glass-card hover-lift transition-elegant">
                <h3 className="text-xl sm:text-2xl font-bold text-elegant mb-3 sm:mb-4">Our Mission</h3>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-light">
                  To democratize secure technology by building tools that protect user privacy while 
                  delivering exceptional experiences. Every line of code we write is guided by principles 
                  of security, transparency, and accessibility.
                </p>
              </Card>
              <Card className="p-6 sm:p-8 shadow-elegant border border-border/30 glass-card hover-lift transition-elegant">
                <h3 className="text-xl sm:text-2xl font-bold text-elegant mb-3 sm:mb-4">Why Choose Us?</h3>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-light">
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
      <section className="py-16 sm:py-20 lg:py-24 gradient-elegant relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></div>
        <div className="relative max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8 lg:space-y-10 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white px-2">
            Ready to Share Unlimited Files?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto px-4 font-light">
            Experience the future of file sharing with our hybrid cloud + P2P system.
          </p>
          <Link to="/send" className="inline-block">
            <Button size="xl" className="bg-white text-primary hover:bg-white/90 hover:shadow-elegant transition-elegant hover-lift px-10 py-5 text-lg font-semibold">
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