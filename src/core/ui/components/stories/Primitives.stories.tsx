import { useState } from 'react'

import { expect, userEvent, waitFor, within } from 'storybook/test'

import { ThemeProvider } from '@/core/theme/ThemeProvider'

import * as UI from '../index'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { DateRange } from 'react-day-picker'

const meta = {
  title: 'UI/Primitives',
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <UI.TooltipProvider>
          <div className="max-w-3xl space-y-6 bg-background p-4 text-foreground">
            <Story />
            <UI.Toaster />
          </div>
        </UI.TooltipProvider>
      </ThemeProvider>
    ),
  ],
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Accordion: Story = {
  render: () => (
    <UI.Accordion type="single" collapsible>
      <UI.AccordionItem value="one">
        <UI.AccordionTrigger>Is this editable?</UI.AccordionTrigger>
        <UI.AccordionContent>
          Yes. The source lives in your project.
        </UI.AccordionContent>
      </UI.AccordionItem>
      <UI.AccordionItem value="two" disabled>
        <UI.AccordionTrigger>Unavailable section</UI.AccordionTrigger>
        <UI.AccordionContent>Disabled</UI.AccordionContent>
      </UI.AccordionItem>
    </UI.Accordion>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    await userEvent.click(c.getByRole('button', { name: 'Is this editable?' }))
    await waitFor(() =>
      expect(
        c.getByText('Yes. The source lives in your project.')
      ).toBeVisible()
    )
  },
}

export const AlertDialog: Story = {
  render: () => (
    <UI.AlertDialog>
      <UI.AlertDialogTrigger asChild>
        <UI.Button variant="destructive">Delete draft</UI.Button>
      </UI.AlertDialogTrigger>
      <UI.AlertDialogContent>
        <UI.AlertDialogHeader>
          <UI.AlertDialogTitle>Delete this draft?</UI.AlertDialogTitle>
          <UI.AlertDialogDescription>
            This action cannot be undone.
          </UI.AlertDialogDescription>
        </UI.AlertDialogHeader>
        <UI.AlertDialogFooter>
          <UI.AlertDialogCancel>Cancel</UI.AlertDialogCancel>
          <UI.AlertDialogAction variant="destructive">
            Delete
          </UI.AlertDialogAction>
        </UI.AlertDialogFooter>
      </UI.AlertDialogContent>
    </UI.AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Delete draft',
    })
    await userEvent.click(trigger)
    const page = within(canvasElement.ownerDocument.body)
    await expect(
      page.getByRole('alertdialog', { name: 'Delete this draft?' })
    ).toHaveAccessibleDescription('This action cannot be undone.')
    await userEvent.click(page.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(trigger).toHaveFocus())
  },
}

export const ButtonGroup: Story = {
  render: () => (
    <UI.ButtonGroup aria-label="Draft actions">
      <UI.Button variant="outline">Save</UI.Button>
      <UI.Button variant="outline" disabled>
        Publish
      </UI.Button>
      <UI.Button loading>Saving</UI.Button>
    </UI.ButtonGroup>
  ),
}

function CalendarSample() {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 9, 27))
  return (
    <UI.Calendar
      mode="single"
      defaultMonth={new Date(2026, 9, 1)}
      selected={date}
      onSelect={setDate}
      disabled={{ before: new Date(2026, 9, 5) }}
      footer={
        date ? `Selected: ${date.toLocaleDateString('en-US')}` : 'Choose a date'
      }
    />
  )
}
export const Calendar: Story = { render: () => <CalendarSample /> }
function CalendarRangeSample() {
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(2026, 9, 12),
    to: new Date(2026, 9, 16),
  })
  return (
    <UI.Calendar
      mode="range"
      defaultMonth={new Date(2026, 9, 1)}
      selected={range}
      onSelect={setRange}
    />
  )
}
export const CalendarRange: Story = { render: () => <CalendarRangeSample /> }

function ComboboxSample() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  return (
    <UI.Popover open={open} onOpenChange={setOpen}>
      <UI.PopoverTrigger asChild>
        <UI.Button variant="outline" role="combobox" aria-expanded={open}>
          {value || 'Choose project'}
        </UI.Button>
      </UI.PopoverTrigger>
      <UI.PopoverContent className="p-0">
        <UI.Command label="Search projects">
          <UI.CommandInput aria-label="Search projects" />
          <UI.CommandList>
            <UI.CommandEmpty>No matching projects.</UI.CommandEmpty>
            {['Launchpad', 'Website', 'Admin'].map((project) => (
              <UI.CommandItem
                key={project}
                aria-selected={project === value}
                onSelect={() => {
                  setValue(project)
                  setOpen(false)
                }}
              >
                {project}
              </UI.CommandItem>
            ))}
          </UI.CommandList>
        </UI.Command>
      </UI.PopoverContent>
    </UI.Popover>
  )
}
export const Combobox: Story = { render: () => <ComboboxSample /> }

