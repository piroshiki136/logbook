import Link from "next/link"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatArticleDate } from "../lib/format-article-date"

interface ArticlePrevNextCardProps {
  href: string
  title: string
  id: number
  dateValue?: string
  label: string
}

export function ArticlePrevNextCard(props: ArticlePrevNextCardProps) {
  const { href, title, id, dateValue, label } = props
  const formattedDate = dateValue ? formatArticleDate(dateValue) : undefined

  return (
    <article
      className="group flex w-full flex-col md:flex-1"
      data-article-id={String(id)}
    >
      <p className="mb-2 text-sm font-medium text-muted-foreground">{label}</p>
      <Link href={href} className="block h-full">
        <Card className="h-full transition-colors group-hover:bg-muted/50">
          <CardHeader>
            <CardTitle
              className="leading-snug"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {title}
            </CardTitle>
            {formattedDate && (
              <CardDescription>{formattedDate}</CardDescription>
            )}
          </CardHeader>
        </Card>
      </Link>
    </article>
  )
}
