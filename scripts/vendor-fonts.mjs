// Run explicitly to refresh the checked-in, SIL Open Font License font assets.
// Normal production builds never need a network connection for fonts.
import fs from 'node:fs/promises';
const directory = 'dist/assets/fonts';
await fs.mkdir(directory, { recursive: true });
const sources = [
  ['dm-sans', 'dmsans', 'https://fonts.gstatic.com/s/dmsans/v17/rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu0-K4.woff2'],
  ['manrope', 'manrope', 'https://fonts.gstatic.com/s/manrope/v20/xn7gYHE41ni1AdIRggexSg.woff2'],
  ['libre-baskerville', 'librebaskerville', 'https://fonts.gstatic.com/s/librebaskerville/v24/kmKnZrc3Hgbbcjq75U4uslyuy4kn0qNZaxM.woff2'],
];
for (const [name, family, url] of sources) {
  for (const [target, source] of [
    [`${name}-latin.woff2`, url],
    [`${name}-OFL.txt`, `https://raw.githubusercontent.com/google/fonts/main/ofl/${family}/OFL.txt`],
  ]) {
    const response = await fetch(source);
    if (!response.ok) throw Error(`Cannot download ${source}: ${response.status}`);
    await fs.writeFile(`${directory}/${target}`, Buffer.from(await response.arrayBuffer()));
  }
}
