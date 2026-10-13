const fs = require('fs');
const path = require('path');

const distHtmlPath = path.join(__dirname, '..', 'dist', 'index.html');
const fontPath = path.join(__dirname, '..', 'node_modules', '@expo', 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts', 'Ionicons.ttf');

if (fs.existsSync(distHtmlPath) && fs.existsSync(fontPath)) {
  const fontBase64 = fs.readFileSync(fontPath).toString('base64');
  let html = fs.readFileSync(distHtmlPath, 'utf8');

  const fontStyle = `
    <style id="expo-generated-fonts">
      @font-face {
        font-family: 'Ionicons';
        src: url('data:font/truetype;charset=utf-8;base64,${fontBase64}') format('truetype');
        font-display: swap;
      }
      @font-face {
        font-family: 'ionicons';
        src: url('data:font/truetype;charset=utf-8;base64,${fontBase64}') format('truetype');
        font-display: swap;
      }
    </style>
  `;

  if (!html.includes('id="expo-generated-fonts"')) {
    html = html.replace('</head>', `${fontStyle}\n</head>`);
    fs.writeFileSync(distHtmlPath, html, 'utf8');
    console.log('✅ Ionicons font successfully embedded into dist/index.html!');
  }
}
