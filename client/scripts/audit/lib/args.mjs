/**
 * @fileoverview CLI Argument Parsing & Flag Normalization
 */

import process from 'node:process'

export function parseArgs(rawArgs = process.argv.slice(2)) {
  const hasFlag = (flag) => rawArgs.includes(flag)

  const getArgValue = (prefix) => {
    const match = rawArgs.find((a) => a.startsWith(`${prefix}=`))
    if (match) return match.slice(prefix.length + 1)
    const idx = rawArgs.indexOf(prefix)
    if (idx !== -1 && idx + 1 < rawArgs.length) return rawArgs[idx + 1]
    return null
  }

  const showHelp = hasFlag('--help') || hasFlag('-h')
  const isStrict = hasFlag('--strict')
  const isSummaryOnly = hasFlag('--summary')
  const isErrorsOnly = hasFlag('--errors-only')
  const isGenerateBaseline = hasFlag('--generate-baseline')
  const isUpdateBaseline = hasFlag('--update-baseline')
  const formatArg = getArgValue('--format') || 'text'
  const isJsonFormat = formatArg === 'json'
  const targetPathFilter = getArgValue('--path')
  const targetRuleFilter = getArgValue('--rule')
  const targetDomainFilter = getArgValue('--domain')
  const isListRules = hasFlag('--list-rules')
  const isRatchet = hasFlag('--ratchet')

  return {
    rawArgs,
    showHelp,
    isStrict,
    isSummaryOnly,
    isErrorsOnly,
    isGenerateBaseline,
    isUpdateBaseline,
    formatArg,
    isJsonFormat,
    targetPathFilter,
    targetRuleFilter,
    targetDomainFilter,
    isListRules,
    isRatchet,
  }
}
