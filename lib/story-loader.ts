import fs from 'fs';
import path from 'path';

export type Scene = {
    id: number;
    title: string;
    imageDescription: string;
    imagePath?: string; // Optional path to specific illustration
    text: string; // The storytelling part
    prompt: string; // AI image prompt
};

export type StoryData = {
    type: 'story';
    title: string;
    scenes: Scene[];
};

export type SeriesData = {
    type: 'series';
    title: string;
    intro: Scene[]; // Intro Scenes (Cover, Author's Note, etc)
    roadmap: { title: string; file: string; status: string }[];
    characters: { name: string; description: string }[];
};

// Helper to extract scenes from text content
function extractScenes(content: string, filename: string = ''): Scene[] {
    const scenes: Scene[] = [];

    // Split by H2 headers (## ) to define scenes
    const rawSections = content.split(/^## /m).slice(1);

    rawSections.forEach((sectionRaw, index) => {
        const lines = sectionRaw.trim().split('\n');
        let rawTitle = lines[0].trim();
        let title = rawTitle.replace(/\s*\(.*?\)/g, '').trim();

        const sectionContent = lines.slice(1).join('\n');

        // Extract Metadata
        const imageDescMatch = sectionContent.match(/### 그림 설명\s+([\s\S]*?)(?=###|$)/) || sectionContent.match(/\*\*그림 설명\*\*:\s+(.*)/);
        const textMatch = sectionContent.match(/### 텍스트\s+([\s\S]*?)(?=###|$)/) || sectionContent.match(/> (.*)/);
        const promptMatch = sectionContent.match(/### AI 이미지 프롬프트\s+```([\s\S]*?)```/);

        // Text Cleanup
        let cleanText = '';
        if (sectionContent.includes('### 텍스트')) {
            const tm = sectionContent.match(/### 텍스트\s+([\s\S]*?)(?=###|$)/);
            if (tm) {
                // Remove blockquote markers specifically for the text section
                cleanText = tm[1].split('\n').map(l => l.replace(/^>\s?/, '').trim()).filter(Boolean).join('\n\n');
            }
        } else {
            // Fallback
            const quoteMatches = sectionContent.match(/> (.*)/g);
            if (quoteMatches) cleanText = quoteMatches.map(l => l.replace(/^> /, '')).join('\n');
        }

        // Image Path Logic
        let imagePath = undefined;
        let p = undefined;

        // 1. Series Cover (Page 1)
        if (title.includes('시리즈 표지') || title.includes('Series Cover')) {
            p = '/images/series_cover.png';
        }
        // 2. Series TOC (Page 2) - Explicitly empty or specific placeholder
        else if (title.includes('시리즈 목차') || title.includes('Series Index')) {
            imagePath = undefined;
        }
        // 3. Volume Logic (Cover, Back Cover, Scenes)
        else {
            const volMatch = filename.match(/vol(\d+)\.md$/) || filename.match(/vo(\d+)\.md$/);
            const volume = volMatch ? volMatch[1] : '1';

            if (title.includes('뒷표지') || title.includes('Back')) {
                p = `/images/vol${volume}/cover_back.png`;
            } else if (title.includes('표지') || title.includes('Cover')) { // Front Cover of Volume
                p = `/images/vol${volume}/cover_front.png`;
            } else {
                // Scene Number Parsing
                const pageMatch = rawTitle.match(/\((\d+)/);
                if (pageMatch) {
                    let pageNumInt = parseInt(pageMatch[1], 10);
                    // Standardize to even numbers (Start of Spread)
                    if (pageNumInt % 2 !== 0) pageNumInt -= 1;
                    const pageNum = pageNumInt.toString().padStart(3, '0');
                    p = `/images/vol${volume}/${pageNum}.png`;
                }
            }
        }

        // Validate if image file exists
        if (p && fs.existsSync(path.join(process.cwd(), 'public', p))) {
            imagePath = p;
        }

        const scene: Scene = {
            id: index + 1, // Will be re-indexed
            title: title,
            imageDescription: imageDescMatch ? (imageDescMatch[1] || imageDescMatch[0].replace('**그림 설명**:', '').trim()).trim() : '',
            imagePath: imagePath,
            text: cleanText,
            prompt: promptMatch ? promptMatch[1].trim() : '',
        };
        scenes.push(scene);
    });

    return scenes;
}

export async function getStoryData(filename: string): Promise<StoryData | SeriesData> {
    const filePath = path.join(process.cwd(), 'content', filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Check if this is a Series Manifest loading request
    const isSeriesManifest = fileContent.includes('(시리즈 정보)');

    // CASE 1: Loading story.md (Series Manifest) explicitly
    if (isSeriesManifest && filename === 'story.md') {
        const titleMatch = fileContent.match(/^# (.+) \(시리즈 정보\)/);
        const roadmapMatches = [...fileContent.matchAll(/\d+\. \*\*\[(.+)\] (.+)\*\* \(file: `(.+)`\)/g)];

        // Extract Intro Scenes (Series Cover, Author's Note, etc.)
        const introScenes = extractScenes(fileContent, 'story.md');

        return {
            type: 'series',
            title: titleMatch ? titleMatch[1] : 'Unknown Series',
            intro: introScenes,
            roadmap: roadmapMatches.map(m => ({
                title: `${m[1]} ${m[2]}`,
                file: m[3],
                status: 'Available'
            })),
            characters: []
        };
    }

    // CASE 2: Loading a Volume (e.g. vol1.md)
    let storyTitle = '';
    const volTitleMatch = fileContent.match(/^# (.+)$/m);
    if (volTitleMatch) storyTitle = volTitleMatch[1];

    const scenes = extractScenes(fileContent, filename);

    return {
        type: 'story',
        title: storyTitle, // Volume Title
        scenes: scenes,
    };
}
