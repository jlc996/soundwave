import { useState, useEffect } from 'react';
import { getAlbums, createAlbum, deleteAlbum } from './api.js';
import AlbumList from './components/AlbumList.jsx';
import AlbumForm from './components/AlbumForm.jsx';

export default function App() {
  const [albums, setAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // A separate error for the form. A failure loading the list and a
  // failure saving the form are different problems and belong in
  // different places on screen.
  const [formError, setFormError] = useState(null);

  // Pulled out of useEffect so we can call it again after any change.
  async function loadAlbums() {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAlbums();
      setAlbums(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAlbums();
  }, []);

  // -------------------------------------------------------------
  // CREATE
  // -------------------------------------------------------------
  async function handleCreate(newAlbum) {
    try {
      setFormError(null);

      // TODO (LAB 3): save it on the server, then reload the list so
      // the screen matches the server.
      //
      await createAlbum(newAlbum);
      await loadAlbums();

      return true;   // tells the form it can clear itself
    } catch (err) {
      // This is the message YOUR backend wrote in its guard clause.
      setFormError(err.message);
      return false;  // keeps the user's typing
    }
  }

  // -------------------------------------------------------------
  // DELETE
  // -------------------------------------------------------------
  async function handleDelete(id) {
    if (!window.confirm('Delete this album?')) return;

    try {
      // TODO (LAB 3): delete it on the server, then reload the list.
      //
      await deleteAlbum(id);
      await loadAlbums();

    } catch (err) {
      setError(err.message);
      // Someone else may have deleted it already. Refresh either way
      // so the screen stops showing something that doesn't exist.
      loadAlbums();
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>SoundWave</h1>
        <p className="subtitle">My album collection</p>
      </header>

      <main>
        <AlbumForm onSubmit={handleCreate} error={formError} />

        {isLoading && <p className="status">Loading albums…</p>}

        {error && (
          <p className="status error">Could not load albums: {error}</p>
        )}

        {!isLoading && !error && albums.length === 0 && (
          <p className="status">No albums yet. Add your first one above!</p>
        )}

        {!isLoading && !error && albums.length > 0 && (
          <AlbumList albums={albums} onDelete={handleDelete} />
        )}
      </main>
    </div>
  );
}