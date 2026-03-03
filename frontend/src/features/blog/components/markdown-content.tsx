"use client"

import { Check, Copy } from "lucide-react"
import { type ReactNode, useEffect, useRef, useState } from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"

type MarkdownContentProps = {
  content: string
  className?: string
}

function nodeToString(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node)
  }
  if (Array.isArray(node)) {
    return node.map((item) => nodeToString(item as ReactNode)).join("")
  }
  if (node && typeof node === "object" && "props" in node) {
    return nodeToString(
      (node as { props?: { children?: ReactNode } }).props?.children,
    )
  }
  return ""
}

type CodeFrameProps = {
  rawCode: string
  children: ReactNode
}

function CodeFrame({ rawCode, children }: CodeFrameProps) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  const onCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = window.setTimeout(() => {
        setCopied(false)
        timeoutRef.current = null
      }, 1500)
    } catch {
      setCopied(false)
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="not-prose my-4">
      <div className="relative overflow-hidden rounded-lg border border-border bg-[#1e1e1e] text-[#d4d4d4]">
        <button
          type="button"
          onClick={() => onCopy(rawCode)}
          aria-label={copied ? "コピー完了" : "コードをコピー"}
          className="absolute top-2 right-2 z-10 rounded-md border border-white/20 bg-black/30 px-2 py-1 text-xs text-white transition-colors hover:bg-black/50"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>

        <pre className="m-0 overflow-x-auto text-sm leading-6">{children}</pre>
      </div>
    </div>
  )
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  const components: Components = {
    pre({ children }) {
      const raw = nodeToString(children)
      return <CodeFrame rawCode={raw}>{children}</CodeFrame>
    },
  }

  return (
    <div
      className={cn(
        "prose prose-neutral max-w-none wrap-break-word dark:prose-invert",
        "prose-headings:mt-8 prose-headings:mb-3 prose-headings:font-semibold",
        "prose-p:my-4 prose-p:leading-7",
        "prose-a:text-foreground prose-a:underline prose-a:underline-offset-4",
        "prose-blockquote:border-l-border prose-blockquote:text-muted-foreground",
        "prose-li:my-1",
        "prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none",
        "prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:border prose-pre:border-border prose-pre:bg-transparent prose-pre:p-0",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
