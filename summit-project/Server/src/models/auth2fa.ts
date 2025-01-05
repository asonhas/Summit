import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

// Generate a new secret
export const generateSecret = (appName: string) => {
  return speakeasy.generateSecret({
    name: appName,
  });
};

// Generate a QR code URL
export const generateQRCode = async (otpauthUrl: string) => {
  try {
    const qrCode = await qrcode.toDataURL(otpauthUrl);
    return qrCode;
  } catch (error) {
    throw new Error('Error generating QR code');
  }
};

// Verify the token
export const verifyToken = (secret: any, token: any) => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1,
  });
};
