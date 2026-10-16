import type { Meta, StoryObj } from '@storybook/react';

import { ImageGallery } from '~storybook/blocks';

import type { GamutIconProps } from '.';
import * as icons from './icons/regular';

type IconMap = Record<string, React.ComponentType<GamutIconProps>>;

const allIcons = icons as unknown as IconMap;

const pick = (names: string[]): IconMap =>
  Object.fromEntries(
    names
      .filter((name) => name in allIcons)
      .map((name) => [name, allIcons[name]])
  );

const VENDOR_ICON_NAMES = [
  'AmexIcon',
  'AppleIcon',
  'DiscordIcon',
  'DiscordOutlineIcon',
  'EaIcon',
  'FacebookIcon',
  'FaviconIcon',
  'FaviconSolidIcon',
  'GithubIcon',
  'GithubOutlineIcon',
  'GoogleIcon',
  'GplusIcon',
  'IbmIcon',
  'InstagramIcon',
  'JiraIcon',
  'LinkedinIcon',
  'LinkedinOutlineIcon',
  'MastercardIcon',
  'MediumIcon',
  'MetaIcon',
  'MicrosoftIcon',
  'OpenAiFullIcon',
  'OpenAiIcon',
  'PaypalLogoIcon',
  'PercipioIcon',
  'RailsIcon',
  'ReactIcon',
  'RedditIcon',
  'RedditSolidIcon',
  'SlackIcon',
  'SpotifyIcon',
  'TikTokIcon',
  'TwitterIcon',
  'TwitterOutlineIcon',
  'VisaIcon',
  'WhatsAppFilledIcon',
  'XIcon',
  'YoutubeIcon',
  'YoutubePlayIcon',
].sort();

const LE_ICON_NAMES = [
  'ArticleIcon',
  'BadgeIcon',
  'BookClosedBookmarkIcon',
  'CertificateFilledIcon',
  'CertificateIcon',
  'ChallengeProjectIcon',
  'ChecklistIcon',
  'EditorIcon',
  'FileSearchIcon',
  'FitnessDumbbellIcon',
  'ForumsChatIcon',
  'InformationalIcon',
  'InteractiveCursorIcon',
  'InstructionsIcon',
  'LearnIcon',
  'LessonIcon',
  'NarrativeIcon',
  'ObjectiveIcon',
  'OverviewIcon',
  'PathChangeIcon',
  'PathCompleteIcon',
  'PathIcon',
  'PinIcon',
  'PortfolioProjectIcon',
  'ProfessionalCertificateIcon',
  'ProjectsIcon',
  'QuizIcon',
  'ReportIcon',
  'ResponsiveIcon',
  'StreakIcon',
  'TerminalIcon',
  'TrophyFilledIcon',
  'TrophyIcon',
].sort();

const SKILLS_ICON_NAMES = [
  'ArtificialIntelligenceIcon',
  'BashShellIcon',
  'CIcon',
  'CPlusIcon',
  'CSharpIcon',
  'CloudComputingIcon',
  'ComputerScienceIcon',
  'CybersecurityIcon',
  'DataAnalyticsIcon',
  'DataEngineeringIcon',
  'DataScienceIcon',
  'DataVisualizationIcon',
  'DevopsIcon',
  'FallbackSkillIcon',
  'FlutterIcon',
  'GameDevelopmentIcon',
  'GitIcon',
  'GoIcon',
  'HtmlCssIcon',
  'ItIcon',
  'JavaIcon',
  'JavascriptIcon',
  'KotlinIcon',
  'MachineLearningIcon',
  'MarkdownIcon',
  'MathIcon',
  'MobileDevelopmentIcon',
  'PhpIcon',
  'PythonIcon',
  'RIcon',
  'RubyIcon',
  'SqlIcon',
  'SwiftIcon',
  'TypescriptIcon',
  'WebDesignIcon',
  'WebDevelopmentIcon',
].sort();

const VENDOR_ICONS = pick(VENDOR_ICON_NAMES);
const LE_ICONS = pick(LE_ICON_NAMES);
const SKILLS_ICONS = pick(SKILLS_ICON_NAMES);

const categorized = new Set([
  ...VENDOR_ICON_NAMES,
  ...LE_ICON_NAMES,
  ...SKILLS_ICON_NAMES,
]);

const UI_ICONS: IconMap = Object.fromEntries(
  Object.entries(allIcons).filter(([name]) => !categorized.has(name))
);

type IconProps = GamutIconProps & {
  icon: typeof icons.AlertIcon;
};

const IconComponent: React.FC<IconProps> = ({ icon: Icon, ...rest }) => {
  return <Icon {...rest} />;
};

const meta: Meta<typeof IconComponent> = {
  title: 'Media & Assets/Icons/Regular',
  component: IconComponent,
  argTypes: {
    icon: {
      options: Object.keys(icons),
      mapping: icons,
      control: 'select',
    },
  },
};

export default meta;
type Story = StoryObj<typeof IconComponent>;

export const Default: Story = {
  args: {
    size: 40,
    icon: icons.AlertIcon,
  },
};

// The gallery stories are visual catalogs of every icon (slow to render + axe,
// and redundant with `Default`). `!test` removes the auto-applied `test` tag so
// addon-vitest skips them; they still render in Storybook.
export const RegularInterfaceIcons: Story = {
  tags: ['!test'],
  render: () => {
    return <ImageGallery imageType="icon" images={UI_ICONS} />;
  },
};

export const RegularLearningEnvironmentIcons: Story = {
  tags: ['!test'],
  render: () => {
    return <ImageGallery imageType="icon" images={LE_ICONS} />;
  },
};

export const RegularVendorIcons: Story = {
  tags: ['!test'],
  render: () => {
    return <ImageGallery imageType="icon" images={VENDOR_ICONS} />;
  },
};

export const RegularSkillIcons: Story = {
  tags: ['!test'],
  render: () => {
    return <ImageGallery imageType="icon" images={SKILLS_ICONS} />;
  },
};
