import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, waitFor } from 'storybook/test';

import { Video } from '.';

const meta: Meta<typeof Video> = {
  title: 'Media & Assets/Video',
  component: Video,
  parameters: {
    docs: {
      description: {
        component: `Import \`Video\` from \`@skillsoft/gamut/Video\`. It isn't in the main \`@skillsoft/gamut\` export, so apps that don't use it never load its player libraries.

Those libraries are peer dependencies, so add them yourself. Pin \`@vidstack/react\`: its \`latest\` npm tag still points to 0.6, which lacks the layout \`Video\` imports, and 1.14+ breaks Jest in repos whose Babel can't parse static class blocks.

\`\`\`bash
yarn add @vidstack/react@~1.12.12 react-player@^3.4.0
\`\`\``,
      },
    },
  },
  args: {},
};

export default meta;
type Story = StoryObj<typeof Video>;

const mp4Url =
  'https://static-assets.codecademy.com/skillshorts/introduction-to-quantum-computing/01-Introduction-to-Quantum-Computing.mp4';
const mp4Title = '01: Introduction-to-Quantum-Computing';
const youtubeUrl = 'https://www.youtube.com/watch?v=wxds6MAtUQ0';
const youtubeTitle = 'Intro to Programming: Loops';
const englishSubtitles = {
  src: 'https://files.vidstack.io/sprite-fight/subs/english.vtt',
  label: 'English',
  language: 'en-US',
  kind: 'subtitles',
} as const;
const chapters = {
  src: 'https://files.vidstack.io/sprite-fight/chapters.vtt',
  language: 'en-US',
  kind: 'chapters',
  type: 'vtt',
  default: true,
} as const;

const providerIframe = (canvasElement: HTMLElement) =>
  canvasElement
    .querySelector('youtube-video, vimeo-video')
    ?.shadowRoot?.querySelector('iframe');

const onReady = fn();
const onPlay = fn();

export const Default: Story = {
  args: {
    videoUrl: mp4Url,
    videoTitle: mp4Title,
    translations: {
      Play: 'Play Intro Video',
    },
    onReady: () => onReady(),
  },
  play: async ({ canvas, userEvent }) => {
    const player = await canvas.findByRole('region', {
      name: `Video Player - ${mp4Title}`,
    });
    await waitFor(() => expect(player).toHaveAttribute('data-can-play'), {
      timeout: 10000,
    });
    await expect(onReady).toHaveBeenCalled();

    await canvas.findByRole('button', { name: 'Play Intro Video' });
    await userEvent.hover(canvas.getByRole('button', { name: 'Fullscreen' }));
    await canvas.findByRole('tooltip', { name: 'Enter fullscreen' });
    await expect(
      canvas.queryByRole('button', { name: /download/i })
    ).toBeNull();
    await expect(canvas.queryByRole('button', { name: /airplay/i })).toBeNull();
    await expect(
      canvas.queryByRole('button', { name: /google cast/i })
    ).toBeNull();
  },
};

export const PlayAndPause: Story = {
  args: {
    videoUrl: mp4Url,
    videoTitle: mp4Title,
    muted: true,
    onPlay: () => onPlay(),
  },
  play: async ({ canvas, userEvent }) => {
    const player = await canvas.findByRole('region', {
      name: `Video Player - ${mp4Title}`,
    });
    await waitFor(() => expect(player).toHaveAttribute('data-can-play'), {
      timeout: 10000,
    });

    const playButton = await canvas.findByRole('button', {
      name: 'Play',
      pressed: false,
    });
    await userEvent.click(playButton);
    await waitFor(() => expect(onPlay).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(player).toHaveAttribute('data-playing'));
    await expect(playButton).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(playButton);
    await waitFor(() => expect(player).toHaveAttribute('data-paused'));
    await expect(playButton).toHaveAttribute('aria-pressed', 'false');
  },
};

