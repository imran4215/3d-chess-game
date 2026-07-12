import { Chess } from 'chess.js'

// Piece values
const PIECE_VALUES = {
  p: 100,  // pawn
  n: 320,  // knight
  b: 330,  // bishop
  r: 500,  // rook
  q: 900,  // queen
  k: 20000 // king
}

// Piece-Square Tables (index 0-63, a8 to h1)
// Pawn table - encourages center control and advancement
const PAWN_TABLE = [
   0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0,
]

// Knight table - center is good
const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
]

// Bishop table - prefer diagonals and center
const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
]

// Rook table - prefer open files and center (seventh rank bonus)
const ROOK_TABLE = [
   0,  0,  0,  0,  0,  0,  0,  0,
   5, 10, 10, 10, 10, 10, 10,  5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
   0,  0,  0,  5,  5,  0,  0,  0,
]

// Queen table - center and attack
const QUEEN_TABLE = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20,
]

// King middle game table - safer in corners
const KING_TABLE = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20,
]

const PIECE_TABLES = {
  p: PAWN_TABLE,
  n: KNIGHT_TABLE,
  b: BISHOP_TABLE,
  r: ROOK_TABLE,
  q: QUEEN_TABLE,
  k: KING_TABLE,
}

// Flip table for black pieces (mirror vertically)
function getTableIndex(square, isWhite) {
  const file = square % 8
  const rank = Math.floor(square / 8)
  if (isWhite) {
    // White: rank 0 (a8) maps to table row 0, rank 7 (a1) maps to table row 7
    return rank * 8 + file
  } else {
    // Black: rank 0 (a8) maps to table row 7, rank 7 (a1) maps to table row 0
    return (7 - rank) * 8 + file
  }
}

// Evaluate a single piece's position
function evaluatePiece(piece, square) {
  const isWhite = piece.color === 'w'
  const idx = getTableIndex(square, isWhite)
  const table = PIECE_TABLES[piece.type]
  return table ? table[idx] : 0
}

// Evaluate the full board from AI's perspective (positive = good for AI)
function evaluateBoard(game) {
  const board = game.board()
  let score = 0

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file]
      if (!piece) continue

      const squareIndex = rank * 8 + file
      const pieceValue = PIECE_VALUES[piece.type]
      const positionBonus = evaluatePiece(
        { type: piece.type, color: piece.color },
        squareIndex
      )

      if (piece.color === 'b') {
        score += pieceValue + positionBonus  // AI is black
      } else {
        score -= pieceValue + positionBonus  // Player is white
      }
    }
  }

  // Mobility bonus (number of legal moves)
  const moves = game.moves({ verbose: false })
  const isAI = game.turn() === 'b'
  score += isAI ? moves.length * 2 : -moves.length * 2

  // Checkmate detection
  if (game.isCheckmate()) {
    if (game.turn() === 'b') {
      // Black is checkmated, white wins → bad for AI
      score = -99999
    } else {
      // White is checkmated, black wins → good for AI
      score = 99999
    }
  }

  return score
}

// Minimax with Alpha-Beta pruning
function minimax(game, depth, alpha, beta, isMaximizing) {
  // Terminal check
  if (depth === 0) {
    return { score: evaluateBoard(game) }
  }

  if (game.isGameOver()) {
    const score = evaluateBoard(game)
    // Favor checkmates that happen sooner
    return { score: score > 0 ? score - depth * 10 : score + depth * 10 }
  }

  const moves = game.moves()
  // Move ordering: captures first for better pruning
  moves.sort((a, b) => {
    const captureDiff = (b.includes('x') ? 1 : 0) - (a.includes('x') ? 1 : 0)
    if (captureDiff !== 0) return captureDiff
    // Prefer promotions
    return (b.includes('=') ? 1 : 0) - (a.includes('=') ? 1 : 0)
  })

  let bestMove = moves[0]

  if (isMaximizing) {
    let maxScore = -Infinity
    for (const move of moves) {
      game.move(move)
      const result = minimax(game, depth - 1, alpha, beta, false)
      game.undo()

      if (result.score > maxScore) {
        maxScore = result.score
        bestMove = move
      }
      alpha = Math.max(alpha, maxScore)
      if (beta <= alpha) break // Beta cutoff
    }
    return { score: maxScore, move: bestMove }
  } else {
    let minScore = Infinity
    for (const move of moves) {
      game.move(move)
      const result = minimax(game, depth - 1, alpha, beta, true)
      game.undo()

      if (result.score < minScore) {
        minScore = result.score
        bestMove = move
      }
      beta = Math.min(beta, minScore)
      if (beta <= alpha) break // Alpha cutoff
    }
    return { score: minScore, move: bestMove }
  }
}

// Get AI move based on difficulty level
export function getBestMove(fen, depth = 3) {
  const game = new Chess(fen)
  const isMaximizing = game.turn() === 'b'
  const result = minimax(game, depth, -Infinity, Infinity, isMaximizing)
  return result.move
}

// Main AI entry point with difficulty levels
export function getAIMove(fen, difficulty = 'medium') {
  const game = new Chess(fen)
  const moves = game.moves()
  if (moves.length === 0) return null

  switch (difficulty) {
    case 'easy':
      // 50% random move, 50% shallow (depth 2) minimax
      if (Math.random() < 0.5) {
        return moves[Math.floor(Math.random() * moves.length)]
      }
      return getBestMove(fen, 2)

    case 'hard':
      // Depth 4 — stronger play (might be slower in complex positions)
      return getBestMove(fen, 4)

    case 'medium':
    default:
      // Depth 3 with some variety (10% random)
      if (Math.random() < 0.1) {
        return moves[Math.floor(Math.random() * moves.length)]
      }
      return getBestMove(fen, 3)
  }
}
