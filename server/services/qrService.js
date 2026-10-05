const QRCode = require('qrcode');

/**
 * Generate high-resolution, error-corrected QR code
 */
async function generateQRCodeDataURL(url, options = {}) {
  const defaultOptions = {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    quality: 0.95,
    margin: 2,
    color: {
      dark: options.darkColor || '#0B2E59',
      light: options.lightColor || '#FFFFFF'
    },
    width: options.width || 600
  };

  return await QRCode.toDataURL(url, defaultOptions);
}

async function generateQRCodeSVG(url, options = {}) {
  const defaultOptions = {
    errorCorrectionLevel: 'H',
    type: 'svg',
    margin: 2,
    color: {
      dark: options.darkColor || '#0B2E59',
      light: options.lightColor || '#FFFFFF'
    },
    width: options.width || 600
  };

  return await QRCode.toString(url, defaultOptions);
}

async function generateQRCodeBuffer(url, options = {}) {
  const defaultOptions = {
    errorCorrectionLevel: 'H',
    type: 'png',
    margin: 2,
    color: {
      dark: options.darkColor || '#0B2E59',
      light: options.lightColor || '#FFFFFF'
    },
    width: options.width || 800
  };

  return await QRCode.toBuffer(url, defaultOptions);
}

module.exports = {
  generateQRCodeDataURL,
  generateQRCodeSVG,
  generateQRCodeBuffer
};
