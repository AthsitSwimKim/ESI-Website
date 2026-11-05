import { describe, expect, it } from 'vitest'

import { createExampleProject, createProjectDraft } from '@/data/admin'
import { projects } from '@/data/projects'
import { hasDuplicateSlug, parseProjectDrafts } from '@/lib/admin'
import { checkImageFile, isInlineDraftImage, prepareDraftImages } from '@/lib/adminImages'

describe('admin draft boundary', () => {
  it('creates an explicitly labelled example without touching public data or colliding with existing records', () => {
    const example = createExampleProject(projects)
    expect(example.title).toContain('[Sample]')
    expect(example.titleTh).toContain('[ตัวอย่าง]')
    expect(example.scopeTh?.length).toBeGreaterThan(0)
    expect(example.gallery?.length).toBeGreaterThan(0)
    expect(parseProjectDrafts(JSON.stringify([example, ...projects]))).toHaveLength(
      projects.length + 1,
    )
    const secondExample = createExampleProject([example, ...projects])
    expect(secondExample.slug).not.toBe(example.slug)
    expect(projects.some((item) => item.slug === example.slug)).toBe(false)
  })
  it('round trips every existing field without changing public project data', () => {
    const restored = parseProjectDrafts(JSON.stringify(projects))
    expect(restored).toEqual(projects)
    restored[0].title = 'Local edit'
    expect(projects[0].title).not.toBe('Local edit')
  })

  it('rejects corrupt storage, duplicate records and malformed field types', () => {
    for (const raw of [
      '{',
      'null',
      '{}',
      JSON.stringify([projects[0], projects[0]]),
      JSON.stringify([{ ...projects[0], scope: [42] }]),
      JSON.stringify([{ ...projects[0], featured: 'true' }]),
      JSON.stringify([{ ...projects[0], categories: ['unknown'] }]),
    ]) {
      expect(() => parseProjectDrafts(raw)).toThrow()
    }
  })

  it('rejects remote and executable image paths in saved drafts', () => {
    for (const image of [
      'javascript:alert(1)',
      'https://example.com/photo.jpg',
      '/images/../secret.jpg',
    ]) {
      expect(() => parseProjectDrafts(JSON.stringify([{ ...projects[0], image }]))).toThrow()
    }
  })

  it('allows an empty workspace and allocates a stable new id above existing ids', () => {
    expect(parseProjectDrafts('[]')).toEqual([])
    expect(createProjectDraft(projects).id).toBe(Math.max(...projects.map((item) => item.id)) + 1)
    expect(hasDuplicateSlug({ ...projects[1], slug: projects[0].slug }, projects)).toBe(true)
    expect(hasDuplicateSlug(projects[0], projects)).toBe(false)
  })

  it('preserves uploaded raster data when drafts are saved and reloaded', () => {
    const image = 'data:image/webp;base64,UklGRg=='
    expect(parseProjectDrafts(JSON.stringify([{ ...projects[0], image }]))[0].image).toBe(image)
    for (const invalid of [
      'data:image/svg+xml;base64,PHN2Zz4=',
      'data:text/html;base64,PHNjcmlwdD4=',
      'data:image/webp;base64,broken',
      'data:image/webp;base64,' + 'A'.repeat(900000),
    ]) {
      expect(isInlineDraftImage(invalid)).toBe(false)
    }
  })

  it('rejects unsupported and oversized files before decoding', () => {
    expect(checkImageFile({ type: 'image/svg+xml', size: 100 })).toBe('uploadTypeError')
    expect(checkImageFile({ type: 'image/png', size: 11 * 1024 * 1024 })).toBe('uploadSizeError')
    expect(checkImageFile({ type: 'image/jpeg', size: 0 })).toBe('uploadSizeError')
    expect(checkImageFile({ type: 'image/webp', size: 1024 })).toBeNull()
  })

  it('keeps old gallery images and uploaded gallery images together through save and reload', () => {
    const gallery = [
      '/images/projects/map-ta-phut-tank-terminal-cctv.webp',
      'data:image/webp;base64,UklGRg==',
    ]
    const restored = parseProjectDrafts(JSON.stringify([{ ...projects[0], gallery }]))
    expect(restored[0].gallery).toEqual(gallery)
    expect(
      parseProjectDrafts(JSON.stringify([{ ...projects[0], gallery: [] }]))[0].gallery,
    ).toEqual([])
    for (const image of [
      'data:image/svg+xml;base64,PHN2Zz4=',
      'https://example.com/photo.jpg',
      '/images/../secret.jpg',
    ]) {
      expect(() =>
        parseProjectDrafts(JSON.stringify([{ ...projects[0], gallery: [image] }])),
      ).toThrow()
    }
  })

  it('rejects an invalid file in a batch before attempting to decode any files', async () => {
    await expect(
      prepareDraftImages([
        { type: 'image/webp', size: 100 },
        { type: 'image/svg+xml', size: 100 },
      ] as File[]),
    ).rejects.toThrow('uploadTypeError')
  })
})
