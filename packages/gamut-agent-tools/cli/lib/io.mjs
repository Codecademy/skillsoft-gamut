// Deliberately duplicated from @skillsoft/gamut's bin/lib/io.mjs -- this
// package can't import across the package boundary from its own bootstrap
// shim, and duplicating a handful of trivial log helpers is simpler than
// threading them through the dynamic import call.

/** @param {string} message */
export function log(message) {
  process.stdout.write(message.endsWith('\n') ? message : `${message}\n`);
}

/** @param {string} message */
export function warn(message) {
  process.stderr.write(message.endsWith('\n') ? message : `${message}\n`);
}

/** @param {string} message */
export function error(message) {
  process.stderr.write(message.endsWith('\n') ? message : `${message}\n`);
}
