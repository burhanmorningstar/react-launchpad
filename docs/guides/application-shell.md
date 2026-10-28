# Application shell

`AppShell` is a reusable layout, independent of authentication and product
configuration. Dashboard and admin layouts supply their differences as navigation
data and slots. The application layer translates labels, filters permissions and
creates account actions. Route guards still own route access; menu filtering is a
view decision, not an authorization boundary.

`AppRouter` supplies the discovered feature descriptors through an app-owned
context. `ApplicationLayout` consumes each feature's optional `menu` entries and
associates them with that feature's route `mount` using `matchRoutes`, without
calling lazy page loaders. Dashboard/admin ownership and role filtering remain
in the app. Public/guest entries do not automatically join private shell menus.
Existing demo descriptors now advertise their menus; a new mounted feature can
add `{ id, label, href }` entries without editing a central destination list.
Labels can be translation keys or plain text. Optional icon and fallback-label
overrides in `app/navigation.ts` are presentation choices, not registration.

```tsx
import { AppShell } from '@/core/layouts/AppShell'

// Render inside a React Router. Supply the shared CSS tokens once at app entry.
;<AppShell
  nav={[
    { id: 'overview', label: 'Overview', href: '/workspace' },
    {
      id: 'team',
      label: 'Team',
      children: [{ id: 'people', label: 'People', href: '/workspace/people' }],
    },
  ]}
  logo={<MyBrand />}
  compactLogo={<MyBrandMark />}
  title="Workspace"
  headerActions={<MyHeaderActions />}
  userMenu={<MyAccountMenu />}
  footer={<MySidebarFooter />}
>
  <MyPage />
</AppShell>
```

`NavigationItem` has a unique `id`, plain `label`, optional `href`, decorative
`icon`, `children` and `disabled`. Use path-based internal URLs. The longest
matching route path determines `aria-current="page"`; query strings do not inflate
route specificity. Active nested branches expand when the path changes; users can
also toggle branches with normal button keyboard controls. Disabled entries have
no actionable link. Remove unauthorized entries before passing them to core.

The `logo` slot serves expanded navigation and the mobile header. `compactLogo`
is optional and replaces it on collapsed desktop navigation. The footer belongs
to the sidebar and is removed from the keyboard path when collapsed. Keep branding
slots narrow and give icon-only actions accessible names. Header actions and the
account menu should remain compact at 360 px.

## State and responsive behavior

Every `AppShell` creates one `ShellProvider` and a private vanilla Zustand store.
It starts with `mobileOpen=false` and accepts `defaultDesktopCollapsed` for the
initial desktop preference. Desktop collapse is retained through viewport changes
and navigation within that mounted shell; it is not stored in localStorage.
Independent shell instances do not share state.

`useShell` is available to custom descendants. `ShellProvider`, `AppHeader` and
`AppSidebar` are lower-level composition pieces; the mobile header expects a Radix
Sheet root. Most consumers should use `AppShell` directly rather than wrapping it
in a second provider. The former global `useUIStore.sidebarOpen/toggleSidebar`
API was removed; it conflated desktop preference and mobile visibility. Application
consumers now use the shell controls, with no duplicated sidebar state.

Desktop starts at `64rem`; below it, navigation is a modal Sheet. Location changes
(including query/hash navigation) and breakpoint changes close mobile navigation.
Escape and outside dismissal use Radix focus trapping. Closing or crossing to
desktop returns focus to the current navigation control. If a focused desktop
sidebar disappears at the mobile breakpoint, focus moves to the visible menu
control. A focused main-content element is preserved. The skip link targets the
single focusable main landmark.

The header and desktop sidebar are sticky. Edit these tokens in
`src/styles/tokens.css`:

| Token                             | Default  |
| --------------------------------- | -------- |
| `--shell-header-height`           | `4rem`   |
| `--shell-sidebar-width`           | `17rem`  |
| `--shell-sidebar-collapsed-width` | `4.5rem` |
| `--shell-content-min-width`       | `0px`    |
| `--page-gutter`                   | `1.5rem` |

Sidebar colors resolve to the existing `--sidebar-*` tokens. No product name,
auth/session import or brand palette is embedded in core. Application branding is
read from `ProjectConfig` through `ProjectBrand`, including the auth layout.

## Local verification

Unit tests cover active subroutes and query specificity, nested groups, separate
collapse/mobile state, instance isolation, hidden footer actions, skip links,
route/breakpoint closure and focus return. `e2e/shell.spec.ts` uses a local session
fixture, not a backend login, at 360/768/1440 px in light/dark mode. Storybook
provides a second product, collapsed layout and long/nested/disabled navigation
fixtures. Later locale and accessibility tasks expand language/RTL and whole-app
coverage; these checks do not certify a live backend or screen-reader behavior.
