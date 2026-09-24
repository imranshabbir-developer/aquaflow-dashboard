# Modern P3Care SMS Dashboard

## Goal
Rebuild the supplied SMS workspace as a polished, portfolio-grade React application while preserving its core content and workflow. The uploaded screenshot is a structural reference only; the new interface will use the requested ocean-blue to cyan identity, modern spacing, typography, controls, and responsive behavior.

## Assumptions
- This delivery is a frontend prototype: any non-empty email and password opens the dashboard; no real account service or persistent backend is added.
- All sidebar destinations will be functional routed pages with polished representative content and interactions.
- The SMS page is the priority and will be the most complete workflow.
- The blocked reference URL will not be scraped; the supplied screenshot contains the source content and navigation needed for this rebuild.

## Experience and Visual Direction
- Use a premium “clinical communications command center” direction: crisp white workspace, deep ocean-blue/cyan navigation, restrained shadows, subtle grid texture, and purposeful depth.
- Keep the supplied gradient family anchored by `#1A82A8` and `#32A3CD`, extended into semantic design tokens for accessible states.
- Use Sora for distinctive headings and Manrope for dense, readable interface copy.
- Use compact radii, clear separators, high-contrast active states, and subtle motion rather than exaggerated 3D effects.
- The desktop SMS workspace will preserve the proven three-pane model: shared navigation, conversation list, active conversation.
- Mobile and tablet layouts will collapse intelligently: persistent navigation trigger, conversation drill-in, and touch-friendly controls without overlap.

## Routes and Shared Structure
- `/` — centered modern sign-in screen with branded identity, email/password fields, password visibility, remember option, validation, loading state, and demo access.
- `/sms` — complete messaging workspace.
- `/contacts` — searchable contacts directory with contact detail actions.
- `/bulk-sms` — campaign composer with audience, message, scheduling, and summary controls.
- `/users` — user and role management interface.
- `/settings` — messaging, notification, sender, and workspace preferences.
- `/profile` — personal details and account preferences.
- Shared authenticated shell — collapsible gradient sidebar, responsive top bar, breadcrumbs/page title, notification control, and account menu.
- Logout clears the demo session and returns to sign-in.

## SMS Workspace
- New-message flow with recipient selection and message composer.
- Search plus a filter selector for phone number/contact/message text.
- Recent, bookmarked, and unread tabs with accurate counts and active states.
- Conversation rows with selection, initials, sender source, timestamp, preview, unread state, and bookmark affordance.
- Active-chat header with contact details, call/action menu, bookmark, and delete confirmation.
- Distinct incoming/outgoing messages, timestamps, delivery/read indicators, and date separators.
- Composer with attachment action, character count, send button, keyboard submission, disabled/empty state, and simulated sending.
- Responsive conversation switching and an intentional empty state when no conversation is selected.
- In-memory demo interactions so search, filters, tabs, bookmarking, message creation, sending, and conversation deletion visibly work.

## Reusable Architecture
- Separate route files for every page with route-specific titles and social metadata.
- Shared application shell and navigation configuration.
- Reusable page header, stat blocks, searchable toolbar, empty state, confirmation dialog, form controls, and status badge patterns.
- Domain components for conversation list, chat header, message thread, composer, contact rows, campaign form, user table, settings panels, and profile form.
- Central typed demo data and UI models so a future API can replace local data without redesigning pages.
- Semantic theme values in the global design system; no ad hoc colors in page components.

## Motion and Interaction
- Short sidebar and page transitions, tactile button feedback, smooth panel changes, and subtle message-entry motion.
- Respect reduced-motion preferences.
- Use familiar icons with tooltips for icon-only actions and preserve keyboard/focus accessibility.

## Validation
- Verify every navigation item opens its own page and shared navigation remains available.
- Exercise sign-in, logout, search, tabs, bookmark, new conversation, send, delete, settings, and profile interactions.
- Check desktop and mobile layouts for clipping, overlap, readable text, and usable controls.
- Confirm all content routes provide unique metadata and the application finishes without type or runtime errors.
