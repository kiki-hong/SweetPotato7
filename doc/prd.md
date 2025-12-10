# 제품 요구사항 문서 (Product Requirement Document)

## 1. 프로젝트 개요 (Project Overview)
**프로젝트명**: 고구마 7남매의 인생 여행 (Sweet Potato 7 Siblings' Life Journey)
**형식**: 인터랙티브 웹 동화책 (Interactive Web Storybook)
**목표**: 5권으로 구성된 어린이 동화 시리즈를 웹 애플리케이션으로 구현하여 몰입감 있는 독서 경험을 제공합니다. 텍스트와 일러스트, 음성(TTS)이 결합된 멀티미디어 경험을 지향합니다.

## 2. 주요 기능 (Key Features)

### 2.1 독서 경험 (Reading Experience)
- **장면(Scene) 단위 구성**: 텍스트와 해당 삽화(일러스트)를 1:1로 매칭하여 보여줍니다.
- **페이지 넘기기**: 이전/다음 버튼 및 제스처(터치 대응 필요)를 통한 직관적인 내비게이션.
- **애니메이션**: 페이지 전환 시 부드러운 애니메이션 효과 (Framer Motion).
- **반응형 디자인**: PC, 태블릿, 모바일 등 다양한 기기에서 최적화된 레이아웃 제공.

### 2.2 오디오/접근성 (Audio & Accessibility)
- **TTS (Text-to-Speech)**: "전체 읽어주기" 및 페이지별 다시 듣기 기능.
- **한국어 음성 최적화**: 자연스러운 한국어 낭독을 위한 음성 합생 설정.

### 2.3 부가 기능 (Extras)
- **AI 프롬프트 보기**: 각 장면의 일러스트를 생성한 AI 프롬프트 확인 기능 (교육/참고용).
- **다국어 프롬프트**: 프롬프트 설명의 한국어/영어 전환.
- **내비게이션**: 언제든 표지(처음)로 돌아갈 수 있는 기능.

## 3. 기술 스택 (Tech Stack)
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (with custom design system config)
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Data**: Markdown (`.md`) based content management

## 4. 데이터 및 폴더 구조 (Data & Directory Structure)

### 4.1 콘텐츠 관리 (Content)
- `content/`: 각 권(Volume)의 텍스트와 메타데이터를 담은 Markdown 파일 저장.
  - `sweetpotato_story_vo1.md`, `vo2.md` ...

### 4.2 에셋 관리 (Assets)
- `public/images/`: 일러스트 이미지 저장.
- **구조 개선 (예정)**: 권별 폴더 하위에 페이지 번호를 파일명으로 하여 관리.
  - `public/images/vol1/004.jpg` (1권 4페이지 장면)
  - `public/images/vol2/006.jpg` (2권 6페이지 장면)

### 4.3 컴포넌트 구조 (Components)
- `components/StoryViewer.tsx`: 핵심 뷰어 컴포넌트. 상태 관리(페이지, 오디오) 및 UI 렌더링 담당.
- `lib/story-loader.ts`: Markdown 파일 파싱 및 데이터 구조화 로직.

## 5. 주요 기능 및 디자인 (Features & Design)

### 5.1 뷰어 고도화 (Viewer Enhancements)
- **텍스트 배경 이미지 (Watermark)**: 텍스트 영역에 현재 장면의 일러스트를 아주 옅게(Opacity 10%) 배경으로 적용하여 심미성 향상.
- **세부 장면 (Sub-scenes)**: `1-1`, `1-2` 형태로 장면을 세분화하여 호흡 조절 가능.

### 5.2 디자인 가이드라인
- **컨셉**: 따뜻하고 감성적인 동화책 스타일.
- **색상**: **Amber(호박색)** 계열을 주조색으로 사용.
- **폰트**: **김정철 명조 (KimJeongcheolMyoungjo)**.

## 6. 장기 로드맵 (Roadmap)

### Phase 1: 아키텍처 재구축 (Current)
- 다중 동화 지원을 위한 폴더 구조 개편 (`sweetpotato`, `potato` 분리).
- 시리즈 공통 정보(`series.md`)와 본문(`volN.md`) 분리.
- 뷰어 UI/UX 개선 (배경 이미지, 세부 장면 로직).

### Phase 2: 데이터 표준화
- 개발자 없이 텍스트/이미지만 있으면 동화가 생성되도록 데이터 포맷(JSON/MD) 표준화.

### Phase 3: 작가 스튜디오 (Creator Studio)
- **웹 기반 제작 도구**: 사용자가 이미지 업로드 및 텍스트 입력을 통해 직접 동화를 만들고 공유하는 플랫폼 기능.
- "PDF 업로드" 대신 "직접 저작" 방식으로 접근하여 기술적 난이도 해결 및 참여 유도.
