import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"

export function SignInButton() {
  return (
    <form
      className="w-full"
      action={async () => {
        "use server"
        await signIn("github", { redirectTo: "/admin" })
      }}
    >
      <Button className="w-full" type="submit">
        Sign in
      </Button>
    </form>
  )
}
