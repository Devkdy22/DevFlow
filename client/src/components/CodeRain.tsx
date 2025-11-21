import { useEffect, useState } from "react";

const codeSnippets = [
  "const app = () => {}",
  "function init() {}",
  'import React from "react"',
  "export default App",
  "npm install",
  'git commit -m "update"',
  "async/await",
  "<Component />",
  "useState()",
  "useEffect()",
  "return (",
  "interface Props",
  "type User = {}",
  "class App {}",
  "// TODO: refactor",
  "console.log()",
  "Promise.all()",
  "map()",
  "filter()",
  "reduce()",
];

interface CodeLine {
  id: number;
  text: string;
  left: number;
  duration: number;
  delay: number;
}

export function CodeRain() {
  const [lines, setLines] = useState<CodeLine[]>([]);

  useEffect(() => {
    const generateLines = () => {
      const newLines: CodeLine[] = [];
      for (let i = 0; i < 15; i++) {
        newLines.push({
          id: Math.random(),
          text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
          left: Math.random() * 100,
          duration: 15 + Math.random() * 10,
          delay: Math.random() * 5,
        });
      }
      setLines(newLines);
    };

    generateLines();
  }, []);

  return (
    <>
      <style>
        {`
          @keyframes fall {
            0% {
              transform: translateY(-50px);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateY(100vh);
              opacity: 0;
            }
          }
        `}
      </style>
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.07]">
        {lines.map(line => (
          <div
            key={line.id}
            className="absolute text-[#4F46E5] whitespace-nowrap font-mono text-sm"
            style={{
              left: `${line.left}%`,
              animation: `fall ${line.duration}s linear ${line.delay}s infinite`,
              top: "-50px",
            }}
          >
            {line.text}
          </div>
        ))}
      </div>
    </>
  );
}
