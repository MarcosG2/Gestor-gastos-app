const ENABLED_KEY = 'gestor-app-lock-enabled'
const CREDENTIAL_KEY = 'gestor-app-lock-credential-id'

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

function base64ToBuffer(base64) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

export function isAppLockSupported() {
  return typeof window !== 'undefined' && window.PublicKeyCredential != null
}

export function isAppLockEnabled() {
  return localStorage.getItem(ENABLED_KEY) === '1' && !!localStorage.getItem(CREDENTIAL_KEY)
}

export function clearAppLock() {
  localStorage.removeItem(ENABLED_KEY)
  localStorage.removeItem(CREDENTIAL_KEY)
}

export async function enableAppLock(userId) {
  if (!isAppLockSupported()) {
    throw new Error('Tu navegador no admite bloqueo con WebAuthn')
  }

  const challenge = crypto.getRandomValues(new Uint8Array(32))
  const userIdBytes = new TextEncoder().encode(userId)

  const credential = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: 'Gestor de Gastos' },
      user: {
        id: userIdBytes,
        name: userId,
        displayName: 'Usuario',
      },
      pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
      },
      timeout: 60000,
    },
  })

  if (!credential) throw new Error('No se pudo crear la credencial')

  localStorage.setItem(CREDENTIAL_KEY, bufferToBase64(credential.rawId))
  localStorage.setItem(ENABLED_KEY, '1')
}

export async function verifyAppLock() {
  if (!isAppLockEnabled()) return true

  const credId = localStorage.getItem(CREDENTIAL_KEY)
  if (!credId) return true

  const challenge = crypto.getRandomValues(new Uint8Array(32))

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: [
        {
          id: base64ToBuffer(credId),
          type: 'public-key',
        },
      ],
      userVerification: 'required',
      timeout: 60000,
    },
  })

  return !!assertion
}

export function disableAppLock() {
  clearAppLock()
}
