import { isAutomatic, manifest } from '../presets/color-roles/manifest';

/*
  The color-roles data is generated from design's map, so these guard the
  generator and any hand edit: a row the codemod applies must name exactly one
  real role, and no name can be both an alias and an old palette color.
*/
describe('color-roles manifest', () => {
  const rows = Object.entries(manifest.aliases);
  const roles = new Set(manifest.roles);

  it('has every alias design maps', () => {
    expect(rows).toHaveLength(32);
  });

  it.each(rows.filter(([, a]) => isAutomatic(a)))(
    '%s names exactly one role',
    (_, alias) => {
      expect(alias.to).toHaveLength(1);
    }
  );

  it('only targets real roles', () => {
    const bad = rows.flatMap(([name, a]) =>
      a.to.filter((t) => !roles.has(t)).map((t) => `${name} → ${t}`)
    );
    expect(bad).toEqual([]);
  });

  it('keeps aliases and old palette names apart', () => {
    const both = manifest.oldPalette.filter((n) => n in manifest.aliases);
    expect(both).toEqual([]);
  });
});
