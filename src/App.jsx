import React, { useEffect, useState, useCallback } from 'react'
import Gallery from './components/Gallery'
import FloatingAdmin from './components/FloatingAdmin'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

export default function App() {
  const [images, setImages] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/api/list`)
      const imgs = (res.data.images || []).map(i => `${API_BASE}${i}`)
      setImages(imgs)
    } catch (e) {
      console.error('Could not fetch list', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  const onUploadSuccess = (url) => {
    setImages(prev => [url, ...prev])
  }

  const onDeleteSuccess = (filename) => {
    setImages(prev => prev.filter(i => i !== filename))
  }

  const filtered = images.filter(i => {
    if (!query) return true
    return i.toLowerCase().includes(query.toLowerCase())
  })

  return (
    <div className="app-root">
      <header className="site-header">
        <div className="brand">
          <div className="logo">G</div>
          <div>
            <h1>Gulnaz Abdul Qadeer</h1>
            <p>MA Fine Arts — Punjab University (Old Campus)</p>
          </div>
        </div>

        <div className="controls">
          <input
            className="search"
            placeholder="Search filenames or type to filter..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className="refresh" onClick={fetchList}>{loading ? 'Refreshing...' : 'Refresh'}</button>
        </div>
      </header>

      <main>
        <Gallery images={filtered} />
        {images.length === 0 && !loading && (
          <p className="muted center">No uploaded images yet. Click the <strong>G</strong> button to login and upload.</p>
        )}
      </main>

      <FloatingAdmin
        apiBase={API_BASE}
        onUploadSuccess={(url) => { onUploadSuccess(url); fetchList(); }}
        onDeleteSuccess={(filename) => { onDeleteSuccess(filename); fetchList(); }}
      />

      <footer className="site-footer">© {new Date().getFullYear()} Gulnaz Abdul Qadeer — Built with care</footer>
    </div>
  )
}
