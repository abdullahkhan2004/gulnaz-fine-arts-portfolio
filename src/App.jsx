import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Gallery from './components/Gallery';
import FloatingAdmin from './components/FloatingAdmin';
import AdminPanel from './components/AdminPanel';
import { Loader } from 'lucide-react';

// Live API Base
const API_BASE = 'https://gulnaz-fine-arts-server-production.up.railway.app';

export default function App() {
  const [images, setImages] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch images from server
  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/list`);
      const imgs = (res.data.images || []).map(i => `${API_BASE}${i}`);
      setImages(imgs);
    } catch (err) {
      console.error('Fetch images error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Filter images by search query
  const filteredImages = images.filter(img =>
    !query || img.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="app-root">
      {/* Header */}
      <header className="site-header">
        <div className="brand">
          <div className="logo">G</div>
          <div>
            <h1>Gulnaz Abdul Qadeer</h1>
            <p>MA Fine Arts — Punjab University</p>
          </div>
        </div>
        <div className="controls">
          <input
            type="text"
            className="search"
            placeholder="Search..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className="refresh" onClick={fetchImages} disabled={loading}>
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Refresh'}
          </button>
        </div>
      </header>

      {/* Gallery */}
      <main>
        {loading && images.length === 0 && (
          <p className="text-center p-8 flex items-center justify-center text-blue-400">
            <Loader className="w-6 h-6 mr-2 animate-spin" /> Loading...
          </p>
        )}
        <Gallery images={filteredImages} />
        {!loading && images.length === 0 && (
          <p className="text-center text-gray-400 p-12 border-dashed border-2 rounded-xl">
            No artwork found.
          </p>
        )}
      </main>

      {/* Floating Admin Panel */}
      <FloatingAdmin
        apiBase={API_BASE}
        onUploadSuccess={fetchImages}
        onDeleteSuccess={fetchImages}
      />

      {/* Footer */}
      <footer className="site-footer">
        © {new Date().getFullYear()} Gulnaz Abdul Qadeer
      </footer>
    </div>
  );
}
