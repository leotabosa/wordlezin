const WORDLEZIN_SECRET_KEY = 'WORDLEZIN_SECRET_KEY'

function stringToBytes(str: string): Uint8Array {
  const encoder = new TextEncoder()
  return encoder.encode(str)
}

function bytesToString(bytes: Uint8Array): string {
  const decoder = new TextDecoder()
  return decoder.decode(bytes)
}

async function deriveKey(password: string): Promise<CryptoKey> {
  const passwordBytes = stringToBytes(password)
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBytes,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: stringToBytes('wordlezin-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptData(data: string): Promise<string> {
  try {
    const key = await deriveKey(WORDLEZIN_SECRET_KEY)
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const dataBytes = stringToBytes(data)

    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      dataBytes
    )

    const encryptedBytes = new Uint8Array(encryptedBuffer)
    const combined = new Uint8Array(iv.length + encryptedBytes.length)
    combined.set(iv, 0)
    combined.set(encryptedBytes, iv.length)

    return btoa(String.fromCharCode(...combined))
  } catch (error) {
    throw new Error('Encryption failed')
  }
}

export async function decryptData(encryptedData: string): Promise<string> {
  try {
    const key = await deriveKey(WORDLEZIN_SECRET_KEY)
    const combined = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0))

    const iv = combined.slice(0, 12)
    const data = combined.slice(12)

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )

    return bytesToString(new Uint8Array(decryptedBuffer))
  } catch (error) {
    throw new Error('Decryption failed')
  }
}