export const Collapsible: Story = {
  render: () => (
    <UI.Collapsible>
      <UI.CollapsibleTrigger asChild>
        <UI.Button variant="outline">Show details</UI.Button>
      </UI.CollapsibleTrigger>
      <UI.CollapsibleContent className="p-4">
        Details can be expanded using the keyboard.
      </UI.CollapsibleContent>
    </UI.Collapsible>
  ),
}

export const Command: Story = {
  render: () => (
    <UI.Command className="max-w-sm rounded-md border" label="Search actions">
      <UI.CommandInput
        placeholder="Search actions…"
        aria-label="Search actions"
      />
      <UI.CommandList>
        <UI.CommandEmpty>No matching actions.</UI.CommandEmpty>
        <UI.CommandGroup heading="Actions">
          <UI.CommandItem>Open project</UI.CommandItem>
          <UI.CommandItem>Settings</UI.CommandItem>
          <UI.CommandItem disabled>Publish</UI.CommandItem>
        </UI.CommandGroup>
      </UI.CommandList>
    </UI.Command>
  ),
}
function CommandDialogSample() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <UI.Button onClick={() => setOpen(true)}>Open commands</UI.Button>
      <UI.CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Project commands"
        description="Find an action for this project."
      >
        <UI.CommandInput aria-label="Find action" />
        <UI.CommandList>
          <UI.CommandEmpty>No matching actions.</UI.CommandEmpty>
          <UI.CommandItem onSelect={() => setOpen(false)}>
            Open project
          </UI.CommandItem>
          <UI.CommandItem disabled>Publish</UI.CommandItem>
        </UI.CommandList>
      </UI.CommandDialog>
    </>
  )
}
export const CommandDialog: Story = { render: () => <CommandDialogSample /> }

export const ContextMenu: Story = {
  render: () => (
    <UI.ContextMenu>
      <UI.ContextMenuTrigger
        className="flex h-36 items-center justify-center rounded border border-dashed"
        tabIndex={0}
      >
        Right click or press Shift+F10
      </UI.ContextMenuTrigger>
      <UI.ContextMenuContent>
        <UI.ContextMenuItem>Copy</UI.ContextMenuItem>
        <UI.ContextMenuItem disabled>Paste</UI.ContextMenuItem>
        <UI.ContextMenuSeparator />
        <UI.ContextMenuCheckboxItem checked>
          Show details
        </UI.ContextMenuCheckboxItem>
      </UI.ContextMenuContent>
    </UI.ContextMenu>
  ),
}

export const Dialog: Story = {
  render: () => (
    <UI.Dialog>
      <UI.DialogTrigger asChild>
        <UI.Button>Open dialog</UI.Button>
      </UI.DialogTrigger>
      <UI.DialogContent>
        <UI.DialogHeader>
          <UI.DialogTitle>Edit profile</UI.DialogTitle>
          <UI.DialogDescription>Update your public name.</UI.DialogDescription>
        </UI.DialogHeader>
        <UI.Field>
          <UI.FieldLabel htmlFor="dialog-name">Public name</UI.FieldLabel>
          <UI.Input id="dialog-name" />
        </UI.Field>
        <UI.DialogFooter>
          <UI.DialogClose asChild>
            <UI.Button>Save</UI.Button>
          </UI.DialogClose>
        </UI.DialogFooter>
      </UI.DialogContent>
    </UI.Dialog>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Open dialog',
    })
    await userEvent.click(trigger)
    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body).getByRole('dialog', {
          name: 'Edit profile',
        })
      ).toBeVisible()
    )
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(trigger).toHaveFocus())
  },
}

