'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import ChessPiece3D from './ChessPiece3D'

const BOARD = {
  light: '#E8D0A8',
  dark: '#B08858',
  border: '#4A3520',
  selected: '#5BC05B',
  move: '#2EE02E',
  capture: '#FF5533',
  lastMove: '#FFF3CD',
  check: '#FF3333',
}

// Floating animation for selected piece
function FloatAnim({ children, active }) {
  const ref = useRef()
  useFrame((s) => {
    if (active && ref.current) {
      ref.current.position.y = Math.sin(s.clock.elapsedTime * 3) * 0.05
    }
  })
  return <group ref={ref}>{children}</group>
}

// Pulsing scale
function PulseAnim({ children, color, delay = 0 }) {
  const ref = useRef()
  useFrame((s) => {
    if (ref.current) {
      const t = s.clock.elapsedTime * 2.5 + delay
      ref.current.scale.setScalar(1 + Math.sin(t) * 0.12)
    }
  })
  return (
    <mesh ref={ref}>
      {children}
    </mesh>
  )
}

// === Board Scene ===
function BoardScene({
  boardState, selectedSquare, possibleMoves, lastMove, isCheck, flipped,
  onSquareClick,
}) {
  const squares = useMemo(() => {
    const out = []
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const isLight = (rank + file) % 2 === 0
        const dr = flipped ? 7 - rank : rank
        const df = flipped ? 7 - file : file
        const x = df - 3.5
        const z = dr - 3.5
        const fc = String.fromCharCode(97 + file)
        const rn = 8 - rank
        const name = `${fc}${rn}`
        let color = isLight ? BOARD.light : BOARD.dark
        if (lastMove && (name === lastMove.from || name === lastMove.to)) {
          color = new THREE.Color(color).lerp(new THREE.Color(BOARD.lastMove), 0.4).getStyle()
        }
        out.push({ name, x, z, color })
      }
    }
    return out
  }, [flipped, lastMove])

  const pieces = useMemo(() => {
    if (!boardState) return []
    const out = []
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const p = boardState[rank][file]
        if (!p) continue
        const dr = flipped ? 7 - rank : rank
        const df = flipped ? 7 - file : file
        const x = df - 3.5
        const z = dr - 3.5
        const fc = String.fromCharCode(97 + file)
        const rn = 8 - rank
        out.push({ ...p, sq: `${fc}${rn}`, pos: { x, z }, key: `${fc}${rn}-${p.color}-${p.type}` })
      }
    }
    return out
  }, [boardState, flipped])

  return (
    <group>
      {/* Border frame */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]}>
        <planeGeometry args={[8.8, 8.8]} />
        <meshStandardMaterial color={BOARD.border} roughness={0.8} />
      </mesh>

      {/* Squares */}
      {squares.map((sq) => {
        const hl = selectedSquare === sq.name
        const ck = isCheck === sq.name
        const isTarget = possibleMoves.some((m) => m.to === sq.name)
        const isCap = isTarget && possibleMoves.some((m) => m.to === sq.name && m.captured)

        let c = sq.color
        if (ck) c = BOARD.check
        else if (hl) c = BOARD.selected

        return (
          <group key={sq.name}>
            {/* Base square tile — clickable */}
            <mesh
              position={[sq.x, 0, sq.z]}
              onClick={(e) => { e.stopPropagation(); onSquareClick?.(sq.name) }}
            >
              <boxGeometry args={[0.97, 0.08, 0.97]} />
              <meshStandardMaterial
                color={c}
                roughness={hl ? 0.25 : 0.6}
                emissive={ck ? BOARD.check : hl ? BOARD.selected : '#000'}
                emissiveIntensity={ck ? 0.25 : hl ? 0.18 : 0}
              />
            </mesh>

            {/* === MOVE INDICATOR — INSIDE THE BOX === */}
            {isTarget && (
              <group position={[sq.x, 0.045, sq.z]}>
                {/* Common glow disc under the indicator */}
                <mesh position={[0, -0.01, 0]}>
                  <circleGeometry args={[0.32, 20]} />
                  <meshStandardMaterial
                    color={isCap ? BOARD.capture : BOARD.move}
                    transparent
                    opacity={0.15}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                  />
                </mesh>

                {isCap ? (
                  /* === CAPTURE: Square ring at edge of square === */
                  <PulseAnim color={BOARD.capture} delay={0.3}>
                    <ringGeometry args={[0.30, 0.44, 4]} />
                    <meshStandardMaterial
                      color={BOARD.capture}
                      transparent
                      opacity={0.6}
                      side={THREE.DoubleSide}
                      depthWrite={false}
                    />
                  </PulseAnim>
                ) : (
                  /* === VALID MOVE: Inner inset square with glow === */
                  <PulseAnim color={BOARD.move}>
                    <boxGeometry args={[0.55, 0.03, 0.55]} />
                    <meshStandardMaterial
                      color={BOARD.move}
                      transparent
                      opacity={0.5}
                      emissive={BOARD.move}
                      emissiveIntensity={0.15}
                    />
                  </PulseAnim>
                )}
              </group>
            )}
          </group>
        )
      })}

      {/* Pieces — pointerEvents="none" so clicks pass to squares */}
      {pieces.map((pc) => {
        const sel = selectedSquare === pc.sq
        return (
          <FloatAnim key={pc.key} active={sel}>
            <group position={[pc.pos.x, 0.10, pc.pos.z]} pointerEvents="none">
              {/* Shadow disc */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
                <circleGeometry args={[0.35, 16]} />
                <meshStandardMaterial color="#000" transparent opacity={0.12} depthWrite={false} />
              </mesh>
              <ChessPiece3D type={pc.type} color={pc.color} isSelected={sel} />
            </group>
          </FloatAnim>
        )
      })}

      {/* Labels */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const df = flipped ? 7 - i : i
        const x = df - 3.5
        const ch = String.fromCharCode(97 + i)
        return (
          <Text key={`f${ch}`} position={[x, -0.02, 4.3]} fontSize={0.22} color="#6B5B4E" anchorX="center" anchorY="top">
            {ch.toUpperCase()}
          </Text>
        )
      })}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const dr = flipped ? 7 - i : i
        const z = dr - 3.5
        const n = 8 - i
        return (
          <Text key={`r${n}`} position={[-4.3, -0.02, z]} fontSize={0.22} color="#6B5B4E" anchorX="center" anchorY="middle">
            {n}
          </Text>
        )
      })}
    </group>
  )
}

// === MAIN ===
export default function ChessBoard3D({
  boardState, selectedSquare, possibleMoves, lastMove, isCheck, flipped = false,
  onSquareClick,
}) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 7.5, 7], fov: 38, near: 0.1, far: 100 }}
        shadows
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.45} />
        <directionalLight position={[6, 12, 4]} intensity={1.0} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
        <directionalLight position={[-4, 5, -3]} intensity={0.3} />
        <directionalLight position={[0, 6, -8]} intensity={0.25} />
        <hemisphereLight args={['#C8E0FF', '#2A2A40', 0.5]} />

        <BoardScene
          boardState={boardState}
          selectedSquare={selectedSquare}
          possibleMoves={possibleMoves}
          lastMove={lastMove}
          isCheck={isCheck}
          flipped={flipped}
          onSquareClick={onSquareClick}
        />

        <OrbitControls
          enablePan={false} enableZoom={true}
          minDistance={5} maxDistance={18}
          maxPolarAngle={Math.PI / 2.05} minPolarAngle={Math.PI / 5}
          target={[0, 0, 0]} rotateSpeed={0.4}
        />
      </Canvas>
    </div>
  )
}
