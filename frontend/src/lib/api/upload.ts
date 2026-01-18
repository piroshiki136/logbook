import { apiFetch } from "./client"
import type { UploadImageResponse } from "./types"

export const uploadImage = async (file: File): Promise<UploadImageResponse> => {
  const formData = new FormData()
  formData.append("file", file)
  return apiFetch<UploadImageResponse>("/api/upload-image", {
    method: "POST",
    body: formData,
  })
}
