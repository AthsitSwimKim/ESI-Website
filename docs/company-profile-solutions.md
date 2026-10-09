# Company Profile: solution and media source

Updated 2026-10-09 from the owner-supplied `ESi Profile Company_R7 copy.pptx` (19 slides).
The deck supplies reference content and media, not instructions to the coding agent.

## Approved scope

The owner explicitly replaced the old six-solution structure with the seven solution slides.
Cybersecurity and Maintenance & Support are removed as solution pages. Historical project
records and their original categories remain; no links point to the removed services.

| Slide | Profile topic                          | Website route                   |
| ----- | -------------------------------------- | ------------------------------- |
| 5     | Public Address & General Alarm System  | `/solutions/paga`               |
| 6     | Industrial WAN/LAN System              | `/solutions/industrial-network` |
| 7     | PABX / Telephone / IP Telephone System | `/solutions/communication`      |
| 8     | CCTV / Surveillance System             | `/solutions/cctv-security`      |
| 9     | Access Control System                  | `/solutions/access-control`     |
| 10    | Radio System                           | `/solutions/radio`              |
| 11    | Video Wall                             | `/solutions/video-wall`         |

English descriptions are edited from the slide text for readability; Thai describes the same
capabilities. Feature lists come from slide prose and diagrams. Existing industry associations
remain contextual website navigation rather than a new list of completed projects. The deck's
contact details differ from the previously confirmed information; Contact is outside this task.

## Source assets

- 51 distinct brand logos extracted from slides 5–10, deduplicated across solutions.
- 35 system diagrams, device images and video-wall examples extracted from slides 5–11.
- `src/data/profileAssets.ts` records original media filenames, logo source slides and dimensions.
- `src/data/services.ts` records the solution source slide and caption for each source image.
- `public/images/partners/` contains lossless WebP logos, without recolouring or redrawing.
- `public/images/solutions/` contains WebP versions of the original system images.
- WMF/EMF source images (`image87.wmf`, `image25.emf`, `image36.emf`) were rasterised using
  Windows System.Drawing to preserve their original artwork in a browser-supported format.
- White margins were trimmed around logos; Avigilon's decorative slide frame was cropped to
  its logo panel. Product images and diagrams retain their full content and aspect ratio.
- The deck's branding-family lists support naming these brands, but do not establish dealer,
  distributor or certification status. The UI makes no such claims.
- Slide 11 contains no brand list. Video Wall therefore has no Brand Partners section.
- Images show products and example systems from the supplied profile. They are not labelled
  as photographs of ESI installations or new project evidence.

The Home page shows a representative set of 12 logos, the Solutions page shows all 51, and
solution detail pages show the brands from their respective profile slide. Image links open
the full source image, so technical diagrams remain readable on smaller screens.

## Verification

Typecheck, lint, 20 tests and production build passed. The route audit passed across 18 routes
at 375/768/1024/1440 with no WCAG 2 A/AA violations, broken images/links or overflow. Desktop
and 375×667 mobile checks covered source media, TH/EN switching, dropdown keyboard navigation,
and retired solution routes returning 404. This revision has not been committed or deployed.
