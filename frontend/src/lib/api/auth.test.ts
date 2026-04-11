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

const TEST_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAL45HKSdRA8vmn8g
umjiDDhZdv9d57DmP2Jubhbxi8Rwg3wVGuRp3ypzcYOUzhi4b20Pmzx2vf7mWzeb
XZ/btijGDcN0ZR8nCdDA8LNMGDRUsd1AR1FdcucphY1Igfw+rkgq/t8nSJ75hwmt
mwe8kr+Pp3bBGaqE4OpaMKm7Xe/BAgMBAAECgYB1hUFN7h9DJozTp7ui2qzkD1m2
USS4JLfaLxFyuU45Ua3Z9gwEO+h1CJeDzGY73Y5xmae1hkLBfT2zsBf6kDoMCyKm
buB7V3fi5E+/leT+iYru+BkMuWXUK8pXJu1XbV3JzGz9MnUFbkIdO5QgU4d2kCvM
YqyQ+ycHZZlYJaBm9QJBAO99MP7GpQIHCexAoBujJkKMd1E1UB3vYAfBeRDxOSel
Wp/BmHIg6u6f8Zphrp4oa3oeZi+ZRl6sB0OJi9dfyUMCQQDLVmmKuYsSHf5f4MrD
1Fq3tz2jmjdN7RG1gvyx5OCJYs3aaERDpgTdLGgg+T/Hkwbxb9IqpoAVsQ4hJm6u
q4CrAkEAsm4X3vqpXgVYg0jzASRhERwOmdaaxnLenWishs7ywnMUPgrDReT4pKlO
HLPCoduDmAymHbiZEVgiYVNNeT3IeQJAEtuawjDfAvkhJEc2xt6k4zDtWITu6B06
bTkOsnjlkhhFuyG8YwG8pb5+kcBL9/hcxnt2ZFo4uspG4zArR6vELQJADEkbi1Tc
EXNzjIXTcDq77+5qvsmWb601iXqIZAIAk+0OjSZGRbrtcr+OLBi6Qom4J14tuInx
vh3wWJ8odakkEg==
-----END PRIVATE KEY-----`

describe("auth api helpers", () => {
  const env = { ...process.env }

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...env }
    process.env.FRONTEND_ASSERTION_PRIVATE_KEY = TEST_PRIVATE_KEY
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