export const Drawer: Story = {
  render: () => (
    <UI.Drawer>
      <UI.DrawerTrigger asChild>
        <UI.Button>Open drawer</UI.Button>
      </UI.DrawerTrigger>
      <UI.DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <UI.DrawerHeader>
            <UI.DrawerTitle>Daily goal</UI.DrawerTitle>
            <UI.DrawerDescription>
              Choose a realistic daily target.
            </UI.DrawerDescription>
          </UI.DrawerHeader>
          <div className="p-4">
            <UI.Slider aria-label="Daily target" defaultValue={[30]} max={60} />
          </div>
          <UI.DrawerFooter>
            <UI.DrawerClose asChild>
              <UI.Button>Done</UI.Button>
            </UI.DrawerClose>
          </UI.DrawerFooter>
        </div>
      </UI.DrawerContent>
    </UI.Drawer>
  ),
}
export const HoverCard: Story = {
  render: () => (
    <UI.HoverCard>
      <UI.HoverCardTrigger asChild>
        <UI.Button variant="link">Project information</UI.Button>
      </UI.HoverCardTrigger>
      <UI.HoverCardContent>
        Helpful supplementary information. Essential actions remain on the page.
      </UI.HoverCardContent>
    </UI.HoverCard>
  ),
}

export const NavigationMenu: Story = {
  render: () => (
    <UI.NavigationMenu>
      <UI.NavigationMenuList>
        <UI.NavigationMenuItem>
          <UI.NavigationMenuTrigger>Resources</UI.NavigationMenuTrigger>
          <UI.NavigationMenuContent>
            <UI.NavigationMenuLink href="#guide" className="block w-60 p-4">
              Getting started
            </UI.NavigationMenuLink>
          </UI.NavigationMenuContent>
        </UI.NavigationMenuItem>
        <UI.NavigationMenuItem>
          <UI.NavigationMenuLink href="#overview" className="p-3">
            Overview
          </UI.NavigationMenuLink>
        </UI.NavigationMenuItem>
      </UI.NavigationMenuList>
    </UI.NavigationMenu>
  ),
}
export const Pagination: Story = {
  render: () => (
    <UI.Pagination>
      <UI.PaginationContent>
        <UI.PaginationItem>
          <UI.PaginationPrevious href="#page-1" />
        </UI.PaginationItem>
        <UI.PaginationItem>
          <UI.PaginationLink href="#page-1">1</UI.PaginationLink>
        </UI.PaginationItem>
        <UI.PaginationItem>
          <UI.PaginationLink href="#page-2" isActive>
            2
          </UI.PaginationLink>
        </UI.PaginationItem>
        <UI.PaginationItem>
          <UI.PaginationEllipsis />
        </UI.PaginationItem>
        <UI.PaginationItem>
          <UI.PaginationNext href="#page-3" />
        </UI.PaginationItem>
      </UI.PaginationContent>
    </UI.Pagination>
  ),
}
export const Progress: Story = {
  render: () => (
    <div className="space-y-4">
      <UI.Progress value={67} aria-label="Import progress" />
      <UI.Progress value={null} aria-label="Waiting for progress" />
      <UI.Spinner aria-label="Loading preview" />
    </div>
  ),
}
export const Resizable: Story = {
  render: () => (
    <UI.ResizablePanelGroup
      orientation="horizontal"
      className="min-h-48 rounded border"
    >
      <UI.ResizablePanel defaultSize="35%" minSize="20%">
        <div className="p-6">Sidebar</div>
      </UI.ResizablePanel>
      <UI.ResizableHandle withHandle aria-label="Resize sidebar" />
      <UI.ResizablePanel minSize="20%">
        <div className="p-6">Content</div>
      </UI.ResizablePanel>
    </UI.ResizablePanelGroup>
  ),
}
export const ScrollArea: Story = {
  render: () => (
    <UI.ScrollArea
      className="h-48 w-64 rounded border"
      tabIndex={0}
      aria-label="Activity history"
    >
      <div className="space-y-4 p-4">
        {Array.from({ length: 30 }, (_, i) => (
          <p key={i}>Activity {i + 1}</p>
        ))}
      </div>
      <UI.ScrollBar />
    </UI.ScrollArea>
  ),
}
export const Slider: Story = {
  render: () => (
    <div className="space-y-6">
      <UI.Slider aria-label="Volume" defaultValue={[40]} max={100} step={5} />
      <UI.Slider aria-label="Disabled volume" defaultValue={[60]} disabled />
      <UI.Slider defaultValue={[20, 80]} aria-label="Price range" />
    </div>
  ),
}
export const Toggle: Story = {
  render: () => (
    <div className="flex gap-4">
      <UI.Toggle aria-label="Bold" variant="outline">
        B
      </UI.Toggle>
      <UI.Toggle aria-label="Italic" disabled>
        I
      </UI.Toggle>
      <UI.ToggleGroup
        type="single"
        aria-label="Text alignment"
        defaultValue="left"
      >
        <UI.ToggleGroupItem value="left" aria-label="Align left">
          Left
        </UI.ToggleGroupItem>
        <UI.ToggleGroupItem value="center" aria-label="Align center">
          Center
        </UI.ToggleGroupItem>
        <UI.ToggleGroupItem value="right" aria-label="Align right" disabled>
          Right
        </UI.ToggleGroupItem>
      </UI.ToggleGroup>
    </div>
  ),
}
export const Spinner: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <UI.Spinner aria-label="Loading results" />
      <UI.Button loading>Saving changes</UI.Button>
      <UI.Button size="icon" aria-label="Refresh" loading>
        <span aria-hidden="true">↻</span>
      </UI.Button>
    </div>
  ),
}
export const Empty: Story = {
  render: () => (
    <UI.Empty>
      <UI.EmptyHeader>
        <UI.EmptyMedia variant="icon">
          <span aria-hidden="true">◇</span>
        </UI.EmptyMedia>
        <UI.EmptyTitle>No projects yet</UI.EmptyTitle>
        <UI.EmptyDescription>
          Create your first project to get started.
        </UI.EmptyDescription>
      </UI.EmptyHeader>
      <UI.EmptyContent>
        <UI.Button>Create project</UI.Button>
      </UI.EmptyContent>
    </UI.Empty>
  ),
}

