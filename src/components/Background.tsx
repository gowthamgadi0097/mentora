"use client";

import { useTheme } from "./ThemeProvider";

function Waves() {
  const path =
    "M0,160 C180,220 360,100 540,160 C720,220 900,100 1080,160 C1260,220 1440,100 1440,160 L1440,320 L0,320 Z";
  return (
    <>
      {[0.35, 0.28, 0.2].map((o, i) => (
        <svg
          key={i}
          className="wave"
          viewBox="0 0 2880 320"
          preserveAspectRatio="none"
          style={{ fill: `rgb(var(${i === 1 ? "--accent" : "--primary"}) / ${o})` }}
        >
          <path d={path} />
          <path d={path} transform="translate(1440,0)" />
        </svg>
      ))}
    </>
  );
}

export default function Background() {
  const { bg } = useTheme();
  return (
    <div aria-hidden className={`bg-layer bg-${bg}`}>
      {bg === "waves" && <Waves />}
    </div>
  );
}
