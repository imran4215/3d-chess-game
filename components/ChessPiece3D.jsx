'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

// === COLORS ===
const C = {
  w: '#F5F0E8',
  wA: '#E8E0D0',
  wG: '#D4A843',
  b: '#1C1C30',
  bA: '#2C2C48',
  bG: '#8899AA',
}

function mat(color, metalness = 0.25, roughness = 0.35) {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness })
}

function goldMat() {
  return new THREE.MeshStandardMaterial({ color: C.wG, metalness: 0.8, roughness: 0.15 })
}

function silverMat() {
  return new THREE.MeshStandardMaterial({ color: C.bG, metalness: 0.85, roughness: 0.12 })
}

function lathe(points, color, metalness, roughness) {
  const vec2 = points.map(([r, y]) => new THREE.Vector2(r, y))
  const geo = new THREE.LatheGeometry(vec2, 28)
  return new THREE.Mesh(geo, mat(color, metalness, roughness))
}

// === PAWN ===
function PawnBody({ w }) {
  const parts = useMemo(() => {
    const body = lathe([
      [0.38, 0], [0.42, 0.04], [0.42, 0.06],
      [0.38, 0.08], [0.30, 0.10], [0.28, 0.22],
      [0.26, 0.34], [0.22, 0.40], [0.16, 0.42],
      [0.10, 0.44], [0.06, 0.46],
    ], w ? C.w : C.b, 0.3, 0.35)

    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.12, 0.08, 12),
      mat(w ? C.wA : C.bA)
    )
    neck.position.y = 0.49

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 16, 14),
      mat(w ? C.w : C.b, 0.35, 0.3)
    )
    head.position.y = 0.58

    return [body, neck, head]
  }, [w])

  return parts.map((m, i) => <primitive key={i} object={m} />)
}

// === ROOK ===
function RookBody({ w }) {
  const parts = useMemo(() => {
    const body = lathe([
      [0.38, 0], [0.42, 0.04], [0.42, 0.06],
      [0.38, 0.08], [0.34, 0.08], [0.34, 0.42],
      [0.36, 0.46], [0.40, 0.48], [0.40, 0.52],
    ], w ? C.w : C.b, 0.3, 0.35)

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.045, 8, 20),
      mat(w ? C.wA : C.bA, 0.5, 0.25)
    )
    ring.position.y = 0.54
    ring.rotation.x = Math.PI / 2

    const bMat = mat(w ? C.w : C.b, 0.35, 0.3)
    const b = (dx, dz) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), bMat)
      m.position.set(dx, 0.62, dz)
      return m
    }

    return [
      body, ring,
      b(0.22, 0), b(-0.22, 0), b(0, 0.22), b(0, -0.22),
      b(0.16, 0.16), b(-0.16, 0.16), b(0.16, -0.16), b(-0.16, -0.16),
    ]
  }, [w])

  return parts.map((m, i) => <primitive key={i} object={m} />)
}

// === KNIGHT ===
function KnightBody({ w }) {
  const parts = useMemo(() => {
    const body = lathe([
      [0.38, 0], [0.42, 0.04], [0.42, 0.06],
      [0.38, 0.08], [0.32, 0.08], [0.30, 0.22],
      [0.28, 0.30], [0.26, 0.34],
    ], w ? C.w : C.b, 0.3, 0.35)

    const mainColor = w ? C.w : C.b
    const acColor = w ? C.wA : C.bA

    const torso = new THREE.Mesh(
      new THREE.CylinderGeometry(0.20, 0.28, 0.12, 12), mat(mainColor)
    )
    torso.position.set(0.04, 0.38, 0)
    torso.rotation.z = 0.08

    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.12, 0.08, 10), mat(acColor)
    )
    neck.position.set(0.12, 0.48, 0)
    neck.rotation.z = 0.25

    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.08, 0.12), mat(mainColor)
    )
    head.position.set(0.20, 0.52, 0)
    head.rotation.z = -0.05

    const snout = new THREE.Mesh(
      new THREE.BoxGeometry(0.10, 0.05, 0.06), mat(acColor)
    )
    snout.position.set(0.34, 0.50, 0)

    const ear = new THREE.Mesh(
      new THREE.ConeGeometry(0.03, 0.08, 6), mat(acColor)
    )
    ear.position.set(0.18, 0.58, 0.06)

    const eyeMat = w ? goldMat() : silverMat()
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 6), eyeMat)
    eye.position.set(0.26, 0.53, 0.06)

    return [body, torso, neck, head, snout, ear, eye]
  }, [w])

  return parts.map((m, i) => <primitive key={i} object={m} />)
}

