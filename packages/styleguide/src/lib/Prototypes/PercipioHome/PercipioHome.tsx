import { useTheme } from '@emotion/react';
import {
  Box,
  Card,
  FillButton,
  FlexBox,
  GridBox,
  Anchor,
  PopoverContainer,
  Tag,
  Text,
  TextButton,
  ToolTip,
} from '@codecademy/gamut';
import { GamutProvider, percipioTheme } from '@codecademy/gamut-styles';
import {
  ArrowChevronRightIcon,
  BookLibraryIcon,
  CloseIcon,
  MenuIcon,
  MiniChevronDownIcon,
  PinIcon,
  SearchIcon,
} from '@codecademy/gamut-icons';
import { useRef, useState } from 'react';

import './PercipioHome.css';
import {
  AREAS,
  BANNER,
  GREETING,
  PRIMARY_NAV_ITEMS,
  SECONDARY_NAV_ITEMS,
  SEARCH_PLACEHOLDER,
  SKILL_AREAS_HEADING,
  SKILL_AREAS_SUBTITLE,
  TOOLBAR_LABELS,
  type AreaItem,
  type NavItem,
} from './data';

/* Old Card variants (white, beige, navy, yellow), cycled over the area cards. */
const AREA_CARD_VARIANTS = ['white', 'beige', 'navy', 'yellow'] as const;

const NavButton = ({ item, active }: { item: NavItem; active?: boolean }) => (
  <Box
    as="button"
    type="button"
    className={`navItem${active ? ' active' : ''}`}
    data-marker={item.id}
  >
    <span className="iconWrapper" aria-hidden="true">
      <MenuIcon size={20} />
      {item.badgeCount ? (
        <span className="badge" aria-label={`${item.badgeCount} unread`}>
          {item.badgeCount}
        </span>
      ) : null}
    </span>
    <Text as="span" fontSize={14} className="navItemLabel">
      {item.label}
    </Text>
    {item.badgeCount === undefined ? null : (
      <ArrowChevronRightIcon size={16} aria-hidden="true" />
    )}
  </Box>
);

/** Top nav: logo, search, and the header controls. */
const TopNav = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuTargetRef = useRef<HTMLButtonElement>(null);

  return (
    <Box className="root" data-marker="topNav">
      <Box as="header" className="header">
        <FlexBox
          as="nav"
          className="primaryNav"
          alignItems="center"
          justifyContent="space-between"
          gap={16}
        >
          <Box className="homeItem" role="link" tabIndex={0} aria-label="Home">
            <Text as="span" fontSize={20} fontWeight="bold">
              Percipio
            </Text>
          </Box>

          <Box className="componentContainer">
            <SearchIcon size={20} aria-hidden="true" />
            <Text as="span" fontSize={14} color="text-secondary">
              {SEARCH_PLACEHOLDER}
            </Text>
          </Box>

          <FlexBox alignItems="center" gap={8}>
            <ToolTip label="Notifications">
              <TextButton variant="primary" size="small">
                Notifications
              </TextButton>
            </ToolTip>

            <Box className="nineDotMenuContainer" data-marker="nineDotMenu">
              <Box
                as="button"
                type="button"
                ref={menuTargetRef}
                className="nineDotMenuButton"
                data-active={menuOpen}
                aria-expanded={menuOpen}
                aria-haspopup="true"
                aria-label="Apps"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <span className="notificationDot" />
                <MenuIcon size={24} />
              </Box>
              {menuOpen && menuTargetRef.current && (
                <PopoverContainer
                  isOpen={menuOpen}
                  targetRef={{ current: menuTargetRef.current }}
                  onRequestClose={() => setMenuOpen(false)}
                  alignment="bottom-right"
                  inline={true}
                  x={-40}
                >
                  <Box role="menu" aria-orientation="vertical" className="nineDotMenuContent">
                    <FlexBox flexDirection="column">
                      <Box as="a" href="#" role="menuitem" tabIndex={0} className="menuItem">
                        My Learning
                      </Box>
                      <Box as="a" href="#" role="menuitem" tabIndex={0} className="menuItem">
                        Log out
                      </Box>
                    </FlexBox>
                  </Box>
                </PopoverContainer>
              )}
            </Box>
          </FlexBox>
        </FlexBox>
      </Box>
    </Box>
  );
};

/** Left nav: primary links, then the pinned secondary links. */
const LeftNav = () => (
  <Box as="nav" className="leftNavRoot" aria-label="Main">
    <Box as="div" className="navBody">
      <Box as="div" className="navSection">
        {PRIMARY_NAV_ITEMS.map((item) => (
          <NavButton key={item.id} item={item} active={item.id === 'home'} />
        ))}
      </Box>
      <Box as="div" className="footerSection">
        <div className="divider" />
        {SECONDARY_NAV_ITEMS.map((item) => (
          <NavButton key={item.id} item={item} />
        ))}
      </Box>
    </Box>
  </Box>
);

