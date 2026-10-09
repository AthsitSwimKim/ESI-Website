import type { Industry, IndustrySlug } from '@/types'

/** Licensed real photographs, checked 2026-10-09. Context images, not ESI project evidence. */
export const industryPhotos = {
  'oil-gas': {
    image: '/images/industries/oil-gas-photo.webp',
    imageWidth: 1200,
    imageHeight: 794,
    imageCredit: {
      title: 'Deepsea Delta drilling rig, North Sea',
      author: 'Erik Christensen',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Oil_platform_in_the_North_Sea.jpg',
      license: 'CC BY-SA 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    },
  },
  petrochemical: {
    image: '/images/industries/petrochemical-basf-photo.webp',
    imageWidth: 1200,
    imageHeight: 1200,
    imageCredit: {
      title: 'BASF chemical plant, Ludwigshafen, Germany',
      author: 'Felix König',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:BASF_Ludwigshafen_part.jpg',
      license: 'CC BY 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    },
  },
  'power-energy': {
    image: '/images/industries/power-energy-photo.webp',
    imageWidth: 1200,
    imageHeight: 800,
    imageCredit: {
      title: 'Rostock power station, Germany',
      author: 'Radomianin',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Rostock_Power_Station,_SW_view.jpg',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    },
  },
  manufacturing: {
    image: '/images/industries/manufacturing-photo.webp',
    imageWidth: 1200,
    imageHeight: 801,
    imageCredit: {
      title: 'Robotic body assembly, BMW plant Leipzig, Germany',
      author: 'BMW Werk Leipzig',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:BMW_Leipzig_MEDIA_050719_Download_Karosseriebau_max.jpg',
      license: 'CC BY-SA 2.0 DE',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/de/',
    },
  },
  'industrial-infrastructure': {
    image: '/images/industries/industrial-infrastructure-photo.webp',
    imageWidth: 1200,
    imageHeight: 900,
    imageCredit: {
      title: 'Rotterdam Container Terminal at sunset, Netherlands',
      author: 'VileGecko',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:RCT_Sunset.jpg',
      license: 'CC BY-SA 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    },
  },
} satisfies Record<
  IndustrySlug,
  Pick<Industry, 'image' | 'imageWidth' | 'imageHeight' | 'imageCredit'>
>
