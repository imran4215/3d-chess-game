'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Chess } from 'chess.js'
import ChessBoard3D from './ChessBoard3D'
import GameUI from './GameUI'
import { getAIMove } from '@/lib/chessAI'

export default function Game() {
  const chessRef = useRef(new Chess())

  // Color & difficulty state
  const [playerColor, setPlayerColor] = useState(null)
  const [difficulty, setDifficulty] = useState('medium')
  const [gameStarted, setGameStarted] = useState(false)

  // Game state
  const [board, setBoard] = useState(chessRef.current.board())
  const [turn, setTurn] = useState('w')
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [possibleMoves, setPossibleMoves] = useState([])
  const [lastMove, setLastMove] = useState(null)
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [statusText, setStatusText] = useState('playing')
  const [aiThinking, setAiThinking] = useState(false)
  const [checkSquare, setCheckSquare] = useState(null)
  const [isGameOver, setIsGameOver] = useState(false)
  const [gameResult, setGameResult] = useState(null)

  // Refs
  const moveHistoryRef = useRef([])
  const capturedPiecesRef = useRef([])

  // Derived
  const aiColor = playerColor === 'w' ? 'b' : 'w'
  const boardFlipped = playerColor === 'b' // black at bottom for black player

  // === COLOR + DIFFICULTY PICKER ===
  const chooseColor = useCallback((color, diff) => {
    setPlayerColor(color)
    setDifficulty(diff)
    chessRef.current = new Chess()
    moveHistoryRef.current = []
    capturedPiecesRef.current = []
    setSelectedSquare(null)
    setPossibleMoves([])
    setLastMove(null)
    setCheckSquare(null)
    setAiThinking(false)
    setStatusText('playing')
    setIsGameOver(false)
    setGameResult(null)
    setTurn('w')
    setBoard(chessRef.current.board())
    setIsPlayerTurn(color === 'w') // white goes first
    setGameStarted(true)
  }, [])

  // Refresh state from chess.js
  const refreshState = useCallback(() => {
    const chess = chessRef.current
    setBoard([...chess.board()])
    setTurn(chess.turn())

    const isOver = chess.isGameOver()
    setIsGameOver(isOver)

    if (isOver) {
      setSelectedSquare(null)
      setPossibleMoves([])
      setCheckSquare(null)

      if (chess.isCheckmate()) {
        const winner = chess.turn() === 'w' ? 'b' : 'w'
        setStatusText('checkmate')
        setGameResult(winner)
      } else if (chess.isStalemate()) {
        setStatusText('stalemate')
        setGameResult(null)
      } else if (chess.isDraw()) {
        setStatusText('draw')
        setGameResult(null)
      }
    } else if (chess.isCheck()) {
      setStatusText('check')
      const b = chess.board()
      for (let r = 0; r < 8; r++) {
        for (let f = 0; f < 8; f++) {
          const p = b[r][f]
          if (p && p.type === 'k' && p.color === chess.turn()) {
            const file = String.fromCharCode(97 + f)
            const rank = r + 1
            setCheckSquare(`${file}${rank}`)
            break
          }
        }
      }
    } else {
      setStatusText('playing')
      setCheckSquare(null)
    }

    if (playerColor) {
      setIsPlayerTurn(chess.turn() === playerColor)
    }
  }, [playerColor])

  // AI move handler
  const makeAIMove = useCallback(async () => {
    if (!playerColor) return
    setAiThinking(true)
    await new Promise(r => setTimeout(r, 400))

    const chess = chessRef.current
    if (chess.isGameOver() || chess.turn() !== aiColor) {
      setAiThinking(false)
      return
    }

    try {
      const move = getAIMove(chess.fen(), difficulty)
      if (move) {
        chess.move(move)
        const verbose = chess.history({ verbose: true })
        const last = verbose[verbose.length - 1]
        if (last) {
          moveHistoryRef.current = [...moveHistoryRef.current, last]
          setLastMove({ from: last.from, to: last.to })
          if (last.captured) {
            capturedPiecesRef.current = [
              ...capturedPiecesRef.current,
              { type: last.captured, color: last.color === 'w' ? 'b' : 'w' },
            ]
          }
        }
        refreshState()
      }
    } catch (e) {
      console.error('AI error:', e)
    }
    setAiThinking(false)
  }, [refreshState, playerColor, aiColor, difficulty])

  // Watch for AI turn
  useEffect(() => {
    if (!playerColor || !gameStarted) return
    if (turn === aiColor && !isGameOver && !aiThinking) {
      makeAIMove()
    }
  }, [turn, isGameOver, aiThinking, makeAIMove, playerColor, aiColor, gameStarted])

  // AI first move when player is black
  useEffect(() => {
    if (gameStarted && playerColor === 'b' && turn === 'w' && !aiThinking && !isGameOver) {
      makeAIMove()
    }
  }, [gameStarted, playerColor, turn, aiThinking, isGameOver, makeAIMove])

  // Select a piece
  const selectSquare = useCallback((square) => {
    setSelectedSquare(square)
    const moves = chessRef.current.moves({ square, verbose: true })
    setPossibleMoves(moves)
  }, [])

  // Execute a move
  const executeMove = useCallback((from, to) => {
    const chess = chessRef.current
    try {
      const move = chess.move({ from, to, promotion: 'q' })
      if (!move) return false

      moveHistoryRef.current = [...moveHistoryRef.current, move]
      setLastMove({ from: move.from, to: move.to })

      if (move.captured) {
        capturedPiecesRef.current = [
          ...capturedPiecesRef.current,
          { type: move.captured, color: move.color === 'w' ? 'b' : 'w' },
        ]
      }

      setSelectedSquare(null)
      setPossibleMoves([])
      refreshState()
      return true
    } catch (e) {
      return false
    }
  }, [refreshState])

  // Click on square
  const handleSquareClick = useCallback((square) => {
    if (!playerColor || turn !== playerColor || aiThinking || isGameOver) return

    const isTarget = possibleMoves.some(m => m.to === square)
    if (isTarget) {
      executeMove(selectedSquare, square)
      return
    }

    // Select own piece
    const chess = chessRef.current
    const b = chess.board()
    const f = square.charCodeAt(0) - 97
    const r = parseInt(square[1]) - 1
    const piece = b[7 - r]?.[f]
    if (piece && piece.color === playerColor) {
      selectSquare(square)
    } else {
      setSelectedSquare(null)
      setPossibleMoves([])
    }
  }, [playerColor, turn, aiThinking, isGameOver, possibleMoves, selectedSquare, executeMove, selectSquare])

  // New game — go back to color picker
  const handleNewGame = useCallback(() => {
    setPlayerColor(null)
    setGameStarted(false)
    setSelectedSquare(null)
    setPossibleMoves([])
    setLastMove(null)
    setCheckSquare(null)
    setAiThinking(false)
    setIsPlayerTurn(true)
    setStatusText('playing')
    setIsGameOver(false)
    setGameResult(null)
    chessRef.current = new Chess()
    moveHistoryRef.current = []
    capturedPiecesRef.current = []
    setTurn('w')
    setBoard(chessRef.current.board())
  }, [])

  // Undo
  const handleUndo = useCallback(() => {
    if (moveHistoryRef.current.length < 2) {
      handleNewGame()
      return
    }

    const chess = chessRef.current
    chess.undo()
    chess.undo()
    moveHistoryRef.current = moveHistoryRef.current.slice(0, -2)

    const allMoves = chess.history({ verbose: true })
    capturedPiecesRef.current = allMoves
      .filter(m => m.captured)
      .map(m => ({ type: m.captured, color: m.color === 'w' ? 'b' : 'w' }))

    setSelectedSquare(null)
    setPossibleMoves([])
    setLastMove(null)
    refreshState()
  }, [refreshState, handleNewGame])

  // Save game
  const handleSaveGame = useCallback(async () => {
    if (!gameResult || !playerColor) return
    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          result: gameResult,
          termination: statusText === 'checkmate' ? 'checkmate' : 'draw',
          moves: moveHistoryRef.current.map(m => m.san),
          pgn: chessRef.current.pgn(),
          playerName: playerColor === 'w' ? 'Player (White)' : 'Player (Black)',
        }),
      })
      const data = await res.json()
      if (data.success) alert('Game saved! 🎉')
    } catch {
      alert('MongoDB not available. Game saved locally.')
    }
  }, [gameResult, statusText, playerColor])

  const playerWon = gameResult === playerColor

  // ===== RENDER =====
  return (
    <div className="w-full h-screen bg-[#0a0a1a] flex">
      {/* 3D Board */}
      <div className="flex-1 relative">
        {gameStarted && (
          <ChessBoard3D
            boardState={board}
            selectedSquare={selectedSquare}
            possibleMoves={possibleMoves}
            lastMove={lastMove}
            isCheck={checkSquare}
            flipped={boardFlipped}
            onSquareClick={handleSquareClick}
          />
        )}

        {/* AI Thinking overlay */}
        {aiThinking && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-amber-400 px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2.5 border border-amber-500/30 shadow-lg z-10">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
            </div>
            AI is thinking...
          </div>
        )}

        {/* Game Over overlay */}
        {isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="bg-black/85 backdrop-blur-md rounded-2xl px-10 py-6 text-center border border-white/10 shadow-2xl">
              <p className="text-5xl mb-2">
                {playerWon ? '🏆' : gameResult ? '😞' : '🤝'}
              </p>
              <p className="text-2xl font-bold text-white">
                {playerWon ? 'You Win!' : gameResult ? 'AI Wins!' : 'Draw!'}
              </p>
              <p className="text-gray-400 text-sm mt-1 capitalize">{statusText}</p>
              <button
                onClick={handleNewGame}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg font-semibold text-black hover:from-amber-400 hover:to-orange-400 transition-all"
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {/* Color + Difficulty Picker Overlay */}
        {!gameStarted && (
          <div className="absolute inset-0 flex items-center justify-center z-30 bg-[#0a0a1a]">
            <div className="bg-gray-900/90 backdrop-blur-md rounded-3xl px-10 py-8 text-center border border-gray-800/50 shadow-2xl max-w-lg">
              <p className="text-5xl mb-2">♟️</p>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-1">
                3D Chess
              </h2>
              <p className="text-gray-400 text-sm mb-6">vs AI — Choose your side & difficulty</p>

              {/* Difficulty */}
              <div className="flex gap-2 justify-center mb-6">
                {['easy', 'medium', 'hard'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                      difficulty === d
                        ? d === 'easy' ? 'bg-green-600 text-white shadow-lg' :
                          d === 'medium' ? 'bg-amber-600 text-white shadow-lg' :
                          'bg-red-600 text-white shadow-lg'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {d === 'easy' && '🌱 '}
                    {d === 'medium' && '⚡ '}
                    {d === 'hard' && '🔥 '}
                    {d}
                  </button>
                ))}
              </div>

              {/* Color */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => chooseColor('w', difficulty)}
                  className="flex flex-col items-center gap-2 px-8 py-5 rounded-2xl bg-gradient-to-b from-gray-100 to-gray-300 text-gray-900 hover:from-white hover:to-gray-200 transition-all hover:scale-105 active:scale-95 shadow-lg border-2 border-transparent hover:border-amber-400"
                >
                  <span className="text-5xl">♔</span>
                  <span className="font-bold text-lg">White</span>
                  <span className="text-xs text-gray-500">First move</span>
                </button>
                <button
                  onClick={() => chooseColor('b', difficulty)}
                  className="flex flex-col items-center gap-2 px-8 py-5 rounded-2xl bg-gradient-to-b from-gray-800 to-gray-950 text-white hover:from-gray-700 hover:to-gray-900 transition-all hover:scale-105 active:scale-95 shadow-lg border-2 border-gray-700 hover:border-amber-400"
                >
                  <span className="text-5xl">♚</span>
                  <span className="font-bold text-lg">Black</span>
                  <span className="text-xs text-gray-400">AI starts</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Side Panel */}
      {gameStarted && (
        <div className="w-72 lg:w-80 p-3 flex flex-col">
          <GameUI
            status={statusText}
            turn={turn}
            moves={moveHistoryRef.current}
            capturedPieces={capturedPiecesRef.current}
            isPlayerTurn={isPlayerTurn}
            gameResult={gameResult}
            onNewGame={handleNewGame}
            onUndo={handleUndo}
            onSaveGame={handleSaveGame}
            playerColor={playerColor}
            difficulty={difficulty}
          />
        </div>
      )}
    </div>
  )
}
