const fs = require('fs');
const files = [
    'js/gen-image.js',
    'js/gen-video.js',
    'js/gen-doc.js',
    'js/gen-audio.js',
    'js/prompt-image.js',
    'js/prompt-video.js'
];
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/\\`/g, '`').replace(/\\\$/g, '$').replace(/\\'/g, "'");
    fs.writeFileSync(f, content);
});
console.log('Fixed syntax errors');
