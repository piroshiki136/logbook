import "server-only"

import { getBackendToken } from "./auth"

export const getAdminToken = async () => {
  return getBackendToken()
}
