import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@skillsoft/gamut';
import {
  Controls,
  Description,
  Primary,
  Stories,
  Subtitle,
  Title,
  useOf,
} from '@storybook/addon-docs/blocks';

import { isSystemPropCategory } from '../../systemProps';

/**
 * Storybook's default autodocs page, with system props moved out of the main
 * props table into their own tab, and the primary story shown only at the top
 * instead of again under Stories.
 */
export const DocsPage: React.FC = () => {
  const { csfFile, preparedMeta } = useOf('meta', ['meta']);
  const isSingleStory = Object.keys(csfFile.stories).length === 1;
  const systemProps = Object.entries(preparedMeta.argTypes)
    .filter(([, argType]) => isSystemPropCategory(argType.table?.category))
    .map(([name]) => name);

  return (
    <>
      <Title />
      <Subtitle />
      <Description of="meta" />
      {isSingleStory && <Description of="story" />}
      <Primary />
      {systemProps.length > 0 ? (
        <Tabs defaultSelectedKey="props">
          <TabList aria-label="Props">
            <Tab id="props">Props</Tab>
            <Tab id="system-props">System props</Tab>
          </TabList>
          <TabPanels>
            <TabPanel id="props">
              <Controls exclude={systemProps} />
            </TabPanel>
            <TabPanel id="system-props">
              <Controls include={systemProps} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      ) : (
        <Controls />
      )}
      {!isSingleStory && <Stories includePrimary={false} />}
    </>
  );
};
