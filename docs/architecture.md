# Architecture Overview

DevFlow는 `client`/`server` 애플리케이션과 `packages/*` 내부 라이브러리로 분리된 모노레포 구조를 사용합니다.

## Monorepo Structure

```text
DevFlow/
├─ client/                  # React + Vite 앱
├─ server/                  # Express + MongoDB API
├─ packages/
│  ├─ core/                 # 인증/토큰/헤더 유틸
│  ├─ navigation/           # 네비게이션 데이터 + 아이콘 매핑
│  ├─ motion/               # 페이지 전환/GSAP 훅
│  └─ shell/                # 공통 앱 레이아웃(AppShell)
└─ docs/                    # 기술 문서
```

## Runtime Layers

1. `client`는 라우팅/페이지 조합을 담당합니다.
2. 공통 UI shell은 `@devflow/shell`에서 제공합니다.
3. 모션 정책은 `@devflow/motion`으로 통일합니다.
4. 인증 토큰 처리/헤더 적용은 `@devflow/core`를 사용합니다.
5. 메뉴 정의는 `@devflow/navigation`에서 관리합니다.

## Library Packaging

각 라이브러리는 배포형 구조(`dist`)를 갖습니다.

- ESM 출력: `dist/*.js`
- 타입 출력: `dist/*.d.ts`
- `package.json`의 `exports`를 통해 진입점을 고정

빌드 순서(루트):

```bash
npm run build:libs
# core -> navigation -> motion -> shell
```

이 순서는 `shell`이 `motion/navigation`에 의존하기 때문에 고정되어 있습니다.

## Build and Dev Flow

- 개발: `npm run dev`
  - 내부적으로 `build:libs`를 먼저 수행한 뒤 client/server dev 서버를 실행
- 전체 빌드: `npm run build:all`
  - `build:libs` + client build + server build

## Design Principles

- 페이지 코드에서 공통 concern(auth header, layout, navigation, transition)을 분리
- 설정 기반 라우트/메뉴 구조로 확장 시 수정 지점 최소화
- 라이브러리 단위 배포 가능하도록 앱 코드와 분리

## Current Trade-offs

- 라이브러리 빌드는 현재 `client`의 TypeScript 바이너리를 사용합니다.
- `client`는 안정적 로컬 해석을 위해 `vite.config.ts`에서 라이브러리 `dist`를 alias로 연결합니다.
