/**
 * @fileoverview JSDoc Rule typedef & contract for RoGym Audit Engine.
 */

/**
 * @typedef {'ERROR' | 'WARNING'} RuleSeverity
 */

/**
 * @typedef {'html-semantic' | 'css-tokens' | 'react-props' | 'a11y' | 'forms' | 'state' | 'architecture' | 'security' | 'testing'} RuleDomain
 */

/**
 * @typedef {Object} RuleViolation
 * @property {string} file - Đường dẫn tương đối chuẩn POSIX tới file
 * @property {number} line - Số dòng vi phạm (1-based)
 * @property {string} text - Thông điệp mô tả vị trí vi phạm
 */

/**
 * @typedef {Object} Rule
 * @property {string} id - Mã định danh duy nhất của rule trong code (vd: 'HEX_COLOR_ONLY_IN_CSS')
 * @property {RuleDomain} domain - Tên domain kiến trúc quản lý
 * @property {RuleSeverity} severity - Mức độ nghiêm trọng ('ERROR' | 'WARNING')
 * @property {string} canonicalId - Mã chuẩn 106-Matrix (STD-*, SEM-*, A11Y-*, SEC-*, API-*)
 * @property {string} docRef - Mã alias tương thích ngược (SEM-*)
 * @property {string} description - Mô tả mục đích kiểm tra
 * @property {(rel: string) => boolean} filter - Hàm lọc các file cần kiểm tra
 * @property {(line: string, idx: number, lines: string[], isExempt: (id: string) => boolean, rel: string) => boolean | string | null} [checkLine] - Hàm kiểm tra từng dòng
 * @property {(content: string, rel: string, lines: string[], isExempt: (id: string) => boolean) => Array<{line: number, text: string}>} [checkFile] - Hàm kiểm tra nguyên khối file
 * @property {string} message - Thông điệp cảnh báo mặc định
 */

export {}