export const SeekBackwards: Story = {
  args: {
    videoUrl: mp4Url,
    videoTitle: mp4Title,
  },
  play: async ({ canvas, userEvent }) => {
    const player = await canvas.findByRole('region', {
      name: `Video Player - ${mp4Title}`,
    });
    await waitFor(() => expect(player).toHaveAttribute('data-can-play'), {
      timeout: 10000,
    });
    const video = player.querySelector('video')!;
    video.currentTime = 30;
    await waitFor(() => expect(video.currentTime).toBe(30));

    const seekBackward = await canvas.findByRole('button', {
      name: 'Seek backward -10 seconds',
    });
    await userEvent.hover(seekBackward);
    await canvas.findByRole('tooltip', { name: 'Back 10 seconds' });

    await userEvent.click(seekBackward);
    await waitFor(() => expect(video.currentTime).toBe(20));
  },
};

export const KeyboardShortcuts: Story = {
  args: {
    videoUrl: mp4Url,
    videoTitle: mp4Title,
    muted: true,
  },
  play: async ({ canvas, userEvent }) => {
    const player = await canvas.findByRole('region', {
      name: `Video Player - ${mp4Title}`,
    });
    await waitFor(() => expect(player).toHaveAttribute('data-can-play'), {
      timeout: 10000,
    });
    player.focus();

    await userEvent.keyboard('k');
    await waitFor(() => expect(player).toHaveAttribute('data-playing'));
    await userEvent.keyboard('k');
    await waitFor(() => expect(player).toHaveAttribute('data-paused'));

    await userEvent.keyboard('m');
    await waitFor(() => expect(player).not.toHaveAttribute('data-muted'));
    await userEvent.keyboard('m');
    await waitFor(() => expect(player).toHaveAttribute('data-muted'));
  },
};

export const CaptionsMenu: Story = {
  args: {
    videoUrl: mp4Url,
    videoTitle: mp4Title,
    textTracks: [
      englishSubtitles,
      {
        src: 'https://files.vidstack.io/sprite-fight/subs/spanish.vtt',
        label: 'Spanish',
        language: 'es-ES',
        kind: 'subtitles',
        default: true,
      },
    ],
  },
  parameters: {
    a11y: {
      config: {
        rules: [{ id: 'scrollable-region-focusable', enabled: false }],
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    // TODO: Vidstack's open settings menu is a scrollable region with no keyboard access (axe scrollable-region-focusable)
    const player = await canvas.findByRole('region', {
      name: `Video Player - ${mp4Title}`,
    });
    await waitFor(() => expect(player).toHaveAttribute('data-can-play'), {
      timeout: 10000,
    });

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Settings' })
    );
    await canvas.findByRole('menuitem', { name: /Captions/ });
    await waitFor(() =>
      userEvent.click(canvas.getByRole('menuitem', { name: /Captions/ }))
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('menuitemradio', { name: 'Spanish' })
      ).toHaveAttribute('aria-checked', 'true')
    );

    await waitFor(() =>
      userEvent.click(canvas.getByRole('menuitemradio', { name: 'English' }))
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('menuitemradio', { name: 'English' })
      ).toHaveAttribute('aria-checked', 'true')
    );
    await expect(
      canvas.getByRole('menuitemradio', { name: 'Spanish' })
    ).toHaveAttribute('aria-checked', 'false');
  },
};

export const WithoutControls: Story = {
  args: {
    videoUrl: mp4Url,
    videoTitle: mp4Title,
    controls: false,
  },
  play: async ({ canvas }) => {
    const player = await canvas.findByRole('region', {
      name: `Video Player - ${mp4Title}`,
    });
    await waitFor(() => expect(player).toHaveAttribute('data-can-play'), {
      timeout: 10000,
    });
    await expect(canvas.queryByRole('button')).toBeNull();
  },
};

export const Youtube: Story = {
  args: {
    videoUrl: youtubeUrl,
    videoTitle: youtubeTitle,
  },
  play: async ({ canvas, canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelector('youtube-video')).toHaveAttribute(
        'src',
        youtubeUrl
      )
    );
    await waitFor(
      () =>
        expect(providerIframe(canvasElement)).toHaveAttribute(
          'title',
          youtubeTitle
        ),
      { timeout: 5000 }
    );
    await expect(canvas.queryByRole('region')).toBeNull();
  },
};

export const YoutubeWithPlaceholder: Story = {
  args: {
    videoUrl: youtubeUrl,
    videoTitle: youtubeTitle,
    placeholderImage: 'https://files.vidstack.io/sprite-fight/poster.webp',
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const playButton = await canvas.findByRole('button', {
      name: `play video: ${youtubeTitle}`,
    });
    await expect(canvasElement.querySelector('youtube-video')).toBeNull();

    await userEvent.click(playButton);
    await waitFor(() =>
      expect(canvasElement.querySelector('youtube-video')).toHaveAttribute(
        'src',
        youtubeUrl
      )
    );
  },
};

