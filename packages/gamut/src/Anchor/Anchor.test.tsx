import { render } from '@testing-library/react';
import React from 'react';

import { Anchor } from '.';

const anchorText = 'I am an anchor';
const href = 'https://example.com';

describe('Anchor', () => {
  it('forwards ref to the anchor element', () => {
    const ref = React.createRef<HTMLAnchorElement>();
    render(
      <Anchor href={href} ref={ref}>
        {anchorText}
      </Anchor>
    );

    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    expect(ref.current).toHaveAttribute('href', href);
  });

  it('forwards ref to the button when rendered without href', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Anchor ref={ref}>{anchorText}</Anchor>);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
