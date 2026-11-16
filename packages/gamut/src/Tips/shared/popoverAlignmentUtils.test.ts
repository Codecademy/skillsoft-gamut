import { getPopoverAlignmentAndPattern } from './popoverAlignmentUtils';

describe('getPopoverAlignmentAndPattern', () => {
  it('maps start-center to Popover center + align start', () => {
    expect(
      getPopoverAlignmentAndPattern({
        alignment: 'start-center',
        type: 'tool',
      })
    ).toMatchObject({
      position: 'center',
      align: 'start',
      beak: 'center',
    });
  });

  it('maps end-center to Popover center + align end', () => {
    expect(
      getPopoverAlignmentAndPattern({
        alignment: 'end-center',
        type: 'tool',
      })
    ).toMatchObject({
      position: 'center',
      align: 'end',
      beak: 'center',
    });
  });

  it('maps top-center without horizontal align swap', () => {
    expect(
      getPopoverAlignmentAndPattern({
        alignment: 'top-center',
        type: 'tool',
      })
    ).toMatchObject({
      position: 'above',
      align: 'center',
    });
  });
});
