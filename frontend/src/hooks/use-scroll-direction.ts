"use client"

import { useEffect, useRef, useState } from "react"

export function useScrollDirection() {
  const [isUp, setIsUp] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY

      if (current < lastScrollY.current) {
        setIsUp(true)
      } else {
        setIsUp(false)
      }

      lastScrollY.current = current
    }

    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return isUp
}
