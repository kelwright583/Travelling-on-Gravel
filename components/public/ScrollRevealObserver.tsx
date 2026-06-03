'use client'

import { useEffect } from 'react'

export function ScrollRevealObserver() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.scroll-reveal')
    if (!els.length) return

    const observer = new IntersectionObserver(
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

    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return null
}
