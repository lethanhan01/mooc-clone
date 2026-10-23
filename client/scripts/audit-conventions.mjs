#!/usr/bin/env node
/**
 * @fileoverview RoGym Conventions Suite — Static Audit Engine (Thin Compatibility Shim)
 * Phục vụ tương thích ngược 100% với các lệnh npm scripts và test suites hiện hữu.
 * Logic kiểm toán chính được phân tách và quản lý trong: client/scripts/audit/
 */

import { runAuditCli } from './audit/cli.mjs'

runAuditCli()
