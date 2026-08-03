/**
 * @jest-environment node
 */

import {
  adjustPageProperties,
  getPublishTimestamp
} from '@/lib/db/notion/getPageProperties'

jest.mock('notion-utils', () => ({
  getDateValue: jest.fn(),
  getTextContent: jest.fn()
}))

jest.mock('@/lib/db/notion/getNotionAPI', () => ({
  __esModule: true,
  default: {
    getUsers: jest.fn()
  }
}))

describe('adjustPageProperties', () => {
  it('uses category mapping for pages only when the page category is mapped', () => {
    const NOTION_CONFIG = {
      POST_URL_PREFIX: '%category%/%year%/%month%/%day%',
      POST_URL_PREFIX_MAPPING_CATEGORY: {
        Guide: 'manual'
      },
      PSEUDO_STATIC: false
    }

    const mappedPage = {
      id: 'page-id',
      type: 'Page',
      slug: 'a-manual',
      category: 'Guide'
    }
    const plainPage = {
      id: 'plain-id',
      type: 'Page',
      slug: 'a-book',
      category: 'Book'
    }

    adjustPageProperties(mappedPage, NOTION_CONFIG)
    adjustPageProperties(plainPage, NOTION_CONFIG)

    expect(mappedPage.slug).toBe('manual/a-manual')
    expect(mappedPage.href).toBe('/manual/a-manual')
    expect(plainPage.slug).toBe('a-book')
    expect(plainPage.href).toBe('/a-book')
  })
})

describe('getPublishTimestamp', () => {
  it('keeps the time component for posts published on the same day', () => {
    const earlier = getPublishTimestamp({
      start_date: '2026-08-03',
      start_time: '11:15'
    })
    const later = getPublishTimestamp({
      start_date: '2026-08-03',
      start_time: '11:30'
    })

    expect(later).toBeGreaterThan(earlier)
  })

  it('continues to support date-only properties', () => {
    expect(getPublishTimestamp({ start_date: '2026-08-03' })).toBe(
      new Date('2026-08-03').getTime()
    )
  })

  it('falls back to the Notion creation time when the date is missing', () => {
    const fallback = '2026-08-03T03:30:00.000Z'

    expect(getPublishTimestamp({}, fallback)).toBe(
      new Date(fallback).getTime()
    )
  })
})
