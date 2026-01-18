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
    id: 'board-list',
    src: '/screenshots/board-list.jpg',
    captionKey: 'landing:screenshots.boardList',
    alt: 'Board management interface',
  },
  {
    id: 'auth',
    src: '/screenshots/auth.jpg',
    captionKey: 'landing:screenshots.auth',
    alt: 'Authentication page',
  },
  {
    id: 'board-settings',
    src: '/screenshots/board-settings.jpg',
    captionKey: 'landing:screenshots.boardSettings',
    alt: 'Board settings and member management',
  },
  {
    id: 'user-settings',
    src: '/screenshots/user-settings.jpg',
    captionKey: 'landing:screenshots.userSettings',
    alt: 'User profile settings',
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
