type PageSearchParams =
  | Record<string, string | string[] | undefined>
  | undefined

export const createPageHrefBuilder = (
  params: PageSearchParams,
  pathname: string,
) => {
  return (page: number) => {
    const query = new URLSearchParams()

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (key === "page" || value === undefined) continue
        if (Array.isArray(value)) {
          for (const item of value) {
            query.append(key, item)
          }
          continue
        }
        query.set(key, value)
      }
    }

    query.set("page", String(page))
    return `${pathname}?${query.toString()}`
  }
}
