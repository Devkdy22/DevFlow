# 📝 **DevFlow**

<p align="center"> Full-stack developer workflow tracker built with React, TypeScript, Express, and MongoDB.</p>
<br>

### **<p align="center"> “Track. Build. Reflect.” — 개발자의 여정을 기록하다.</p>**

<p align="center"> <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=000" /> <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=fff" /> <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=fff" /> <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=fff" /> <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=fff" /> <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=fff" /> <img src="https://img.shields.io/badge/AWS-FF9900?style=for-the-badge&logo=amazonaws&logoColor=fff" /> </p>
<br>

> 개발자가 **프로젝트를 기록하고 성장 과정을 추적**할 수 있는 풀스택 사이드 프로젝트입니다.
>
> 본 프로젝트는 **React + TypeScript (프론트엔드)** 와 **Express + TypeScript + MongoDB (백엔드)** 로 구성되어 있으며, 추후 **AWS**, **Docker**, **CI/CD** 를 통해 배포 환경까지 확장할 계획입니다.

---

## 📁 프로젝트 구조

```bash
DevFlow/
├── client/                  # 프론트엔드 앱 (React + Vite)
├── server/                  # 백엔드 API (Express + MongoDB)
├── packages/                # 내부 라이브러리(workspaces)
│   ├── core/               # auth/token/header 유틸
│   ├── navigation/         # 네비게이션 데이터/아이콘 매핑
│   ├── motion/             # 전환/애니메이션 유틸
│   └── shell/              # 공통 AppShell 레이아웃
├── docs/                    # 아키텍처/전략 문서
└── README.md
```

---

## ⚙️ 개발 환경 설정

### 1️⃣ 저장소 클론

```bash
git clone https://github.com/your-username/DevFlow.git
cd DevFlow
```

### 2️⃣ 의존성 설치

```bash
npm install
```

### 3️⃣ 개발 서버 실행 (워크스페이스 빌드 포함)

```bash
npm run dev
```

### 4️⃣ 개별 실행 (선택)

```bash
cd server
npm run dev
```

서버가 성공적으로 실행되면:

```
Server running on port 5000
MongoDB Connected ✅
```

이 출력됩니다.

```bash
cd ../client
npm run dev
```

> 브라우저에서 [http://localhost:5173](http://localhost:5173) 으로 접속하여 확인할 수 있습니다.

### 5️⃣ 빌드/테스트 명령

```bash
# 내부 라이브러리 빌드
npm run build:libs

# 전체 빌드 (libs + client + server)
npm run build:all

# 라이브러리 단위 테스트
npm run test:libs
```

---

## 📚 문서

- [Architecture Overview](./docs/architecture.md)
- [Frontend Libraries](./docs/frontend-libraries.md)
- [Animation Strategy](./docs/animation.md)
- [Testing Strategy](./docs/testing.md)
- [Free Deployment Guide](./docs/deploy-free.md)

---

## 🧠 아키텍처 요약

- 모노레포(workspaces) 기반으로 앱과 라이브러리를 분리
- `client`는 `@devflow/*` 라이브러리를 소비
- 공통 관심사(auth/navigation/motion/shell)를 페이지 코드에서 분리
- 애니메이션은 `framer-motion` + GSAP fallback 전략으로 통일

자세한 설계/규칙은 위 `docs/*` 문서를 기준으로 유지합니다.

---

## 🛠️ 주요 기술 스택

| 구분                  | 기술                         | 설명                                     |
| --------------------- | ---------------------------- | ---------------------------------------- |
| **Frontend**          | React, TypeScript, Vite      | 빠른 개발 환경과 타입 안정성을 위한 선택 |
| **Backend**           | Node.js, Express, TypeScript | 간결하고 확장성 높은 서버 구현           |
| **Database**          | MongoDB + Mongoose           | 스키마 기반 NoSQL 데이터 관리            |
| **Dev Tools**         | ESLint, Prettier             | 코드 품질 관리                           |
| **Deployment (계획)** | AWS, Docker                  | 클라우드 및 컨테이너 기반 배포           |

---

## 💾 환경 변수 (.env)

`server/.env` 파일을 생성하고 아래 내용을 추가하세요:

```env
PORT=5000
MONGO_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/devflow
```

> 실제 배포 시에는 `.env` 파일을 절대 커밋하지 않습니다.

---

## 🧱 Git Ignore 설정

`.gitignore` 파일 예시:

```bash
# Node
node_modules/

# Build outputs
dist/
build/

# Environment
.env
.env.local

# IDE
.vscode/
.DS_Store
```

---

## 🌐 GitHub 레포지토리 설명

> **DevFlow — 개발자의 프로젝트 여정을 기록하고 공유하는 공간**
>
> 이 프로젝트는 **React + TypeScript + Express + MongoDB** 기반의 풀스택 구조로, 개발자가 프로젝트를 등록하고, 진행 상황을 기록하며, 회고를 작성할 수 있는 기능을 목표로 합니다.
>
> 추후 Docker, AWS 배포 및 CI/CD 파이프라인을 추가하여 **실제 서비스 운영 수준의 구조**를 구현할 예정입니다.

---

## 🧭 향후 계획

- [ ] 인증 시스템 (JWT + bcrypt)
- [ ] 프로젝트 등록 / 수정 / 삭제 API
- [ ] 프론트엔드 UI (프로젝트 목록, 회고 작성 페이지)
- [ ] Docker & AWS 배포 자동화

---

## 👨‍💻 개발자

### **김도연 (Kim Doyeon)**

- Frontend 중심 개발자 지망
- React, TypeScript, Express, MongoDB 학습 및 프로젝트 구축 중

📫 GitHub: [https://github.com/Devkdy22](https://github.com/Devkdy22)

---

> 💡 **DevFlow**는 “개발자의 흐름을 기록하다”라는 의미로, 개인의 성장과정을 한눈에 볼 수 있도록 돕는 개발자 중심 프로젝트입니다.
> This project focuses not only on feature implementation, but also on building a scalable and maintainable frontend architecture.