export const Field: Story = {
  render: () => (
    <UI.FieldGroup className="max-w-sm">
      <UI.Field>
        <UI.FieldLabel htmlFor="field-email">Email</UI.FieldLabel>
        <UI.Input
          id="field-email"
          type="email"
          aria-describedby="field-email-help"
        />
        <UI.FieldDescription id="field-email-help">
          Used for project invitations.
        </UI.FieldDescription>
      </UI.Field>
      <UI.Field data-invalid>
        <UI.FieldLabel htmlFor="field-invalid">Project name</UI.FieldLabel>
        <UI.Input
          id="field-invalid"
          defaultValue="!"
          aria-invalid
          aria-describedby="field-name-error"
        />
        <UI.FieldError id="field-name-error">
          Use at least three characters.
        </UI.FieldError>
      </UI.Field>
      <UI.Field data-disabled>
        <UI.FieldLabel htmlFor="field-disabled">Workspace</UI.FieldLabel>
        <UI.Input id="field-disabled" disabled value="Personal" readOnly />
      </UI.Field>
      <UI.Field>
        <UI.FieldLabel htmlFor="field-notes">Notes</UI.FieldLabel>
        <UI.Textarea id="field-notes" placeholder="Optional notes" />
      </UI.Field>
    </UI.FieldGroup>
  ),
}
export const ChoiceControls: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <UI.Checkbox id="terms" />
        <UI.Label htmlFor="terms">Accept terms</UI.Label>
        <UI.Checkbox disabled aria-label="Unavailable option" />
      </div>
      <UI.RadioGroup aria-label="Plan" defaultValue="starter">
        <div className="flex gap-2">
          <UI.RadioGroupItem value="starter" id="starter" />
          <UI.Label htmlFor="starter">Starter</UI.Label>
        </div>
        <div className="flex gap-2">
          <UI.RadioGroupItem
            value="team"
            disabled
            aria-label="Team (unavailable)"
          />
          Team
        </div>
      </UI.RadioGroup>
      <div className="flex gap-2">
        <UI.Switch id="notifications" />
        <UI.Label htmlFor="notifications">Notifications</UI.Label>
        <UI.Switch disabled aria-label="Unavailable notification setting" />
      </div>
      <UI.Select defaultValue="all">
        <UI.SelectTrigger aria-label="Filter role" className="w-60">
          <UI.SelectValue />
        </UI.SelectTrigger>
        <UI.SelectContent>
          <UI.SelectItem value="all">All roles</UI.SelectItem>
          <UI.SelectItem value="admin">Admin</UI.SelectItem>
          <UI.SelectItem value="guest" disabled>
            Guest
          </UI.SelectItem>
        </UI.SelectContent>
      </UI.Select>
    </div>
  ),
}
export const Sheet: Story = {
  render: () => (
    <UI.Sheet>
      <UI.SheetTrigger asChild>
        <UI.Button>Open panel</UI.Button>
      </UI.SheetTrigger>
      <UI.SheetContent>
        <UI.SheetHeader>
          <UI.SheetTitle>Project settings</UI.SheetTitle>
          <UI.SheetDescription>
            Adjust your project preferences.
          </UI.SheetDescription>
        </UI.SheetHeader>
        <p className="p-4">Press Escape or click outside to close.</p>
      </UI.SheetContent>
    </UI.Sheet>
  ),
}
export const MenusAndPopover: Story = {
  render: () => (
    <div className="flex gap-4">
      <UI.DropdownMenu>
        <UI.DropdownMenuTrigger asChild>
          <UI.Button variant="outline">Actions</UI.Button>
        </UI.DropdownMenuTrigger>
        <UI.DropdownMenuContent>
          <UI.DropdownMenuLabel>Project</UI.DropdownMenuLabel>
          <UI.DropdownMenuItem>Edit</UI.DropdownMenuItem>
          <UI.DropdownMenuItem disabled>Archive</UI.DropdownMenuItem>
        </UI.DropdownMenuContent>
      </UI.DropdownMenu>
      <UI.Popover>
        <UI.PopoverTrigger asChild>
          <UI.Button variant="outline">Details</UI.Button>
        </UI.PopoverTrigger>
        <UI.PopoverContent>Additional project settings.</UI.PopoverContent>
      </UI.Popover>
      <UI.Tooltip>
        <UI.TooltipTrigger asChild>
          <UI.Button size="icon" aria-label="Help">
            ?
          </UI.Button>
        </UI.TooltipTrigger>
        <UI.TooltipContent>Get help with this setting</UI.TooltipContent>
      </UI.Tooltip>
    </div>
  ),
}
export const DisplayPrimitives: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <UI.Avatar>
          <UI.AvatarFallback>AL</UI.AvatarFallback>
        </UI.Avatar>
        <UI.Badge>Active</UI.Badge>
        <UI.Badge variant="secondary">Draft</UI.Badge>
        <UI.Badge variant="destructive">Failed</UI.Badge>
        <UI.Badge variant="outline">Pending</UI.Badge>
      </div>
      <UI.Alert>
        <UI.AlertTitle>Saved</UI.AlertTitle>
        <UI.AlertDescription>
          Your changes are stored locally.
        </UI.AlertDescription>
      </UI.Alert>
      <UI.Alert variant="destructive">
        <UI.AlertTitle>Unable to save</UI.AlertTitle>
        <UI.AlertDescription>
          Check the field errors and try again.
        </UI.AlertDescription>
      </UI.Alert>
      <UI.Separator />
      <UI.Skeleton className="h-10 w-60" aria-label="Loading content" />
      <UI.Tabs defaultValue="overview">
        <UI.TabsList>
          <UI.TabsTrigger value="overview">Overview</UI.TabsTrigger>
          <UI.TabsTrigger value="details">Details</UI.TabsTrigger>
          <UI.TabsTrigger value="disabled" disabled>
            Unavailable
          </UI.TabsTrigger>
        </UI.TabsList>
        <UI.TabsContent value="overview">Overview content</UI.TabsContent>
        <UI.TabsContent value="details">Details content</UI.TabsContent>
      </UI.Tabs>
      <UI.Table>
        <UI.TableCaption>Project status</UI.TableCaption>
        <UI.TableHeader>
          <UI.TableRow>
            <UI.TableHead>Name</UI.TableHead>
            <UI.TableHead>Status</UI.TableHead>
          </UI.TableRow>
        </UI.TableHeader>
        <UI.TableBody>
          <UI.TableRow>
            <UI.TableCell>Launchpad</UI.TableCell>
            <UI.TableCell>Ready</UI.TableCell>
          </UI.TableRow>
        </UI.TableBody>
      </UI.Table>
    </div>
  ),
}
export const Toasts: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <UI.Button onClick={() => UI.toast.success('Project saved')}>
        Success toast
      </UI.Button>
      <UI.Button
        variant="destructive"
        onClick={() => UI.toast.error('Unable to save project')}
      >
        Error toast
      </UI.Button>
      <UI.Button
        variant="outline"
        onClick={() =>
          UI.toast('Draft ready', {
            action: { label: 'Undo', onClick: () => UI.toast('Undone') },
          })
        }
      >
        Action toast
      </UI.Button>
    </div>
  ),
}
