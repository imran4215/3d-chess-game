'use client'

import { useState } from 'react'

const PIECE_SYMBOLS = {
  p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
  P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔',
}

export default function GameUI({
  status,
  turn,
  moves,
  capturedPieces,
  isPlayerTurn,
  gameResult,
  onNewGame,
  onUndo,
  onSaveGame,
  playerColor = 'w',
  difficulty = 'medium',
}) {
  const [showHistory, setShowHistory] = useState(false)

  const capturedWhite = capturedPieces?.filter(p => p.color === 'w') || []
  const capturedBlack = capturedPieces?.filter(p => p.color === 'b') || []

  const playerWon = gameResult === playerColor

  const statusColor =
    status === 'check' ? 'text-yellow-400' :
    status === 'checkmate' ? (playerWon ? 'text-green-400' : 'text-red-500') :
    status === 'stalemate' ? 'text-blue-400' :
    'text-gray-300'

  const statusIcon =
    status === 'check' ? '⚡' :
    status === 'checkmate' ? (playerWon ? '👑' : '💀') :
    status === 'stalemate' ? '🤝' :
    ''

  return (
    <div className="flex flex-col h-full bg-gray-900/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-800/50 shadow-xl">
      {/* Title */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
          3D Chess
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">You are <span className="text-white font-medium">{playerColor === 'w' ? 'White' : 'Black'}</span>
          <span className="mx-1.5">•</span>
          <span className={
            difficulty === 'easy' ? 'text-green-400' :
            difficulty === 'hard' ? 'text-red-400' :
            'text-amber-400'
          }>
            {difficulty === 'easy' ? '🌱 ' : difficulty === 'hard' ? '🔥 ' : '⚡ '}
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </span>
        </p>
      </div>

      {/* Game Status */}
      <div className={`text-center py-2.5 px-3 rounded-xl mb-3 font-semibold text-sm ${statusColor} bg-gray-800/50 border border-gray-700/30`}>
        {statusIcon && <span className="mr-1.5">{statusIcon}</span>}
        {status === 'playing' && (isPlayerTurn ? '🎯 Your Turn' : '🤔 AI is thinking...')}
        {status === 'check' && (isPlayerTurn ? '⚠️ You are in Check!' : '⚠️ Opponent in Check!')}
        {status === 'checkmate' && (playerWon ? '🎉 You Win by Checkmate!' : '😔 AI Wins by Checkmate!')}
        {status === 'stalemate' && '🤝 Stalemate — Draw!'}
        {status === 'draw' && '🤝 Draw!'}
      </div>

      {/* Turn Indicator */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className={`w-4 h-4 rounded-full border-2 ${turn === 'w' ? 'bg-white border-gray-300 shadow-sm' : 'bg-gray-800 border-gray-600'}`} />
        <span className="text-sm text-gray-400">
          {turn === playerColor ? "Your Turn" : "AI's Turn"}
        </span>
      </div>

      {/* Captured Pieces */}
      <div className="mb-3 text-sm">
        <p className="text-xs text-gray-500 mb-1">Captured by You:</p>
        <div className="tracking-wider text-base text-white/80 bg-gray-800/30 rounded-lg px-2 py-1 min-h-[24px]">
          {(playerColor === 'w' ? capturedBlack : capturedWhite).length > 0
            ? (playerColor === 'w' ? capturedBlack : capturedWhite).map((p, i) => (
                <span key={i} className="mr-0.5">{PIECE_SYMBOLS[p.type.toUpperCase()]}</span>
              ))
            : <span className="text-gray-600 text-xs">—</span>}
        </div>
        <p className="text-xs text-gray-500 mb-1 mt-2">Captured by AI:</p>
        <div className="tracking-wider text-base text-white/80 bg-gray-800/30 rounded-lg px-2 py-1 min-h-[24px]">
          {(playerColor === 'w' ? capturedWhite : capturedBlack).length > 0
            ? (playerColor === 'w' ? capturedWhite : capturedBlack).map((p, i) => (
                <span key={i} className="mr-0.5">{PIECE_SYMBOLS[p.color === 'w' ? p.type.toUpperCase() : p.type]}</span>
              ))
            : <span className="text-gray-600 text-xs">—</span>}
        </div>
      </div>

      {/* Move History */}
      <div className="flex-1 min-h-0">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-2 w-full"
        >
          <span>📜 Move History ({moves.length})</span>
          <svg
            className={`w-3 h-3 transition-transform ml-auto ${showHistory ? 'rotate-90' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {showHistory && (
          <div className="bg-gray-800/50 rounded-lg p-2 max-h-32 overflow-y-auto text-xs font-mono text-gray-400 scrollbar-thin">
            {moves.length === 0 ? (
              <p className="text-gray-600 text-center py-2">No moves yet</p>
            ) : (
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                {moves.map((move, i) => (
                  <span key={i} className="truncate">
                    {i % 2 === 0 && <span className="text-gray-600 mr-1">{Math.floor(i / 2) + 1}.</span>}
                    <span className={move.color === 'w' ? 'text-gray-200' : 'text-gray-400'}>
                      {move.san}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Move count */}
      <div className="text-center text-xs text-gray-600 my-2">
        Move {Math.ceil(moves.length / 2) || '—'}
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        <button
          onClick={onNewGame}
          className="px-3 py-2.5 text-sm bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-medium hover:from-green-500 hover:to-emerald-500 transition-all active:scale-95"
        >
          New Game
        </button>
        <button
          onClick={onUndo}
          disabled={moves.length < 2}
          className="px-3 py-2.5 text-sm bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg font-medium hover:from-gray-500 hover:to-gray-600 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Undo
        </button>
      </div>
    </div>
  )
}
