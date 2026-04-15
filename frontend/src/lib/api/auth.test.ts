import { generateKeyPairSync } from "node:crypto"

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  apiFetch: vi.fn(),
}))

vi.mock("server-only", () => ({}))

vi.mock("@/auth", () => ({
  auth: mocks.auth,
}))

vi.mock("./client", () => ({
  apiFetch: mocks.apiFetch,
}))

import {
  AuthError,
  createAssertionJwt,
  exchangeBackendToken,
  getBackendToken,
} from "./auth"

describe("auth api helpers", () => {
  const env = { ...process.env }

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...env }
    const { privateKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    })
    process.env.FRONTEND_ASSERTION_PRIVATE_KEY = privateKey
    process.env.FRONTEND_ASSERTION_KID = "test-kid"
  })

  afterAll(() => {
    process.env = env
  })

  it("未ログイン時は AuthError を投げる", async () => {
    mocks.auth.mockResolvedValue(null)

    await expect(createAssertionJwt()).rejects.toThrow(AuthError)
  })

  it("セッションからアサーション JWT を生成する", async () => {
    mocks.auth.mockResolvedValue({
      user: {
        email: "admin@example.com",
        id: "12345",
      },
    })

    const token = await createAssertionJwt()

    expect(token.split(".")).toHaveLength(3)

    const [encodedHeader, encodedPayload] = token.split(".")
    const header = JSON.parse(
      Buffer.from(encodedHeader, "base64url").toString(),
    )
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString(),
    )

    expect(header).toEqual({
      alg: "RS256",
      typ: "JWT",
      kid: "test-kid",
    })
    expect(payload).toMatchObject({
      iss: "logbook-frontend",
      email: "admin@example.com",
      sub: "github:12345",
    })
    expect(typeof payload.jti).toBe("string")
    expect(payload.jti.length).toBeGreaterThan(0)
  })

  it("トークン交換 API を呼び出して backend token を返す", async () => {
    mocks.apiFetch.mockResolvedValue({ token: "backend-token" })

    await expect(exchangeBackendToken("assertion-token")).resolves.toBe(
      "backend-token",
    )
    expect(mocks.apiFetch).toHaveBeenCalledWith("/api/auth/token", {
      method: "POST",
      body: { assertion: "assertion-token" },
    })
  })

  it("getBackendToken はアサーション生成と交換を連結する", async () => {
    mocks.auth.mockResolvedValue({
      user: {
        email: "admin@example.com",
        id: "12345",
      },
    })
    mocks.apiFetch.mockResolvedValue({ token: "backend-token" })

    await expect(getBackendToken()).resolves.toBe("backend-token")
    expect(mocks.apiFetch).toHaveBeenCalledOnce()
  })
})
