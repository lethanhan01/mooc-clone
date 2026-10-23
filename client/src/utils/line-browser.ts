export function isLineInAppBrowser(userAgent = navigator.userAgent): boolean {
  return /\bLine\//i.test(userAgent)
}
