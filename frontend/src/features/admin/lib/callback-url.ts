const ADMIN_ROOT_PATH = "/admin"

export const getSafeAdminCallbackUrl = (callbackUrl?: string) => {
  if (!callbackUrl) return ADMIN_ROOT_PATH
  return callbackUrl === ADMIN_ROOT_PATH ||
    callbackUrl.startsWith(`${ADMIN_ROOT_PATH}/`)
    ? callbackUrl
    : ADMIN_ROOT_PATH
}
