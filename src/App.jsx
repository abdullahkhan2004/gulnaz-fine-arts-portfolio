import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, X, Lock, Unlock, Loader, Menu } from 'lucide-react';
import FloatingAdmin from './components/FloatingAdmin';
import Gallery from './components/Gallery';

// Live API URL
const API_BASE = 'https://gulnaz-fine-arts-server-production.up.railway.app';

export default function App() {
  const [images, setImages] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // ========================== Fetch Images ==========================
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/list`);
      const imgs = (res.data.images || []).map(i => `${API_BASE}${i}`);
      setImages(imgs);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  const filtered = images.filter(i => !query || i.toLowerCase().includes(query.toLowerCase()));

  // ========================== Flipbook States ==========================
  const [flipbookOpen, setFlipbookOpen] = useState(false);
  const [flipIndex, setFlipIndex] = useState(0);
  const [flipSpeed, setFlipSpeed] = useState(4000); // ms
  const [music, setMusic] = useState(null);
  const audioRef = useRef(null);
  const flipInterval = useRef(null);

  const openFlipbook = () => {
    if (images.length === 0) {
      alert("No images to show in flipbook!");
      return;
    }
    setFlipIndex(0);
    setFlipbookOpen(true);
  };

  const closeFlipbook = () => {
    setFlipbookOpen(false);
    clearInterval(flipInterval.current);
    if (audioRef.current) audioRef.current.pause();
  };

  const nextImage = () => setFlipIndex(prev => (prev + 1) % images.length);
  const prevImage = () => setFlipIndex(prev => (prev - 1 + images.length) % images.length);

  // Automatic flip every flipSpeed ms
  useEffect(() => {
    if (flipbookOpen) {
      clearInterval(flipInterval.current);
      flipInterval.current = setInterval(() => {
        setFlipIndex(prev => (prev + 1) % images.length);
      }, flipSpeed);
    }
    return () => clearInterval(flipInterval.current);
  }, [flipbookOpen, images.length, flipSpeed]);

  // ========================== Handlers ==========================
  const handleSpeedChange = (e) => setFlipSpeed(Number(e.target.value));
  const handleMusicUpload = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setMusic(URL.createObjectURL(file));
      if (audioRef.current) {
        audioRef.current.src = URL.createObjectURL(file);
        audioRef.current.play();
      }
    }
  };
  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = images[flipIndex];
    link.download = images[flipIndex].split('/').pop();
    link.click();
  };

  // ========================== JSX ==========================
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
          <button className="refresh" onClick={fetchList} disabled={loading}>
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Refresh'}
          </button>
        </div>
      </header>

      {/* Main Gallery */}
      <main>
        {loading && images.length === 0 && (
          <p className="text-center text-blue-400 p-8 flex items-center justify-center">
            <Loader className="w-6 h-6 mr-2 animate-spin" /> Loading...
          </p>
        )}
        <Gallery images={filtered} />
        {images.length === 0 && !loading && (
          <p className="text-center text-gray-400 p-12 border-dashed border-2 rounded-xl">No artwork found.</p>
        )}
      </main>

      {/* Flipbook FAB */}
      <button
        onClick={openFlipbook}
        className="fab"
        style={{ bottom: 100, right: 20 }}
        title="Flipbook"
      >
        F
      </button>

      {/* Flipbook Modal */}
      {flipbookOpen && (
        <div className="modal" onClick={closeFlipbook}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ textAlign: 'center', maxWidth: '90vw', maxHeight: '90vh', padding: 20 }}
          >
            <h3>Flipbook</h3>

            {/* Image Display */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '12px 0' }}>
              <button onClick={prevImage} style={{ marginRight: 12 }}>◀</button>
              <img
                src={images[flipIndex]}
                alt={`Flip ${flipIndex + 1}`}
                style={{
                  maxWidth: '85%',
                  maxHeight: '70vh',
                  borderRadius: 8,
                  transition: 'transform 0.5s ease-in-out',
                }}
              />
              <button onClick={nextImage} style={{ marginLeft: 12 }}>▶</button>
            </div>

            <div style={{ marginTop: 8 }}>{flipIndex + 1} / {images.length}</div>

            {/* Controls */}
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              {/* Speed Slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: 12 }}>Speed:</label>
                <input
                  type="range"
                  min="500"
                  max="7000"
                  step="250"
                  value={flipSpeed}
                  onChange={handleSpeedChange}
                />
                <span style={{ fontSize: 12 }}>{(flipSpeed/1000).toFixed(1)}s</span>
              </div>

              {/* Music Upload */}
              <div>
                <label style={{ cursor: 'pointer', fontSize: 12, padding: 6, background: '#222', borderRadius: 6 }}>
                  🎵 Add Music
                  <input type="file" accept="audio/*" onChange={handleMusicUpload} style={{ display: 'none' }} />
                </label>
              </div>


              {/* Close */}
              <button onClick={closeFlipbook} style={{ fontSize: 12, padding: '6px 12px', borderRadius: 6 }}>
                ✖ Close
              </button>
            </div>

            {/* Audio Player */}
            {music && (
              <audio ref={audioRef} src={music} controls autoPlay style={{ marginTop: 12, width: '100%' }} />
            )}
          </div>
        </div>
      )}

      {/* Floating Admin Panel */}
      <FloatingAdmin apiBase={API_BASE} onUploadSuccess={fetchList} />

      <footer className="site-footer">© {new Date().getFullYear()} Gulnaz Abdul Qadeer</footer>
    </div>
  );
}
