# Editable primitives

Import from `@/core/ui` or directly from `@/core/ui/components/<name>`. The source is owned by this repository and consumes the shared semantic tokens. Keep large examples behind lazy routes; importing the calendar or command palette is not part of starter initialization.

Radix remains the interaction foundation. There is no Base UI migration. Components accept native/Radix props and compose with `asChild`; they do not own application data, schemas or React Hook Form state. Task 10 owns form wrappers and validation integration.

## API and accessibility

- `Button` uses `variant="default|secondary|destructive|outline|ghost|link"`, `size="default|sm|lg|icon|icon-sm|icon-lg"` and `loading`. Loading preserves its accessible name, adds a decorative spinner and `aria-busy`, and blocks activation. Disabled/loading slotted links also block navigation and leave the tab order. Give icon buttons an `aria-label` or visually hidden text. Keep supplementary icons `aria-hidden`.
- `Input` and `Textarea` expose native props and refs. Compose `Field`, `FieldLabel`, `FieldDescription` and `FieldError`; connect `htmlFor`/`id`, `aria-invalid` and `aria-describedby` explicitly. Do not put schema state inside a primitive.
- Every `Dialog`, `AlertDialog`, `Sheet` and `Drawer` needs its corresponding title and description. Escape, focus trapping and focus return belong to Radix/Vaul. Dialog/sheet dismiss outside; alert dialogs require an explicit action or Escape. Supply `onCloseAutoFocus` when a controlled dialog has no Radix trigger or removes its trigger after a successful action.
- `SelectItem` values must be nonempty. Use a sentinel such as `all` for a reset option and map it to application filter state at the boundary. Name the `SelectTrigger`.
- Name `Slider` with `aria-label` or `aria-labelledby`; names reach individual thumbs. A labelled range adds minimum/maximum to thumb names. `Progress` exposes its value and maximum to assistive technology, uses the same ratio visually, and `value={null}` is indeterminate. Give `Command` its `label`; `CommandDialog` uses its title as the command label.
- Native password/number/file input types are primitives. Password visibility, parsing, date-only semantics, multi-select state and upload transport belong to the later field/adapter tasks.
- Mount one `Toaster` inside `ThemeProvider`. `toast` and the existing `useToast` convenience facade both use Sonner. These are one renderer and one queue.

## Migration

