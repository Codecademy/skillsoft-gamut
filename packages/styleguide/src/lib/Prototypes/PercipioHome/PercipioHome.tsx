import {
  Anchor,
  Box,
  Card,
  FillButton,
  FlexBox,
  GridBox,
  IconButton,
  Menu,
  MenuItem,
  PopoverContainer,
  ProgressBar,
  StrokeButton,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Tag,
  Text,
  TextButton,
  Toggle,
} from '@skillsoft/gamut';
import { GamutProvider, skillsoftTheme } from '@skillsoft/gamut-styles';
import {
  BellIcon,
  BookLibraryIcon,
  CloseIcon,
  MenuIcon,
  MiniChevronRightIcon,
  SearchIcon,
  TrophyIcon,
} from '@skillsoft/gamut-icons';
import { useRef, useState } from 'react';

import {
  AREAS,
  AreaItem,
  BANNER,
  CAISY_CARDS,
  ContentCard,
  GREETING,
  GREETING_SUB,
  HOME_TABS,
  INTEREST_CARDS,
  INTEREST_TABS,
  LEARNING_OF_WEEK,
  NavItem,
  PRIMARY_NAV_ITEMS,
  ROLE_ADVISOR,
  SECONDARY_NAV_ITEMS,
  SEARCH_PLACEHOLDER,
  TOOLBAR_LABELS,
  TOP_PICKS_CARDS,
  TOP_PICKS_TABS,
} from './data';

const TOPBAR_HEIGHT = 72;
const SIDEBAR_WIDTH = 256;

/* ---------- Top bar ---------- */

const TopBar = ({ onToggleNav }: { onToggleNav: () => void }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  return (
    <Box
      as="header"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={12}
      height={`${TOPBAR_HEIGHT}px`}
      bg="surface-raised"
      boxShadow="shadow-ambient"
    >
      <FlexBox alignItems="center" justifyContent="space-between" height="100%" px={{ xs: 16, md: 24 }} gap={16}>
        <FlexBox alignItems="center" gap={16}>
          <IconButton icon={MenuIcon} tip="Main menu" aria-label="Main menu" onClick={onToggleNav} />
          <Text as="span" fontSize={22} fontWeight="bold" color="text-default">
            Percipio
          </Text>
        </FlexBox>

        <Box flex="1" maxWidth="560px" display={{ xs: 'none', md: 'block' }}>
          <FlexBox alignItems="center" gap={8} px={16} height="44px" borderRadius="full" bg="surface-sunken" color="text-subtle">
            <SearchIcon size={20} aria-hidden />
            <Text as="span" fontSize={16} color="text-subtle">
              {SEARCH_PLACEHOLDER}
            </Text>
          </FlexBox>
        </Box>

        <FlexBox alignItems="center" gap={8}>
          <Tag variant="readOnly" icon={TrophyIcon}>1465 XP</Tag>
          <IconButton icon={BellIcon} tip="Notifications" aria-label="Notifications" />
          <Box ref={avatarRef} position="relative">
            <IconButton
              icon={MenuIcon}
              tip="My profile"
              aria-label="My profile"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onClick={() => setMenuOpen((open) => !open)}
            />
            {menuOpen && avatarRef.current && (
              <PopoverContainer
                isOpen={menuOpen}
                targetRef={avatarRef}
                onRequestClose={() => setMenuOpen(false)}
                alignment="bottom-right"
                inline
              >
                <Menu>
                  <MenuItem>My Learning</MenuItem>
                  <MenuItem>My Settings</MenuItem>
                  <MenuItem>Log Out</MenuItem>
                </Menu>
              </PopoverContainer>
            )}
          </Box>
        </FlexBox>
      </FlexBox>
    </Box>
  );
};

/* ---------- Sidebar ---------- */

const SidebarItem = ({ item, active }: { item: NavItem; active?: boolean }) => {
  const Icon = item.icon;
  return (
    <FlexBox
      as="button"
      alignItems="center"
      gap={12}
      width="100%"
      px={16}
      py={8}
      pl={item.nested ? 40 : 16}
      borderRadius="md"
      bg={active ? 'surface-brand-subtle' : 'transparent'}
      color={active ? 'text-default' : 'text-subtle'}
      aria-current={active ? 'page' : undefined}
      data-marker={item.id}
    >
      <Icon size={20} aria-hidden />
      <Text as="span" fontSize={16} fontWeight={active ? "bold" : undefined}>
        {item.label}
      </Text>
      {item.badgeCount ? <Tag variant="readOnly">{item.badgeCount}</Tag> : null}
    </FlexBox>
  );
};

