/**
 * @fileoverview Line-preserving Masking Helper
 */

/**
 * Line-preserving Masking: Thay thế nội dung block comment /* ... * / và {/* ... * /
 * bằng khoảng trắng nhưng GIỮ NGUYÊN 100% ký tự xuống dòng \n để bảo toàn vị trí dòng.
 * @param {string} content
 * @returns {string}
 */
export function maskFileContent(content) {
  return content.replace(/\{\/\*[\s\S]*?\*\/\}|\/\*[\s\S]*?\*\//g, (match) => {
    return match.replace(/[^\n]/g, ' ')
  })
}
