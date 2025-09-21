export interface QRCodeOptions {
  size?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export class QRCodeGenerator {
  private static readonly DEFAULT_OPTIONS: Required<QRCodeOptions> = {
    size: 256,
    errorCorrectionLevel: 'M',
    margin: 4,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  };

  static generateForRoom(roomCode: string, options: QRCodeOptions = {}): string {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const url = `${window.location.origin}/get?room=${roomCode}`;
    
    return this.generateQRCodeUrl(url, opts);
  }

  static generateForAccessCode(accessCode: string, options: QRCodeOptions = {}): string {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const url = `${window.location.origin}/get?code=${accessCode}`;
    
    return this.generateQRCodeUrl(url, opts);
  }

  private static generateQRCodeUrl(data: string, options: Required<QRCodeOptions>): string {
    const params = new URLSearchParams({
      size: `${options.size}x${options.size}`,
      data: data,
      ecc: options.errorCorrectionLevel,
      margin: options.margin.toString(),
      color: options.color.dark.replace('#', ''),
      bgcolor: options.color.light.replace('#', '')
    });

    return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;
  }

  static async generateDataURL(data: string, options: QRCodeOptions = {}): Promise<string> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const url = this.generateQRCodeUrl(data, opts);
    
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to generate QR code data URL:', error);
      return url; // Fallback to direct URL
    }
  }

  static downloadQRCode(data: string, filename: string = 'qr-code.png', options: QRCodeOptions = {}): void {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const url = this.generateQRCodeUrl(data, opts);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}