const Sidebar = ({ open }: { open: boolean }) => (
  <Box
    as="nav"
    aria-label="Main"
    position="sticky"
    top={`${TOPBAR_HEIGHT}px`}
    height={`calc(100vh - ${TOPBAR_HEIGHT}px)`}
    width={open ? `${SIDEBAR_WIDTH}px` : '0px'}
    bg="surface-default"
  >
    <FlexBox flexDirection="column" justifyContent="space-between" height="100%" p={12} gap={16} minWidth={`${SIDEBAR_WIDTH}px`}>
      <FlexBox flexDirection="column" gap={4}>
        {PRIMARY_NAV_ITEMS.map((item) => (
          <SidebarItem key={item.id} item={item} active={item.id === 'home'} />
        ))}
      </FlexBox>
      <FlexBox flexDirection="column" gap={4}>
        {SECONDARY_NAV_ITEMS.map((item) => (
          <SidebarItem key={item.id} item={item} />
        ))}
      </FlexBox>
    </FlexBox>
  </Box>
);

/* ---------- Content ---------- */

/** Featured banner: a brand surface with the copy and a call to action. */
const FeaturedBanner = () => (
  <Card variant="brand" p={32} borderRadius="lg" data-marker="banner">
    <FlexBox flexDirection="column" gap={12} maxWidth="640px">
      <Tag variant="readOnly">{BANNER.eyebrow}</Tag>
      <Text as="h2" fontSize={34} fontWeight="bold" color="text-inverse">
        {BANNER.title}
      </Text>
      <Text as="p" fontSize={18} color="text-inverse">
        {BANNER.body}
      </Text>
      <FlexBox gap={12} mt={8} flexWrap="wrap">
        <FillButton size="normal">{BANNER.cta}</FillButton>
        <StrokeButton size="normal">Browse Copilot</StrokeButton>
      </FlexBox>
    </FlexBox>
  </Card>
);

/** Role advisor and the learning-of-the-week highlight, side by side. */
const RoleAndHighlight = () => (
  <GridBox gridTemplateColumns={{ xs: '1fr', md: '1.4fr 1fr' }} gap={16}>
    <Card p={24} borderRadius="lg">
      <FlexBox flexDirection="column" gap={12}>
        <Text as="h3" fontSize={22} fontWeight="bold">
          {ROLE_ADVISOR.title}
        </Text>
        <Text as="p" fontSize={16} color="text-subtle">
          {ROLE_ADVISOR.body}
        </Text>
        <TextButton size="normal" iconPosition="right" icon={MiniChevronRightIcon}>
          {ROLE_ADVISOR.cta}
        </TextButton>
      </FlexBox>
    </Card>
    <Card p={24} borderRadius="lg">
      <FlexBox flexDirection="column" gap={12}>
        <Text as="span" fontSize={14} color="text-subtle">
          {LEARNING_OF_WEEK.label}
        </Text>
        <Text as="h3" fontSize={20} fontWeight="bold">
          {LEARNING_OF_WEEK.title}
        </Text>
        <ProgressBar percent={LEARNING_OF_WEEK.progress} variant="blue" />
        <FillButton size="small">Start now</FillButton>
      </FlexBox>
    </Card>
  </GridBox>
);

/** A card in a carousel row. */
const ContentCardItem = ({ item }: { item: ContentCard }) => (
  <Card p={0} borderRadius="lg" data-marker="contentCard">
    <Box height="120px" bg="surface-brand-subtle" aria-hidden />
    <FlexBox flexDirection="column" gap={8} p={16}>
      <Tag variant="readOnly">{item.kind}</Tag>
      <Text as="h4" fontSize={16} fontWeight="bold">
        {item.title}
      </Text>
      {item.progress !== undefined ? <ProgressBar percent={item.progress} variant="blue" /> : null}
    </FlexBox>
  </Card>
);

