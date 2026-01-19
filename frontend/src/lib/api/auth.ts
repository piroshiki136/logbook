import "server-only"

import { createPrivateKey, createSign, randomUUID } from "node:crypto"
import { auth } from "@/auth"
import { apiFetch } from "./client"

export class AuthError extends Error {
  code = "AUTH_REQUIRED"

  constructor(message?: string) {
    super(message ?? "認証が必要です")
    this.name = "AuthError"
  }
}

const ASSERTION_ISSUER = "logbook-frontend"
const ASSERTION_TTL_SECONDS = 120
const TOKEN_EXCHANGE_PATH = "/api/auth/token"

type TokenExchangeResponse = {
  token: string
}

type AssertionPayload = {
  iss: string
  email: string
  iat: number
  exp: number
  jti: string
  sub?: string
}

type AssertionHeader = {
  alg: "RS256"
  typ: "JWT"
  kid?: string
}

const readEnvOrThrow = (key: string) => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`${key} is not set`)
  }
  return value
}

const normalizePem = (value: string) =>
  value.trim().replace(/\r\n/g, "\n").replace(/\\n/g, "\n")

const createPrivateKeyOrThrow = (pem: string) => {
  try {
    return createPrivateKey(pem)
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown error"
    throw new Error(`FRONTEND_ASSERTION_PRIVATE_KEY is invalid: ${reason}`)
  }
}

const base64Url = (value: string | Buffer) =>
  Buffer.from(value).toString("base64url")

const signAssertionJwt = (payload: AssertionPayload) => {
  const keyPem = normalizePem(readEnvOrThrow("FRONTEND_ASSERTION_PRIVATE_KEY"))
  const keyId = process.env.FRONTEND_ASSERTION_KID
  const privateKey = createPrivateKeyOrThrow(keyPem)

  const header: AssertionHeader = {
    alg: "RS256",
    typ: "JWT",
    ...(keyId ? { kid: keyId } : {}),
  }

  const encodedHeader = base64Url(JSON.stringify(header))
  const encodedPayload = base64Url(JSON.stringify(payload))
  const signingInput = `${encodedHeader}.${encodedPayload}`

  const signer = createSign("RSA-SHA256")
  signer.update(signingInput)
  signer.end()

  const signature = signer.sign(privateKey)
  return `${signingInput}.${base64Url(signature)}`
}

const buildSubject = (providerAccountId?: string | null) => {
  if (!providerAccountId) return undefined
  return `github:${providerAccountId}`
}

export const createAssertionJwt = async () => {
  const session = await auth()
  const email = session?.user?.email
  if (!email) {
    throw new AuthError()
  }

  const now = Math.floor(Date.now() / 1000)
  const payload: AssertionPayload = {
    iss: ASSERTION_ISSUER,
    email,
    iat: now,
    exp: now + ASSERTION_TTL_SECONDS,
    jti: randomUUID(),
    sub: buildSubject(session.user?.id),
  }

  return signAssertionJwt(payload)
}

export const exchangeBackendToken = async (assertion: string) => {
  const response = await apiFetch<TokenExchangeResponse>(TOKEN_EXCHANGE_PATH, {
    method: "POST",
    body: { assertion },
  })
  return response.token
}

export const getBackendToken = async () => {
  const assertion = await createAssertionJwt()
  return exchangeBackendToken(assertion)
}
