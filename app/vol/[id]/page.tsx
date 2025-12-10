import { getStoryData } from '@/lib/story-loader';
import StoryViewer from '@/components/StoryViewer';

export default async function VolumePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const volId = id;
    const filename = `vol${volId}.md`;

    const data = await getStoryData(filename);

    // Fetch series info to find next volume
    const seriesData = await getStoryData('story.md');
    let nextVolume = null;

    if (seriesData.type === 'series') {
        const currentVolIndex = seriesData.roadmap.findIndex(v => v.file === filename);
        if (currentVolIndex !== -1 && currentVolIndex < seriesData.roadmap.length - 1) {
            const nextVolData = seriesData.roadmap[currentVolIndex + 1];
            // Check if next volume is available (not scheduled)
            if (!nextVolData.status.includes('예정')) {
                const nextMatch = nextVolData.file.match(/vol(\d+)\.md/);
                if (nextMatch) {
                    nextVolume = {
                        id: nextMatch[1],
                        title: nextVolData.title
                    };
                }
            }
        }
    }

    if (data.type === 'series') {
        return <div>Error: Invalid Story File</div>;
    }

    return (
        <main>
            <StoryViewer data={data} nextVolume={nextVolume} />
        </main>
    );
}
