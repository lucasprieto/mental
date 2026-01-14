# Phase 13: Dashboard Redesign - Research

**Researched:** 2026-01-14
**Domain:** React/Next.js sidebar layout with Tailwind CSS
**Confidence:** HIGH

<research_summary>
## Summary

Researched sidebar layout patterns for admin dashboards using Next.js 15, React 19, and Tailwind CSS. The standard approach uses a fixed sidebar with CSS Grid layout (`grid-cols-[<sidebar-width>_1fr]`), maintaining the sidebar fixed while the main content scrolls.

For collapsible sections, Headless UI's Disclosure component is the established solution - it provides accessible, unstyled collapsible functionality that integrates perfectly with Tailwind CSS and handles ARIA attributes automatically.

Linear's design philosophy emphasizes reducing visual noise, maintaining alignment, and maximizing content density while keeping the interface clean and keyboard-friendly. The key is purposeful minimalism - no busy sidebars or excessive UI elements.

**Primary recommendation:** Use CSS Grid with fixed sidebar (w-64), Headless UI Disclosure for collapsible sections, and apply Linear-style minimal aesthetics with subtle hover states.
</research_summary>

<standard_stack>
## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | ^15.0.0 | Framework | Already in project |
| react | ^19.0.0 | UI library | Already in project |
| tailwindcss | ^3.4.0 | Styling | Already in project |

### Add for This Phase
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @headlessui/react | ^2.2.0 | Disclosure component | Tailwind Labs' official accessible UI - handles ARIA, keyboard nav |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Headless UI Disclosure | Native `<details>` | Native is simpler but less control over animations/styling |
| Headless UI Disclosure | Custom state + useState | Custom works but must implement ARIA manually |
| Fixed sidebar | Drawer (mobile-style) | Drawer is mobile-first; fixed sidebar is desktop admin pattern |

**Installation:**
```bash
pnpm add @headlessui/react
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Layout Structure
```
app/
├── layout.tsx          # Grid layout with sidebar
├── page.tsx            # Dashboard content
└── components/
    ├── Sidebar.tsx     # Filter sidebar component
    └── CollapsibleSection.tsx  # Reusable collapsible
```

### Pattern 1: CSS Grid Sidebar Layout
**What:** Fixed sidebar with scrollable main content using CSS Grid
**When to use:** Admin dashboards, filter-heavy interfaces
**Example:**
```tsx
// Source: Tailwind CSS patterns + Flowbite docs
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {/* Grid: sidebar + main */}
        <div className="grid grid-cols-[16rem_1fr] min-h-screen">
          {/* Fixed sidebar */}
          <aside className="fixed top-0 left-0 w-64 h-screen overflow-y-auto border-r border-gray-200 bg-white">
            <Sidebar />
          </aside>

          {/* Main content with left margin to account for fixed sidebar */}
          <main className="ml-64">
            <header className="border-b border-gray-200 px-6 py-4">
              <h1 className="text-xl font-semibold">Mental</h1>
            </header>
            <div className="px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
