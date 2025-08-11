export const COLORS = {
    PRIMARY_LINK: '#8186ff',

    SUCCESS: 'green',
    ERROR: 'red',
    ADMIN_ACCENT: '#4ade80',

    CANVAS_BACKGROUND: '#222',
} as const;

export const CHAT_BACKGROUND_OPTIONS = [
    { name: 'Default', color: '#282828' },
    { name: 'Midnight Blue', color: '#2a2d35' },
    { name: 'Warm Ember', color: '#332f2f' },
    { name: 'Forest Green', color: '#2f3d30' },
    { name: 'Deep Purple', color: '#302a35' },
];

export const CHAT_FONT_SIZE_OPTIONS = [
    { name: 'Small', value: 'small', tKey: 'settingsPage.font.small' },
    { name: 'Regular', value: 'medium', tKey: 'settingsPage.font.regular' },
    { name: 'Large', value: 'large', tKey: 'settingsPage.font.large' },
];
