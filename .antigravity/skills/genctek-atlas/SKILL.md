---
name: genctek-atlas
description: Use when working on the GençTek Atlas educational web app or its student-facing Vibe Coding materials, including building the app from scratch with prompts, React/Vite/Firebase implementation, Turkey map features, role-based dashboards, Firestore/Storage security rules, testing, deployment, and documentation for high school students.
---

# GençTek Atlas Skill

Use this skill when asked to build, improve, explain, test, secure, or document GençTek Atlas.

## Product Goal

Build a student-friendly educational platform that shows technology events and student projects across Turkey. The app should support:

- Interactive Turkey map with city, theme, format, and text filters
- Event and project submission flows
- Student, teacher, principal, coordinator, and admin roles
- Teacher, principal, and admin dashboards
- Study groups, group tasks, and announcements
- Direct messaging with strict participant access
- Notifications, XP, badges, and profile summaries
- Analytics for events, projects, schools, cities, themes, and pending records
- Firebase Hosting deployment

## Default Technical Stack

Prefer:

- React with Vite
- React Router
- Vanilla CSS
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase Hosting
- Lucide React for icons
- SVG map first; React-Leaflet and GeoJSON only when a more advanced map is needed
- Vitest and React Testing Library for automated tests

Avoid adding heavy UI frameworks unless the user explicitly asks.

## Student-Facing Writing Rules

When writing prompts, guides, README sections, or educational docs:

- Write in simple Turkish for high school students.
- Keep "Açıklama" and "Prompt" separated.
- Assume the student may be starting from zero and may not know file names.
- For prompt libraries, avoid references like "open this file" or "edit this component" unless the task is explicitly about the existing repository.
- Prefer wording like: "Gerekli dosya ve klasörleri sen oluştur."
- Explain technical words briefly when first used.
- Keep each prompt focused on one build step.

## Prompt Guide Policy

The main prompt guide is `docs/VIBE_CODING_PROMPTS.md`.

For that guide, treat the repository as if it does not exist. The prompts must help a student generate GençTek Atlas from scratch with an AI coding tool. Include these sections when relevant:

- Project idea and roadmap
- Tech choice and setup
- First working homepage
- Pages and navigation
- Map and filters
- Event and project forms
- Firebase connection
- Database model
- User login and roles
- Dashboards
- Study groups and tasks
- Direct messaging
- Notifications, XP, and badges
- Analytics
- Design and mobile responsiveness
- Firebase security rules
- Security audit
- Manual tests
- Automated tests
- Test failure debugging
- Deployment
- General debugging
- Short helper prompts

## Implementation Guidelines

When editing the actual app:

- Read the nearby code before changing it.
- Preserve the existing React/Firebase/Vanilla CSS style.
- Keep changes scoped to the requested feature.
- Do not expose `.env.local` values or Firebase secrets.
- Keep demo mode working when Firebase config is missing.
- Make forms validate required fields and show clear Turkish error messages.
- Keep user-generated content rendered safely; avoid unsafe HTML.
- Keep route access and UI access aligned with user roles.
- Prefer small reusable helpers only when they reduce real duplication.

## Security Requirements

For Firestore and Storage rules or security reviews, check:

- Public users only read approved public events/projects.
- New submissions start as pending approval.
- Only admins can approve, reject, delete, or globally feature records.
- Students can only edit their own private profile data.
- Teachers only access their own students and related applications.
- Principals only access their school-level summaries.
- Message reads/writes are limited to conversation participants.
- Study groups are visible to members and authorized staff only.
- Storage restricts file type and size.
- GitHub/application links are validated.
- User text does not create XSS risk.
- Private Firebase config files are not committed.

## Testing Policy

For code changes, suggest or run the most relevant checks:

- `npm run lint`
- `npm run test`
- `npm run build`

For student-facing prompt/documentation-only changes, do not run app tests unless requested. Instead, check Markdown structure, headings, and whether prompts match the target audience.

Useful test areas:

- Map city selection and filtering
- Search and theme filtering
- Form validation, including GitHub URL validation
- Protected screens for logged-out users
- Role-based dashboard visibility
- Admin approval/rejection flows
- Direct messaging access rules
- Notification unread counts
- Task status changes

## Deployment Checklist

Before deployment:

- Confirm Firebase project settings are configured.
- Confirm secrets are stored outside source control.
- Run lint, tests, and build.
- Review Firestore and Storage rules.
- Confirm demo data is not accidentally treated as production data.
- Deploy rules before or together with hosting.

## Response Style

Use concise, practical Turkish for user-facing responses in this project. Mention changed files and verification. Do not over-explain routine implementation details.
