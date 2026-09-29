import { existsSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { iconMap } from './icons'
import { industries } from './industries'
import { getRelatedProjects, projectFilters, projects } from './projects'
import { services } from './services'
import { INDUSTRY_SLUGS, PROJECT_CATEGORIES } from '@/types'

/**
 * Data-integrity tests (PLAN Phase 6). ESI edits `src/data/*.ts` by hand to add projects and
 * services, so these guard the invariants the pages rely on: unique slugs, valid categories
 * and industries, icons that exist, and image paths that are really in public/.
 */
const publicDir = path.resolve(import.meta.dirname, '../../public')
const imageExists = (src: string) => existsSync(path.join(publicDir, src))
const isKebab = (s: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)

describe('projects', () => {
  it('has unique slugs and ids', () => {
    expect(new Set(projects.map((p) => p.slug)).size).toBe(projects.length)
    expect(new Set(projects.map((p) => p.id)).size).toBe(projects.length)
  })

  it('uses kebab-case slugs', () => {
    for (const p of projects) expect(isKebab(p.slug), p.slug).toBe(true)
  })

  it('only uses known categories and industries', () => {
    for (const p of projects) {
      expect(p.categories.length, `${p.slug} has no category`).toBeGreaterThan(0)
      for (const c of p.categories) expect(PROJECT_CATEGORIES).toContain(c)
      expect(INDUSTRY_SLUGS).toContain(p.industry)
    }
  })

  it('points at images that exist', () => {
    for (const p of projects) {
      expect(imageExists(p.image), `${p.slug}: ${p.image}`).toBe(true)
      for (const g of p.gallery ?? []) expect(imageExists(g), `${p.slug}: ${g}`).toBe(true)
    }
  })

  it('features 3–6 projects on the home page', () => {
    const featured = projects.filter((p) => p.featured)
    expect(featured.length).toBeGreaterThanOrEqual(3)
    expect(featured.length).toBeLessThanOrEqual(6)
  })

  it('never lists a project as its own related project', () => {
    for (const p of projects) {
      const related = getRelatedProjects(p)
      expect(related.map((r) => r.id)).not.toContain(p.id)
      expect(related.length).toBeLessThanOrEqual(3)
    }
  })

  it('offers a filter tab for every category', () => {
    expect(projectFilters.map((f) => f.value)).toEqual(['all', ...PROJECT_CATEGORIES])
  })
})

describe('services', () => {
  it('has unique kebab-case slugs and unique categories', () => {
    expect(new Set(services.map((s) => s.slug)).size).toBe(services.length)
    for (const s of services) expect(isKebab(s.slug), s.slug).toBe(true)
    // Solution ↔ project linking assumes one service per category.
    expect(new Set(services.map((s) => s.category)).size).toBe(services.length)
  })

  it('uses known icons, categories, industries and existing images', () => {
    for (const s of services) {
      expect(Object.keys(iconMap)).toContain(s.icon)
      expect(PROJECT_CATEGORIES).toContain(s.category)
      for (const i of s.industries) expect(INDUSTRY_SLUGS).toContain(i)
      expect(imageExists(s.image), `${s.slug}: ${s.image}`).toBe(true)
      expect(s.features.length, `${s.slug} has no features`).toBeGreaterThan(0)
    }
  })
})

describe('industries', () => {
  it('covers every industry slug exactly once with valid icons and images', () => {
    expect(industries.map((i) => i.slug).sort()).toEqual([...INDUSTRY_SLUGS].sort())
    for (const i of industries) {
      expect(Object.keys(iconMap)).toContain(i.icon)
      expect(imageExists(i.image), `${i.slug}: ${i.image}`).toBe(true)
      expect(i.scope.length, `${i.slug} has no scope`).toBeGreaterThan(0)
    }
  })
})
