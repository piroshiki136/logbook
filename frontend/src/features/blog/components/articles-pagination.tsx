import { buttonVariants } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"

type ArticlesPaginationProps = {
  currentPage: number
  totalPages: number
  pathname?: string
  buildHref?: (page: number) => string
  className?: string
}

const clampPage = (page: number, totalPages: number) => {
  if (!Number.isFinite(page)) return 1
  if (page < 1) return 1
  if (page > totalPages) return totalPages
  return Math.floor(page)
}

const createPageHref = (pathname: string, page: number) => {
  const query = new URLSearchParams({ page: String(page) })
  return `${pathname}?${query.toString()}`
}

type PageLinkProps = {
  href: string
  label: string
  ariaLabel: string
  disabled: boolean
  variant?: "default" | "ghost"
}

function PageLink(props: PageLinkProps) {
  const { href, label, ariaLabel, disabled, variant = "ghost" } = props

  if (!disabled) {
    return (
      <PaginationLink
        href={href}
        aria-label={ariaLabel}
        size="default"
        className={cn("px-3", variant === "default" && "border bg-background")}
      >
        {label}
      </PaginationLink>
    )
  }

  return (
    <span
      aria-disabled="true"
      className={cn(
        buttonVariants({ variant: "ghost", size: "default" }),
        "pointer-events-none px-3 opacity-50",
      )}
    >
      {label}
    </span>
  )
}

export function ArticlesPagination(props: ArticlesPaginationProps) {
  const {
    currentPage,
    totalPages,
    pathname = "/articles",
    buildHref,
    className,
  } = props

  if (totalPages <= 1) return null

  const safeTotalPages = Math.max(1, Math.floor(totalPages))
  const safeCurrentPage = clampPage(currentPage, safeTotalPages)

  const toHref = (page: number) =>
    buildHref
      ? buildHref(clampPage(page, safeTotalPages))
      : createPageHref(pathname, clampPage(page, safeTotalPages))

  const isFirstPage = safeCurrentPage === 1
  const isLastPage = safeCurrentPage === safeTotalPages

  return (
    <div
      className={cn(
        "mt-8 flex flex-col items-center justify-center gap-3 text-center",
        className,
      )}
    >
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PageLink
              href={toHref(1)}
              label="最初"
              ariaLabel="最初のページへ"
              disabled={isFirstPage}
              variant="default"
            />
          </PaginationItem>
          <PaginationItem>
            <PageLink
              href={toHref(safeCurrentPage - 1)}
              label="前へ"
              ariaLabel="前のページへ"
              disabled={isFirstPage}
            />
          </PaginationItem>
          <PaginationItem>
            <PageLink
              href={toHref(safeCurrentPage + 1)}
              label="次へ"
              ariaLabel="次のページへ"
              disabled={isLastPage}
            />
          </PaginationItem>
          <PaginationItem>
            <PageLink
              href={toHref(safeTotalPages)}
              label="最後"
              ariaLabel="最後のページへ"
              disabled={isLastPage}
              variant="default"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        現在 {safeCurrentPage} / 全 {safeTotalPages} ページ
      </p>
    </div>
  )
}
