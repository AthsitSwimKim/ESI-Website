/** Published changes overlay the original references without discarding their source comments. */
export function applyProjectContent(references, content) {
  const removed = new Set(content.removedIds)
  const overrides = new Map(content.records.map((project) => [project.id, project]))
  const originalIds = new Set(references.map((project) => project.id))
  return [
    ...content.records.filter(
      (project) => !originalIds.has(project.id) && !removed.has(project.id),
    ),
    ...references
      .filter((project) => !removed.has(project.id))
      .map((project) => overrides.get(project.id) ?? project),
  ]
}
