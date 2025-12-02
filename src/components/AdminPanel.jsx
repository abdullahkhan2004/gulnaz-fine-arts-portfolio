import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'

export default function AdminPanel({ apiBase, onClose = ()=>{}, onUploadSuccess = ()=>{}, onDeleteSuccess = ()=>{} }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [files, setFiles] = useState([])
  const dropRef = useRef()

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${apiBase}/api/list`)
      const imgs = (res.data.images || []).map(i => apiBase + i)
      setFiles(imgs)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(()=>{ fetchFiles() }, [])

  useEffect(()=>{
    const el = dropRef.current
    if (!el) return
    const onDrop = (e) => {
      e.preventDefault()
      const f = e.dataTransfer.files?.[0]
      if (f) setFile(f)
    }
    const onDragOver = (e) => e.preventDefault()
    el.addEventListener('drop', onDrop)
    el.addEventListener('dragover', onDragOver)
    return () => {
      el.removeEventListener('drop', onDrop)
      el.removeEventListener('dragover', onDragOver)
    }
  }, [])

  const upload = async () => {
    if (!file) return alert('Choose or drop a file')
    setUploading(true)
    setProgress(0)
    const fd = new FormData()
    fd.append('image', file)
    fd.append('name', 'Gulnaz')
    fd.append('password', '12345')
    try {
      const res = await axios.post(`${apiBase}/api/upload`, fd, {
        headers: {'Content-Type': 'multipart/form-data'},
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100))
        }
      })
      if (res.data.success && res.data.url) {
        const full = `${apiBase}${res.data.url}`
        onUploadSuccess(full)
        setFile(null)
        fetchFiles()
        alert('Upload complete')
      } else {
        alert('Upload failed: ' + (res.data.error || 'unknown'))
      }
    } catch (e) {
      alert('Upload error: ' + e.message)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const deleteFile = async (f) => {
    if (!confirm('Delete this image from server?')) return
    try {
      const filename = f.replace(apiBase, '')
      const res = await axios.delete(`${apiBase}/api/delete`, { data: { name: 'Gulnaz', password: '12345', filename } })
      if (res.data.success) {
        onDeleteSuccess(f)
        fetchFiles()
        alert('Deleted')
      } else {
        alert('Delete failed: ' + (res.data.error || 'unknown'))
      }
    } catch (e) {
      alert('Delete error: ' + e.message)
    }
  }

  return (
    <div className="modal">
      <div className="modal-card admin large">
        <h3>Admin Panel</h3>

        <div className="group">
          <label>Drag & drop or choose an image to upload</label>
          <div ref={dropRef} className="dropzone">
            {file ? (
              <div className="preview-row">
                <img src={URL.createObjectURL(file)} alt="preview" />
                <div style={{flex:1}}>
                  <div><strong>{file.name}</strong></div>
                  <div className="muted">{Math.round(file.size/1024)} KB</div>
                </div>
              </div>
            ) : (
              <div className="drop-hint">Drop image here or click to select</div>
            )}
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
          </div>
          <div className="row" style={{marginTop:12}}>
            <button onClick={upload} disabled={uploading}>{uploading ? `Uploading ${progress}%` : 'Upload'}</button>
            <button onClick={onClose}>Logout & Close</button>
          </div>
          {uploading && <progress value={progress} max="100" style={{width:'100%'}} />}
        </div>

        <div className="group">
          <label>Files on server</label>
          <div style={{maxHeight:260, overflow:'auto', padding:8, borderRadius:8, background:'#fbfbfc'}}>
            {files.length === 0 && <div className="muted">No files on server</div>}
            {files.map(f => (
              <div key={f} className="server-row">
                <img src={f} alt="" />
                <div className="fname">{f.split('/').pop()}</div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>deleteFile(f)}>Delete</button>
                </div>
              </div>
            ))}
            <div style={{marginTop:8}}>
              <button onClick={fetchFiles}>Refresh list</button>
            </div>
          </div>
        </div>

        <p className="help">Tip: Uploaded files are stored in server/uploads/ and served at /uploads/. For permanent static files, place them in client/public/drawings/ before building.</p>
      </div>
    </div>
  )
}
