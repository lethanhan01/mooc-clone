import { useState, useCallback } from 'react'
import {
  Layers,
  Zap,
} from 'lucide-react'
import { Badge } from '@/components/ui/data-display'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation'
import { LanguageSwitcher } from '@/components/ui/typography'
import { ThemeToggle } from '@/components/ui/navigation'
import { QuickComponentFinder } from './showcase/components/QuickComponentFinder'
import { ButtonsShowcase } from './showcase/sections/ButtonsShowcase'
import { FormsShowcase } from './showcase/sections/FormsShowcase'
import { OverlaysShowcase } from './showcase/sections/OverlaysShowcase'
import { DataDisplayShowcase } from './showcase/sections/DataDisplayShowcase'
import { NavigationShowcase } from './showcase/sections/NavigationShowcase'
import { FeedbackShowcase } from './showcase/sections/FeedbackShowcase'
import type { ComponentIndexItem } from './showcase/mock-data/showcaseData'

export default function DesignSystemShowcasePage() {
  const [activeTone, setActiveTone] = useState<string>('#06c384')
  const [activeTab, setActiveTab] = useState<string>('buttons')

  const handleSelectFromFinder = useCallback((item: ComponentIndexItem) => {
    setActiveTab(item.tab)
    setTimeout(() => {
      const element = document.getElementById(item.id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }, [])

  return (
    <div
      className="min-h-screen bg-[var(--rogym-bg-base)] text-text-primary p-4 sm:p-8 space-y-10"
      style={{ '--rogym-tone': activeTone } as React.CSSProperties}
    >
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-line-subtle pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-3 w-3 rounded-full bg-action-accent animate-pulse" />
            <Badge tone="accent">SQB HUST UI Design System v2.0</Badge>
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
            Design System & Component Showcase
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Thư viện thành phần giao diện chuẩn hóa, Interactive Prop Playgrounds và Semantic Primitives.
          </p>
        </div>

        {/* Global Tone Color Picker Playground */}
        <div className="flex items-center gap-3 bg-surface p-3 rounded-2xl border border-line-subtle shrink-0">
          <Zap className="h-4 w-4 text-action-accent" />
          <span className="text-xs font-medium text-text-secondary">Tone Thử Nghiệm:</span>
          <div className="flex gap-1.5">
            {[
              { label: 'Neon Green', hex: '#06c384' },
              { label: 'HUST Red', hex: '#c41e3a' },
              { label: 'Edu Blue', hex: '#1877f2' },
              { label: 'Amber Gold', hex: '#f59e0b' },
              { label: 'Purple Violet', hex: '#8b5cf6' },
            ].map((tone) => (
              <button
                key={tone.hex}
                type="button"
                onClick={() => setActiveTone(tone.hex)}
                className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer"
                style={{
                  backgroundColor: tone.hex,
                  borderColor: activeTone === tone.hex ? '#ffffff' : 'transparent',
                }}
                title={tone.label}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Component Finder */}
      <QuickComponentFinder onSelectComponent={handleSelectFromFinder} />

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
        <TabsList className="bg-surface border border-line-subtle p-1.5 rounded-2xl flex flex-wrap gap-2">
          <TabsTrigger value="buttons" className="gap-2">
            <Zap className="h-4 w-4" />
            <span>Actions & Buttons</span>
          </TabsTrigger>
          <TabsTrigger value="forms" className="gap-2">
            <Layers className="h-4 w-4" />
            <span>Forms & Inputs</span>
          </TabsTrigger>
          <TabsTrigger value="overlays" className="gap-2">
            <Layers className="h-4 w-4" />
            <span>Overlays & Dialogs</span>
          </TabsTrigger>
          <TabsTrigger value="data-display" className="gap-2">
            <Layers className="h-4 w-4" />
            <span>Data Display</span>
          </TabsTrigger>
          <TabsTrigger value="navigation" className="gap-2">
            <Layers className="h-4 w-4" />
            <span>Navigation</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-2">
            <Layers className="h-4 w-4" />
            <span>Feedback & Status</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buttons">
          <ButtonsShowcase />
        </TabsContent>
        <TabsContent value="forms">
          <FormsShowcase />
        </TabsContent>
        <TabsContent value="overlays">
          <OverlaysShowcase />
        </TabsContent>
        <TabsContent value="data-display">
          <DataDisplayShowcase />
        </TabsContent>
        <TabsContent value="navigation">
          <NavigationShowcase />
        </TabsContent>
        <TabsContent value="feedback">
          <FeedbackShowcase />
        </TabsContent>
      </Tabs>
    </div>
  )
}

