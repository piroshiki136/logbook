import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"

type SignInButtonProps = {
  redirectTo: string
}

export function SignInButton({ redirectTo }: SignInButtonProps) {
  return (
    <form
      className="w-full"
      action={async () => {
        "use server"
        await signIn("github", { redirectTo })
      }}
    >
      <Button className="w-full" type="submit">
        Sign in
      </Button>
    </form>
  )
}
