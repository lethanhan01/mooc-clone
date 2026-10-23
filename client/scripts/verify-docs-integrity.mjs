import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLIENT_DIR = path.resolve(__dirname, '..');
const REPO_ROOT = CLIENT_DIR;
const DOCS_DIR = path.resolve(CLIENT_DIR, 'docs');
const APPENDIX_B_PATH = path.resolve(CLIENT_DIR, '../docs/VI/semantic-design/appendix-b-audit-rule-map.md');

const TARGET_FILES = [
  path.resolve(CLIENT_DIR, 'FRONTEND_CONVENTIONS.md'),
  path.resolve(DOCS_DIR, 'README.md'),
  path.resolve(DOCS_DIR, 'QUICK_REFERENCE.md'),
  path.resolve(DOCS_DIR, '01-architecture-and-structure.md'),
  path.resolve(DOCS_DIR, '02-state-management.md'),
  path.resolve(DOCS_DIR, '03-coding-standards.md'),
  path.resolve(DOCS_DIR, '04-component-patterns.md'),
  path.resolve(DOCS_DIR, '05-forms-and-validation.md'),
  path.resolve(DOCS_DIR, '06-styling-and-design-tokens.md'),
  path.resolve(DOCS_DIR, '07-testing-and-quality-assurance.md'),
  path.resolve(DOCS_DIR, '08-semantic-design-system.md'),
  path.resolve(DOCS_DIR, '09-accessibility.md'),
  path.resolve(DOCS_DIR, '10-frontend-security-and-auth.md'),
  path.resolve(DOCS_DIR, '11-performance-and-web-vitals.md'),
  path.resolve(DOCS_DIR, '12-observability-and-telemetry.md'),
  path.resolve(DOCS_DIR, '13-api-contracts-and-resilience.md'),
  path.resolve(DOCS_DIR, '14-internationalization-and-localization.md'),
  path.resolve(DOCS_DIR, '15-release-engineering-and-devops.md'),
  path.resolve(DOCS_DIR, '16-view-transitions-and-motion.md'),
  path.resolve(DOCS_DIR, '17-mobile-and-native-architecture.md'),
  path.resolve(CLIENT_DIR, 'src/components/README.md'),
  path.resolve(CLIENT_DIR, 'src/hooks/README.md'),
  path.resolve(CLIENT_DIR, 'src/lib/README.md'),
  path.resolve(CLIENT_DIR, 'src/services/README.md'),
  path.resolve(CLIENT_DIR, 'src/stores/README.md'),
  path.resolve(CLIENT_DIR, 'src/utils/README.md'),
];

function findMarkdownFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (['node_modules', '.git', 'dist', '.aider-desk', '.next', 'coverage'].includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

function getExtendedMarkdownFiles() {
  const targetDirs = [
    path.join(CLIENT_DIR, 'docs'),
    path.join(CLIENT_DIR, 'src'),
    path.join(REPO_ROOT, '.agents', 'rules'),
    path.join(REPO_ROOT, '.agents', 'skills', 'sqb-frontend-conventions'),
  ];
  const standalone = [
    path.join(CLIENT_DIR, 'FRONTEND_CONVENTIONS.md'),
    path.join(CLIENT_DIR, 'AGENTS.md'),
    path.join(CLIENT_DIR, 'README.md'),
    // path.join(REPO_ROOT, 'AGENTS.md'),
  ];
  const collected = [...standalone];
  for (const dir of targetDirs) {
    collected.push(...findMarkdownFiles(dir));
  }
  return [...new Set(collected.filter(f => fs.existsSync(f)))];
}

const REQUIRED_KEYWORDS_BY_FILE = {
  'QUICK_REFERENCE.md': [
    'Cheat-Recipes', 'Definition of Done', 'STD-', 'SEM-',
    'A11Y-', 'SEC-', 'PERF-', 'OBS-', 'API-', 'I18N-', 'OPS-'
  ],
  'FRONTEND_CONVENTIONS.md': [
    'Predictability', 'Modularity', 'Accessibility', 'Testability',
    'Tháp Phân Tầng Ngữ Nghĩa', '19 Tiêu Chuẩn', 'rogym-convention-exempt',
    'audit-conventions.mjs'
  ],
  'README.md': [
    'Hub & Spokes', '19 Tiêu chuẩn', 'FRONTEND_CONVENTIONS.md',
    'rogym-convention-exempt'
  ],
  '01-architecture-and-structure.md': [
    'Bulletproof React', 'Co-location', 'Rule of Three',
    'Component Anatomy', 'React.lazy', 'Circular Dependencies',
    'Monorepo', 'Modular Monolith', 'Static Assets'
  ],
  '02-state-management.md': [
    'TkDodo', 'TanStack Query', 'queryKeys', 'Zustand',
    'useSearchParams', 'Derived State', 'Payment Flow',
    'BroadcastChannel', 'IndexedDB', 'Race Condition'
  ],
  '03-coding-standards.md': [
    '22 Tiêu chuẩn', 'rogym-convention-exempt', 'Line-preserving Masking',
    'Baseline Snapshot', 'Primitive Boundary', 'AbortController', 'UTC', 'RFC 9457'
  ],
  '04-component-patterns.md': [
    'Compound Components', 'Container / Presentational',
    'Error Boundaries', 'as prop', 'Controlled',
    'asChild', 'useControllableState', 'Stacking Context', 'Focus Trap', 'z-index'
  ],
  '05-forms-and-validation.md': [
    'Bộ Ba Primitives', 'FormField', 'SubmitButton',
    'On-input', 'Zod', 'React Hook Form',
    'Wizard', 'useFieldArray', 'sessionStorage', 'debounce'
  ],
  '06-styling-and-design-tokens.md': [
    '100% HEX', '--rogym-', 'token-values.ts', 'BEM',
    'Z-Index', 'Mobile-first', 'LINE LIFF',
    'Brand Namespacing', 'FOUC', 'Container Queries'
  ],
  '07-testing-and-quality-assurance.md': [
    'Vitest 2.1', 'Testing Library', 'Accessible Queries',
    'Mocking Boundaries', 'findBy', 'Definition of Done',
    'MSW', 'Playwright', 'Visual Regression'
  ],
  '08-semantic-design-system.md': [
    'Trụ cột S1', 'Trụ cột S2', 'Trụ cột S3', 'Trụ cột S4',
    'SEM-TOKEN-', 'color-mix', 'primitive.css', 'semantic.css',
    'Archetype', 'Storybook'
  ],
  '09-accessibility.md': [
    'W3C WAI-ARIA APG', 'vitest-axe', 'SEM-A11Y-', '44', 'Contrast',
    'A11Y-', 'prefers-reduced-motion', 'Widget'
  ],
  '10-frontend-security-and-auth.md': [
    'OWASP', 'SEC-', 'DOMPurify', 'CSP', 'PII'
  ],
  '11-performance-and-web-vitals.md': [
    'Core Web Vitals', 'PERF-', 'LCP', 'Bundle Budget', 'Virtualization'
  ],
  '12-observability-and-telemetry.md': [
    'OBS-', 'Sentry', 'Trace Context', 'PII', 'Logging'
  ],
  '13-api-contracts-and-resilience.md': [
    'API-', 'RFC 7807', 'AbortController', 'OpenAPI', 'Exponential Backoff'
  ],
  '14-internationalization-and-localization.md': [
    'I18N-', 'Zero Hardcoded Strings', 'Intl', 'RTL', 'i18next'
  ],
  '15-release-engineering-and-devops.md': [
    'OPS-', 'Zod', 'Docker', 'Cache-Busting', 'Semantic Versioning'
  ],
  '16-view-transitions-and-motion.md': [
    'View Transition', 'MOTION-', 'Spatial Continuity', 'prefers-reduced-motion', 'Shared Element'
  ],
  '17-mobile-and-native-architecture.md': [
    'Universal Mobile', 'MOB-', 'LINE LIFF', 'FlashList', 'Safe Area'
  ],
  'src/components/README.md': [
    'Design System', 'Semantic Tokens', 'Radix', 'APG', 'SubmitButton', 'PageHeader'
  ],
  'src/hooks/README.md': [
    'TanStack Query', 'queryKeys', 'NO_EFFECT_FETCH', 'state-actions-meta',
    'createQueryWrapper', 'useDebounce', 'useNetworkStatus', 'AttendancePage'
  ],
  'src/lib/README.md': [
    'RFC 7807', 'pii-masker', 'logger', 'Trace Context', 'formatDate',
    'formatVnd', 'toneClasses', 'backoff-retry', 'bundle-barrel-imports'
  ],
  'src/services/README.md': [
    'Axios', 'AbortSignal', 'api.ts', 'Vitest', 'Silent Token Refresh'
  ],
  'src/stores/README.md': [
    'Zustand', 'Client State', 'onLogout', 'Atomic Selectors', 'Vitest'
  ],
  'src/utils/README.md': [
    'Pure Functions', 'UTC+7', 'cn', 'pii-masker', 'Vitest'
  ],
};

const VALID_MERMAID_TYPES = [
  'flowchart', 'graph', 'sequenceDiagram', 'stateDiagram',
  'classDiagram', 'erDiagram', 'gantt', 'pie', 'gitGraph', 'mindmap'
];

function strictGfmSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc}\-\s]/gu, '') // Remove punctuation
    .replace(/\s+/g, '-'); // Collapse whitespace to single hyphen
}

