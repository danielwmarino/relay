import sharp from 'sharp'

const sizes = [192, 512]

for (const size of sizes) {
  const fontSize = Math.floor(size * 0.55)
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#222222" rx="${size * 0.2}"/>
      <text
        x="50%"
        y="54%"
        font-family="Arial, sans-serif"
        font-weight="bold"
        font-size="${fontSize}"
        fill="white"
        text-anchor="middle"
        dominant-baseline="middle"
      >R</text>
    </svg>
  `
  await sharp(Buffer.from(svg)).png().toFile(`public/icons/icon-${size}.png`)
  console.log(`Created icon-${size}.png`)
}
