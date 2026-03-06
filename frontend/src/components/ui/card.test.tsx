import { render, screen } from "@testing-library/react"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card"

describe("Card", () => {
  it("主要スロットを描画できる", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>タイトル</CardTitle>
          <CardDescription>説明</CardDescription>
          <CardAction>Action</CardAction>
        </CardHeader>
        <CardContent>本文</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    )

    expect(screen.getByText("タイトル")).toHaveAttribute(
      "data-slot",
      "card-title",
    )
    expect(screen.getByText("説明")).toHaveAttribute(
      "data-slot",
      "card-description",
    )
    expect(screen.getByText("Action")).toHaveAttribute(
      "data-slot",
      "card-action",
    )
    expect(screen.getByText("本文")).toHaveAttribute(
      "data-slot",
      "card-content",
    )
    expect(screen.getByText("Footer")).toHaveAttribute(
      "data-slot",
      "card-footer",
    )
  })
})
