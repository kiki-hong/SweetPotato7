const fs = require('fs');
const path = require('path');

const filename = 'story.md';
const filePath = path.join(process.cwd(), 'content', filename);
const fileContent = fs.readFileSync(filePath, 'utf-8');

const rawSections = fileContent.split(/^## /m).slice(1);

rawSections.forEach((sectionRaw, index) => {
    const lines = sectionRaw.trim().split('\n');
    let rawTitle = lines[0].trim();
    let title = rawTitle.replace(/\s*\(.*?\)/g, '').trim();

    if (title === '표지') {
        console.log('--- FOUND SCENE: 표지 ---');
        console.log('Raw Section Start:', sectionRaw.substring(0, 100));

        const content = lines.slice(1).join('\n');
        console.log('Content Start:', content.substring(0, 100));

        const textMatch = content.match(/### 텍스트\s+([\s\S]*?)(?=###|$)/);
        console.log('Text Match Found:', !!textMatch);

        if (textMatch) {
            console.log('Captured Group 1:', textMatch[1]);

            const cleanText = textMatch[1]
                .split('\n')
                .map(l => l.replace(/^>\s?/, '').trim())
                .filter(l => l !== '')
                .join('\n\n');

            console.log('Cleaned Text:', cleanText);
            console.log('Cleaned Text Length:', cleanText.length);
        }
    }
});
