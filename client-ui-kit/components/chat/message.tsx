"use client"

import * as React from "react"

import { cn } from "../../lib/utils"

export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Who is sending the message
   */
  from: "user" | "assistant"

  /**
   * Optional avatar component to display
   */
  avatar?: React.ReactNode
}

export const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  ({ className, from, avatar, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full py-4",
          from === "user" ? "justify-end" : "justify-start",
          className
        )}
        {...props}
      >
        <div className="flex items-end gap-3">
          {from === "assistant" && avatar}
          <div className="flex flex-col">{children}</div>
          {from === "user" && avatar}
        </div>
      </div>
    )
  }
)

Message.displayName = "Message"

export type MessageContentProps = React.HTMLAttributes<HTMLDivElement>

export const MessageContent = React.forwardRef<HTMLDivElement, MessageContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex max-w-xs flex-col gap-2 rounded-2xl px-4 py-3 bg-secondary text-foreground",
          className
        )}
        {...props}
      />
    )
  }
)

MessageContent.displayName = "MessageContent"