function slugify(text) {
  return strictGfmSlug(text);
}

function validateTargetFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File không tồn tại: ${filePath}`);
    return null;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  return { content, lines };
}

function collectFileMetrics(lines) {
  const headings = lines.filter(l => /^#{1,6}\s+/.test(l));
  const codeBlocks = lines.filter(l => l.startsWith('```')).length / 2;
  const tableRows = lines.filter(l => /^\|.*\|$/.test(l.trim())).length;

  return {
    lines: lines.length,
    headings: headings.length,
    codeBlocks: Math.floor(codeBlocks),
    tableRows,
  };
}

function checkDocKeywords(key, content, baseName) {
  let warnings = 0;
  const requiredKeywords = REQUIRED_KEYWORDS_BY_FILE[key] || (baseName ? REQUIRED_KEYWORDS_BY_FILE[baseName] : []) || [];
  const lowerContent = content.toLowerCase();
  for (const kw of requiredKeywords) {
    if (!lowerContent.includes(kw.toLowerCase())) {
      console.warn(`⚠️ [${key}] Thiếu từ khóa cốt lõi: "${kw}"`);
      warnings++;
    }
  }
  return warnings;
}

function extractMermaidBlocks(content) {
  const blocks = [];
  const lines = content.split('\n');
  let inside = false;
  let current = [];

  for (const line of lines) {
    if (!inside && line.trim().startsWith('```mermaid')) {
      inside = true;
      current = [];
    } else if (inside && line.trim().startsWith('```')) {
      inside = false;
      blocks.push(current.join('\n'));
    } else if (inside) {
      current.push(line);
    }
  }

  return blocks;
}

function checkNoAbsolutePaths(fileName, content) {
  let errors = 0;
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    const stripped = line.replace(/`[^`\n]*`/g, '');
    if (stripped.includes('file:///') || /file:\/\/[a-zA-Z]:/.test(stripped)) {
      console.error(`❌ [${fileName}:${idx + 1}] Phát hiện đường dẫn absolute bị CẤM: "${line.trim()}"`);
      errors++;
    }
  });
  return errors;
}

function checkMermaidSyntax(fileName, content) {
  let errors = 0;
  const blocks = extractMermaidBlocks(content);
  blocks.forEach((code, idx) => {
    const hasValidType = VALID_MERMAID_TYPES.some(t => code.includes(t));
    if (!hasValidType) {
      console.error(`❌ [${fileName}] Khối Mermaid #${idx + 1} thiếu chỉ định loại biểu đồ hợp lệ!`);
      errors++;
    }

    const lines = code.split('\n');
    lines.forEach((line, lineIdx) => {
      if (/\(\[[^"]*?\([^"]*?\]\)/.test(line)) {
        console.error(`❌ [${fileName}] Khối Mermaid #${idx + 1} dòng ${lineIdx + 1}: Chứa dấu ngoặc đơn chưa bọc nháy kép trong stadium node ([...])!`);
        errors++;
      }
      if (/-->\|[^"|\n]*?\([^"|\n]*?\|/.test(line)) {
        console.error(`❌ [${fileName}] Khối Mermaid #${idx + 1} dòng ${lineIdx + 1}: Chứa dấu ngoặc đơn chưa bọc nháy kép trong nhãn cạnh (-->|...|)!`);
        errors++;
      }
    });
  });
  return errors;
}

function checkDocVersion(fileName, content) {
  if (fileName !== 'SKILL.md' && !content.includes('Phiên bản:') && !content.includes('Version:')) {
    console.warn(`⚠️ [${fileName}] Chưa có khai báo Header Version!`);
    return 1;
  }
  return 0;
}

