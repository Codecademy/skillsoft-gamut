export const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

export type Size = (typeof sizes)[number];
