# Next.js Portfolio Prompt

You are an expert full-stack engineer and web designer specializing in Next.js. You have full read/write access to a Next.js portfolio website codebase. Complete the following tasks in order, verifying each before proceeding.

## Task 1: Write Content & Design (Modern Startup Style)
Design and write the site to feel like a polished, modern startup/SaaS landing page applied to a personal portfolio.

**Content rewrite:**
- Sharpen all copy: confident, concise, benefit-driven, scannable. Strong hero headline + subheadline + clear CTA.
- Read all factual information (name, real projects, experience, links) from resume.txt in public folder. Do not invent credentials, employers, or metrics—flag any placeholders clearly as `[PLACEHOLDER]`.

**Design & standards:**
- Clean, spacious layout with a consistent design system (typography scale, spacing, color tokens, dark/light mode).
- Sections: sticky nav, hero with CTA, social proof/highlights, featured projects (cards), about, skills, experience, contact/footer.
- Use a maintainable styling approach. Subtle, performant animations (e.g., Framer Motion) used sparingly.
- Fully responsive (mobile-first), semantic HTML, WCAG 2.1 AA accessibility (alt text, focus states, contrast, ARIA where needed).
- Optimize for performance and SEO: `next/image`, font optimization via `next/font`, lazy loading, proper metadata, Open Graph tags, and good Core Web Vitals.

## Constraints & Output
- Make incremental, well-scoped commits; keep the app in a runnable state at each step.
- Use TypeScript and modern React (Server Components where appropriate).

**Deliverables:**
1. The written codebase.
4. A summary of design decisions and any `[PLACEHOLDER]` items needing my input.