import { drawMeOut, drawMeOutEn } from './drawMeOut'
import type { Locale, StoryCartridge } from '../types'

export const DEFAULT_CARTRIDGE_ID = 'draw-me-out'
export const CARTRIDGES: Record<string, StoryCartridge> = { 'draw-me-out': drawMeOut }
export const CARTRIDGES_EN: Record<string, StoryCartridge> = { 'draw-me-out': drawMeOutEn }
export function listCartridges(locale: Locale): StoryCartridge[] { return [locale === 'en' ? drawMeOutEn : drawMeOut] }
export function resolveCartridge(_id: string | null | undefined, locale: Locale = 'zh'): StoryCartridge { return locale === 'en' ? drawMeOutEn : drawMeOut }