/** Featured banner: headline, body copy, and a call to action. */
const Banner = () => (
  <Box
    as="section"
    bg="background-selected"
    borderColor="border-primary"
    className="banner"
    data-marker="banner"
  >
    <FlexBox flexDirection="column" gap={8} p={24}>
      <Text as="span" fontSize={14} color="text-secondary">
        {BANNER.eyebrow}
      </Text>
      <Text as="h2" fontSize={32} fontWeight="bold" color="text-accent">
        {BANNER.title}
      </Text>
      <Text as="p" fontSize={16} color="text-secondary">
        {BANNER.body}
      </Text>
      <FillButton size="small">Learn more</FillButton>
    </FlexBox>
  </Box>
);

/** Search toolbar: relevant-to-me toggle, search field, and a clear action. */
const SearchToolbar = () => (
  <FlexBox
    alignItems="center"
    justifyContent="space-between"
    gap={16}
    flexWrap="wrap"
    data-marker="searchToolbar"
  >
    <Tag variant="primary" size="small">
      {TOOLBAR_LABELS.relevantToMe}
    </Tag>
    <FlexBox alignItems="center" gap={8}>
      <Box
        as="input"
        type="search"
        aria-label={TOOLBAR_LABELS.search}
        placeholder={TOOLBAR_LABELS.search}
        borderColor="border-primary"
        bg="background"
        color="text-primary"
        p={8}
      />
      <TextButton variant="primary" size="small" icon={CloseIcon} iconPosition="right">
        {TOOLBAR_LABELS.clear}
      </TextButton>
    </FlexBox>
  </FlexBox>
);

/** One area card. Hover reveals its subjects, using the old Card variants. */
const AreaCardItem = ({ area, index }: { area: AreaItem; index: number }) => {
  const variant = AREA_CARD_VARIANTS[index % AREA_CARD_VARIANTS.length];
  const theme = useTheme();
  const secondaryText = theme.colors['text-secondary'];

  return (
    <Card variant={variant} data-marker="areaCard" p={16}>
      <FlexBox alignItems="center" gap={8}>
        <BookLibraryIcon size={24} aria-hidden />
        <Text as="h3" fontSize={18} fontWeight="bold">
          {area.title}
        </Text>
      </FlexBox>
      <Text as="p" fontSize={14} style={{ color: secondaryText }}>
        {area.subjects.length} subjects
      </Text>
      <FlexBox flexDirection="column" gap={4} borderColor="border-primary">
        {area.subjects.map((subject) => (
          <Anchor key={subject.id} href="#" color="primary">
            {subject.title}
          </Anchor>
        ))}
      </FlexBox>
      <TextButton size="small" icon={MiniChevronDownIcon} iconPosition="right">
        Show all
      </TextButton>
    </Card>
  );
};

/** Skill areas: heading, subtitle, and a row of area cards. */
const SkillAreas = () => (
  <Box as="section" aria-labelledby="skill-areas-heading" data-marker="skillAreas">
    <FlexBox flexDirection="column" gap={8} mb={16}>
      <Text as="h2" id="skill-areas-heading" fontSize={22} fontWeight="bold">
        {SKILL_AREAS_HEADING}
      </Text>
      <Text as="p" fontSize={16} color="text-secondary">
        {SKILL_AREAS_SUBTITLE}
      </Text>
    </FlexBox>
    <GridBox
      as="ul"
      gridTemplateColumns={['1fr', '1fr 1fr', '1fr 1fr 1fr 1fr']}
      gap={16}
      className="areasGrid"
    >
      {AREAS.map((area, index) => (
        <AreaCardItem key={area.id} area={area} index={index} />
      ))}
    </GridBox>
  </Box>
);

/** The Percipio home page, static. Old gamut names and old color names on purpose. */
export const PercipioHome = () => (
  <GamutProvider theme={percipioTheme}>
    <Box className="lxTheme" data-marker="percipioHome">
      <TopNav />
      <FlexBox className="pageBody" pt="70px">
        <LeftNav />
        <Box as="main" flex="1" p={24}>
          <Text as="p" fontSize={18} color="text-accent" mb={16}>
            {GREETING}
          </Text>
          <Banner />
          <Box mt={24}>
            <SearchToolbar />
          </Box>
          <Box mt={24}>
            <SkillAreas />
          </Box>
        </Box>
      </FlexBox>
    </Box>
  </GamutProvider>
);

export default PercipioHome;
