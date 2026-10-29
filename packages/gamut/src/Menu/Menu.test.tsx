import { render } from '@testing-library/react';
import * as React from 'react';

import { Menu } from './Menu';
import { MenuItem } from './MenuItem';

describe('MenuItem', () => {
  it('forwards ref to the link when MenuItem has href', () => {
    const ref = React.createRef<HTMLAnchorElement>();
    render(
      <Menu>
        <MenuItem href="#link" ref={ref}>
          Cool Town
        </MenuItem>
      </Menu>
    );
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });

  it('forwards ref to the button when MenuItem has onClick', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <Menu>
        <MenuItem ref={ref} onClick={() => null}>
          Cool Town
        </MenuItem>
      </Menu>
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
