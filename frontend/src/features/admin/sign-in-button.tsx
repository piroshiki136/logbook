"use client"

import { signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"

export function SignInButton() {
  return (
    <Button
      className="w-full shadow-md shadow-black/10 mt-6"
      type="button"
      onClick={() => signIn("github", { callbackUrl: "/admin" })}
    >
      Sign in with GitHub
    </Button>
  )
}
