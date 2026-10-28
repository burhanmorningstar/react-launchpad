import { useEffect, type ReactNode } from 'react'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/core/ui/components/command'

export interface CommandPaletteItem {
  id: string
  title: string
  description?: string
  icon?: ReactNode
  shortcut?: string
  disabled?: boolean
  group?: string
  onSelect: () => void
}

export interface CommandPaletteProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  items: CommandPaletteItem[]
  placeholder?: string
  emptyMessage?: string
  enableGlobalShortcut?: boolean
}

export function CommandPalette({
  open = false,
  onOpenChange,
  items,
  placeholder = 'Type a command or search...',
  emptyMessage = 'No results found.',
  enableGlobalShortcut = true,
}: CommandPaletteProps) {
  useEffect(() => {
    if (!enableGlobalShortcut || !onOpenChange) return

    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    window.addEventListener('keydown', down)
    return () => window.removeEventListener('keydown', down)
  }, [enableGlobalShortcut, onOpenChange, open])

  // Group items by their group property
  const groupedItems = items.reduce<Record<string, CommandPaletteItem[]>>(
    (acc, item) => {
      const groupName = item.group || 'General'
      if (!acc[groupName]) acc[groupName] = []
      acc[groupName].push(item)
      return acc
    },
    {}
  )

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command Palette"
      description="Search actions, navigation routes, and commands"
    >
      <CommandInput placeholder={placeholder} />
      <CommandList>
        <CommandEmpty>{emptyMessage}</CommandEmpty>
        {Object.entries(groupedItems).map(([group, groupItems]) => (
          <CommandGroup key={group} heading={group}>
            {groupItems.map((item) => (
              <CommandItem
                key={item.id}
                value={`${item.title} ${item.description || ''}`}
                disabled={item.disabled}
                onSelect={() => {
                  if (!item.disabled) {
                    item.onSelect()
                    onOpenChange?.(false)
                  }
                }}
              >
                {item.icon && (
                  <span className="mr-2 h-4 w-4 shrink-0">{item.icon}</span>
                )}
                <div className="flex flex-col">
                  <span className="font-medium">{item.title}</span>
                  {item.description && (
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  )}
                </div>
                {item.shortcut && (
                  <CommandShortcut>{item.shortcut}</CommandShortcut>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
