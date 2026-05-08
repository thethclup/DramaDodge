import { GAME_SPEED_INITIAL, GRAVITY, JUMP_FORCE, PLAYER_SIZE, OBSTACLE_WIDTH, GROUND_HEIGHT, DramaType, PowerupType } from './constants'

export interface GameState {
    score: number
    distance: number
    hype: number
    isGameOver: boolean
    isPaused: boolean
    combo: number
}

interface Rect {
    x: number
    y: number
    w: number
    h: number
}

function rectIntersect(r1: Rect, r2: Rect) {
    return !(r2.x > r1.x + r1.w || 
             r2.x + r2.w < r1.x || 
             r2.y > r1.y + r1.h ||
             r2.y + r2.h < r1.y)
}

export class GameEngine {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    width: number
    height: number

    state: GameState = {
        score: 0,
        distance: 0,
        hype: 0,
        isGameOver: false,
        isPaused: false,
        combo: 0
    }

    onStateChange: (state: GameState) => void

    // Entities
    player = {
        x: 50,
        y: 0,
        vy: 0,
        w: PLAYER_SIZE,
        h: PLAYER_SIZE,
        isGrounded: false,
        isSliding: false,
        tiltMode: false,
        shielded: false
    }

    obstacles: { x: number, y: number, w: number, h: number, type: DramaType, speedOffset: number }[] = []
    powerups: { x: number, y: number, w: number, h: number, type: PowerupType }[] = []
    particles: { x: number, y: number, vx: number, vy: number, life: number, maxLife: number, color: string, text?: string }[] = []

    gameSpeed = GAME_SPEED_INITIAL
    lastTime = 0
    reqId: number | null = null
    
    framesSequence = 0

    constructor(canvas: HTMLCanvasElement, onStateChange: (s: GameState) => void) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')!
        this.width = canvas.width
        this.height = canvas.height
        this.onStateChange = onStateChange
        
