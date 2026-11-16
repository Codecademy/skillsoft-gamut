import { getBeakVariant } from './beak';

describe('getBeakVariant', () => {
  it("uses `beak` when `position` is not `center` (i.e. `below`) to set the location of the beak relative to the popover' container", () => {
    expect(
      getBeakVariant({
        position: 'below',
        align: 'end',
        beak: 'start',
        variant: 'primary',
      })
    ).toBe('below-start');
  });

  it("uses `beak` when `position` is not `center` (i.e. `above`) to set the location of the beak relative to the popover' container", () => {
    expect(
      getBeakVariant({
        position: 'above',
        align: 'start',
        beak: 'end',
        variant: 'primary',
      })
    ).toBe('above-end');
  });

  it('uses `align` for the beak position when `position` is `above`/`below` when beak is explicitly omitted', () => {
    expect(
      getBeakVariant({
        position: 'above',
        align: 'end',
        variant: 'secondary',
      })
    ).toBe('above-end-sml');
  });

  it('uses center beak when beak is center regardless of align', () => {
    expect(
      getBeakVariant({
        position: 'below',
        align: 'end',
        beak: 'center',
        variant: 'primary',
      })
    ).toBe('below-center');
  });

  it('uses align for position center', () => {
    expect(
      getBeakVariant({
        position: 'center',
        align: 'start',
        beak: 'center',
        variant: 'secondary',
      })
    ).toBe('center-start-sml');
  });

  it('appends -sml for secondary variant', () => {
    expect(
      getBeakVariant({
        position: 'below',
        align: 'end',
        beak: 'start',
        variant: 'secondary',
      })
    ).toBe('below-start-sml');
  });
});
