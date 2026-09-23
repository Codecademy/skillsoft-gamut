import { Rotation, StrokeButton } from '@skillsoft/gamut';
import { MiniChevronDownIcon } from '@skillsoft/gamut-icons';
import type { Meta } from '@storybook/react';
import type { ComponentProps} from 'react';
import { useEffect, useState } from 'react';

const meta: Meta<typeof Rotation> = {
  component: Rotation,
  args: {},
};

export default meta;

export const Default: React.FC<ComponentProps<typeof Rotation>> = (args) => {
  const [isRotated, setRotated] = useState(args.rotated);

  useEffect(() => {
    setRotated(args.rotated);
  }, [args.rotated]);

  return (
    <StrokeButton
      aria-label="Toggle rotation demo"
      onClick={() => setRotated(!isRotated)}
    >
      <Rotation {...args} rotated={isRotated}>
        <MiniChevronDownIcon />
      </Rotation>
    </StrokeButton>
  );
};
