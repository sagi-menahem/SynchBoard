import {
  Globe,
  LayoutGrid,
  Palette,
  Pencil,
  Shield,
  Smartphone,
  Users,
} from 'lucide-react';

export const FEATURES = [
  {
    id: 'realtime',
    icon: Users,
    titleKey: 'landing:features.realtime.title',
    descriptionKey: 'landing:features.realtime.description',
  },
  {
    id: 'drawing',
    icon: Pencil,
    titleKey: 'landing:features.drawing.title',
    descriptionKey: 'landing:features.drawing.description',
  },
  {
    id: 'boards',
    icon: LayoutGrid,
    titleKey: 'landing:features.boards.title',
    descriptionKey: 'landing:features.boards.description',
  },
  {
    id: 'security',
    icon: Shield,
    titleKey: 'landing:features.security.title',
    descriptionKey: 'landing:features.security.description',
  },
  {
    id: 'themes',
    icon: Palette,
    titleKey: 'landing:features.themes.title',
    descriptionKey: 'landing:features.themes.description',
  },
  {
    id: 'mobile',
    icon: Smartphone,
    titleKey: 'landing:features.mobile.title',
    descriptionKey: 'landing:features.mobile.description',
  },
] as const;

export const SCREENSHOTS = [
  {
    id: 'workspace-dark',
    src: '/screenshots/workspace-en-dark.jpg',
    captionKey: 'landing:screenshots.workspaceDark',
    alt: 'SynchBoard workspace in dark theme',
  },
  {
    id: 'workspace-light',
    src: '/screenshots/workspace-en-light.jpg',
    captionKey: 'landing:screenshots.workspaceLight',
    alt: 'SynchBoard workspace in light theme',
  },
  {
    id: 'board-list',
    src: '/screenshots/board-list.jpg',
    captionKey: 'landing:screenshots.boardList',
    alt: 'Board management interface',
  },
  {
    id: 'mobile-canvas',
    src: '/screenshots/mobile-canvas.jpg',
    captionKey: 'landing:screenshots.mobileCanvas',
    alt: 'Mobile responsive canvas',
  },
] as const;

export const TECH_LOGOS = [
  { id: 'react', name: 'React', color: '#61DAFB' },
  { id: 'typescript', name: 'TypeScript', color: '#3178C6' },
  { id: 'spring', name: 'Spring Boot', color: '#6DB33F' },
  { id: 'postgresql', name: 'PostgreSQL', color: '#4169E1' },
  { id: 'docker', name: 'Docker', color: '#2496ED' },
  { id: 'websocket', name: 'WebSocket', color: '#FF6B6B' },
] as const;

export const NAV_LINKS = [
  { id: 'features', href: '#features', labelKey: 'landing:nav.features', external: false },
  { id: 'screenshots', href: '#screenshots', labelKey: 'landing:nav.screenshots', external: false },
  {
    id: 'github',
    href: 'https://github.com/sagi-menahem/SynchBoard',
    labelKey: 'landing:nav.github',
    external: true,
  },
] as const;

export const GITHUB_URL = 'https://github.com/sagi-menahem/SynchBoard';
export const LIVE_DEMO_URL = 'https://synchboard.com';

export const LANGUAGE_ICONS: Record<string, typeof Globe> = {
  default: Globe,
};
