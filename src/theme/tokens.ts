export interface Palette {
  bg: string;
  elevated: string;
  ink: string;
  muted: string;
  line: string;
  accent: string;
  accentInk: string;
  accentSoft: string;
  accentSoftInk: string;
  danger: string;
  dangerSoft: string;
  favorite: string;
  focus: string;
  previewBg: string;
  previewInk: string;
  previewMuted: string;
  tabBar: string;
  shadow: string;
}

export const palettes: Record<'light' | 'dark', Palette> = {
  light: {
    bg: '#F3EFE6',
    elevated: '#FFFCF6',
    ink: '#1C1915',
    muted: '#4E4942',
    line: '#DDD4C4',
    accent: '#0E5C59',
    accentInk: '#FFFFFF',
    accentSoft: '#E4F2F0',
    accentSoftInk: '#0C3F3C',
    danger: '#8C2A2A',
    dangerSoft: '#F8E6E2',
    favorite: '#8A4E0F',
    focus: '#0E5C59',
    previewBg: '#161814',
    previewInk: '#F6F1E7',
    previewMuted: '#C8BFAF',
    tabBar: '#FFFCF6',
    shadow: 'rgba(28, 25, 21, 0.08)',
  },
  dark: {
    bg: '#121410',
    elevated: '#1E221C',
    ink: '#F4EFE6',
    muted: '#D0C6B6',
    line: '#34382F',
    accent: '#0F6E68',
    accentInk: '#F7FFFE',
    accentSoft: '#163532',
    accentSoftInk: '#C8F4EF',
    danger: '#F0B4A8',
    dangerSoft: '#3A221E',
    favorite: '#E7C27A',
    focus: '#8FE0D8',
    previewBg: '#0C0E0B',
    previewInk: '#F6F1E7',
    previewMuted: '#C8BFAF',
    tabBar: '#181B16',
    shadow: 'rgba(0, 0, 0, 0.35)',
  },
};

export const fonts = {
  body: 'Figtree_400Regular',
  bodyMedium: 'Figtree_600SemiBold',
  bodyBold: 'Figtree_700Bold',
  display: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',
} as const;
