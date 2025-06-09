import { useState } from 'react'
import {
  generateRSAKeyPair,
  exportKeyToPEM,
  encryptPrivateKeyPEM,
} from '../utils/crypto'

export default function KeyGenerator() {
  const [password, setPassword] = useState('')
  const [generating, setGenerating] = useState(false)
  const [publicKeyPEM, setPublicKeyPEM] = useState('')
  const [privateKeyEncrypted, setPrivateKeyEncrypted] = useState('')

  const handleGenerate = async (e) => {
    e.preventDefault()
    setGenerating(true)
    setPublicKeyPEM('')
    setPrivateKeyEncrypted('')
    try {
      const { publicKey, privateKey } = await generateRSAKeyPair()
      const pubPEM = await exportKeyToPEM(publicKey, 'public')
      const privPEM = await exportKeyToPEM(privateKey, 'private')
      const encrypted = await encryptPrivateKeyPEM(privPEM, password)
      setPublicKeyPEM(pubPEM)
      setPrivateKeyEncrypted(encrypted)
    } finally {
      setGenerating(false)
    }
  }

  const download = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <h2>Generar Claves RSA</h2>
      <form onSubmit={handleGenerate}>
        <label>
          Contraseña para proteger la clave privada:
          <input
            type="password"
            value={password}
            required
            onChange={e => setPassword(e.target.value)}
          />
        </label>
        <button type="submit" disabled={generating}>
          {generating ? 'Generando...' : 'Generar claves'}
        </button>
      </form>
      {publicKeyPEM && (
        <div>
          <button onClick={() => download(publicKeyPEM, 'public_key.pem')}>
            Descargar clave pública
          </button>
        </div>
      )}
      {privateKeyEncrypted && (
        <div>
          <button onClick={() => download(privateKeyEncrypted, 'private_key.enc')}>
            Descargar clave privada protegida
          </button>
        </div>
      )}
    </div>
  )
}