/** A titled row of cards with tabs above it. */
const CardRow = ({
  title,
  tabs,
  cards,
  action,
}: {
  title: string;
  tabs: string[];
  cards: ContentCard[];
  action?: string;
}) => (
  <Box as="section">
    <FlexBox alignItems="center" justifyContent="space-between" mb={12} gap={12}>
      <Text as="h2" fontSize={22} fontWeight="bold">
        {title}
      </Text>
      {action ? <TextButton size="small">{action}</TextButton> : null}
    </FlexBox>
    <Tabs>
      <TabList>
        {tabs.map((tab) => (
          <Tab key={tab} id={tab}>
            {tab}
          </Tab>
        ))}
      </TabList>
      {tabs.map((tab) => (
        <TabPanel key={tab} id={tab} />
      ))}
    </Tabs>
    <GridBox gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }} gap={16} mt={16}>
      {cards.map((card) => (
        <ContentCardItem key={card.title} item={card} />
      ))}
    </GridBox>
  </Box>
);

/** Skill areas: a card per area, subjects listed inside. */
const SkillAreas = () => (
  <Box as="section" aria-labelledby="skill-areas-heading" data-marker="skillAreas">
    <Text as="h2" id="skill-areas-heading" fontSize={22} fontWeight="bold" mb={4}>
      Skill areas
    </Text>
    <Text as="p" fontSize={16} color="text-subtle" mb={16}>
      Browse the skill areas in your library.
    </Text>
    <GridBox gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }} gap={16}>
      {AREAS.map((area: AreaItem) => (
        <Card key={area.id} p={24} borderRadius="lg" data-marker="areaCard">
          <FlexBox flexDirection="column" gap={12}>
            <FlexBox alignItems="center" gap={8}>
              <BookLibraryIcon size={24} aria-hidden />
              <Text as="h3" fontSize={18} fontWeight="bold">
                {area.title}
              </Text>
            </FlexBox>
            <Text as="p" fontSize={14} color="text-subtle">
              {area.subjects.length} subjects
            </Text>
            <FlexBox flexDirection="column" gap={8}>
              {area.subjects.map((subject) => (
                <Anchor key={subject} href="#" fontSize={16}>
                  {subject}
                </Anchor>
              ))}
            </FlexBox>
          </FlexBox>
        </Card>
      ))}
    </GridBox>
  </Box>
);

/** Search toolbar above the skill areas: relevance toggle, clear action. */
const SearchToolbar = () => {
  const [relevant, setRelevant] = useState(false);
  return (
    <FlexBox alignItems="center" justifyContent="space-between" gap={16} flexWrap="wrap" mb={24}>
      <Toggle
        label={TOOLBAR_LABELS.relevantToMe}
        checked={relevant}
        onChange={() => setRelevant((on) => !on)}
      />
      <TextButton size="small" icon={CloseIcon} iconPosition="right">
        {TOOLBAR_LABELS.clear}
      </TextButton>
    </FlexBox>
  );
};

/* ---------- Page ---------- */

export const PercipioHome = () => {
  const [navOpen, setNavOpen] = useState(true);

  return (
    <GamutProvider theme={skillsoftTheme}>
      <Box bg="surface-default" minHeight="100vh" color="text-default">
        <TopBar onToggleNav={() => setNavOpen((open) => !open)} />
        <Box height={`${TOPBAR_HEIGHT}px`} aria-hidden />
        <FlexBox alignItems="flex-start">
          <Sidebar open={navOpen} />
          <Box as="main" flex="1" minWidth="0" px={{ xs: 16, md: 32 }} py={24} pb={64}>
            <Box maxWidth="1200px" mx="auto">
              <Box mb={24}>
                <Text as="h1" fontSize={34} fontWeight="bold">
                  {GREETING}
                </Text>
                <Text as="p" fontSize={18} color="text-subtle">
                  {GREETING_SUB}
                </Text>
              </Box>

              <FlexBox flexDirection="column" gap={32}>
                <FeaturedBanner />
                <RoleAndHighlight />
                <CardRow title="Top picks for you" tabs={TOP_PICKS_TABS} cards={TOP_PICKS_CARDS} />
                <CardRow
                  title="Based on your skill interests"
                  tabs={INTEREST_TABS}
                  cards={INTEREST_CARDS}
                  action="Edit interests"
                />
                <CardRow title="Practice with CAISY AI Simulator" tabs={HOME_TABS.slice(0, 4)} cards={CAISY_CARDS} />
                <Box>
                  <SearchToolbar />
                  <SkillAreas />
                </Box>
              </FlexBox>
            </Box>
          </Box>
        </FlexBox>
      </Box>
    </GamutProvider>
  );
};

export default PercipioHome;
