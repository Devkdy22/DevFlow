# Animation Strategy

DevFlow는 인터랙션 성격에 따라 `framer-motion`과 GSAP(옵션 로드)을 분리해 사용합니다.

## Principles

- 상태 기반 UI 전환은 `framer-motion`
- 반복/강조 효과는 GSAP 훅(`useGsapFloat`)
- 페이지마다 제각각 애니메이션을 직접 작성하지 않고, 라이브러리 컴포넌트/훅으로 재사용

## Where Each Tool Is Used

## `framer-motion`

적용 대상:
- 페이지 전환: `PageTransition`
- 모바일 메뉴 열림/닫힘: `AppShell`의 `AnimatePresence`

선택 이유:
- React 상태 변화와 선언적으로 결합하기 좋음
- 초기/애니메이트/종료 상태를 컴포넌트 단위로 표현 가능

## GSAP (`useGsapFloat`)

적용 대상:
- 브랜드 로고, 히어로 로고 같은 강조 요소의 주기적 부유 애니메이션

선택 이유:
- 단순 반복 tween 제어가 명확함
- DOM 대상 애니메이션 제어가 직관적

## Network-Constrained Fallback

현재 환경은 패키지 설치가 제한될 수 있어, `useGsapFloat`는 다음 전략을 사용합니다.

- `window.gsap`이 이미 존재하면 즉시 사용
- 없으면 CDN 스크립트를 동적으로 로드 시도
- 로드 실패 시 안전하게 no-op 처리

## Usage Rules

1. 라우트 전환은 반드시 `PageTransition`으로 통일
2. shell 내부 등장/퇴장은 `AnimatePresence` 패턴 사용
3. 장식용 반복 모션은 `useGsapFloat` 재사용
4. 과도한 동시 애니메이션을 피하고, 핵심 요소 중심으로 제한

## Future Improvements

- 사용자 선호(`prefers-reduced-motion`) 반영
- 모션 토큰(duration/easing) 중앙 설정
- 스크롤 기반 섹션 애니메이션(필요 시 GSAP ScrollTrigger) 도입
