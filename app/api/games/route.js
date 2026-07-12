import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Game from '@/models/Game'

// GET /api/games - Get game history
export async function GET() {
  try {
    await connectDB()
    const games = await Game.find()
      .sort({ playedAt: -1 })
      .limit(20)
      .select('result termination moves playerName playedAt')
      .lean()
    return NextResponse.json({ games })
  } catch (error) {
    console.error('Error fetching games:', error)
    // Return empty array if DB is not available
    return NextResponse.json({ games: [] })
  }
}

// POST /api/games - Save a game result
export async function POST(request) {
  try {
    await connectDB()
    const body = await request.json()
    const game = await Game.create({
      result: body.result,
      termination: body.termination || '',
      moves: body.moves || [],
      pgn: body.pgn || '',
      playerName: body.playerName || 'Player',
      duration: body.duration || 0,
    })
    return NextResponse.json({ success: true, game })
  } catch (error) {
    console.error('Error saving game:', error)
    return NextResponse.json({ success: false, error: 'Failed to save game' }, { status: 500 })
  }
}
