// ---------------------------------------------------------------
// EVERY network request in this app lives in this file.
// This is where your lab time goes.
//
// Where is our backend?
//
// Development: BASE_URL is an empty string, so fetch('/api/albums')
//   stays a relative path and the Vite proxy forwards it to port 5000.
//
// Production: VITE_API_URL is the full address of the deployed API,
//   e.g. "https://soundwave-api.onrender.com"
//
// This one line is the only difference between the two environments.
// ---------------------------------------------------------------

const BASE_URL = import.meta.env.VITE_API_URL || '';
const res = await fetch(`${BASE_URL}/api/albums`);
/**
 * Every response goes through here.
 *
 * THE MOST IMPORTANT THING IN THIS FILE:
 * fetch() does NOT throw when the server replies 404 or 500. As far as
 * fetch is concerned, it asked a question and got an answer. So your
 * try/catch will NOT catch a bad status. You have to check res.ok
 * yourself, every single time.
 */
async function handleResponse(res) {
  if (!res.ok) {
    // Read the { message: "..." } our backend promises on every error.
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data.message) message = data.message;
    } catch {
      // Response was not JSON. Keep the generic message.
    }
    throw new Error(message);
  }

  // 204 No Content (our DELETE) has an empty body.
  // Calling res.json() on it would throw "Unexpected end of JSON input".
  if (res.status === 204) return null;

  return res.json();
}

// ---------------------------------------------------------------
// GET all albums, optionally filtered by artist
// ---------------------------------------------------------------
export async function getAlbums(search) {
  // encodeURIComponent matters: without it, searching "AC/DC" puts a
  // slash in the URL and the server sees a path it does not recognise.
  const url = search
    ? `${BASE_URL}/api/albums?artist=${encodeURIComponent(search)}`
    : `${BASE_URL}/api/albums`;

  // ===== TODO (LAB 2) =====================================
  // Send the request and pass the result to handleResponse.
  //
    const res = await fetch(url);
    return handleResponse(res);
  //
  // Then DELETE the throw below.
  // ========================================================
  // throw new Error('getAlbums() is not implemented yet — see Lab 2 (Day 2)');
}

// ---------------------------------------------------------------
// POST a new album
// ---------------------------------------------------------------
export async function createAlbum(album) {
  // ===== TODO (LAB 3) =====================================
  // A POST needs THREE things a GET does not:
  //   1. method: 'POST'
  //   2. headers: { 'Content-Type': 'application/json' }
  //   3. body: JSON.stringify(album)
  //
  // These are exactly what you set in Postman: the method dropdown,
  // the Body -> raw -> JSON dropdown, and the text you typed.
  //
    const res = await fetch(`${BASE_URL}/api/albums`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(album),
    });
    return handleResponse(res);
  // ========================================================
  // throw new Error('createAlbum() is not implemented yet — see Lab 3 (Day 3)');
}

// ---------------------------------------------------------------
// PATCH an existing album — send ONLY what changed
// ---------------------------------------------------------------
export async function updateAlbum(id, changes) {
  // ===== TODO (LAB 4a) ====================================
  // Same three things as POST, but method: 'PATCH' and the URL
  // includes the id.
  //
  //   const res = await fetch(`${BASE_URL}/api/albums/${id}`, {
  //     method: 'PATCH',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(changes),
  //   });
  //   return handleResponse(res);
  // ========================================================
  throw new Error('updateAlbum() is not implemented yet — see Lab 4a (Day 4)');
}

// ---------------------------------------------------------------
// DELETE an album
// ---------------------------------------------------------------
export async function deleteAlbum(id) {
  // ===== TODO (LAB 3) =====================================
  // No headers and no body needed — there is nothing to send.
  // handleResponse returns null for the 204.
  //
    const res = await fetch(`${BASE_URL}/api/albums/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  // ========================================================
  // throw new Error('deleteAlbum() is not implemented yet — see Lab 3 (Day 3)');
}
