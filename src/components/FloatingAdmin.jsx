import React, { useState } from 'react'
import AdminPanel from './AdminPanel'

export default function FloatingAdmin({ apiBase, onUploadSuccess, onDeleteSuccess }) {
  const [open, setOpen] = useState(false)
  const [logged, setLogged] = useState(false)
  const [name, setName] = useState('')
  const [pass, setPass] = useState('')

  const tryLogin = () => {
    if (name === 'Gulnaz' && pass === '12345') {
      setLogged(true)
      setOpen(true)
      setName('')
      setPass('')
    } else {
      alert('Wrong credentials (client-side). Use Name: Gulnaz, Password: 12345')
    }
  }

  return (
    <>
      <button className="fab" onClick={()=>setOpen(true)} title="Admin">G</button>

      {open && !logged && (
        <div className="modal small">
          <div className="modal-card">
            <h3>Admin Login</h3>
            <label>Name
              <input value={name} onChange={e=>setName(e.target.value)} />
            </label>
            <label>Password
              <input type="password" value={pass} onChange={e=>setPass(e.target.value)} />
            </label>
            <div className="row">
              <button onClick={tryLogin}>Login</button>
              <button onClick={()=>setOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {open && logged && (
        <AdminPanel
          apiBase={apiBase}
          onClose={() => { setOpen(false); setLogged(false); }}
          onUploadSuccess={onUploadSuccess}
          onDeleteSuccess={onDeleteSuccess}
        />
      )}
    </>
  )
}
