// Helper to convert ArrayBuffer to base64
export function arrayBufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

// Helper to convert base64 to ArrayBuffer
export function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Generate RSA key pair
export async function generateRSAKeyPair() {
  return await window.crypto.subtle.generateKey(
    {
      name: "RSA-PSS",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"]
  );
}

// Export key to PEM format
export async function exportKeyToPEM(key, type = "public") {
  const exported = await window.crypto.subtle.exportKey(
    type === "public" ? "spki" : "pkcs8",
    key
  );
  const exportedAsBase64 = arrayBufferToBase64(exported);
  const pemHeader = type === "public"
    ? "-----BEGIN PUBLIC KEY-----"
    : "-----BEGIN PRIVATE KEY-----";
  const pemFooter = type === "public"
    ? "-----END PUBLIC KEY-----"
    : "-----END PRIVATE KEY-----";
  const pemBody = exportedAsBase64.match(/.{1,64}/g).join('\n');
  return `${pemHeader}\n${pemBody}\n${pemFooter}`;
}

// Import PEM key
export async function importKeyFromPEM(pem, type = "public") {
  const b64 = pem.replace(/-----(BEGIN|END) (PUBLIC|PRIVATE) KEY-----|\n/g, '');
  const binary = base64ToArrayBuffer(b64);
  if (type === "public") {
    return await window.crypto.subtle.importKey(
      "spki",
      binary,
      {
        name: "RSA-PSS",
        hash: "SHA-256",
      },
      true,
      ["verify"]
    );
  } else {
    return await window.crypto.subtle.importKey(
      "pkcs8",
      binary,
      {
        name: "RSA-PSS",
        hash: "SHA-256",
      },
      true,
      ["sign"]
    );
  }
}

// Encrypt private key PEM with password (AES-GCM)
export async function encryptPrivateKeyPEM(pem, password) {
  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(pem)
  );
  // Store salt, iv, ciphertext as base64 JSON
  return JSON.stringify({
    salt: arrayBufferToBase64(salt),
    iv: arrayBufferToBase64(iv),
    ciphertext: arrayBufferToBase64(ciphertext),
  });
}

// Decrypt private key PEM with password
export async function decryptPrivateKeyPEM(json, password) {
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const { salt, iv, ciphertext } = JSON.parse(json);
  const saltBuf = base64ToArrayBuffer(salt);
  const ivBuf = base64ToArrayBuffer(iv);
  const ctBuf = base64ToArrayBuffer(ciphertext);
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBuf,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBuf },
    key,
    ctBuf
  );
  return dec.decode(decrypted);
}

// Sign file data
export async function signData(privateKey, data) {
  return await window.crypto.subtle.sign(
    {
      name: "RSA-PSS",
      saltLength: 32,
    },
    privateKey,
    data
  );
}

// Verify signature
export async function verifySignature(publicKey, signature, data) {
  return await window.crypto.subtle.verify(
    {
      name: "RSA-PSS",
      saltLength: 32,
    },
    publicKey,
    signature,
    data
  );
}