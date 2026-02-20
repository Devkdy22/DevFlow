# Testing Strategy

DevFlow는 앱 통합 테스트와 라이브러리 단위 테스트를 분리합니다.

## Test Layers

## 1) Backend API/Integration Tests

위치:
- `server/src/__tests__/*.test.ts`

특징:
- 기존 Jest 설정(`server/jest.config.ts`) 사용
- 환경 로드/DB setup 훅 포함
- API 행위 검증 중심

실행:

```bash
cd server
npm test
```

## 2) Workspace Library Unit Tests

위치:
- `server/src/__tests__/workspaceLibraries.test.ts`

설정:
- `server/jest.libs.config.ts`
- DB setup 훅 없이 순수 유틸/데이터 검증

검증 범위:
- `@devflow/core` 인증 토큰 및 헤더 유틸
- `@devflow/navigation` 기본 라우트 정의

실행:

```bash
# root
npm run test:libs

# or
cd server
npm run test:libs
```

## Why Split Configs?

- 라이브러리 테스트는 DB 의존이 불필요
- API 테스트의 느린 setup이 라이브러리 테스트에 영향을 주지 않음
- CI에서 빠른 smoke 테스트와 통합 테스트를 분리 가능

## Recommended CI Order

1. `npm run build:libs`
2. `npm run test:libs`
3. `cd client && npm run build`
4. `cd server && npm test`

## Additional Tests to Add

- `@devflow/motion`: `PageTransition` 렌더/키 변경 테스트
- `@devflow/shell`: 네비 active 상태, 로그아웃 콜백, 모바일 메뉴 토글 테스트
- `client`: 라우트 가드(`ProtectedRoute`, `AuthRoute`) 동작 테스트

## Practical Guidelines

- 순수 함수는 라이브러리 단위 테스트 우선
- UI 상호작용은 컴포넌트 테스트로 검증
- E2E가 필요해지면 인증/핵심 플로우부터 최소 시나리오로 시작