function getFileAnchors(fPath, fileAnchorsCache) {
  if (fileAnchorsCache.has(fPath)) return fileAnchorsCache.get(fPath);
  const text = fs.readFileSync(fPath, 'utf-8');
  const anchors = new Set();

  // 1. Explicit <a id="..." or name="..."> tags
  const aTagRegex = /<a\s+(?:id|name)=["']([^"']+)["']/gi;
  let m;
  while ((m = aTagRegex.exec(text)) !== null) {
    anchors.add(m[1].toLowerCase());
  }

  // 2. Heading slugs (GFM style) - parsed line by line without backtracking
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#')) {
      const match = trimmed.match(/^#{1,6}\s+(.+)$/);
      if (match) {
        const cleanHeading = match[1].replace(/<[^>]*>/g, '').trim();
        anchors.add(strictGfmSlug(cleanHeading));
      }
    }
  }

  fileAnchorsCache.set(fPath, anchors);
  return anchors;
}

function validateSingleLink(linkHref, linkText, filePath, fileName, fileAnchorsCache) {
  const href = linkHref.trim();

  // 1. Check for forbidden absolute paths
  if (href.startsWith('file:') || /^[a-zA-Z]:[/\\]/.test(href) || href.startsWith('/Users/') || href.startsWith('/home/')) {
    console.error(`❌ [${fileName}] Phát hiện đường dẫn tuyệt đối bị CẤM trong liên kết: "${href}" (Text: "${linkText}")`);
    return { error: true, counted: true };
  }

  if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
    return { error: false, counted: false };
  }

  const [targetPath, hash] = href.split('#');
  let resolvedFile = filePath;

  if (targetPath) {
    resolvedFile = path.resolve(path.dirname(filePath), targetPath);
    if (!fs.existsSync(resolvedFile)) {
      console.error(`❌ [${fileName}] Liên kết hỏng tới tệp: "${href}" (đích không tồn tại: ${resolvedFile})`);
      return { error: true, counted: true };
    }
  }

  if (hash && fs.existsSync(resolvedFile)) {
    const targetAnchors = getFileAnchors(resolvedFile, fileAnchorsCache);
    const normalizedHash = decodeURIComponent(hash).toLowerCase();
    const rawHash = hash.toLowerCase();

    if (!targetAnchors.has(normalizedHash) && !targetAnchors.has(rawHash)) {
      console.error(`❌ [${fileName}] Neo liên kết hỏng: "#${hash}" không tồn tại trong ${path.basename(resolvedFile)} (Text: "${linkText}")`);
      return { error: true, counted: true };
    }
  }

  return { error: false, counted: true };
}

function checkDocLinksAndAnchors(targetFiles, fileAnchorsCache) {
  console.log('\n🔍 Kiểm tra tính toàn vẹn của liên kết nội bộ và neo tiêu đề (Anchor Links)...');
  let errors = 0;
  let validatedLinksCount = 0;
  const linkRegex = /\[([^[\]]*)\]\(([^()]*)\)/g;

  for (const filePath of targetFiles) {
    const fileName = path.basename(filePath);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf-8');
    let linkMatch;

    while ((linkMatch = linkRegex.exec(content)) !== null) {
      const res = validateSingleLink(linkMatch[2], linkMatch[1], filePath, fileName, fileAnchorsCache);
      if (res.error) errors++;
      if (res.counted) validatedLinksCount++;
    }
  }

  console.log(`✅ [Link Integrity] Đã xác thực ${validatedLinksCount} liên kết nội bộ & neo tiêu đề (${errors} lỗi).`);
  return errors;
}

function checkSemHeadingUniqueness(targetFiles) {
  console.log('\n🔍 Kiểm tra tính duy nhất của các định nghĩa quy chuẩn SEM-*...');
  let errors = 0;
  const semHeadingDefinitions = new Map();

  for (const filePath of targetFiles) {
    const fileName = path.basename(filePath);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, lineIndex) => {
      const headingMatch = line.match(/^#{1,6}\s+`?(SEM-[A-Z0-9]+-\d+)`?/);
      if (headingMatch) {
        const semId = headingMatch[1];
        if (semHeadingDefinitions.has(semId)) {
          const prev = semHeadingDefinitions.get(semId);
          console.error(`❌ Trùng lặp định nghĩa mã quy chuẩn [${semId}]:`);
          console.error(`   - Định nghĩa trước tại: ${prev.fileName}:${prev.lineIndex}`);
          console.error(`   - Định nghĩa trùng tại: ${fileName}:${lineIndex + 1}`);
          errors++;
        } else {
          semHeadingDefinitions.set(semId, { fileName, lineIndex: lineIndex + 1 });
        }
      }
    });
  }

  console.log(`✅ Đã kiểm tra ${semHeadingDefinitions.size} định nghĩa heading quy chuẩn SEM-* (0 trùng lặp).`);
  return errors;
}