| Previous API                                               | Current API / consumer migration                                                                                                                                                            |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button isLoading`                                         | `Button loading`; auth pages and stories migrated                                                                                                                                           |
| `Button fullWidth`                                         | `className="w-full"`; layouts and auth pages migrated                                                                                                                                       |
| `Input label/error`                                        | Explicit `FieldLabel` / `FieldError` with native ARIA props; auth and user edit forms migrated                                                                                              |
| `Modal` alias for `Dialog`                                 | Import and compose `Dialog` by its real name                                                                                                                                                |
| Custom `Modal/`, `ModalProvider`, `useModal().openConfirm` | Controlled `Dialog` / `AlertDialog`; user deletion now uses `AlertDialog`, retains trigger focus on Cancel, focuses the persistent table region on success and stays open on mutation error |
| Custom `Form/Select`, `Form/Checkbox`, etc.                | Canonical lowercase composable primitives; unused competing wrappers removed                                                                                                                |
| `Toast.tsx` wrapper                                        | `Toaster` from `sonner.tsx`, `toast` or `useToast`; redundant wrapper removed                                                                                                               |
| Empty `SelectItem value=""`                                | Nonempty reset sentinel; user role/status filters migrated                                                                                                                                  |

## Inventory against design section 6

Status means **existing** before Task 5, **new** in Task 5, or **composite** built from primitives. Future composites are explicitly marked; this inventory does not claim later tasks are complete.

| Design items                                                     | Status                       | Implementation / remaining owner                                                                                      |
| ---------------------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Button, badge, avatar, card, separator, skeleton                 | existing                     | Canonical lowercase components; Button API standardized                                                               |
| Button group, spinner, empty state                               | new                          | `button-group`, `spinner`, `empty`                                                                                    |
| Icon button, link, typography, error state                       | composite                    | Named `Button size="icon"`, `Button asChild` + link, semantic HTML + typography tokens, `Alert variant="destructive"` |
| Input, textarea, checkbox, radio, switch, select                 | existing                     | Native/Radix primitives; competing `Form/` removed                                                                    |
| Password, number                                                 | composite                    | Native `Input type="password                                                                                          | number"`; product field wrappers in Task 10 |
| Searchable combobox                                              | composite                    | `Popover` + `Command`; keyboard/search example in Primitives stories. Async options in Task 11                        |
| Multi-select                                                     | composite, future            | Task 11 field state and keyboard/removal behavior                                                                     |
| Slider                                                           | new                          | `slider`, single/range and disabled examples                                                                          |
| Date/date-range                                                  | new + composite              | `Calendar` single/range; popover field and date semantics in Tasks 10–11                                              |
| File picker                                                      | composite, future            | Native input available; Task 15 selection/preview/upload adapter                                                      |
| Dialog, sheet, popover, tooltip, dropdown, toast                 | existing                     | Radix and Sonner; one documented API                                                                                  |
| Alert dialog/confirm, drawer, context menu, hover card           | new                          | `alert-dialog`, Vaul `drawer`, `context-menu`, `hover-card`                                                           |
| Sidebar, navbar                                                  | composite, future            | Task 6 AppShell; Task 7 public site shell                                                                             |
| Breadcrumb, tabs                                                 | existing                     | `Breadcrumbs`, `Tabs`                                                                                                 |
| Pagination, navigation menu, collapsible, accordion, scroll area | new                          | Corresponding lowercase components                                                                                    |
| Command palette                                                  | new + composite              | `Command`, `CommandDialog`; application command registry in Task 16                                                   |
| Table/DataTable                                                  | existing                     | Table primitives, existing DataTable; Task 14 client/manual product contract                                          |
| Chart wrapper/states, carousel                                   | composite, future            | Task 16                                                                                                               |
| Progress, resizable panel                                        | new                          | `progress`, `resizable` (v4 Group/Panel/Separator)                                                                    |
| AppShell, SiteShell, AuthLayout                                  | existing + composite, future | Existing AuthLayout; Tasks 6–7 shared shells                                                                          |
| PageHeader, PageSection, toolbar, filter bar, stat card          | composite, future            | Task 7                                                                                                                |
| Hero, feature grid, pricing, FAQ, CTA, footer                    | composite, future            | Task 7                                                                                                                |

## Sources and dependencies

The 20 new source files adapt the official [shadcn/ui new-york-v4 registry](https://ui.shadcn.com/r/styles/new-york-v4/accordion.json), retrieved 2026-10-27. The upstream [MIT license](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md) is included at `src/core/ui/licenses/shadcn-ui.md`. Adaptations use this project's utility aliases, individual Radix packages, semantic focus/disabled tokens, and fix progress value forwarding, slider thumb names and command dialog title placement. Registry names identify the source variant; application code stays editable locally.

New runtime dependencies are pinned exactly; existing dependency major versions are preserved. Registry metadata was checked for MIT licensing and React 19 peer compatibility before installation.

| Package                           | Version | Purpose                  |
| --------------------------------- | ------- | ------------------------ |
| `@radix-ui/react-accordion`       | 1.3.1   | Accordion                |
| `@radix-ui/react-alert-dialog`    | 1.2.1   | Confirm dialog           |
| `@radix-ui/react-collapsible`     | 1.2.1   | Collapsible              |
| `@radix-ui/react-context-menu`    | 2.4.1   | Context menu             |
| `@radix-ui/react-hover-card`      | 1.2.1   | Hover card               |
| `@radix-ui/react-navigation-menu` | 1.4.1   | Navigation menu          |
| `@radix-ui/react-progress`        | 1.2.1   | Progress                 |
| `@radix-ui/react-scroll-area`     | 1.4.0   | Scroll area              |
| `@radix-ui/react-slider`          | 1.6.1   | Slider                   |
| `@radix-ui/react-toggle`          | 1.2.1   | Toggle                   |
| `@radix-ui/react-toggle-group`    | 1.2.1   | Toggle group             |
| `cmdk`                            | 1.1.1   | Command search           |
| `vaul`                            | 1.1.2   | Drawer                   |
| `react-day-picker`                | 10.0.2  | Calendar                 |
| `date-fns`                        | 4.4.0   | Calendar date dependency |
| `react-resizable-panels`          | 4.15.0  | Resizable panels         |

## Verification

`primitives.test.tsx` covers slotted/disabled/loading buttons, accessible names, progress values, slider keyboard input and modal title/description, Escape/outside dismissal and focus return. `UserTable.test.tsx` proves confirmation no longer requires the removed modal provider. Stories cover each new primitive, compositions and relevant disabled, invalid, loading and focus states; Button/Input/Card keep dedicated stories. Whole-catalog/a11y automation is expanded in Tasks 18 and 21; these checks are not a screen-reader certification.
