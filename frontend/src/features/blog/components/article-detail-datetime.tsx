import { formatArticleDateTime } from "../lib/format-article-datetime"

type ArticleDetailDateTimeProps = {
  value: string
  className?: string
}

export function ArticleDetailDateTime(props: ArticleDetailDateTimeProps) {
  const { value, className } = props
  const label = `${formatArticleDateTime(value)} 更新`

  return (
    <time className={className} dateTime={new Date(value).toISOString()}>
      {label}
    </time>
  )
}