export const YoutubeUrlList: Story = {
  args: {
    videoUrl: [youtubeUrl],
    videoTitle: youtubeTitle,
  },
  play: async ({ canvas, canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelector('youtube-video')).not.toBeNull()
    );
    await expect(canvas.queryByRole('region')).toBeNull();
  },
};

export const YoutubeWithCaptions: Story = {
  args: {
    videoUrl: youtubeUrl,
    videoTitle: youtubeTitle,
    textTracks: [englishSubtitles],
  },
  tags: ['!test'],
  play: async ({ canvas, canvasElement }) => {
    // TODO: Unmounting a vidstack YouTube player before it loads throws unhandled "provider destroyed" rejections, so this story is excluded from test runs
    await canvas.findByRole('region', {
      name: `Video Player - ${youtubeTitle}`,
    });
    await expect(canvasElement.querySelector('youtube-video')).toBeNull();
  },
};

export const YoutubeWithoutPlayerEmbed: Story = {
  args: {
    videoUrl: youtubeUrl,
    videoTitle: youtubeTitle,
    showPlayerEmbed: false,
  },
  tags: ['!test'],
  play: async ({ canvas, canvasElement }) => {
    // TODO: Unmounting a vidstack YouTube player before it loads throws unhandled "provider destroyed" rejections, so this story is excluded from test runs
    await canvas.findByRole('region', {
      name: `Video Player - ${youtubeTitle}`,
    });
    await expect(canvasElement.querySelector('youtube-video')).toBeNull();
  },
};

export const YoutubeWithChapters: Story = {
  args: {
    videoUrl: youtubeUrl,
    videoTitle: youtubeTitle,
    textTracks: [chapters],
  },
  play: async ({ canvas, canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelector('youtube-video')).toHaveAttribute(
        'src',
        youtubeUrl
      )
    );
    await expect(canvas.queryByRole('region')).toBeNull();
  },
};

export const Vimeo: Story = {
  args: {
    videoUrl: 'https://vimeo.com/1218916076',
    videoTitle: 'CODECADEMY | Develop Yourself',
  },
  play: async ({ canvasElement }) => {
    await waitFor(
      () =>
        expect(providerIframe(canvasElement)).toHaveAttribute(
          'title',
          'CODECADEMY | Develop Yourself'
        ),
      { timeout: 5000 }
    );
  },
};

export const VimeoWithoutTitle: Story = {
  args: {
    videoUrl: 'https://vimeo.com/1218916076',
  },
  parameters: {
    a11y: { config: { rules: [{ id: 'frame-title', enabled: false }] } },
  },
  play: async ({ canvasElement }) => {
    // TODO: Video doesn't title Vimeo's provider iframe when its shadow root attaches late, so it never gets the default "Video player" name
    await waitFor(() =>
      expect(canvasElement.querySelector('vimeo-video')).toHaveAttribute(
        'src',
        'https://vimeo.com/1218916076'
      )
    );
  },
};

export const VideoWithTracksAndThumbnails: Story = {
  args: {
    videoUrl: 'https://files.vidstack.io/sprite-fight/hls/stream.m3u8',
    videoTitle: 'Sprite Fight',
    placeholderImage: 'https://files.vidstack.io/sprite-fight/poster.webp',
    autoplay: false,
    textTracks: [
      englishSubtitles,
      {
        src: 'https://files.vidstack.io/sprite-fight/subs/spanish.vtt',
        label: 'Spanish',
        language: 'es-ES',
        kind: 'subtitles',
        default: true,
      },
      chapters,
    ],
    thumbnails: 'https://files.vidstack.io/sprite-fight/thumbnails.vtt',
  },
  play: async ({ canvas }) => {
    const player = await canvas.findByRole('region', {
      name: 'Video Player - Sprite Fight',
    });
    canvas.getByRole('img', { name: 'Sprite Fight' });
    await waitFor(() =>
      expect(
        [...player.querySelectorAll('track')].map((track) => track.label)
      ).toEqual(['English', 'Spanish'])
    );
  },
};
