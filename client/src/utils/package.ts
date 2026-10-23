export function parsePackageBenefits(raw: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.map(String)
  } catch {
    // Older records may contain newline-delimited plain text.
  }
  return raw.split('\n').map((item) => item.trim()).filter(Boolean)
}
