import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react'

interface RevealProps extends HTMLMotionProps<'div'> {
  /** stagger index -- delays entrance by index * 90ms, capped at 360ms, matching sibling reveal order */
  index?: number
}

/**
 * Fades + rises content into view once it crosses the viewport, replacing the
 * old hand-rolled IntersectionObserver + direct el.style mutation.
 */
export function Reveal({ index = 0, children, ...props }: RevealProps) {
  const reduceMotion = useReducedMotion()
  const delay = reduceMotion ? 0 : Math.min(index * 0.09, 0.36)

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 38, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reduceMotion ? 0.15 : 1.05, delay, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
