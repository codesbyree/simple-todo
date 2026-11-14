import { PlusIcon, XIcon } from 'lucide-react'
import { SyntheticEvent, useEffect, useRef, useState } from 'react'

import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

import { useTodoStore } from '@renderer/stores/use-todo-store'
import { useNavigationStore } from '@renderer/stores/use-navigation-store'

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
        x: isInTodoPage ? 0 : '-100%',
        filter: isInTodoPage ? 'blur(0px)' : 'blur(12px)',
        ease: 'power3.out',
        duration: 0.2
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
    <button
      ref={buttonRef}
      onClick={handleOnOpen}
      className="w-13.5 h-13.5 cursor-pointer border-none outline-none rounded-full grid place-items-center bg-(image:--gradient-custom-radial) hover:bg-(image:--gradient-custom-radial-hover) text-white/60 fixed bottom-5 right-15 z-102 backdrop-blur-lg shadow-fab-inner opacity-0"
    >
      <PlusIcon />
    </button>
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
        className="relative z-20 w-75 h-max p-3 bg-form rounded-xl flex flex-col gap-6"
      >
        <header className="flex justify-between items-center text-form-header">
          <h2 className="text-lg font-semibold tracking-tight">Add Todo</h2>

          <button
            type="button"
            onClick={animateAndClose}
            className="cursor-pointer border-none focus:outline-0"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="todo-title" className="text-input-label tracking-tight text-base">
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
              className="rounded-tl-md tracking-tight rounded-tr-sm border border-input-ring focus:border-input-ring-focus outline-none! bg-input text-input-text placeholder:text-input-placeholder p-2.5 text-base"
            ></input>
          </div>

          <button
            type="submit"
            disabled={isSubmitButtonReady}
            className="disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-md px-3 py-1 text-sm font-semibold tracking-tight text-input-button-foreground bg-input-button h-10 text-center w-full hover:bg-input-button-hover transition-colors"
          >
            Create todo
          </button>
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
