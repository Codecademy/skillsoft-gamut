// Static mock content for the Percipio home prototype. Copied in spirit from
// design's recreation (everest/color-tokens/sandbox/src/examples/percipioHome/data.ts);
// no redux, i18n or data fetching.

export interface NavItem {
  id: string;
  label: string;
  badgeCount?: number;
}

export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'library', label: 'Library' },
  { id: 'learning', label: 'My Learning' },
  { id: 'assignments', label: 'Assignments', badgeCount: 1 },
  { id: 'role-advisor', label: 'Role Advisor' },
  { id: 'certifications', label: 'Certification Center' },
  { id: 'benchmarks', label: 'Skill Benchmarks' },
  { id: 'labs', label: 'Practice Labs' },
];

export const SECONDARY_NAV_ITEMS: NavItem[] = [
  { id: 'settings', label: 'My Settings' },
  { id: 'help', label: 'Help' },
];

export interface SubjectLink {
  id: string;
  title: string;
}

export interface AreaItem {
  id: string;
  title: string;
  imageUrl?: string;
  subjects: SubjectLink[];
}

export const BANNER = {
  eyebrow: 'Featured channel',
  title: 'Copilot',
  body:
    'Copilot for Microsoft 365 opens a new world of generative AI-powered productivity in your professional life.',
};

export const GREETING = 'Greetings, Stacey! Explore, discover, and master new skills.';

export const SEARCH_PLACEHOLDER = 'Search...';

/** Shown as the skill-areas cards. Subjects appear when a card is hovered. */
export const AREAS: AreaItem[] = [
  {
    id: 'design',
    title: 'Design',
    subjects: [
      { id: 'ux', title: 'UI and UX Design' },
      { id: 'photoshop', title: 'Adobe Photoshop' },
      { id: 'illustrator', title: 'Adobe Illustrator' },
    ],
  },
  {
    id: 'data',
    title: 'Data & Analytics',
    subjects: [
      { id: 'data-analysis', title: 'Data Analysis Types & Techniques' },
      { id: 'premiere', title: 'Adobe Premiere Pro CC' },
    ],
  },
  {
    id: 'leadership',
    title: 'Leadership',
    subjects: [
      { id: 'coaching', title: 'GROW Coaching Model' },
      { id: 'hybrid', title: 'Managing the Modern Meeting' },
    ],
  },
  {
    id: 'technology',
    title: 'Technology Skills',
    subjects: [{ id: 'genai', title: 'Rise of Generative AI' }],
  },
];

export const SKILL_AREAS_HEADING = 'Skill areas';
export const SKILL_AREAS_SUBTITLE =
  'Browse the skill areas in your library. Hover a card to see its subjects.';

export const TOOLBAR_LABELS = {
  relevantToMe: 'Based on my interests',
  search: 'Find topics and subtopics',
  clear: 'Clear',
};
