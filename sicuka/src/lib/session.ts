import crypto from "crypto"

// Derive a 32-byte key from the secret
const SECRET = process.env.SESSION_SECRET || "default_super_secret_session_key_minimum_32_bytes_long!"
const KEY = crypto.createHash("sha256").update(SECRET).digest()
const IV_LENGTH = 16

/**
 * Encrypts a plaintext string using AES-256-CBC
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv("aes-256-cbc", KEY, iv)
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")
  return iv.toString("hex") + ":" + encrypted
}

/**
 * Decrypts an AES-256-CBC encrypted string. Returns null if decryption fails (tampered token).
 */
export function decrypt(encryptedText: string): string | null {
  try {
    const textParts = encryptedText.split(":")
    const ivHex = textParts.shift()
    if (!ivHex) return null
    
    const iv = Buffer.from(ivHex, "hex")
    const encryptedData = Buffer.from(textParts.join(":"), "hex")
    const decipher = crypto.createDecipheriv("aes-256-cbc", KEY, iv)
    
    let decrypted = decipher.update(encryptedData)
    // @ts-ignore
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
  } catch (error) {
    return null // Returns null if signature is invalid or decryption fails
  }
}
