import type * as React from 'react';

import { MarkdownVideo } from '.';

jest.mock('react-player', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@vidstack/react', () => ({
  __esModule: true,
  MediaPlayer: () => null,
  MediaProvider: () => null,
  Poster: jest.fn(),
  Track: jest.fn(),
  useMediaState: jest.fn(),
  useMediaRemote: jest.fn(),
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
