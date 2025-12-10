# 💻 고구마 7남매: 통합 코스 스크립트 설명서

이 문서는 여러 파일로 나뉘어 있는 프로그램의 핵심 로직을 **단 하나의 흐름**으로 이해할 수 있도록 정리한 개발자용 통합 문서입니다.
웹사이트가 작동하는 순서대로 코드를 배치하고 설명했습니다.

---

## 1. 데이터 불러오기 (`lib/story-loader.ts`)
모든 페이지는 이 **데이터 로더**를 통해 마크다운 파일을 읽어들이는 것으로 시작합니다.

### 🔍 핵심 기능: `getStoryData`
파일 이름(`filename`)을 주면, 그 안의 내용을 분석해서 그림과 글을 분리해줍니다.

```typescript
// 1. 파일 내용을 읽습니다.
const fileContent = fs.readFileSync(filePath, 'utf-8');

// 2. 시리즈 정보 파일(story.md)인지 확인합니다.
if (filename === 'story.md') {
    // 작가의 말, 시리즈 표지, 목차 정보 등을 추출하여 반환합니다.
    return {
        type: 'series',
        intro: extractScenes(fileContent), // 표지와 작가의 말
        roadmap: [...] // 목차 리스트
    };
}

// 3. 권별 본문 파일(vol1.md)인 경우
// 장면(Scene) 단위로 내용을 쪼개서 반환합니다.
return {
    type: 'story',
    scenes: extractScenes(fileContent)
};
```

---

## 2. 화면 그리기 (Pages & Components)

### 🏠 A. 메인 홈페이지 (`app/page.tsx`)
사이트에 처음 들어오면 실행되는 코드입니다.

```tsx
export default async function Home() {
  // 위의 로더를 이용해 'story.md'의 표지 정보를 가져옵니다.
  const data = await getStoryData('story.md');
  const coverScene = data.intro.find(s => s.title.includes('시리즈 표지'));

  // 왼쪽: 시리즈 표지 이미지
  // 오른쪽: 작가의 말 (coverScene.text)
  // 하단: [시리즈 목차 보기] 버튼 (클릭 시 /series 로 이동)
  return ( ... );
}
```

### 📋 B. 시리즈 목차 페이지 (`app/series/page.tsx`)
버튼을 눌러 `/series`로 진입했을 때 실행됩니다.

```tsx
export default async function SeriesPage() {
  // 'story.md'의 로드맵(목차) 정보를 가져옵니다.
  const data = await getStoryData('story.md');

  // 로드맵에 있는 1권~5권 리스트를 화면에 뿌려줍니다.
  return (
      data.roadmap.map(vol => (
          // 1권인 경우 [읽기] 버튼 표시 -> 클릭 시 /vol/1 로 이동
          <Link href="/vol/1">읽기</Link>
      ))
  );
}
```

### 📖 C. 동화책 읽기 뷰어 (`app/vol/[id]/page.tsx` + `StoryViewer.tsx`)
1권을 선택하여 `/vol/1`로 들어왔을 때 실행되는 가장 중요한 부분입니다.

#### 1. 페이지 프레임 (`app/vol/[id]/page.tsx`)
```tsx
export default async function VolumePage(...) {
    // 1. URL에서 번호(1)를 확인하고 'vol1.md' 데이터를 가져옵니다.
    const data = await getStoryData('vol1.md');
    
    // 2. 뷰어 컴포넌트를 실행합니다.
    return <StoryViewer data={data} />;
}
```

#### 2. 핵심 뷰어 (`components/StoryViewer.tsx`)
실제로 사용자가 책을 읽고 넘기는 기능을 담당합니다.

```tsx
export default function StoryViewer({ data }) {
    // 현재 몇 페이지를 보고 있는지 기억합니다.
    const [currentIndex, setCurrentIndex] = useState(0);

    // [이전/다음] 버튼 기능
    const nextScene = () => setCurrentIndex(prev => prev + 1);

    // [전체 읽어주기] 기능 (TTS)
    // 1페이지(표지)에만 버튼이 보입니다.
    // 버튼을 누르면 isAutoPlay가 켜지면서 자동으로 읽고 페이지를 넘깁니다.
    
    return (
        // 좌측: 현재 페이지의 이미지 (scenes[currentIndex].imagePath)
        // 우측: 현재 페이지의 글 (scenes[currentIndex].text)
        // 하단: 페이지 넘김 화살표 버튼
    );
}
```

---

## 3. 요약 (전체 구조도)

이 하나의 **흐름(Flow)**만 기억하시면 됩니다:

1. **Loader** (`story-loader.ts`): 파일 읽어오기
   ⬇️
2. **Page** (`page.tsx`): 데이터 받아서 화면 구성하기
   ⬇️
3. **Viewer** (`StoryViewer.tsx`): 사용자와 상호작용하기 (클릭, 읽기)

이 구조 덕분에, 나중에 '2권'을 추가하고 싶으면 코드 수정 없이 **`content/vol2.md` 파일만 만들면** 자동으로 2권이 작동하게 됩니다. (이것이 스크립트를 분리해 둔 이유입니다!)
