import mongoose from 'mongoose'

const GameSchema = new mongoose.Schema({
  result: {
    type: String,
    enum: ['white', 'black', 'draw', 'ongoing'],
    default: 'ongoing',
  },
  termination: {
    type: String,
    enum: ['checkmate', 'stalemate', 'resignation', 'draw', 'timeout', ''],
    default: '',
  },
  moves: {
    type: [String],
    default: [],
  },
  pgn: {
    type: String,
    default: '',
  },
  playerName: {
    type: String,
    default: 'Player',
  },
  aiDifficulty: {
    type: String,
    default: 'medium',
  },
  playedAt: {
    type: Date,
    default: Date.now,
  },
  duration: {
    type: Number, // in seconds
    default: 0,
  },
})

export default mongoose.models.Game || mongoose.model('Game', GameSchema)
