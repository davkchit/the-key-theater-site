// Photos uploaded through the admin come straight off a phone: 5000 px and
// 7-8 MB each. A show page with three of them is over 20 MB, and on a phone
// the visitor stares at the alt text while it loads. This shrinks every
// photo in public/uploads that is too big, in place and under the same name,
// so nothing that points at it changes. Runs before each build
// (rebuild.sh); prints the files it changed, one per line.
//
//   node deploy/cms/shrink-uploads.mjs [folder]
import fs from 'node:fs'
import path from 'node:path'

const DIR = path.resolve(process.argv[2] || 'public/uploads')
const MAX_SIDE = 2400 // px, the long side: sharp on a 1440-px-wide screen at 1.5x
const MAX_BYTES = 900 * 1024 // smaller than this and within MAX_SIDE: left alone

let sharp
try {
  sharp = (await import('sharp')).default
} catch {
  console.error('shrink-uploads: нет sharp, фото не сжимаются (npm ci)')
  process.exit(0)
}
// one photo at a time and no cache: the rebuild runs under a 450 MB cap
sharp.concurrency(1)
sharp.cache(false)

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) yield* walk(p)
    else if (/\.(jpe?g|png|webp)$/i.test(e.name)) yield p
  }
}

for (const file of walk(DIR)) {
  try {
    // read into memory first: libvips keeps the file open otherwise, and on
    // Windows it then cannot be written back
    const input = fs.readFileSync(file)
    const size = input.length
    const meta = await sharp(input).metadata()
    // a phone's portrait shot is stored sideways with an EXIF turn
    const turned = (meta.orientation ?? 1) >= 5
    const long = Math.max(meta.width ?? 0, meta.height ?? 0)
    if (size <= MAX_BYTES && long <= MAX_SIDE) continue

    let img = sharp(input).rotate().resize({
      width: MAX_SIDE,
      height: MAX_SIDE,
      fit: 'inside',
      withoutEnlargement: true,
    })
    const ext = path.extname(file).toLowerCase()
    if (ext === '.png') img = img.png({ compressionLevel: 9 })
    else if (ext === '.webp') img = img.webp({ quality: 82 })
    else img = img.jpeg({ quality: 82, mozjpeg: true })
    const out = await img.toBuffer()
    // a PNG drawing can come out bigger; then it stays as it was
    if (out.length >= size && long <= MAX_SIDE && !turned) continue
    fs.writeFileSync(file, out)
    console.log(
      `${path.relative(process.cwd(), file)}: ${(size / 1048576).toFixed(1)} МБ → ${(out.length / 1048576).toFixed(1)} МБ`,
    )
  } catch (e) {
    // one broken file must not stop the build
    console.error(`shrink-uploads: ${file}: ${e.message}`)
  }
}
