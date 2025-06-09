import { useState } from 'react'
import {
  importKeyFromPEM,
  decryptPrivateKeyPEM,
  signData,
  arrayBufferToBase64,
} from '../utils/crypto'

export default function FileSigner() {
  const [file, setFile] = useState(null)
  const [privKeyFile, setPrivKeyFile] = useState(null)
  const [password, setPassword] = useState('')
  const [signing, setSigning] = useState(false)
  const [signature, setSignature] = useState('')

  const handleSign = async (e) => {
    e.preventDefault()
    setSigning(true)
    setSignature('')
    try {
      // Read file and private key
      const fileData = new Uint8Array(await file.arrayBuffer())
      const privKeyEnc = await privKeyFile.text()
      // Decrypt private key PEM
      let privPEM
      try {
        privPEM = await decryptPrivateKeyPEM(privKeyEnc, password)
      } catch {
        alert('Contraseña incorrecta o archivo de clave inválido.')
        setSigning(false)
        return
      }
      // Import private key
      const privateKey = await importKeyFromPEM(privPEM, 'private')
      // Sign
      const sig = await signData(privateKey, fileData)
      setSignature(arrayBufferToBase64(sig))
    } finally {
      setSigning(false)
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
    <div style={{ width: '100%', maxWidth: 500 }}>
      <h2>Firmar Archivo</h2>
      <form onSubmit={handleSign}>
        <label>
          Archivo a firmar:
          <input
            type="file"
            required
            onChange={e => setFile(e.target.files[0])}
          />
        </label>
        <label>
          Archivo de clave privada (.enc):
          <input
            type="file"
            required
            onChange={e => setPrivKeyFile(e.target.files[0])}
          />
        </label>
        <label>
          Contraseña de la clave privada:
          <input
            type="password"
            value={password}
            required
            onChange={e => setPassword(e.target.value)}
            placeholder="Contraseña"
          />
        </label>
        <button type="submit" disabled={signing}>
          {signing ? 'Firmando...' : 'Firmar'}
        </button>
      </form>
      {signature && (
        <div style={{ marginTop: 24 }}>
          <p style={{ fontWeight: 500, color: '#b71c1c' }}>Firma generada:</p>
          <textarea value={signature} readOnly rows={4} cols={60} />
          <br />
          <button onClick={() => download(signature, 'signature.txt')}>
            Descargar firma
          </button>
        </div>
      )}
    </div>
  )
}
