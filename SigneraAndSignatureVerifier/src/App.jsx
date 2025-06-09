import { useState } from 'react'

import './App.css'
import KeyGenPage from './pages/KeyGenPage'
import SignPage from './pages/SignPage'
import VerifyPage from './pages/VerifyPage'

function App() {
  const [count, setCount] = useState(0)
  const [page, setPage] = useState('keygen')

  let content
  if (page === 'keygen') content = <KeyGenPage />
  else if (page === 'sign') content = <SignPage />
  else if (page === 'verify') content = <VerifyPage />

  return (
    <>
      
      <nav>
        <button onClick={() => setPage('keygen')}>Generar Claves</button>
        <button onClick={() => setPage('sign')}>Firmar Archivo</button>
        <button onClick={() => setPage('verify')}>Verificar Firma</button>
      </nav>
      <hr />
      {content}
    </>
  )
}

export default App
