import React from 'react';
import { Heart, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-muted/20 to-accent/5 border-t border-border/30 py-16 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* About Sendix */}
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold text-elegant">Sendix</h3>
              <p className="text-sm text-muted-foreground opacity-75">by Ropebit Labs</p>
            </div>
            <p className="text-base text-muted-foreground leading-relaxed font-light">
              Secure file and code sharing platform with end-to-end password protection. 
              No registration required, just secure sharing in seconds.
            </p>
          </div>

          {/* About Ropebit Labs */}
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-elegant">Ropebit Labs</h3>
            <p className="text-base text-muted-foreground leading-relaxed font-light">
              We build innovative digital solutions focused on security, privacy, and user experience. 
              Our mission is to make secure technology accessible to everyone.
            </p>
            <a 
              href="https://ropebit.live" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-base text-elegant hover:text-primary-glow transition-elegant hover-lift"
            >
              Visit Ropebit Labs
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Contact & Legal */}
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-elegant">Support</h3>
            <div className="space-y-3 text-base text-muted-foreground">
              <p>Questions or feedback?</p>
              <a 
                href="mailto:ropebitlabs@gmail.com" 
                className="text-elegant hover:text-primary-glow transition-elegant hover-lift"
              >
                support@ropebitlabs.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-border/30 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-base text-muted-foreground text-center sm:text-left font-light">
            © 2024 Ropebit Labs. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-base text-muted-foreground font-light">
            <span>Made with</span>
            <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
            <span>for secure sharing</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
