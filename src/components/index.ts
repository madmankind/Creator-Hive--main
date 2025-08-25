// Creator Hive Design System - Main Export
// Comprehensive component library export

// UI Components
export * from './ui';

// Navigation Components
export { TopNav, TopNavVariants } from './nav/TopNav';
export { TabBar, TabBarVariants } from './nav/TabBar';
export type { TopNavProps } from './nav/TopNav';
export type { TabBarProps, TabBarItem } from './nav/TabBar';

// Gradient Components
export { Backdrop, BackdropVariants } from './gradients/Backdrop';

// Theme and Utils
export { default as theme } from '@/lib/theme';
export * from '@/lib/utils';