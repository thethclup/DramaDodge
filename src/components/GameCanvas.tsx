import React, { useEffect, useRef } from 'react'
import { GameEngine, GameState } from '../game/engine'

interface GameCanvasProps {
  onStateChange: (state: GameState) => void
  isStarted: boolean
  triggerReset: number
}

export function GameCanvas({ onStateChange, isStarted, triggerReset }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<GameEngine | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    
    // Set to fixed resolution and scale via CSS for simplicity, or scale to window size
    // For mobile-first, we'll try to fill width up to max-w-md, with a fixed height.
    canvas.width = window.innerWidth > 600 ? 600 : window.innerWidth
    canvas.height = window.innerHeight > 800 ? 500 : window.innerHeight * 0.6

    engineRef.current = new GameEngine(canvas, onStateChange)
    
    return () => {
      engineRef.current?.stop()
    }
  }, []) // Init once

  useEffect(() => {
    if (isStarted && engineRef.current) {
        engineRef.current.reset()
        engineRef.current.start()
    } else {
        engineRef.current?.stop()
    }
  }, [isStarted, triggerReset])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!engineRef.current) return
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault()
            engineRef.current.jump()
        } else if (e.code === 'ArrowDown') {
            e.preventDefault()
            engineRef.current.slide()
        }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handlePointerDown = (e: React.PointerEvent) => {
     if (!engineRef.current) return
     const { clientY } = e
     const rect = canvasRef.current?.getBoundingClientRect()
     if (!rect) return
     
     const y = clientY - rect.top
     // click top half=jump, bottom half=slide
     if (y < rect.height / 2) {
         engineRef.current.jump()
     } else {
         engineRef.current.slide()
     }
  }

  return (
    <canvas 
        ref={canvasRef} 
        onPointerDown={handlePointerDown}
        className="block bg-[#0a0a0a] mx-auto touch-none shadow-[0_0_40px_rgba(0,255,255,0.1)] w-full h-[60vh] max-h-[500px] object-contain border-4 border-[#222] rounded-none"
        style={{ touchAction: 'none' }} // Prevent scrolling while touching canvas
    />
  )
}
