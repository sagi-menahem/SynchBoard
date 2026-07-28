import type { Plugin } from 'vite';

/**
 * Loads the entry stylesheets asynchronously instead of render-blocking.
 *
 * The page ships critical styles inline in index.html to paint the skeleton immediately
 * (the skeleton hero image is the LCP element). The bundled application CSS is only
 * needed once React mounts, so blocking first paint on it costs LCP for no benefit.
 *
 * This replaces a post-build script that rewrote dist/index.html with a regex hardcoded
 * to `/assets/index-*.css`. Vite 8 splits CSS into several entry chunks, so that pattern
 * silently stopped covering the largest stylesheet. Running inside the build via
 * `transformIndexHtml` means every stylesheet Vite injects is handled, whatever it is
 * named — there is nothing to keep in sync by hand.
 *
 * Each link becomes a `preload` that promotes itself to a stylesheet on load, with the
 * original tag preserved inside `<noscript>` for script-disabled clients.
 */
export function nonBlockingCss(): Plugin {
  // Matches the stylesheet links Vite injects into the entry HTML.
  const stylesheetLink = /<link[^>]*\brel="stylesheet"[^>]*>/g;
  const hrefAttr = /\bhref="([^"]+)"/;

  return {
    name: 'synchboard:non-blocking-css',
    // Dev serves CSS through the module graph; there is no link tag to rewrite.
    apply: 'build',
    // Run after Vite has injected its own asset tags.
    enforce: 'post',
    transformIndexHtml(html) {
      return html.replace(stylesheetLink, (tag) => {
        const href = hrefAttr.exec(tag)?.[1];
        if (!href) {
          return tag;
        }

        const preload =
          `<link rel="preload" as="style" href="${href}" ` +
          `onload="this.onload=null;this.rel='stylesheet'">`;

        return `${preload}<noscript>${tag}</noscript>`;
      });
    },
  };
}
