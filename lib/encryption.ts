import CryptoJS from 'crypto-js';

// Zero-knowledge encryption for sensitive data
// The encryption key should be derived from user input (password/PIN)
// For this implementation, we'll use a simple key derivation

let encryptionKey: string | null = null;

export function setEncryptionKey(key: string) {
  encryptionKey = key;
}

export function getEncryptionKey(): string | null {
  return encryptionKey;
}

export function encrypt(data: string): string {
  if (!encryptionKey) {
    throw new Error('Encryption key not set');
  }
  return CryptoJS.AES.encrypt(data, encryptionKey).toString();
}

export function decrypt(encryptedData: string): string {
  if (!encryptionKey) {
    throw new Error('Encryption key not set');
  }
  const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export function encryptObject<T>(obj: T): string {
  return encrypt(JSON.stringify(obj));
}

export function decryptObject<T>(encryptedData: string): T {
  return JSON.parse(decrypt(encryptedData)) as T;
}