        this.player.y = this.height - GROUND_HEIGHT - PLAYER_SIZE
    }

    start() {
        this.lastTime = performance.now()
        this.loop(this.lastTime)
    }

    stop() {
        if (this.reqId) cancelAnimationFrame(this.reqId)
    }

    reset() {
        this.state = {
            score: 0,
            distance: 0,
            hype: 0,
            isGameOver: false,
            isPaused: false,
            combo: 0
        }
        this.player.y = this.height - GROUND_HEIGHT - PLAYER_SIZE
        this.player.vy = 0
        this.player.isGrounded = true
        this.player.isSliding = false
        this.player.tiltMode = false
        this.player.shielded = false
        this.obstacles = []
        this.powerups = []
        this.particles = []
        this.gameSpeed = GAME_SPEED_INITIAL
        this.framesSequence = 0
        this.onStateChange(this.state)
        this.notifyState()
    }

    jump() {
        if (this.state.isGameOver) return
        if (this.player.isGrounded) {
            let jupmMod = this.player.tiltMode ? -10 : JUMP_FORCE
            this.player.vy = jupmMod
            this.player.isGrounded = false
            this.player.isSliding = false
            this.spawnParticles(this.player.x, this.player.y + this.player.h, 5, '#ffffff')
        }
    }

    slide() {
        if (this.state.isGameOver) return
        if (this.player.isGrounded) {
            this.player.isSliding = true
            this.player.h = PLAYER_SIZE / 2
            this.player.y = this.height - GROUND_HEIGHT - this.player.h
            setTimeout(() => {
                this.player.isSliding = false
                this.player.h = PLAYER_SIZE
                this.player.y = this.height - GROUND_HEIGHT - this.player.h
            }, 600) // Slide duration
        } else {
            this.player.vy += 5 // Fast fall
        }
    }

    spawnObstacle() {
        const types = [DramaType.Ratio, DramaType.FUD, DramaType.CancelWave]
        const type = types[Math.floor(Math.random() * types.length)]
        
        let y = this.height - GROUND_HEIGHT - 40
        if (type === DramaType.CancelWave) {
             y -= 60 // Flying obstacle
        }
        
        this.obstacles.push({
            x: this.width,
            y,
            w: 40,
            h: 40,
            type,
            speedOffset: Math.random() * 2
        })
    }

    spawnPowerup() {
        const types = [PowerupType.Like, PowerupType.GM, PowerupType.BasedOrb]
        const type = types[Math.floor(Math.random() * types.length)]
        this.powerups.push({
            x: this.width + 100,
            y: this.height - GROUND_HEIGHT - 40 - Math.random() * 100,
            w: 30,
            h: 30,
            type
        })
    }

    spawnParticles(x: number, y: number, count: number, color: string, text?: string) {
        for (let i=0; i<count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 0,
                maxLife: 30 + Math.random() * 30,
                color,
                text
            })
        }
    }

    update(dt: number) {
        if (this.state.isGameOver || this.state.isPaused) return

        this.framesSequence++
        this.gameSpeed += dt * 0.0001
        this.state.distance += dt * 0.01 * this.gameSpeed

        // Player physics
        this.player.vy += GRAVITY
        this.player.y += this.player.vy

        // Ground collision
        if (this.player.y + this.player.h >= this.height - GROUND_HEIGHT) {
            this.player.y = this.height - GROUND_HEIGHT - this.player.h
            this.player.vy = 0
            this.player.isGrounded = true
        }

        // Spawning
        if (this.framesSequence % Math.max(30, Math.floor(120 - this.gameSpeed * 5)) === 0 && Math.random() < 0.6) {
            this.spawnObstacle()
        }
        if (this.framesSequence % 150 === 0 && Math.random() < 0.4) {
            this.spawnPowerup()
        }

        const playerRect = { x: this.player.x, y: this.player.y, w: this.player.w, h: this.player.h }

        // Update Obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i]
            obs.x -= (this.gameSpeed + obs.speedOffset)

            if (rectIntersect(playerRect, obs)) {
                if (this.player.shielded) {
                    this.player.shielded = false
                    this.state.hype = Math.max(0, this.state.hype - 30)
                    this.spawnParticles(obs.x, obs.y, 10, '#00ffff', 'SHIELD BREAK!')
                    this.obstacles.splice(i, 1)
                } else {
                    this.state.isGameOver = true
                    this.spawnParticles(this.player.x, this.player.y, 20, '#ff0000', 'CANCELLED!')
                    this.notifyState()
                }
            } else if (obs.x + obs.w < 0) {
                // Dodged successfully
                this.state.score += 10
                this.state.combo++
                this.obstacles.splice(i, 1)
                if (this.state.combo % 10 === 0 && this.state.combo > 0) {
                    this.spawnParticles(this.player.x, this.player.y - 50, 1, '#ff00ff', `${this.state.combo} COMBO!`)
                }
            }
        }

        // Update Powerups
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const pu = this.powerups[i]
            pu.x -= this.gameSpeed

            if (rectIntersect(playerRect, pu)) {
                this.state.score += 50
                this.state.hype = Math.min(100, this.state.hype + 20)
                if (this.state.hype >= 100 && !this.player.shielded) {
                    this.player.shielded = true
                    this.spawnParticles(this.player.x, this.player.y, 10, '#00ff00', 'HYPE SHIELD!')
                } else if (pu.type === PowerupType.GM) {
                    this.spawnParticles(this.player.x, this.player.y, 5, '#ffee00', 'GM!')
                } else {
                    this.spawnParticles(this.player.x, this.player.y, 5, '#ffff00')
                }
                this.powerups.splice(i, 1)
            } else if (pu.x + pu.w < 0) {
                this.powerups.splice(i, 1)
            }
        }

        // Update Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i]
            p.x += p.vx
            p.y += p.vy
            p.life++
            if (p.life >= p.maxLife) {
                this.particles.splice(i, 1)
            }
        }
        
        if (this.framesSequence % 10 === 0) {
             this.notifyState()
        }
    }

    draw() {
        const ctx = this.ctx as CanvasRenderingContext2D
        ctx.clearRect(0, 0, this.width, this.height)

        // Draw sky / background grid
        ctx.fillStyle = '#0f172a' // slate-900
        ctx.fillRect(0, 0, this.width, this.height)
        
        // Grid lines moving
        ctx.strokeStyle = '#1e293b'
        ctx.lineWidth = 2
        const gridOffset = (this.state.distance * 10) % 50
        for(let i=0; i<this.width/50 + 1; i++) {
           ctx.beginPath()
           ctx.moveTo(i*50 - gridOffset, 0)
           ctx.lineTo(i*50 - gridOffset, this.height)
           ctx.stroke()
        }

        // Draw Ground
        ctx.fillStyle = '#1e293b'
        ctx.fillRect(0, this.height - GROUND_HEIGHT, this.width, GROUND_HEIGHT)
        // Ground neon line
        ctx.fillStyle = '#8b5cf6' // violet
        ctx.fillRect(0, this.height - GROUND_HEIGHT, this.width, 5)

        // Draw Player
        ctx.fillStyle = this.player.shielded ? '#22d3ee' : '#a855f7'
        ctx.fillRect(this.player.x, this.player.y, this.player.w, this.player.h)
        // Player eyes (funny meme face hint)
        ctx.fillStyle = '#fff'
        ctx.fillRect(this.player.x + 25, this.player.y + 10, 5, 5)
        ctx.fillRect(this.player.x + 32, this.player.y + 10, 5, 5)

        // Draw Obstacles
        this.obstacles.forEach(obs => {
            if (obs.type === DramaType.Ratio) ctx.fillStyle = '#ef4444'
            else if (obs.type === DramaType.FUD) ctx.fillStyle = '#f97316'
            else ctx.fillStyle = '#dc2626'
            
            ctx.fillRect(obs.x, obs.y, obs.w, obs.h)
            
            ctx.fillStyle = '#fff'
            ctx.font = 'bold 12px monospace'
            ctx.textAlign = 'center'
            ctx.fillText(obs.type, obs.x + obs.w/2, obs.y - 10)
        })

        // Draw Powerups
        this.powerups.forEach(pu => {
            if (pu.type === PowerupType.GM) ctx.fillStyle = '#fbbf24'
            else ctx.fillStyle = '#34d399'
            
            ctx.beginPath()
            ctx.arc(pu.x + pu.w/2, pu.y + pu.h/2, pu.w/2, 0, Math.PI * 2)
            ctx.fill()
            
            ctx.fillStyle = '#000'
            ctx.font = 'bold 10px monospace'
            ctx.textAlign = 'center'
            let t = pu.type === PowerupType.Like ? '❤' : (pu.type === PowerupType.GM ? 'GM' : 'PEPE')
            ctx.fillText(t, pu.x + pu.w/2, pu.y + pu.h/2 + 3)
        })

        // Draw Particles
        this.particles.forEach(p => {
             ctx.globalAlpha = 1 - (p.life / p.maxLife)
             if (p.text) {
                 ctx.fillStyle = p.color
                 ctx.font = 'bold 20px monospace'
                 ctx.fillText(p.text, p.x, p.y)
             } else {
                 ctx.fillStyle = p.color
                 ctx.fillRect(p.x, p.y, 4, 4)
             }
             ctx.globalAlpha = 1.0
        })
    }

    loop = (time: number) => {
        const dt = time - this.lastTime
        this.lastTime = time

        // Cap dt to prevent massive jumps when tab is inactive
        if (dt < 100) {
            this.update(dt)
        }
        
        this.draw()

        if (!this.state.isGameOver) {
            this.reqId = requestAnimationFrame(this.loop)
        }
    }
    
    notifyState() {
        this.onStateChange({...this.state})
    }
}
