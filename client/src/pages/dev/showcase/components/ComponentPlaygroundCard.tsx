// rogym-convention-exempt: ALL [until: 2026-12-31] [Dev showcase UI card wrapper - Phase 5 OQ5 isolation]
import { useState, type ReactNode } from 'react'
import { Check, Code2, Copy, Sliders } from 'lucide-react'
import { Button } from '@/components/ui/actions'
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/data-display'
import { toast } from '@/lib/toast'

interface ComponentPlaygroundCardProps {
  id?: string
  title: string
  description?: string
  badge?: string
  controls?: ReactNode
  children: ReactNode
  codeSnippet?: string
  className?: string
}

export function ComponentPlaygroundCard({
  id,
  title,
  description,
  badge,
  controls,
  children,
  codeSnippet,
  className,
}: Readonly<ComponentPlaygroundCardProps>) {
  const [showCode, setShowCode] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!codeSnippet) return
    try {
      await navigator.clipboard.writeText(codeSnippet)
      setCopied(true)
      toast.success(`Đã sao chép mã JSX của "${title}"`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Không thể sao chép mã')
    }
  }

  return (
    <Card id={id} className={`scroll-mt-20 overflow-hidden border-white/10 ${className || ''}`}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
            {badge && <Badge tone="accent">{badge}</Badge>}
          </div>
          {description && <CardDescription className="mt-1 text-xs">{description}</CardDescription>}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {codeSnippet && (
            <>
              <Button
                size="xs"
                variant={showCode ? 'primary' : 'outline-white'}
                onClick={() => setShowCode(!showCode)}
                leftIcon={<Code2 size={13} />}
              >
                {showCode ? 'Ẩn code' : 'Xem code'}
              </Button>
              <Button
                size="xs"
                variant="dark"
                onClick={handleCopy}
                leftIcon={copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                title="Sao chép JSX snippet"
              >
                {copied ? 'Đã chép' : 'Sao chép'}
              </Button>
            </>
          )}
        </div>
      </CardHeader>

      {controls && (
        <div className="border-b border-white/5 bg-white/[0.02] px-4 py-3 sm:px-6">
          <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-[var(--rogym-teal)] uppercase tracking-wider">
            <Sliders size={13} />
            <span>Interactive Controls & Props Sandbox:</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">{controls}</div>
        </div>
      )}

      <CardContent className="p-4 sm:p-6">{children}</CardContent>

      {showCode && codeSnippet && (
        <div className="border-t border-white/10 bg-black/40 p-4 font-mono text-xs text-white/90 overflow-x-auto">
          <pre className="text-emerald-400/90 whitespace-pre-wrap">{codeSnippet}</pre>
        </div>
      )}
    </Card>
  )
}
