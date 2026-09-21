import mongoose from 'mongoose';

// A schema describes the SHAPE an album is allowed to have.
// Mongo will reject anything that breaks these rules.
const albumSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    artist: {
      type: String,
      required: [true, 'Artist is required'],
      trim: true,
    },
    year: {
      type: Number,
      min: [1900, 'Year must be 1900 or later'],
      max: [2100, 'Year must be 2100 or earlier'],
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt for free
  }
);

// ---------------------------------------------------------------
// THE MOST IMPORTANT BLOCK IN THIS FILE
//
// MongoDB names its id field "_id", but our API has sent "id" since
// Day 1 and the frontend depends on it.
//
// Rather than change the frontend, we make the database match the
// promise our API already made. This is why swapping to MongoDB
// does not touch a single file in client/.
//
// Delete this block and your React keys break.
// ---------------------------------------------------------------
albumSchema.set('toJSON', {
  virtuals: true, // adds a string "id" field
  versionKey: false, // hides "__v"
  transform: (doc, ret) => {
    delete ret._id;
    return ret;
  },
});

export default mongoose.model('Album', albumSchema);
