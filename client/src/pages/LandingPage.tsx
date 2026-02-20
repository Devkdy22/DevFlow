import { motion } from "motion/react";
import { useRef } from "react";
import {
  Code2,
  Zap,
  ArrowRight,
  CheckCircle2,
  Shield,
  Terminal,
  GitBranch,
  Layers,
  Users,
  Clock,
  TrendingUp,
} from "lucide-react";
import { AnimatedBackground } from "./../components/AnimatedBackground";
import { CodeRain } from "./../components/CodeRain";
import { Button } from "../components/ui/button";
import { useGsapFloat } from "@devflow/motion";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const heroLogoRef = useRef<HTMLDivElement>(null);
  useGsapFloat(heroLogoRef, { amplitude: 10, duration: 3.2, autoLoadScript: true });

  return (
    <div className="min-h-screen  w-full  relative overflow-hidden bg-[#0a0b14]">
      {/* Grid Pattern Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
               linear-gradient(to right, rgba(79, 70, 229, 0.03) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(79, 70, 229, 0.03) 1px, transparent 1px)
             `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Dot Pattern Overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(79, 70, 229, 0.15) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800/95 to-slate-900" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-[#4F46E5]/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-[#10B981]/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      {/* Particle Network */}
      <AnimatedBackground />

      {/* Code Rain Effect */}
      <CodeRain />

      {/* Floating Code Blocks */}
      <div className="absolute top-20 left-10 opacity-5 pointer-events-none hidden lg:block">
        <Terminal className="h-32 w-32 text-[#4F46E5]" />
      </div>
      <div className="absolute bottom-32 right-20 opacity-5 pointer-events-none hidden lg:block">
        <GitBranch className="h-40 w-40 text-[#10B981]" />
      </div>
      <div className="absolute top-1/3 right-32 opacity-5 pointer-events-none hidden lg:block">
        <Layers className="h-28 w-28 text-[#6366F1]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-8"
            >
              <div className="relative group" ref={heroLogoRef}>
                <div className="absolute inset-0 bg-gradient-to-r from-[#4F46E5] to-[#10B981] rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-gradient-to-br from-[#4F46E5] to-[#4338CA] p-6 rounded-3xl shadow-2xl">
                  <Code2 className="h-16 w-16 text-white" />
                </div>
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-white mb-6"
            >
              <span className="text-5xl font-bold bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#10B981] bg-clip-text text-transparent">
                DevFlow
              </span>
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-white mb-6 max-w-3xl mx-auto"
            >
              개발자를 위한 차세대 프로젝트 관리 플랫폼
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              일정 관리부터 태스크 추적, 프로젝트 회고까지. 개발 워크플로우를
              위한 선택
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                onClick={onGetStarted}
                size="xl"
                className="group relative px-8 py-6 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  시작하기
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto"
            >
              {[
                { icon: Users, value: "10K+", label: "활성 개발자" },
                { icon: TrendingUp, value: "50K+", label: "완료된 프로젝트" },
                { icon: Clock, value: "99.9%", label: "시스템 업타임" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#4F46E5]/20 to-[#10B981]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                    <stat.icon className="h-8 w-8 text-[#4F46E5] mx-auto mb-3" />
                    <div className="bg-gradient-to-r from-[#4F46E5] to-[#10B981] bg-clip-text text-transparent mb-2">
                      {stat.value}
                    </div>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-white mb-4">
                강력한 기능으로{" "}
                <span className="bg-gradient-to-r from-[#4F46E5] to-[#10B981] bg-clip-text text-transparent">
                  생산성 극대화
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                개발자가 필요로 하는 모든 기능을 하나의 플랫폼에서
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: "프로젝트 타임라인",
                  description:
                    "직관적인 타임라인으로 프로젝트 진행 상황을 한눈에 파악하고 관리하세요",
                  gradient: "from-[#4F46E5] to-[#7C3AED]",
                },
                {
                  icon: CheckCircle2,
                  title: "태스크 보드",
                  description:
                    "Kanban 방식의 태스크 보드로 업무를 체계적으로 정리하고 추적하세요",
                  gradient: "from-[#10B981] to-[#059669]",
                },
                {
                  icon: Shield,
                  title: "일정 관리",
                  description:
                    "개발 일정과 마일스톤을 시각적으로 관리하고 팀과 공유하세요",
                  gradient: "from-[#6366F1] to-[#4F46E5]",
                },
                {
                  icon: Terminal,
                  title: "프로젝트 회고",
                  description:
                    "프로젝트 완료 후 체계적인 회고를 통해 지속적으로 개선하세요",
                  gradient: "from-[#EC4899] to-[#F43F5E]",
                },
                {
                  icon: GitBranch,
                  title: "Git 통합",
                  description:
                    "GitHub, GitLab 등과 연동하여 코드 변경사항을 자동으로 추적하세요",
                  gradient: "from-[#F59E0B] to-[#EF4444]",
                },
                {
                  icon: Layers,
                  title: "팀 협업",
                  description:
                    "실시간 협업 기능으로 팀원들과 효율적으로 소통하고 작업하세요",
                  gradient: "from-[#06B6D4] to-[#3B82F6]",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#4F46E5]/20 to-[#10B981]/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 h-full">
                    <div
                      className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg mb-6`}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="py-12 px-4 border-t border-white/10">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-gray-400">
              © 2025 DevFlow. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
