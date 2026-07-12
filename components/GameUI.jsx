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
  playerColor = 'w',
  difficulty = 'medium',
}) {
  const [showHistory, setShowHistory] = useState(false)

  const capturedWhite = capturedPieces?.filter(p => p.color === 'w') || []
  const capturedBlack = capturedPieces?.filter(p => p.color === 'b') || []

  const playerWon = gameResult === playerColor

  const statusColor =
    status === 'check' ? 'text-yellow-300' :
    status === 'checkmate' ? (playerWon ? 'text-green-400' : 'text-red-400') :
    status === 'stalemate' ? 'text-blue-300' :
    'text-gray-200'

  const statusIcon =
    status === 'check' ? '⚡' :
    status === 'checkmate' ? (playerWon ? '👑' : '💀') :
    status === 'stalemate' ? '🤝' :
    ''

  return (
    <div className="flex flex-col h-full bg-gray-900/80 backdrop-blur-sm rounded-2xl lg:rounded-2xl p-3 lg:p-5 border border-gray-800/50 shadow-xl text-sm lg:text-base">
      {/* Top bar — condensed on mobile */}
      <div className="flex items-center justify-between lg:flex-col lg:text-center gap-2 mb-2 lg:mb-3">
        {/* Title & info: hidden on very small, shown as left + right on mobile */}
        <div className="flex items-center gap-2 lg:flex-col lg:gap-0.5">
          <h2 className="text-base lg:text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent leading-tight">
            ♟ 3D Chess
          </h2>
          <span className="hidden lg:block text-xs text-gray-500">
            You are <span className="text-white font-medium">{playerColor === 'w' ? 'White' : 'Black'}</span>
            <span className="mx-1.5">•</span>
            <span className={
              difficulty === 'easy' ? 'text-green-400' :
              difficulty === 'hard' ? 'text-red-400' :
              'text-amber-400'
            }>
              {difficulty === 'easy' ? '🌱 ' : difficulty === 'hard' ? '🔥 ' : '⚡ '}
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
          </span>
        </div>

        {/* Status pill — always visible */}
        <div className={`px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-lg font-semibold text-xs lg:text-sm ${statusColor} bg-gray-800/60 border border-gray-700/30 whitespace-nowrap`}>
          {statusIcon && <span className="mr-1">{statusIcon}</span>}
          {status === 'playing' && (isPlayerTurn ? 'Your Turn' : 'AI thinking...')}
          {status === 'check' && (isPlayerTurn ? '⚠️ Check!' : 'Opponent Check!')}
          {status === 'checkmate' && (playerWon ? 'You Win!' : 'AI Wins!')}
          {status === 'stalemate' && 'Draw!'}
          {status === 'draw' && 'Draw!'}
        </div>
      </div>

      {/* Mobile-only info row */}
      <div className="flex lg:hidden items-center justify-center gap-2 text-xs text-gray-500 mb-2">
        <span>You: <span className="text-white font-medium">{playerColor === 'w' ? 'White' : 'Black'}</span></span>
        <span className="text-gray-600">|</span>
        <span className={
          difficulty === 'easy' ? 'text-green-400' :
          difficulty === 'hard' ? 'text-red-400' :
          'text-amber-400'
        }>
          {difficulty === 'easy' ? '🌱 ' : difficulty === 'hard' ? '🔥 ' : '⚡ '}
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </span>
        <span className="text-gray-600">|</span>
        <span>Move {Math.ceil(moves.length / 2) || '—'}</span>
      </div>

      {/* Captured + History row — responsive grid */}
      <div className="flex gap-2 lg:flex-col mb-2 min-h-0 flex-1">
        {/* Captured — compact */}
        <div className="flex-1 lg:flex-none">
          <div className="text-xs text-gray-500 mb-0.5 lg:mb-1">
            <span className="hidden lg:inline">Captured by You:</span>
            <span className="lg:hidden">You took:</span>
          </div>
          <div className="tracking-wider text-sm lg:text-base text-white/80 bg-gray-800/30 rounded-lg px-2 py-1 min-h-[20px] lg:min-h-[24px]">
            {(playerColor === 'w' ? capturedBlack : capturedWhite).length > 0
              ? (playerColor === 'w' ? capturedBlack : capturedWhite).map((p, i) => (
                  <span key={i} className="mr-0.5">{PIECE_SYMBOLS[p.type.toUpperCase()]}</span>
                ))
              : <span className="text-gray-600 text-xs">—</span>}
          </div>
        </div>
        <div className="flex-1 lg:flex-none">
          <div className="text-xs text-gray-500 mb-0.5 lg:mb-1">
            <span className="hidden lg:inline">Captured by AI:</span>
            <span className="lg:hidden">AI took:</span>
          </div>
          <div className="tracking-wider text-sm lg:text-base text-white/80 bg-gray-800/30 rounded-lg px-2 py-1 min-h-[20px] lg:min-h-[24px]">
            {(playerColor === 'w' ? capturedWhite : capturedBlack).length > 0
              ? (playerColor === 'w' ? capturedWhite : capturedBlack).map((p, i) => (
                  <span key={i} className="mr-0.5">{PIECE_SYMBOLS[p.color === 'w' ? p.type.toUpperCase() : p.type]}</span>
                ))
              : <span className="text-gray-600 text-xs">—</span>}
          </div>
        </div>
      </div>

      {/* Move History — collapsible */}
      <div className="mt-auto">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-1.5 text-xs lg:text-sm text-gray-400 hover:text-white transition-colors w-full py-1"
        >
          <span>📜 Moves ({moves.length})</span>
          <svg
            className={`w-2.5 h-2.5 lg:w-3 lg:h-3 transition-transform ml-auto ${showHistory ? 'rotate-90' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {showHistory && (
          <div className="bg-gray-800/50 rounded-lg p-1.5 lg:p-2 max-h-24 lg:max-h-28 overflow-y-auto text-xs font-mono text-gray-400 mb-1">
            {moves.length === 0 ? (
              <p className="text-gray-600 text-center py-1">No moves yet</p>
            ) : (
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                {moves.map((move, i) => (
                  <span key={i} className="truncate text-[11px] lg:text-xs">
                    {i % 2 === 0 && <span className="text-gray-600 mr-0.5">{Math.floor(i / 2) + 1}.</span>}
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

      {/* Move count — desktop only */}
      <div className="hidden lg:block text-center text-xs text-gray-600 my-1">
        Move {Math.ceil(moves.length / 2) || '—'}
      </div>

      {/* Buttons — larger touch targets */}
      <div className="grid grid-cols-2 gap-2 lg:gap-2 mt-1 lg:mt-2">
        <button
          onClick={onNewGame}
          className="px-3 py-3 lg:py-2.5 text-sm bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl lg:rounded-lg font-medium hover:from-green-500 hover:to-emerald-500 transition-all active:scale-95 touch-manipulation"
        >
          New Game
        </button>
        <button
          onClick={onUndo}
          disabled={moves.length < 2}
          className="px-3 py-3 lg:py-2.5 text-sm bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl lg:rounded-lg font-medium hover:from-gray-500 hover:to-gray-600 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
        >
          Undo
        </button>
      </div>
    </div>
  )
}
