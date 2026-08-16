// Decap CMS always writes media paths root-relative to `public_folder` in
// admin/config.yml (e.g. "/uploads/team/foo.jpg"), with no idea that the site
// itself is served under a base path (see vite.config.ts -- GitHub Pages
// crutch). Bundler-processed image imports get that base prefix automatically;
// plain strings from content JSON don't, so this stitches it back on.
export function mediaUrl(path: string): string {
  if (!path) return path
  return import.meta.env.BASE_URL + path.replace(/^\//, '')
}
