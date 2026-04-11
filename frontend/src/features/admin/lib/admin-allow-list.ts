export const parseAdminAllowedEmails = (value: string | undefined) =>
  (value ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

export const isAllowedAdminEmail = (
  email: string | null | undefined,
  allowList: readonly string[],
) => !!email && allowList.includes(email.toLowerCase())
