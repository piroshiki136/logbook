const ADMIN_ROOT_PATH = "/admin"
const URL_PARSE_BASE = "http://localhost"

export const getSafeAdminCallbackUrl = (callbackUrl?: string) => {
  if (!callbackUrl || !callbackUrl.startsWith("/")) return ADMIN_ROOT_PATH

  try {
    const normalizedUrl = new URL(callbackUrl, URL_PARSE_BASE)
    const { pathname, search, hash } = normalizedUrl

    return pathname === ADMIN_ROOT_PATH ||
      pathname.startsWith(`${ADMIN_ROOT_PATH}/`)
      ? `${pathname}${search}${hash}`
      : ADMIN_ROOT_PATH
  } catch {
    return ADMIN_ROOT_PATH
  }
}
