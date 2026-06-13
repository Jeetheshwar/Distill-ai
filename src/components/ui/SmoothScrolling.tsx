"use client"
import { ReactLenis } from 'lenis/react'

export function SmoothScrolling({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 0.8, smoothWheel: true }}>
      {children}
    </ReactLenis>
  )
}
