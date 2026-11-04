// Static mock content for the Percipio home prototype. Content follows design's
// recreation (everest/color-tokens/sandbox/src/examples/percipioHome/data.ts) and
// front's homeV2 nav. No redux, i18n or data fetching.

import {
  AiChatSparkIcon,
  BadgeIcon,
  BookLibraryIcon,
  GearIcon,
  GraphStatsAscendIcon,
  LogoutIcon,
  PlayIcon,
  QuestionMarkIcon,
  SparkleIcon,
  StarIcon,
  TrophyIcon,
} from '@skillsoft/gamut-icons';

type Icon = typeof BookLibraryIcon;

export interface NavItem {
  id: string;
  label: string;
  icon: Icon;
  badgeCount?: number;
  nested?: boolean;
}

export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: SparkleIcon },
  { id: 'library', label: 'Library', icon: BookLibraryIcon },
  { id: 'whats-new', label: "What's New", icon: StarIcon },
  { id: 'learning', label: 'My Learning', icon: PlayIcon },
  { id: 'assignments', label: 'Assignments', icon: BadgeIcon, badgeCount: 1, nested: true },
  { id: 'role-advisor', label: 'Role Advisor', icon: BadgeIcon },
  { id: 'certifications', label: 'Certification Center', icon: TrophyIcon },
  { id: 'benchmarks', label: 'Skill Benchmarks', icon: GraphStatsAscendIcon },
  { id: 'labs', label: 'Practice Labs', icon: AiChatSparkIcon },
];

export const SECONDARY_NAV_ITEMS: NavItem[] = [
  { id: 'settings', label: 'My Settings', icon: GearIcon },
  { id: 'help', label: 'Help', icon: QuestionMarkIcon },
  { id: 'logout', label: 'Log Out', icon: LogoutIcon },
];

export interface ContentCard {
  kind: string;
  title: string;
  progress?: number;
}

export const BANNER = {
  eyebrow: 'Featured channel',
  title: 'Copilot',
  body:
    'Copilot for Microsoft 365 opens a new world of generative AI-powered productivity. Learn how to harness it to access information and communicate with your teams more efficiently.',
  cta: 'Learn more',
};

export const GREETING = 'Greetings, Stacey!';
export const GREETING_SUB = 'Explore, discover, and master new skills.';

export const HOME_TABS = ['Role', 'Recent Learning', 'Live Learning', 'Flashcards', 'Skill Benchmarks', 'Playlists', 'Goals'];

export const ROLE_ADVISOR = {
  title: 'Get better at your role!',
  body: 'Role Advisor uses your current role to build a personalized development plan that helps you expand your skills.',
  cta: 'Visit your Role Advisor',
};

export const LEARNING_OF_WEEK = {
  label: 'Learning of the week',
  title: 'RKO26 Pre-Work',
  progress: 40,
};

export const TOP_PICKS_CARDS: ContentCard[] = [
  { kind: 'Course', title: 'UI and UX Design: User Research Methods and Analysis' },
  { kind: 'Course', title: 'CompTIA Data+: Data Analysis Types & Techniques' },
  { kind: 'Course', title: 'RKO26 Pre-Work' , progress: 40},
  { kind: 'Interactive Course', title: 'Human-Centered Design with AI' },
];

export const INTEREST_CARDS: ContentCard[] = [
  { kind: 'Book', title: 'Suddenly Hybrid: Managing the Modern Meeting' },
  { kind: 'Article', title: 'Welcome to the Photoshop User Guide' },
  { kind: 'Course', title: 'Key Concepts for Video Editing in Adobe Premiere Pro CC' },
  { kind: 'Course', title: 'Adobe Illustrator Tools' },
];

export const CAISY_CARDS: ContentCard[] = [
  { kind: 'AI Simulator', title: 'Coaching an Underperforming Employee' },
  { kind: 'AI Simulator', title: 'Connecting with Empathy and Authenticity' },
  { kind: 'AI Simulator', title: 'Customer Service - Refund Request' },
  { kind: 'AI Simulator', title: 'Holding Career Conversations Using the GROW Coaching Model' },
];

export const TOP_PICKS_TABS = ['Courses', 'Skill Benchmarks', 'Books', 'Live Courses', 'Audiobooks', 'Labs'];
export const INTEREST_TABS = ['Design', 'Digital and IT Organization', 'Product Management Skills', 'Technology Skills'];

export interface AreaItem {
  id: string;
  title: string;
  subjects: string[];
}

export const AREAS: AreaItem[] = [
  { id: 'design', title: 'Design', subjects: ['UI and UX Design', 'Adobe Photoshop', 'Adobe Illustrator'] },
  { id: 'data', title: 'Data & Analytics', subjects: ['Data Analysis Types & Techniques', 'Adobe Premiere Pro CC'] },
  { id: 'leadership', title: 'Leadership', subjects: ['GROW Coaching Model', 'Managing the Modern Meeting'] },
  { id: 'technology', title: 'Technology Skills', subjects: ['Rise of Generative AI'] },
];

export const SEARCH_PLACEHOLDER = 'Search skills, courses, and more';

export const TOOLBAR_LABELS = {
  relevantToMe: 'Based on my interests',
  search: 'Find topics and subtopics',
  clear: 'Clear',
};
