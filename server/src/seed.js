import 'dotenv/config';
import mongoose from 'mongoose';
import Album from './models/Album.js';

const startingAlbums = [
  { title: 'Nevermind',           artist: 'Nirvana',        year: 1991 },
  { title: 'Rumours',             artist: 'Fleetwood Mac',  year: 1977 },
  { title: 'Kind of Blue',        artist: 'Miles Davis',    year: 1959 },
  { title: 'Discovery',           artist: 'Daft Punk',      year: 2001 },
  { title: 'To Pimp a Butterfly', artist: 'Kendrick Lamar', year: 2015 },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Safety net: never wipe a real database by accident.
    if (process.env.NODE_ENV === 'production') {
      console.error('Refusing to seed a production database.');
      process.exit(1);
    }

    await Album.deleteMany({});
    console.log('Cleared existing albums');

    const created = await Album.insertMany(startingAlbums);
    console.log(`Added ${created.length} albums`);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

seed();
