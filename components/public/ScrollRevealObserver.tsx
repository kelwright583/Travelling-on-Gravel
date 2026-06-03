'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function ScrollRevealObserver() {
  const pathname = usePathname()

  useEffect(() => {
    let observer: IntersectionObserver

    const setup = () => {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible')
              observer.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.08, rootMargin: '0px 0px -50px 0px' },
      )

      document
        .querySelectorAll<HTMLElement>('.scroll-reveal:not(.visible)')
        .forEach((el) => observer.observe(el))
    }

    // rAF ensures new page content is in the DOM before we query
    const raf = requestAnimationFrame(setup)

    return () => {
      cancelAnimationFrame(raf)
      observer?.disconnect()
    }
  }, [pathname])

  return null
}