```

### Pattern 2: Headless UI Disclosure for Collapsible
**What:** Accessible collapsible section with animation support
**When to use:** Any show/hide content (recently resolved section)
**Example:**
```tsx
// Source: Headless UI docs
import { Disclosure, DisclosureButton, DisclosurePanel, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

function CollapsibleSection({ title, children, defaultOpen = false }) {
  return (
    <Disclosure defaultOpen={defaultOpen}>
      {({ open }) => (
        <>
          <DisclosureButton className="flex w-full items-center justify-between py-2 text-left">
            <span className="text-lg font-semibold">{title}</span>
            <ChevronDownIcon
              className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </DisclosureButton>
          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform opacity-0"
            enterTo="transform opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform opacity-100"
            leaveTo="transform opacity-0"
          >
            <DisclosurePanel>
              {children}
            </DisclosurePanel>
          </Transition>
        </>
      )}
    </Disclosure>
  )
}
```

### Pattern 3: Linear-Style Filter Buttons
**What:** Minimal pill buttons with subtle hover states
**When to use:** Filter controls in sidebar
**Example:**
```tsx
// Source: Linear design patterns
function FilterButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 text-sm rounded-md transition-colors
        ${active
          ? 'bg-gray-900 text-white'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }
      `}
    >
      {children}
    </button>
  )
}
```

### Anti-Patterns to Avoid
- **Heavy shadows/borders:** Linear style is flat and minimal - use subtle borders, not box shadows
- **Overloaded sidebar:** Only essential filters, don't dump everything in sidebar
- **Missing ARIA:** Use Headless UI - it handles aria-expanded, aria-controls automatically
- **Inline collapsible state:** Use Headless UI Disclosure instead of manual useState + conditional render
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Collapsible section | Custom useState + conditional render | Headless UI Disclosure | ARIA handling, keyboard nav, focus management |
| Animation for collapse | CSS transition on height | Headless UI Transition | Height animation is tricky (auto height), Transition handles it |
| Accessible toggle | Button with onclick | DisclosureButton | Handles aria-expanded, keyboard, focus automatically |

**Key insight:** Collapsible/disclosure UI seems simple but has accessibility requirements (aria-expanded, keyboard navigation, focus management) that Headless UI handles correctly. Rolling your own means implementing all this manually.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Fixed Sidebar + Scrolling Content Conflict
**What goes wrong:** Main content scrolls behind fixed sidebar or doesn't scroll properly
**Why it happens:** Not accounting for fixed sidebar width in content layout
**How to avoid:** Use `ml-64` (margin-left matching sidebar width) on main content area
**Warning signs:** Content appears underneath sidebar, horizontal scrollbar appears

### Pitfall 2: Missing aria-expanded on Collapsible
**What goes wrong:** Screen readers don't announce expand/collapse state
**Why it happens:** Using custom div/button without ARIA attributes
**How to avoid:** Use Headless UI Disclosure which handles this automatically
**Warning signs:** Accessibility audit fails, screen reader testing shows missing announcements

### Pitfall 3: Height Animation on Collapsible
**What goes wrong:** Collapse animation is jerky or doesn't work
**Why it happens:** CSS can't animate `height: auto`
**How to avoid:** Use opacity/transform animations (like Headless UI Transition) or accept instant show/hide
**Warning signs:** Trying to animate height directly, content jumps

### Pitfall 4: Sidebar Z-Index Issues
**What goes wrong:** Modals, dropdowns appear behind sidebar
**Why it happens:** Fixed sidebar without proper z-index stacking
**How to avoid:** Use z-40 for sidebar, ensure modals/overlays use higher z-index (z-50+)
**Warning signs:** Dropdowns cut off by sidebar edge
</common_pitfalls>

<code_examples>
## Code Examples

### Sidebar Filter Section
```tsx
// Source: Flowbite sidebar patterns + Linear aesthetics
function SidebarFilters({ themes, activeStatus, activeTheme, onStatusChange, onThemeChange }) {
  return (
    <nav className="p-4 space-y-6">
      {/* Status filter */}
      <div>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          Status
        </h3>
        <div className="space-y-1">
          {['all', 'open', 'resolved'].map((status) => (
            <button
              key={status}
              onClick={() => onStatusChange(status)}
              className={`
                w-full px-3 py-1.5 text-sm text-left rounded-md transition-colors
                ${activeStatus === status
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Theme filter */}
      {themes.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Theme
          </h3>
          <div className="space-y-1">
            {themes.map((theme) => (
              <button
                key={theme}
                onClick={() => onThemeChange(activeTheme === theme ? null : theme)}
                className={`
                  w-full px-3 py-1.5 text-sm text-left rounded-md transition-colors
                  ${activeTheme === theme
                    ? 'bg-purple-100 text-purple-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
```

### Compact Theme Pills (Slim Display)
```tsx
// Source: Linear-style compact indicators
function ThemePills({ themes }) {
  if (themes.length === 0) return null

  return (
    <div className="flex items-center gap-1.5 px-4 py-2 border-b border-gray-100">
      <span className="text-xs text-gray-400">Themes:</span>
      {themes.map(theme => (
        <span
          key={theme}
          className="px-2 py-0.5 text-xs bg-purple-50 text-purple-600 rounded"
        >
          {theme}
        </span>
      ))}
    </div>
  )
}
```
</code_examples>

<sota_updates>
## State of the Art (2025-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom ARIA handling | Headless UI 2.x | 2024 | v2 has simpler API, better React 19 support |
| Heavy UI frameworks | Tailwind + Headless UI | 2023+ | Lighter, more customizable |
| CSS-in-JS for state styles | Tailwind data attributes | 2024 | `data-[state]:` selectors in Tailwind |

**New patterns to consider:**
- **Headless UI 2.x:** Simplified component API, better composition
- **Server Components:** Sidebar can be server component, interactivity at leaf nodes

**Still valid:**
- CSS Grid for sidebar layouts
- Fixed positioning for persistent sidebar
- Tailwind transition utilities for animations
</sota_updates>

<open_questions>
## Open Questions

1. **Mobile behavior (out of scope)**
   - What we know: Phase 16 handles mobile
   - What's unclear: Will sidebar become drawer on mobile?
   - Recommendation: Build desktop-first, add responsive later

2. **Sidebar state persistence**
   - What we know: Filters use URL params (current pattern)
   - What's unclear: Should collapsed/expanded state persist?
   - Recommendation: Keep URL params for filters, expand state can be ephemeral
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- /websites/headlessui_com - Disclosure component API and examples
- /websites/v3_tailwindcss - Layout utilities
- Flowbite sidebar docs - Fixed sidebar patterns

### Secondary (MEDIUM confidence)
- [Linear redesign blog](https://linear.app/now/how-we-redesigned-the-linear-ui) - Design philosophy
- [Tailwind UI sidebar examples](https://tailwindcss.com/plus/ui-blocks/application-ui/application-shells/sidebar) - Layout structure patterns
- [Flowbite sidebar](https://flowbite.com/docs/components/sidebar/) - Implementation details

### Tertiary (needs validation during implementation)
- Exact z-index values may need adjustment based on existing components
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Next.js 15 + React 19 + Tailwind CSS 3.4
- Ecosystem: Headless UI for accessible components
- Patterns: CSS Grid sidebar layout, Disclosure for collapsible
- Pitfalls: Fixed positioning, ARIA requirements, height animation

**Confidence breakdown:**
- Standard stack: HIGH - using project's existing stack + Headless UI (Tailwind Labs official)
- Architecture: HIGH - CSS Grid + fixed sidebar is well-documented pattern
- Pitfalls: HIGH - common issues documented across multiple sources
- Code examples: HIGH - from Context7/official Headless UI docs

**Research date:** 2026-01-14
**Valid until:** 2026-02-14 (30 days - Tailwind/Headless UI ecosystem stable)
</metadata>

---

*Phase: 13-dashboard-redesign*
*Research completed: 2026-01-14*
*Ready for planning: yes*
