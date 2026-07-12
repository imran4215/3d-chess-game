---
name: 3d-chess-game
description: 3D Chess game - MERN stack with Next.js, Three.js, chess.js AI
metadata:
  type: project
---

# 3D Chess Game (User vs AI)

A fully 3D chess game built with Next.js 14, Three.js (react-three-fiber), and chess.js.

**Key Files:**
- `components/Game.jsx` — Main game orchestrator (state, turn management, AI integration)
- `components/ChessBoard3D.jsx` — 3D board with r3f Canvas, lighting, orbit controls
- `components/ChessPiece3D.jsx` — All 6 piece types built with LatheGeometry + primitives
- `components/GameUI.jsx` — Side panel (status, history, captures, controls)
- `lib/chessAI.js` — Minimax AI with alpha-beta pruning (depth 3), piece-square tables

**Piece Design (LatheGeometry):**
Each piece uses a revolved lathe profile for an elegant curved body, plus distinct top features:
- Pawn: curved body + sphere head
- Rook: straight body + battlements (8 blocks)
- Knight: curved body + box/cube horse head + snout + ear
- Bishop: tapered body + mitre cone
- Queen: curved body + crown ring + 6 crown spheres
- King: widest curved body + cross (tallest piece)

**Colors:**
- White: #F5F0E8 body, #D4A843 gold accents
- Black: #1C1C30 body, #8899AA silver accents

**AI:** Minimax depth 3 with move ordering, piece-square tables, mobility evaluation.

**Run:** `npm run dev` → http://localhost:3000
