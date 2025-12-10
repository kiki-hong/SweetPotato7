import { getStoryData } from '@/lib/story-loader';

export default async function SeriesPage() {
    // Load the story data (Series Manifest)
    const data = await getStoryData('story.md');

    if (data.type === 'series') {
        return (
            <div className="min-h-screen bg-[#fdf6e3] text-amber-900 p-8 flex flex-col items-center">
                <header className="max-w-4xl w-full mb-12 text-center relative">
                    <a href="/" className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-colors text-sm font-bold shadow-sm">
                        ← 홈으로
                    </a>
                    <h1 className="text-4xl font-bold mb-4">{data.title}</h1>
                    <p className="text-amber-800/60">시리즈 메타데이터</p>
                </header>

                <div className="max-w-4xl w-full grid gap-8">
                    <section className="bg-white p-8 rounded-2xl shadow-lg border border-amber-100">
                        <h2 className="text-2xl font-bold mb-6 border-b border-amber-100 pb-2">시리즈 로드맵</h2>
                        <div className="space-y-4">
                            {data.roadmap.map((vol, idx) => {
                                const match = vol.file.match(/vol(\d+)\.md/);
                                const volId = match ? match[1] : null;

                                // Link if status is NOT 'Scheduled' (예정)
                                // So 'Available', 'In Progress', 'Start' etc. are all clickable
                                const isAvailable = !vol.status.includes('예정');

                                return (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
                                        <div>
                                            <span className="font-bold text-amber-900 block">{vol.title}</span>
                                            <span className="text-sm text-amber-700">{vol.status}</span>
                                        </div>

                                        {volId && isAvailable ? (
                                            <a href={`/vol/${volId}`} className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-bold transition-colors">
                                                읽기
                                            </a>
                                        ) : (
                                            <span className="text-gray-400 text-sm">준비중</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    return <div>Error: Invalid Series File</div>;
}
