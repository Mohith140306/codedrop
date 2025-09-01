import React from 'react';
import { Heart, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Sendix */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Sendix</h3>
              <p className="text-sm text-muted-foreground">by Ropebit Labs</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Secure file and code sharing platform with end-to-end password protection. 
              No registration required, just secure sharing in seconds.
            </p>
          </div>

          {/* About Ropebit Labs */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Ropebit Labs</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We build innovative digital solutions focused on security, privacy, and user experience. 
              Our mission is to make secure technology accessible to everyone.
            </p>
            <a 
              href="https://ropebit.live" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-glow transition-colors"
            >
              Visit Ropebit Labs
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Contact & Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Support</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Questions or feedback?</p>
              <a 
                href="mailto:ropebitlabs@gmail.com" 
                className="text-primary hover:text-primary-glow transition-colors"
              >
                support@ropebitlabs.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            © 2024 Ropebit Labs. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>for secure sharing</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