// === BISHOP ===
function BishopBody({ w }) {
  const parts = useMemo(() => {
    const body = lathe([
      [0.38, 0], [0.42, 0.04], [0.42, 0.06],
      [0.38, 0.08], [0.32, 0.08], [0.28, 0.18],
      [0.25, 0.30], [0.22, 0.36], [0.18, 0.40],
      [0.14, 0.42],
    ], w ? C.w : C.b, 0.3, 0.35)

    const acColor = w ? C.wA : C.bA

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.035, 8, 16), mat(acColor, 0.5, 0.25)
    )
    ring.position.y = 0.44
    ring.rotation.x = Math.PI / 2

    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.08, 0.06, 10), mat(acColor)
    )
    neck.position.y = 0.48

    const mitre = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 0.22, 14), mat(w ? C.w : C.b, 0.35, 0.3)
    )
    mitre.position.y = 0.60
    mitre.rotation.x = 0.03

    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 6, 6), w ? goldMat() : silverMat()
    )
    ball.position.y = 0.72

    return [body, ring, neck, mitre, ball]
  }, [w])

  return parts.map((m, i) => <primitive key={i} object={m} />)
}

// === QUEEN ===
function QueenBody({ w }) {
  const parts = useMemo(() => {
    const body = lathe([
      [0.40, 0], [0.44, 0.04], [0.44, 0.06],
      [0.40, 0.08], [0.35, 0.08], [0.32, 0.20],
      [0.30, 0.32], [0.28, 0.38], [0.24, 0.42],
      [0.18, 0.44], [0.14, 0.46],
    ], w ? C.w : C.b, 0.3, 0.35)

    const acMat = mat(w ? C.wA : C.bA, 0.5, 0.25)
    const decoMat = w ? goldMat() : silverMat()

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.035, 8, 16), acMat)
    ring.position.y = 0.36
    ring.rotation.x = Math.PI / 2

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.10, 0.06, 10), acMat)
    neck.position.y = 0.50

    const crownRing = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 8, 14), decoMat)
    crownRing.position.y = 0.56
    crownRing.rotation.x = Math.PI / 2

    const pts = []
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      const pt = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), decoMat)
      pt.position.set(Math.cos(angle) * 0.13, 0.60, Math.sin(angle) * 0.13)
      pts.push(pt)
    }

    const top = new THREE.Mesh(new THREE.SphereGeometry(0.10, 14, 12), mat(w ? C.w : C.b, 0.35, 0.3))
    top.position.y = 0.60

    return [body, ring, neck, crownRing, ...pts, top]
  }, [w])

  return parts.map((m, i) => <primitive key={i} object={m} />)
}

// === KING ===
function KingBody({ w }) {
  const parts = useMemo(() => {
    const body = lathe([
      [0.40, 0], [0.44, 0.04], [0.44, 0.06],
      [0.40, 0.08], [0.36, 0.08], [0.34, 0.22],
      [0.32, 0.36], [0.30, 0.44], [0.26, 0.48],
      [0.20, 0.50], [0.16, 0.52],
    ], w ? C.w : C.b, 0.3, 0.35)

    const acMat = mat(w ? C.wA : C.bA, 0.5, 0.25)
    const decoMat = w ? goldMat() : silverMat()

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.30, 0.035, 8, 16), acMat)
    ring.position.y = 0.38
    ring.rotation.x = Math.PI / 2

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.06, 10), acMat)
    neck.position.y = 0.55

    const crown = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.04, 8, 16), decoMat)
    crown.position.y = 0.61
    crown.rotation.x = Math.PI / 2

    const pts = []
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      const pt = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 6), decoMat)
      pt.position.set(Math.cos(angle) * 0.16, 0.65, Math.sin(angle) * 0.16)
      pts.push(pt)
    }

    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.04), decoMat)
    crossV.position.y = 0.73

    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.04), decoMat)
    crossH.position.y = 0.69

    return [body, ring, neck, crown, ...pts, crossV, crossH]
  }, [w])

  return parts.map((m, i) => <primitive key={i} object={m} />)
}

// === PIECE MAP ===
const PIECES = { p: PawnBody, r: RookBody, n: KnightBody, b: BishopBody, q: QueenBody, k: KingBody }

// === MAIN EXPORT ===
export default function ChessPiece3D({ type, color, isSelected }) {
  const Component = PIECES[type]
  if (!Component) return null
  return (
    <group scale={isSelected ? 1.08 : 1}>
      <Component w={color === 'w'} />
    </group>
  )
}
