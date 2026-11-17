import { PlusIcon, XIcon } from 'lucide-react'
import { SyntheticEvent, useEffect, useRef, useState } from 'react'

import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

import { useTodoStore } from '@renderer/stores/use-todo-store'
import { useNavigationStore } from '@renderer/stores/use-navigation-store'

import Button from '../ui/button'

function AddTodoModal() {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)

  const handleOnClose = () => {
    setIsModalVisible(false)
  }

  const handleOnOpen = () => {
    setIsModalVisible(true)
  }

  return (
    <>
      <AddTodoButton handleOnOpen={handleOnOpen} />
      {isModalVisible && <AddTodoForm handleOnClose={handleOnClose} />}
    </>
  )
}

type AddTodoButtonProps = {
  handleOnOpen: () => void
}

function AddTodoButton({ handleOnOpen }: AddTodoButtonProps) {
  const activePage = useNavigationStore((s) => s.activeNavigation)
  const isInTodoPage = activePage === 'todo'

  const buttonRef = useRef<HTMLButtonElement | null>(null)

  useGSAP(
    () => {
      if (!buttonRef.current) return

      gsap.to(buttonRef.current, {
        autoAlpha: isInTodoPage ? 1 : 0,
        keyframes: { scale: isInTodoPage ? [0, 1.1, 1] : [1, 0] },
        x: isInTodoPage ? 0 : -30,
        filter: isInTodoPage ? 'blur(0px)' : 'blur(12px)',
        ease: 'power3.out',
        duration: 0.3
      })
    },
    {
      dependencies: [activePage]
    }
  )

  useEffect(() => {
    const openModalWhenShortcutPressed = (ev: KeyboardEvent) => {
      const pressedKey = ev.key.toLowerCase()
      const isCtrlorCmd = ev.ctrlKey || ev.metaKey

      if (pressedKey === 'n' && isCtrlorCmd && activePage === 'todo') {
        ev.preventDefault()
        handleOnOpen()
      }
    }

    window.addEventListener('keydown', openModalWhenShortcutPressed)

    return () => window.removeEventListener('keydown', openModalWhenShortcutPressed)
  }, [])

  return (
    <Button
      ref={buttonRef}
      onClick={handleOnOpen}
      className="w-13.5 h-13.5 transition-none cursor-pointer border border-white/30 outline-none rounded-full grid place-items-center bg-(image:--gradient-custom-radial) hover:bg-(image:--gradient-custom-radial-hover) text-nav-icon/70 fixed bottom-5 right-18 z-102 backdrop-blur-xl shadow-fab-inner opacity-0"
    >
      <PlusIcon />
    </Button>
  )
}

function AddTodoForm({ handleOnClose }: { handleOnClose: () => void }) {
  const createTodo = useTodoStore((s) => s.addTodo)
  const [todoTitle, setTodoTitle] = useState<string>('')

  const containerRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLElement>(null)
  const backdropRef = useRef<HTMLSpanElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)

  const { contextSafe } = useGSAP(
    () => {
      tl.current = gsap
        .timeline()
        .fromTo(
          backdropRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.25, ease: 'power2.out' }
        )
        .fromTo(
          modalRef.current,
          { opacity: 0, y: 60, scale: 0.95, filter: 'blur(12px)' },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.25,
            ease: 'back.out(1.7)'
          },
          '<0.05'
        )

      inputRef.current?.focus()
    },
    {
      scope: containerRef
    }
  )

  const animateAndClose = contextSafe(() => {
    if (tl.current) {
      tl.current.reverse().eventCallback('onReverseComplete', () => {
        handleOnClose()
      })
    } else handleOnClose()
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') animateAndClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [animateAndClose])

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault()

    createTodo(todoTitle)
    animateAndClose()
  }

  const isSubmitButtonReady = todoTitle.trim().length <= 0

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 w-full h-full z-103 grid place-items-center"
    >
      <section
        ref={modalRef}
        className="relative z-20 w-75 h-max p-4 bg-card rounded-3xl flex flex-col gap-6"
      >
        <header className="flex justify-between items-center text-card-foreground">
          <h2 className="text-lg font-semibold tracking-tight">Add Todo</h2>

          <Button onClick={animateAndClose} size="icon" variant="ghost">
            <XIcon className="w-6 h-6" />
          </Button>
        </header>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="todo-title"
              className="text-secondary-foreground tracking-tight text-base"
            >
              What to do
            </label>

            <input
              ref={inputRef}
              id="todo-title"
              placeholder="Do something amazing"
              value={todoTitle}
              onChange={(e) => setTodoTitle(e.target.value)}
              type="text"
              inputMode="text"
              autoFocus
              className="rounded-tr-xl rounded-tl-xl tracking-tight border border-white/30 focus:border-white/60 outline-none! bg-secondary-foreground text-secondary placeholder:text-secondary/70 p-2.5 text-base"
            ></input>
          </div>

          <Button type="submit" disabled={isSubmitButtonReady}>
            Create todo
          </Button>
        </form>
      </section>

      <span
        ref={backdropRef}
        onClick={animateAndClose}
        className="absolute w-full h-full bg-neutral-950/50 backdrop-blur-lg"
      />
    </div>
  )
}

export default AddTodoModal
