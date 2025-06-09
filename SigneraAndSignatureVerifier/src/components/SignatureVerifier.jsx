import { useState } from 'react'
import {
  importKeyFromPEM,
  base64ToArrayBuffer,
  verifySignature,
} from '../utils/crypto'

export default function SignatureVerifier() {
  const [file, setFile] = useState(null)
  const [signatureFile, setSignatureFile] = useState(null)
  const [pubKeyFile, setPubKeyFile] = useState(null)
  const [verifying, setVerifying] = useState(false)
  const [result, setResult] = useState(null)

  const handleVerify = async (e) => {
    e.preventDefault()
    setVerifying(true)
    setResult(null)
    try {
      const fileData = new Uint8Array(await file.arrayBuffer())
      const signature = await signatureFile.text()
      const pubPEM = await pubKeyFile.text()
      const publicKey = await importKeyFromPEM(pubPEM, 'public')
      const valid = await verifySignature(
        publicKey,
        base64ToArrayBuffer(signature.trim()),
        fileData
      )
      setResult(valid)
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 500 }}>
      <h2>Verificar Firma</h2>
      <form onSubmit={handleVerify}>
        <label>
          Archivo original:
          <input
            type="file"
            required
            onChange={e => setFile(e.target.files[0])}
          />
        </label>
        <label>
          Archivo de firma:
          <input
            type="file"
            required
            onChange={e => setSignatureFile(e.target.files[0])}
          />
        </label>
        <label>
          Archivo de clave pública (.pem):
          <input
            type="file"
            required
            onChange={e => setPubKeyFile(e.target.files[0])}
          />
        </label>
        <button type="submit" disabled={verifying}>
          {verifying ? 'Verificando...' : 'Verificar'}
        </button>
      </form>
      {result !== null && (
        <div style={{ marginTop: 24 }}>
          <p style={{
            fontWeight: 600,
            color: result ? '#388e3c' : '#d32f2f',
            fontSize: '1.2em'
          }}>
            {result
              ? 'La firma es válida ✅'
              : 'La firma NO es válida ❌'}
          </p>
        </div>
      )}
    </div>
  )
}
