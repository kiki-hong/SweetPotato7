import { getStoryData } from '@/lib/story-loader';
import StoryViewer from '@/components/StoryViewer';

export default async function VolumePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const volId = id;
    const filename = `vol${volId}.md`;

    const data = await getStoryData(filename);

    if (data.type === 'series') {
        return <div>Error: Invalid Story File</div>;
    }

    return (
        <main>
            <StoryViewer data={data} />
        </main>
    );
}
