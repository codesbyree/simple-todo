import { useRef } from 'react'
import { Check } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

type ChecklistProps = {
  checked?: boolean
  onToggle?: () => void
}

function Checklist({ checked = false, onToggle }: ChecklistProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const checkRef = useRef<SVGSVGElement>(null)
  const isFirstRender = useRef(true)

  useGSAP(
    () => {
      if (isFirstRender.current) {
        isFirstRender.current = false
        if (checkRef.current) {
          gsap.set(checkRef.current, {
            scale: checked ? 1 : 0,
            opacity: checked ? 1 : 0
          })
        }
        return
      }

      if (checked) {
        gsap.fromTo(
          buttonRef.current,
          { scale: 0.85 },
          { scale: 1, duration: 0.35, ease: 'back.out(2)' }
        )
        gsap.fromTo(
          checkRef.current,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(2.5)' }
        )
      } else {
        gsap.to(checkRef.current, {
          scale: 0,
          opacity: 0,
          duration: 0.15,
          ease: 'power2.in'
        })
      }
    },
    { dependencies: [checked] }
  )

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onToggle}
      aria-label={checked ? 'Mark as incomplete' : 'Mark as complete'}
      className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center bg-[#8e94d4] border-2 border-white/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)] cursor-pointer select-none transition-transform hover:scale-105 active:scale-90"
    >
      <Check
        ref={checkRef}
        className="w-4 h-4 text-white stroke-[3.5]"
      />
    </button>
  )
}

export default Checklist
