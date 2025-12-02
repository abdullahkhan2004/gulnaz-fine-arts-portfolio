import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { UploadCloud, X, Lock, Unlock, Loader, Menu } from 'lucide-react';

// IMPORTANT: Updated to the live URL of the server deployed on Railway
const API_BASE = 'https://gulnaz-fine-arts-server-production.up.railway.app';

// ====================================================================
// COMPONENT 1: Gallery - Displays the image grid
// ====================================================================
const Gallery = ({ images }) => {
    if (images.length === 0) {
        return null; // Will be handled by the main App component's message
    }
    
    // Simple placeholder image for errors
    const errorPlaceholder = "https://placehold.co/300x300/e0e0e0/555?text=Image+Error";

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
            {images.map((imgUrl, index) => (
                <div 
                    key={imgUrl} 
                    className="bg-gray-100 rounded-lg shadow-md overflow-hidden aspect-square border-2 border-gray-200 transition duration-300 hover:shadow-xl hover:border-blue-400 cursor-pointer"
                >
                    <img 
                        src={imgUrl} 
                        alt={`Art piece ${index + 1}`} 
                        className="w-full h-full object-cover transition duration-300 hover:scale-105"
                        onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.src = errorPlaceholder; 
                        }}
                        onClick={() => window.open(imgUrl, '_blank')} // Allow viewing full image on click
                    />
                </div>
            ))}
        </div>
    );
};


// ====================================================================
// COMPONENT 2: FloatingAdmin - Handles the floating admin button and upload panel
// ====================================================================
const FloatingAdmin = ({ apiBase, onUploadSuccess }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false); // Simplified Auth state
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileUpload = async () => {
        if (!file) {
            setMessage('Please select a file.');
            return;
        }

        setUploading(true);
        setMessage('Uploading...');

        const formData = new FormData();
        formData.append('artFile', file);
        // Note: The server is set up to expect the field name 'artFile'

        try {
            const res = await axios.post(`${apiBase}/api/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            setMessage(`Success: ${res.data.message}. Refresh to view.`);
            setFile(null);
            onUploadSuccess(res.data.url); // Triggers list refresh in App.jsx
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Unknown error occurred.';
            setMessage(`Upload Failed: ${errorMsg}`);
            console.error('Upload Error:', error);
        } finally {
            setUploading(false);
        }
    };
    
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage('');
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center font-bold text-xl 
                    ${isOpen ? 'bg-red-500 hover:bg-red-600 text-white transform rotate-45' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                style={{ zIndex: 1000 }}
            >
                {isOpen ? <X className="w-8 h-8 -rotate-45" /> : <Menu className="w-8 h-8" />}
            </button>

            {/* Admin Panel */}
            <div
                className={`fixed bottom-24 right-6 w-80 bg-white shadow-2xl rounded-xl p-4 transition-transform duration-300 border-t-4 border-blue-500`}
                style={{ 
                    zIndex: 999,
                    transform: isOpen ? 'translateY(0)' : 'translateY(100vh)',
                }}
            >
                <h3 className="text-xl font-bold mb-4 text-gray-900">Admin Tools</h3>
                
                {/* Simplified Auth Toggle */}
                <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg border">
                    <span className="text-sm font-medium text-gray-700">Admin Mode (Upload)</span>
                    <button
                        onClick={() => setIsAdmin(!isAdmin)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center transition ${isAdmin ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                        {isAdmin ? <Unlock className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                        {isAdmin ? 'ON' : 'OFF'}
                    </button>
                </div>
                
                {isAdmin ? (
                    <>
                        <h4 className="text-base font-semibold text-gray-700 mb-3">Upload Artwork</h4>
                        
                        <label className="block mb-3">
                            <span className="sr-only">Choose file</span>
                            <input 
                                type="file" 
                                onChange={handleFileChange}
                                accept="image/*"
                                className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                            />
                        </label>
                        
                        {file && <p className="text-xs text-gray-500 mb-3">Selected: {file.name} ({Math.round(file.size / 1024)} KB)</p>}

                        <button
                            onClick={handleFileUpload}
                            disabled={!file || uploading}
                            className={`w-full py-2 rounded-lg font-semibold text-white transition duration-200 flex items-center justify-center shadow-md
                                ${file && !uploading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                        >
                            {uploading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                            {uploading ? 'Processing...' : 'Upload to Server'}
                        </button>
                        
                        {message && (
                            <p className={`mt-3 p-2 text-xs rounded ${message.includes('Success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {message}
                            </p>
                        )}
                    </>
                ) : (
                    <p className="text-center text-sm text-gray-500 py-4">
                        Toggle Admin Mode to enable file uploads.
                    </p>
                )}
            </div>
        </>
    );
};


// ====================================================================
// MAIN COMPONENT: App
// ====================================================================
export default function App() {
  const [images, setImages] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      // Fetching the list from the live Railway server
      const res = await axios.get(`${API_BASE}/api/list`);
      // The server returns paths like '/uploads/filename.jpg'. We prepend the API_BASE URL.
      const imgs = (res.data.images || []).map(i => `${API_BASE}${i}`);
      setImages(imgs);
    } catch (e) {
      console.error('Could not fetch list', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Handler passed to FloatingAdmin to refresh the list after a successful upload
  const onUploadSuccess = () => {
    fetchList();
  };

  // This handler is now simplified as delete logic is best handled server-side 
  // or via a more complex UI, but we keep the refresh logic simple.
  const onDeleteSuccess = () => {
    fetchList();
  };

  const filtered = images.filter(i => {
    if (!query) return true;
    // Check if the full URL (which contains the filename) matches the query
    return i.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="app-root min-h-screen bg-gray-50 pb-20">
      <header className="site-header bg-white shadow-md p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="brand flex items-center space-x-3">
              <div className="logo w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-serif text-2xl font-bold shadow-lg">G</div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-900">Gulnaz Abdul Qadeer</h1>
                <p className="text-sm text-gray-600">MA Fine Arts — Punjab University (Old Campus)</p>
              </div>
            </div>

            <div className="controls flex space-x-2 w-full md:w-auto">
              <input
                className="search w-full md:w-64 p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                placeholder="Search filenames or type to filter..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <button 
                className="refresh bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition duration-150" 
                onClick={fetchList}
                disabled={loading}
              >
                {loading ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : 'Refresh'}
              </button>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto mt-8">
        {loading && images.length === 0 ? (
           <p className="loading-indicator center text-center text-lg text-blue-500 p-8">Loading images from the server...</p>
        ) : (
          <Gallery images={filtered} />
        )}

        {images.length === 0 && !loading && (
          <p className="muted center text-center text-gray-500 p-8 text-lg">No uploaded images yet. Toggle the floating blue button to enable Admin Mode and upload your first piece.</p>
        )}
      </main>

      {/* Floating Admin component is now defined and placed here */}
      <FloatingAdmin
        apiBase={API_BASE}
        onUploadSuccess={onUploadSuccess}
        onDeleteSuccess={onDeleteSuccess} // Passed but only triggers a list refresh
      />

      <footer className="site-footer fixed bottom-0 left-0 w-full bg-white shadow-inner p-3 text-center text-xs text-gray-500 border-t">© {new Date().getFullYear()} Gulnaz Abdul Qadeer — Built with care</footer>
    </div>
  );
}