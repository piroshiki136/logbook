import type { ReactNode } from "react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type AdminAuthCardProps = {
  title: string
  description: string
  footer?: ReactNode
}

export function AdminAuthCard({
  title,
  description,
  footer,
}: AdminAuthCardProps) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-gray-600">{description}</CardContent>
      <CardFooter className="flex-col gap-2 ">{footer}</CardFooter>
    </Card>
  )
}
