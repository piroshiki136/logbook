import { apiFetch } from "./client"
import type { HealthData } from "./types"

export const getHealth = async () => {
  return apiFetch<HealthData>("/api/health")
}

export const getHealthDb = async () => {
  return apiFetch<HealthData>("/api/health/db")
}