const BANNED_PHRASES = [
  { phrase: 'Doanh Nghiệp Phổ Quát', pattern: /Doanh\s*Nghiệp\s*Phổ\s*Quát/i, message: 'Dùng "Khung Tiêu Chuẩn Doanh Nghiệp" thay thế' },
  { phrase: 'Tôn chỉ', pattern: /tôn\s*chỉ/i, message: 'Dùng "nguyên tắc cốt lõi / tiêu chí" thay thế' },
  { phrase: 'Kỷ luật thép', pattern: /kỷ\s*luật\s*thép/i, message: 'Dùng "quy tắc nghiêm ngặt" thay thế' },
  { phrase: 'Viễn đo trình thấu suốt', pattern: /viễn\s*đo\s*trình\s*thấu\s*suốt/i, message: 'Dùng "Hệ Thống Quan Sát, Đo Lường Từ Xa (Telemetry)" thay thế' },
  { phrase: 'nhập khẩu module', pattern: /nhập\s*khẩu\s+module/i, message: 'Dùng "import module" thay thế' },
  { phrase: 'xuất khẩu module', pattern: /xuất\s*khẩu\s+module/i, message: 'Dùng "export module" thay thế' },
  { phrase: 'thư mục nhập khẩu', pattern: /thư\s*mục\s+nhập\s*khẩu/i, message: 'Dùng "thư mục import" thay thế' },
];

