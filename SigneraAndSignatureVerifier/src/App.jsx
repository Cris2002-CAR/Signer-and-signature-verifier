import { useState } from 'react'
import KeyGenPage from './pages/KeyGenPage'
import SignPage from './pages/SignPage'
import VerifyPage from './pages/VerifyPage'
import './App.css'

function App() {
  const [page, setPage] = useState('keygen')

  let content
  if (page === 'keygen') content = <KeyGenPage />
  else if (page === 'sign') content = <SignPage />
  else if (page === 'verify') content = <VerifyPage />

  return (
    <div className="acrobat-app">
      <aside className="acrobat-sidebar">
        <div className="acrobat-logo">
          <span>🔏</span>
          <h1>Firmador y verificador de firmas</h1>
        </div>
        <nav>
          <button
            className={page === 'keygen' ? 'active' : ''}
            onClick={() => setPage('keygen')}
          >
            Generar Claves
          </button>
          <button
            className={page === 'sign' ? 'active' : ''}
            onClick={() => setPage('sign')}
          >
            Firmar Archivo
          </button>
          <button
            className={page === 'verify' ? 'active' : ''}
            onClick={() => setPage('verify')}
          >
            Verificar Firma
          </button>
        </nav>
      </aside>
      <main className="acrobat-main">
        {content}
      </main>
    </div>
  )
}

export default App
