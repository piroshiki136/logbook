import { signOut } from "@/auth"
import { Button } from "@/components/ui/button"

export function SignOutButton() {
  return (
    <form
      className="w-full"
      action={async () => {
        "use server"
        await signOut()
      }}
    >
      <Button className="w-full" type="submit">
        Sign Out
      </Button>
    </form>
  )
}
