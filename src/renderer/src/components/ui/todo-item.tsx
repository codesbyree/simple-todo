import { useEffect, useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import gsap from 'gsap'

import { TodoType, useTodoStore } from '@renderer/stores/use-todo-store'
import { soundService } from '@renderer/services/sound-service'
import { cn } from '@renderer/utils/cn'
import Checklist from './checklist'

type Props = {
  todo: TodoType
  index: number
  totalItem: number
}

function getCardPositionInList(
  index: number,
  totalItem: number
): 'single' | 'top' | 'middle' | 'bottom' {
  if (totalItem === 1) return 'single'
  if (index === 0) return 'top'
  if (index === totalItem - 1) return 'bottom'
  return 'middle'
}

function TodoItem({ todo, index, totalItem }: Props) {
  const cardPos = getCardPositionInList(index, totalItem)
  const removeTodo = useTodoStore((s) => s.removeTodo)
  const completeTodo = useTodoStore((s) => s.completeTodo)

  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLElement>(null)
  const isDragging = useRef(false)
  const hasDragIntent = useRef(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const currentVisualX = useRef(0)
  const isPastThresholdRef = useRef(false)

  const [isChecked, setIsChecked] = useState(todo.checked)
  const [isPastThreshold, setIsPastThreshold] = useState(false)
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null)

  useEffect(() => {
    setIsChecked(todo.checked)
  }, [todo.checked])

  const handleToggleCheck = () => {
    const nextState = !isChecked
    setIsChecked(nextState)

    if (nextState) {
      soundService.playTaskComplete()
    }

    // Give visual animation time to play before committing to store
    setTimeout(() => {
      completeTodo(todo.id)
    }, 350)
  }

  // Release the drag safely and snap back or delete
  const endDrag = (shouldCheckDelete = true) => {
    window.removeEventListener('pointermove', handleWindowPointerMove)
    window.removeEventListener('pointerup', handleWindowPointerUp)
    window.removeEventListener('pointercancel', handleWindowPointerUp)
    window.removeEventListener('blur', handleWindowPointerUp)

    if (!isDragging.current || !cardRef.current) return
    isDragging.current = false
    hasDragIntent.current = false

    const visualX = currentVisualX.current
    const THRESHOLD = 90

    if (shouldCheckDelete && Math.abs(visualX) >= THRESHOLD) {
      // Reached threshold: animate card out, collapse container height, then delete
      const targetX = visualX > 0 ? 380 : -380
      const tl = gsap.timeline({
        onComplete: () => removeTodo(todo.id)
      })

      tl.to(cardRef.current, {
        x: targetX,
        opacity: 0,
        duration: 0.22,
        ease: 'power2.in'
      }).to(
        containerRef.current,
        {
          height: 0,
          opacity: 0,
          duration: 0.16,
          ease: 'power2.out'
        },
        '-=0.06'
      )
    } else {
      // Snap back with snappy spring gravity
      gsap.to(cardRef.current, {
        x: 0,
        opacity: 1,
        duration: 0.35,
        ease: 'back.out(1.8)'
      })
    }

    currentVisualX.current = 0
    setIsPastThreshold(false)
    isPastThresholdRef.current = false
    setDragDirection(null)
  }

  const handleWindowPointerUp = () => {
    endDrag(true)
  }

  const handleWindowPointerMove = (e: PointerEvent) => {
    if (!isDragging.current || !cardRef.current) return

    // AUTO-RELEASE: If no mouse button is held down, immediately release and cancel drag
    if (e.buttons === 0) {
      endDrag(false)
      return
    }

    const dx = e.clientX - startX.current
    const dy = e.clientY - startY.current

    // Detect if movement is primarily vertical (user intends to scroll)
    if (!hasDragIntent.current) {
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) {
        // Cancel dragging so vertical scrolling proceeds smoothly
        endDrag(false)
        return
      }

      // Deadband: ignore tiny micro-jitters below 8px
      if (Math.abs(dx) < 8) return
      hasDragIntent.current = true
    }

    // Apply progressive resistance / gravity
    const sign = Math.sign(dx)
    const absDx = Math.abs(dx)
    const THRESHOLD = 90
    const MAX_DRAG = 120

    let visualX: number
    if (absDx < 100) {
      visualX = sign * (absDx * 0.6)
    } else {
      // Heavier damping past 100px cursor movement
      visualX = sign * (60 + (absDx - 100) * 0.3)
    }

    // Hard physical constraint: cannot drag beyond MAX_DRAG
    if (Math.abs(visualX) > MAX_DRAG) {
      visualX = sign * MAX_DRAG
    }

    currentVisualX.current = visualX

    // Update threshold indicator only when crossing boundary to avoid unnecessary re-renders
    const past = Math.abs(visualX) >= THRESHOLD
    if (past !== isPastThresholdRef.current) {
      isPastThresholdRef.current = past
      setIsPastThreshold(past)
    }

    setDragDirection(visualX > 0 ? 'right' : 'left')

    // Follow cursor with gravity-damped movement and subtle opacity fade
    gsap.set(cardRef.current, {
      x: visualX,
      opacity: Math.max(0.65, 1 - Math.abs(visualX) / 320)
    })
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only respond to primary (left) button
    if (e.button !== 0) return

    // Prevent drag when clicking the checklist button or interactive elements
    if ((e.target as HTMLElement).closest('button')) return

    // Kill any running tweens (e.g. from previous snap-back)
    if (cardRef.current) {
      gsap.killTweensOf(cardRef.current)
    }

    isDragging.current = true
    hasDragIntent.current = false
    isPastThresholdRef.current = false
    setIsPastThreshold(false)
    setDragDirection(null)

    startX.current = e.clientX
    startY.current = e.clientY
    currentVisualX.current = 0

    // Global window listeners guarantee release is never missed
    window.addEventListener('pointermove', handleWindowPointerMove)
    window.addEventListener('pointerup', handleWindowPointerUp)
    window.addEventListener('pointercancel', handleWindowPointerUp)
    window.addEventListener('blur', handleWindowPointerUp)
  }

  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove)
      window.removeEventListener('pointerup', handleWindowPointerUp)
      window.removeEventListener('pointercancel', handleWindowPointerUp)
      window.removeEventListener('blur', handleWindowPointerUp)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden select-none',
        cardPos === 'single' && 'rounded-lg',
        cardPos === 'top' && 'rounded-tl-lg rounded-tr-lg',
        cardPos === 'bottom' && 'rounded-bl-lg rounded-br-lg'
      )}
    >
      {/* Background delete indicators (revealed on drag left or right) */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-between px-4 text-white transition-colors duration-200',
          isPastThreshold ? 'bg-rose-600' : 'bg-rose-950/70',
          cardPos === 'single' && 'rounded-lg',
          cardPos === 'top' && 'rounded-tl-lg rounded-tr-lg',
          cardPos === 'bottom' && 'rounded-bl-lg rounded-br-lg'
        )}
      >
        <div
          className={cn(
            'flex items-center gap-1.5 transition-all duration-200',
            dragDirection === 'right' && isPastThreshold
              ? 'scale-110 text-white font-medium'
              : 'scale-90 text-white/50'
          )}
        >
          <Trash2 className="w-5 h-5" />
          {isPastThreshold && dragDirection === 'right' && (
            <span className="text-xs font-semibold tracking-tight">Delete</span>
          )}
        </div>

        <div
          className={cn(
            'flex items-center gap-1.5 transition-all duration-200',
            dragDirection === 'left' && isPastThreshold
              ? 'scale-110 text-white font-medium'
              : 'scale-90 text-white/50'
          )}
        >
          {isPastThreshold && dragDirection === 'left' && (
            <span className="text-xs font-semibold tracking-tight">Delete</span>
          )}
          <Trash2 className="w-5 h-5" />
        </div>
      </div>

      {/* Draggable & Hoverable Item Card */}
      <article
        ref={cardRef}
        onPointerDown={handlePointerDown}
        className={cn(
          'relative z-10 min-h-12.5 p-3 bg-todo-card shadow-todo-item-inner flex items-center justify-between gap-3 cursor-grab active:cursor-grabbing hover:brightness-95 transition-[filter,background-color] duration-150 touch-pan-y',
          cardPos === 'single' && 'rounded-lg',
          cardPos === 'top' && 'rounded-tl-lg rounded-tr-lg',
          cardPos === 'bottom' && 'rounded-bl-lg rounded-br-lg'
        )}
      >
        <h4
          className={cn(
            'text-todo-card-foreground text-base tracking-tight leading-5 line-clamp-3 select-none transition-all duration-200',
            isChecked && 'line-through text-todo-card-foreground-checked italic'
          )}
        >
          {todo.title}
        </h4>

        <Checklist checked={isChecked} onToggle={handleToggleCheck} />
      </article>
    </div>
  )
}

export default TodoItem
