import { getStoryData } from '@/lib/story-loader';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default async function Home() {
  // Load Series Data
  const data = await getStoryData('story.md');

  if (data.type !== 'series') {
    return <div>Error loading series data.</div>;
  }

  // Extract 'Series Cover' Scene (Page 1)
  const coverScene = data.intro?.find(s => s.title.includes('시리즈 표지'));

  // If no cover scene found, fallback to basic display
  if (!coverScene) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Series Cover Scene Not Found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf6e3] flex flex-col items-center py-8 px-4 font-sans text-gray-800">
      <header className="w-full max-w-4xl flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold text-amber-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          {data.title}
        </h1>
      </header>

      {/* Main Content Area: Resembling a book spread */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 items-stretch justify-center min-h-[600px]">

        {/* Left: Series Cover Image */}
        <div className="flex-1 relative flex flex-col">
          <div className="flex-1 bg-white rounded-2xl shadow-xl p-8 flex flex-col justify-center items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-amber-50/30 pattern-grid-lg opacity-20 pointer-events-none" />
            <div className="z-10 w-full h-full flex items-center justify-center p-4">
              {coverScene.imagePath ? (
                <img
                  src={coverScene.imagePath}
                  alt="Series Cover"
                  className="max-w-full max-h-[80%] object-contain rounded-lg shadow-sm"
                />
              ) : (
                <div className="p-6 bg-amber-50 rounded-xl border-2 border-dashed border-amber-200 text-amber-800/80 italic">
                  {coverScene.imageDescription}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Author's Note & Enter Button */}
        <div className="flex-1 relative flex flex-col">
          <div className="flex-1 bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-amber-50 flex flex-col justify-between relative">

            {/* Content */}
            <div className="prose prose-amber prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line font-medium flex-1 overflow-y-auto">
              <div className="border-b-2 border-amber-100 pb-4 mb-6">
                <h2 className="text-3xl font-bold text-amber-900">작가의 말</h2>
              </div>
              {coverScene.text}
            </div>

            {/* Action Button */}
            <div className="mt-8 pt-6 border-t border-amber-100 flex justify-center">
              <Link
                href="/series"
                className="group flex items-center gap-3 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <span className="text-xl font-bold">시리즈 목차 보기</span>
                <BookOpen className="w-6 h-6 group-hover:animate-pulse" />
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
