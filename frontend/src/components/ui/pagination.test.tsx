import { render, screen } from "@testing-library/react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination"

describe("Pagination UI", () => {
  it("PaginationPrevious と PaginationNext を描画する", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="/articles?page=1" />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="/articles?page=3" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    )

    expect(
      screen.getByRole("link", { name: "Go to previous page" }),
    ).toHaveAttribute("href", "/articles?page=1")
    expect(
      screen.getByRole("link", { name: "Go to next page" }),
    ).toHaveAttribute("href", "/articles?page=3")
  })

  it("PaginationEllipsis を描画する", () => {
    render(<PaginationEllipsis />)
    expect(screen.getByText("More pages")).toBeInTheDocument()
  })

  it("PaginationLink isActive=true で aria-current=page になる", () => {
    render(
      <PaginationLink href="/articles?page=2" isActive>
        2
      </PaginationLink>,
    )

    expect(screen.getByRole("link", { name: "2" })).toHaveAttribute(
      "aria-current",
      "page",
    )
  })
})
