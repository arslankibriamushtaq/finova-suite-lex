/**
 * Simple encryption/decryption utility using base64 encoding
 * For production, consider using a more secure encryption library
 */

const SECRET_KEY = 'finova-los-encryption-key-2024';

/**
 * Encrypts a value using base64 encoding with a simple XOR cipher
 * @param value - The value to encrypt
 * @returns The encrypted string
 */
export const encryptId = (value: string | number): string => {
  try {
    const stringValue = String(value);
    
    // Simple XOR encryption with secret key
    let encrypted = '';
    for (let i = 0; i < stringValue.length; i++) {
      const charCode = stringValue.charCodeAt(i);
      const keyChar = SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
      encrypted += String.fromCharCode(charCode ^ keyChar);
    }
    
    // Encode to base64 and make URL safe
    const base64 = btoa(encrypted);
    return encodeURIComponent(base64);
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
};

/**
 * Decrypts an encrypted value
 * @param encryptedValue - The encrypted string to decrypt
 * @returns The decrypted value
 */
export const decryptId = (encryptedValue: string): string => {
  try {
    // Decode URL encoding and base64
    const decodedValue = decodeURIComponent(encryptedValue);
    const encrypted = atob(decodedValue);
    
    // XOR decrypt with secret key
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      const charCode = encrypted.charCodeAt(i);
      const keyChar = SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
      decrypted += String.fromCharCode(charCode ^ keyChar);
    }
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};
