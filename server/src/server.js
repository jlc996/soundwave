import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Album from './models/Album.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------------------------------------------
// CONNECT TO THE DATABASE
//
// This runs once, when the server starts. If it fails there is no
// point continuing — every route would throw — so we exit loudly
// instead of starting a server that cannot do anything.
// ---------------------------------------------------------------

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
} catch (err) {
  console.error('Could not connect to MongoDB:', err.message);
  process.exit(1);
}

// ---------------------------------------------------------------
// 1. MIDDLEWARE  (runs on every request, before the routes)
// ---------------------------------------------------------------

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',')
  : ['http://localhost:5173'];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// A malformed id like "banana" is not a valid MongoDB ObjectId.
// Passing it to findById throws a CastError and crashes the route,
// so we check first. A weird id is not a server fault — it is just
// a thing that does not exist. 404, never 500.
function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ---------------------------------------------------------------
// 2. ROUTES
//
// Every route is now async, because talking to a database takes
// time. Every route has try/catch, because an unhandled error in
// an async route crashes the WHOLE server, not just this request.
// ---------------------------------------------------------------

app.get('/', (req, res) => {
  res.send('The SoundWave server is running!');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// READ ALL  ------------------------------------------------------
// GET /api/albums
// GET /api/albums?artist=nirv     (partial, case-insensitive)
app.get('/api/albums', async (req, res, next) => {
  try {
    const { artist } = req.query;

    // Build the filter. No artist means no filter: {} matches everything.
    const filter = artist
      ? { artist: { $regex: artist, $options: 'i' } }
      : {};

    const albums = await Album.find(filter).sort({ createdAt: -1 });

    // An empty result is a SUCCESSFUL search that found nothing.
    // 200 with [], never 404.
    res.json(albums);
  } catch (err) {
    next(err);
  }
});

// READ ONE  ------------------------------------------------------
app.get('/api/albums/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ message: 'Album not found' });
    }

    const album = await Album.findById(req.params.id);

    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    res.json(album);
  } catch (err) {
    next(err);
  }
});

// CREATE  --------------------------------------------------------
app.post('/api/albums', async (req, res, next) => {
  try {
    const { title, artist, year } = req.body;

    // Guard clauses: handle the bad cases first, return early.
    if (!title || !artist) {
      return res.status(400).json({ message: 'Title and artist are required' });
    }

    if (year !== undefined && (typeof year !== 'number' || year < 1900 || year > 2100)) {
      return res
        .status(400)
        .json({ message: 'Year must be a number between 1900 and 2100' });
    }

    // Only the fields we expect. Never hand req.body straight to the
    // database — a client could send fields you did not plan for, and
    // Mongo has no idea which ones you meant to allow.
    //
    // Note there is no id here. Mongo generates _id itself, which is
    // the same rule as before: the SERVER owns ids.
    const album = await Album.create({ title, artist, year });

    res.status(201).json(album);
  } catch (err) {
    next(err);
  }
});

// UPDATE (partial)  ----------------------------------------------
app.patch('/api/albums/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ message: 'Album not found' });
    }

    const { title, artist, year } = req.body;

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ message: 'Title cannot be empty' });
    }
    if (artist !== undefined && !artist.trim()) {
      return res.status(400).json({ message: 'Artist cannot be empty' });
    }
    if (year !== undefined && (typeof year !== 'number' || year < 1900 || year > 2100)) {
      return res
        .status(400)
        .json({ message: 'Year must be a number between 1900 and 2100' });
    }

    // PATCH only touches fields that were actually sent.
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (artist !== undefined) updates.artist = artist;
    if (year !== undefined) updates.year = year;

    const album = await Album.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,          // return the UPDATED document, not the old one
        runValidators: true, // re-check the schema rules on update
      }
    );

    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    res.json(album);
  } catch (err) {
    next(err);
  }
});

// DELETE  --------------------------------------------------------
app.delete('/api/albums/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ message: 'Album not found' });
    }

    const album = await Album.findByIdAndDelete(req.params.id);

    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    // 204 No Content — nothing to send back.
    // Do NOT use res.json() here. A 204 must have an empty body.
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------
// 3. CATCH-ALL 404  (after all routes)
// ---------------------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    message: `No route for ${req.method} ${req.originalUrl}`,
  });
});

// ---------------------------------------------------------------
// 4. ERROR HANDLER  (FOUR parameters, always last)
// ---------------------------------------------------------------

app.use((err, req, res, next) => {
  console.error(err); // details go to YOUR terminal

  // Mongoose rejected the data because it broke a schema rule.
  // Without this branch the user sees "Something went wrong" instead
  // of "Title is required", and a 500 instead of a 400.
  if (err.name === 'ValidationError') {
    const firstMessage = Object.values(err.errors)[0]?.message;
    return res.status(400).json({ message: firstMessage || 'Invalid data' });
  }

  res.status(500).json({ message: 'Something went wrong on the server' });
});

// ---------------------------------------------------------------
// 5. START LISTENING
// ---------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
