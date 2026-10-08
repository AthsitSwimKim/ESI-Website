import type { Lang, Project } from '@/types'

export function projectText(project: Project, lang: Lang) {
  return {
    title: lang === 'th' ? project.titleTh || project.title : project.title,
    description: lang === 'th' ? project.descriptionTh || project.description : project.description,
    location: lang === 'th' ? project.locationTh || project.location : project.location,
    scope: lang === 'th' ? project.scopeTh || project.scope : project.scope,
    partners: lang === 'th' ? project.partnersTh || project.partners : project.partners,
  }
}
