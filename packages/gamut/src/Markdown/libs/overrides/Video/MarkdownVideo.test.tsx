import type * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MarkdownVideo } from '.';

vi.mock('react-player', () => ({
  __esModule: true,
  default: () => null,
}));

vi.mock('@vidstack/react', () => ({
  __esModule: true,
  MediaPlayer: () => null,
  MediaProvider: () => null,
  Poster: vi.fn(),
  Track: vi.fn(),
  useMediaState: vi.fn(),
  useMediaRemote: vi.fn(),
}));

describe('MarkdownVideo', () => {
  it('Passes undefined width and height to Video when the video has none', () => {
    // React only warns about NaN styles once per value, so check the props directly
    const element = MarkdownVideo({
      src: 'https://example.com/clip.mp4',
    } as Parameters<typeof MarkdownVideo>[0]) as React.ReactElement<{
      width?: number;
      height?: number;
    }>;
    expect(element.props.width).toBeUndefined();
    expect(element.props.height).toBeUndefined();
  });
});