function checkTableOfContentsIntegrity(targetFiles) {
  console.log('\n🔍 Kiểm tra tính toàn vẹn của Mục lục (Table of Contents Integrity)...');
  let errors = 0;
  let totalTocLinks = 0;

  for (const filePath of targetFiles) {
    const fileName = path.basename(filePath);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    let inToc = false;
    const headings = [];
    const explicitAnchors = new Set();
    const tocLinks = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Explicit HTML anchors
      for (const m of line.matchAll(/<a\s+(?:id|name)=["']([^"']+)["']/gi)) {
        explicitAnchors.add(m[1].toLowerCase());
      }

      // Detect TOC section
      if (/^##\s+(MỤC LỤC|TABLE OF CONTENTS)/i.test(line)) {
        inToc = true;
        continue;
      }
      if (inToc) {
        if ((/^##\s+[^M]/i.test(line) && !line.includes('MỤC LỤC')) || (/^---/.test(line) && i > 15)) {
          inToc = false;
        } else {
          for (const m of line.matchAll(/\[([^\]]+)\]\(#([^)]+)\)/g)) {
            tocLinks.push({ line: i + 1, text: m[1].trim(), href: m[2].trim() });
          }
        }
      }

      const h = line.match(/^(#{1,6})\s+(.+)$/);
      if (h) {
        headings.push({
          line: i + 1,
          clean: h[2].replace(/<[^>]*>/g, '').trim(),
        });
      }
    }

    if (tocLinks.length === 0) continue;

    for (const link of tocLinks) {
      totalTocLinks++;
      const target = decodeURIComponent(link.href).toLowerCase();
      if (explicitAnchors.has(target)) continue;

      const isHeadingMatch = headings.some(h => strictGfmSlug(h.clean) === target);
      if (!isHeadingMatch) {
        const cleanLower = link.text.toLowerCase().replace(/^\d+(\.\d+)*\.\s*/, '').replace(/chương\s+\d+:\s*/i, '');
        const match = headings.find(h => {
          const hLower = h.clean.toLowerCase();
          return hLower.includes(cleanLower.slice(0, 15)) || cleanLower.includes(hLower.slice(0, 15));
        });
        console.error(`❌ [${fileName}:${link.line}] Lỗi điều hướng Mục lục: [${link.text}](#${link.href})`);
        if (match) {
          console.error(`   👉 Tiêu đề khớp tại dòng ${match.line}: "${match.clean}" -> Slug chuẩn: "#${strictGfmSlug(match.clean)}"`);
        } else {
          console.error(`   👉 Không tìm thấy tiêu đề tương ứng trong tệp!`);
        }
        errors++;
      }
    }
  }

  console.log(`✅ [TOC Integrity] Đã kiểm tra ${totalTocLinks} liên kết trong Mục lục (${errors} lỗi).`);
  return errors;
}

function checkBannedPhrases(targetFiles) {
  console.log('\n🔍 Kiểm tra từ ngữ sáo rỗng / thuật ngữ dịch thô (Banned/Deprecated Phrasing)...');
  let warnings = 0;
  for (const filePath of targetFiles) {
    const fileName = path.basename(filePath);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      for (const b of BANNED_PHRASES) {
        if (b.pattern.test(line)) {
          console.warn(`⚠️ [${fileName}:${idx + 1}] Phát hiện từ ngữ cần chuẩn hóa "${b.phrase}": ${b.message}`);
          warnings++;
        }
      }
    });
  }
  if (warnings === 0) {
    console.log('✅ [Phrasing Linter] 100% tệp không chứa từ ngữ sáo rỗng / dịch thô.');
  }
  return warnings;
}

function checkAppendixBSync(targetFiles) {
  if (!fs.existsSync(APPENDIX_B_PATH)) {
    console.warn(`⚠️ Không tìm thấy tệp Appendix B tại: ${APPENDIX_B_PATH}`);
    return { errors: 0, warnings: 1 };
  }

  console.log('\n🔍 Đối chiếu với Ground Truth Appendix B (appendix-b-audit-rule-map.md)...');
  const appendixContent = fs.readFileSync(APPENDIX_B_PATH, 'utf-8');
  const appendixSemIds = [...new Set(appendixContent.match(/SEM-[A-Z0-9]+-\d+/g) || [])];

  const allDocsSemIds = new Set();
  for (const filePath of targetFiles) {
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf-8');
    const matches = content.match(/SEM-[A-Z0-9]+-\d+/g) || [];
    for (const m of matches) allDocsSemIds.add(m);
  }

  const missingFromDocs = appendixSemIds.filter(id => !allDocsSemIds.has(id));
  if (missingFromDocs.length > 0) {
    console.error(`❌ [Appendix B Sync] Các mã SEM-* sau trong Appendix B chưa hiện diện trong client/docs/:`);
    missingFromDocs.forEach(id => console.error(`   - ${id}`));
    return { errors: missingFromDocs.length, warnings: 0 };
  }

  console.log(`✅ [Appendix B Sync] 100% (${appendixSemIds.length}/${appendixSemIds.length}) mã quy chuẩn SEM-* từ Appendix B đã hiện diện trong tài liệu client/docs/.`);
  return { errors: 0, warnings: 0 };
}

function checkMarkdownCodeBlocks(targetFiles) {
  console.log('\n🔍 Kiểm tra tuân thủ quy chuẩn mã nguồn trong các khối code Markdown (Code Block Standards)...');
  let errors = 0;
  let codeBlocksCount = 0;

  for (const filePath of targetFiles) {
    const fileName = path.basename(filePath);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    let inCodeBlock = false;
    let codeLang = '';
    let blockStartLine = 0;
    let blockLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const codeFenceMatch = line.match(/^```([a-zA-Z0-9_-]*)/);

      if (codeFenceMatch && !inCodeBlock) {
        inCodeBlock = true;
        codeLang = codeFenceMatch[1].toLowerCase();
        blockStartLine = i + 1;
        blockLines = [];
        codeBlocksCount++;
        continue;
      }

      if (line.startsWith('```') && inCodeBlock) {
        inCodeBlock = false;
        if (['tsx', 'ts', 'jsx', 'js'].includes(codeLang)) {
          blockLines.forEach((bLine, bIdx) => {
            const actualLineNumber = blockStartLine + bIdx + 1;
            const trimmed = bLine.trim();

            const isNegativeExample =
              trimmed.startsWith('// ❌') ||
              trimmed.startsWith('// TRÁNH') ||
              trimmed.toLowerCase().includes('anti-pattern') ||
              trimmed.toLowerCase().includes('antipattern') ||
              trimmed.toLowerCase().includes('bad-example') ||
              trimmed.toLowerCase().includes('cũ:') ||
              trimmed.toLowerCase().includes('sai:') ||
              trimmed.toLowerCase().includes('legacy') ||
              trimmed.toLowerCase().includes('không nên');

            if (isNegativeExample) return;

            if (/from\s+['"]@\/lib\/utils['"]/.test(trimmed)) {
              console.error(`❌ [${fileName}:${actualLineNumber}] Import lỗi thời "@\/lib\/utils". Bắt buộc đổi sang "@\/utils\/cn" hoặc "@\/utils/*"!`);
              errors++;
            }
            if (/from\s+['"]@\/lib\/pii-masker['"]/.test(trimmed)) {
              console.error(`❌ [${fileName}:${actualLineNumber}] Import lỗi thời "@\/lib\/pii-masker". Bắt buộc đổi sang "@\/utils\/pii-masker"!`);
              errors++;
            }
            if (/(?:text|bg|border|ring)-slate-\d+/.test(trimmed)) {
              if (!trimmed.includes('rogym-convention-exempt') && !trimmed.includes('//')) {
                console.error(`❌ [${fileName}:${actualLineNumber}] Sử dụng màu thô Slate ("${trimmed}"). Bắt buộc dùng Semantic Tokens (text-muted-foreground, bg-card, border-border)!`);
                errors++;
              }
            }
            if (/console\.log\(/.test(trimmed)) {
              if (!trimmed.startsWith('//') && !trimmed.includes('logger.')) {
                console.error(`❌ [${fileName}:${actualLineNumber}] Sử dụng trực tiếp "console.log". Bắt buộc dùng "logger.info / logger.debug" từ "@\/lib\/logger"!`);
                errors++;
              }
            }
          });
        }
        continue;
      }

      if (inCodeBlock) {
        blockLines.push(line);
      }
    }
  }

  console.log(`✅ [Code Block Linter] Đã kiểm tra ${codeBlocksCount} khối mã nguồn (${errors} lỗi).`);
  return errors;
}

function verifyFiles() {
  console.log('🔍 Bắt đầu kiểm tra tính toàn vẹn và đối chiếu tài liệu RoGym...');
  let totalErrors = 0;
  let totalWarnings = 0;
  const fileStats = {};

  const extendedFiles = getExtendedMarkdownFiles();
  console.log(`📋 Tổng số tệp Markdown được quét toàn diện: ${extendedFiles.length} tệp.`);

  for (const filePath of TARGET_FILES) {
    const fileData = validateTargetFile(filePath);
    if (!fileData) {
      totalErrors++;
      continue;
    }
    const fileName = path.basename(filePath);
    const relKey = path.relative(CLIENT_DIR, filePath).replace(/\\/g, '/');
    const displayKey = relKey.startsWith('src/') ? relKey : fileName;
    fileStats[displayKey] = collectFileMetrics(fileData.lines);
    totalWarnings += checkDocKeywords(relKey, fileData.content, fileName);
    totalWarnings += checkDocVersion(displayKey, fileData.content);
  }

  console.log('\n🔍 Kiểm tra quy chuẩn đường dẫn và cú pháp Mermaid trên toàn bộ các tệp Markdown...');
  for (const filePath of extendedFiles) {
    const fileName = path.basename(filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    totalErrors += checkNoAbsolutePaths(fileName, content);
    totalErrors += checkMermaidSyntax(fileName, content);
  }

  const fileAnchorsCache = new Map();
  totalErrors += checkDocLinksAndAnchors(extendedFiles, fileAnchorsCache);
  totalErrors += checkTableOfContentsIntegrity(TARGET_FILES);
  totalWarnings += checkBannedPhrases(TARGET_FILES);
  totalErrors += checkSemHeadingUniqueness(TARGET_FILES);
  totalErrors += checkMarkdownCodeBlocks(TARGET_FILES);

  const appendixResult = checkAppendixBSync(TARGET_FILES);
  totalErrors += appendixResult.errors;
  totalWarnings += appendixResult.warnings;

  console.log('\n📊 Thống kê cấu trúc hiện tại (Core Docs):');
  console.table(fileStats);

  if (totalErrors === 0) {
    console.log(`\n✅ Kiểm tra hoàn tất! 100% tệp Markdown tuân thủ quy chuẩn (Warnings: ${totalWarnings}).`);
  } else {
    console.error(`\n❌ Phát hiện ${totalErrors} lỗi toàn vẹn nghiêm trọng! (Warnings: ${totalWarnings})`);
  }

  return { totalErrors, totalWarnings, fileStats };
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const result = verifyFiles();
  if (result.totalErrors > 0) {
    process.exit(1);
  }
}

export { verifyFiles };

