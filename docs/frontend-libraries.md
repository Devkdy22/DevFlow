# Frontend Libraries

DevFlow 프론트엔드는 앱 코드(`client`)와 내부 라이브러리(`packages/*`)를 분리해 재사용성과 변경 안정성을 확보합니다.

## Internal Libraries

## `@devflow/core`

역할:
- 인증 토큰 키(`AUTH_TOKEN_KEY`) 관리
- 토큰 저장/조회/삭제 유틸
- Axios Authorization 헤더 적용 유틸

주요 API:
- `readAuthToken`
- `persistAuthToken`
- `clearAuthToken`
- `applyAuthHeader`

## `@devflow/navigation`

역할:
- 앱 네비게이션 단일 소스 제공
- 경로/레이블의 베이스 데이터와 아이콘 결합 데이터를 분리

주요 export:
- `APP_NAVIGATION_BASE` (`./base`)
- `APP_NAVIGATION`

## `@devflow/motion`

역할:
- 페이지 전환 컴포넌트 제공
- GSAP 기반 부유(floating) 애니메이션 훅 제공

주요 export:
- `PageTransition`
- `useGsapFloat`

## `@devflow/shell`

역할:
- 상단 네비/모바일 메뉴/브랜드/로그아웃을 포함한 공통 앱 레이아웃
- `rightSlot`을 통한 우측 액션(예: ThemeToggle) 주입

주요 컴포넌트:
- `AppShell`

## Dependency Direction

의존 방향은 아래처럼 단방향으로 유지합니다.

```text
client -> shell -> (motion, navigation)
client -> core
client -> motion
client -> navigation
```

## Package Output Contract

모든 라이브러리는 다음 계약을 따릅니다.

- `main`: `./dist/index.js`
- `types`: `./dist/index.d.ts`
- `exports`: ESM import + type entry 제공
- `files`: `dist`만 publish 대상

## Add a New Library

1. `packages/<name>/src` 생성
2. `package.json`에 `main/types/exports/build` 정의
3. `tsconfig.json`을 `tsconfig.packages.base.json`에서 확장
4. 루트 `build:libs` 순서에 추가
5. `client`에서 필요 시 `tsconfig.app.json`/`vite.config.ts` alias 추가
