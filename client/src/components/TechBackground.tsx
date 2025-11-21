import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function TechBackground() {
  const [particles, setParticles] = useState<
    Array<{ x: number; y: number; delay: number }>
  >([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30 dark:opacity-20">
      {/* Hexagonal Grid */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="hexagons"
            width="50"
            height="43.4"
            patternUnits="userSpaceOnUse"
            patternTransform="scale(2)"
          >
            <polygon
              points="24.8,22 37.3,29.2 37.3,43.7 24.8,50.9 12.3,43.7 12.3,29.2"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-blue-500/20 dark:text-blue-400/10"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexagons)" />
      </svg>

      {/* Floating Code Snippets */}
      <div className="absolute inset-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.4, y: 0 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-20 left-10 text-xs font-mono text-indigo-500/30 dark:text-indigo-400/20"
        >
          const workflow = &#123;
          <br />
          &nbsp;&nbsp;tasks: [],
          <br />
          &nbsp;&nbsp;status: 'active'
          <br />
          &#125;
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 0.4, y: 0 }}
          transition={{
            duration: 2.5,
            delay: 1,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute top-40 right-20 text-xs font-mono text-emerald-500/30 dark:text-emerald-400/20"
        >
          function deploy() &#123;
          <br />
          &nbsp;&nbsp;return success;
          <br />
          &#125;
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{
            duration: 3,
            delay: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute bottom-32 left-1/4 text-xs font-mono text-purple-500/30 dark:text-purple-400/20"
        >
          &#60;Component /&#62;
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 0.3, x: 0 }}
          transition={{
            duration: 2.2,
            delay: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute bottom-20 right-1/3 text-xs font-mono text-pink-500/30 dark:text-pink-400/20"
        >
          npm run build
        </motion.div>
      </div>

      {/* Animated Particles */}
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-500/20 dark:bg-blue-400/10 rounded-full"
          style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: particle.delay,
          }}
        />
      ))}

      {/* Circuit Lines */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d="M 0,100 Q 250,100 250,250 T 500,400"
          fill="none"
          stroke="url(#gradient1)"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        <motion.path
          d="M 800,50 Q 600,150 400,200 T 100,400"
          fill="none"
          stroke="url(#gradient2)"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 4,
            delay: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0" />
            <stop offset="50%" stopColor="#4F46E5" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0" />
            <stop offset="50%" stopColor="#10B981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Glowing Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/3 w-64 h-64 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 6,
          delay: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Animated Dots Grid */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2"
            style={{
              left: `${5 + (i % 5) * 20}%`,
              top: `${10 + Math.floor(i / 5) * 20}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 2,
              delay: i * 0.1,
              repeat: Infinity,
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-400/10 dark:to-purple-400/10" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
