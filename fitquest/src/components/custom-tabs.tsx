"use client"

import { useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface TabProps {
  value: string
  label: string
  disabled?: boolean
  onClick: (value: string) => void
  isActive: boolean
}

function Tab({ value, label, disabled, onClick, isActive }: TabProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onClick(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  )
}

interface TabsProps {
  defaultValue: string
  tabs: {
    value: string
    label: string
    disabled?: boolean
    content: ReactNode
  }[]
}

export function CustomTabs({ defaultValue, tabs }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b">
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={tab.label}
            disabled={tab.disabled}
            onClick={setActiveTab}
            isActive={activeTab === tab.value}
          />
        ))}
      </div>
      <div>
        {tabs.map((tab) => (
          <div key={tab.value} className={cn(activeTab === tab.value ? "block" : "hidden")}>
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  )
}

