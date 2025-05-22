"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"

interface CopyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  size?: "default" | "sm" | "lg" | "icon"
}

export function CopyButton({ value, className, size = "icon", ...props }: CopyButtonProps) {
  const [hasCopied, setHasCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 2000)
  }

  return (
    <Button variant="ghost" size={size} className={className} onClick={handleCopy} {...props}>
      {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      <span className="sr-only">Copy</span>
    </Button>
  )
}
