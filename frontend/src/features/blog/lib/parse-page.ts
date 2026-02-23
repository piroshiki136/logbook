export const parsePage = (raw?: string) => {
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return 1
  if (parsed < 1) return 1
  return Math.floor(parsed)
}
