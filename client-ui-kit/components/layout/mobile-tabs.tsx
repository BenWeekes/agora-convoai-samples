"use client"

import * as React from "react"

import { cn } from "../../lib/utils"

export interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
  content: React.ReactNode
}

export interface MobileTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * List of tabs
   */
  tabs: Tab[]

  /**
   * Currently active tab ID
   */
  activeTab?: string

  /**
   * Callback when tab changes
   */
  onTabChange?: (tabId: string) => void

  /**
   * Position of tab buttons
   * @default "top"
   */
  tabPosition?: "top" | "bottom"
}

/**
 * Mobile tab switcher for video chat layouts
 *
 * Tab 1: Avatar + Local Video
 * Tab 2: Avatar + Chat
 */
export const MobileTabs = React.forwardRef<HTMLDivElement, MobileTabsProps>(
  (
    { className, tabs, activeTab: controlledActiveTab, onTabChange, tabPosition = "top", ...props },
    ref
  ) => {
    const [internalActiveTab, setInternalActiveTab] = React.useState(tabs[0]?.id || "")

    const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab
    const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content

    const handleTabChange = (tabId: string) => {
      if (controlledActiveTab === undefined) {
        setInternalActiveTab(tabId)
      }
      onTabChange?.(tabId)
    }

    const tabButtons = (
      <div className="flex gap-1 border-b bg-muted/30 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.icon && <span className="h-4 w-4">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    )

    return (
      <div ref={ref} className={cn("flex h-full flex-col overflow-hidden", className)} {...props}>
        {/* Top tabs */}
        {tabPosition === "top" && tabButtons}

        {/* Content */}
        <div className="flex-1 overflow-hidden">{activeTabContent}</div>

        {/* Bottom tabs */}
        {tabPosition === "bottom" && tabButtons}
      </div>
    )
  }
)

MobileTabs.displayName = "MobileTabs"
