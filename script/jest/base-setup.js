// Set fixed date
Date.now = jest.fn(() => new Date(2011, 6, 1).valueOf());

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

// Tests marked `@jest-environment node` (server rendering) have no window.
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'scrollTo', { value: noop, writable: true });
}
