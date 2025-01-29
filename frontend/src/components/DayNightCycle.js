import React, { useEffect, useState } from "react";

const DayNightCycle = ({ children }) => {
  const [bgGradient, setBgGradient] = useState("");
  const [sunPosition, setSunPosition] = useState(0);

  const dayGradients = [
    { start: ["#FFB199", "#FF0844"], end: ["#FFD1B9", "#FF8C42"] }, // Рассвет
    { start: ["#FFD1B9", "#FF8C42"], end: ["#87CEEB", "#4682B4"] }, // Утро
    { start: ["#87CEEB", "#4682B4"], end: ["#FFD700", "#87CEFA"] }, // День
    { start: ["#FFD700", "#87CEFA"], end: ["#FF7E5F", "#FD297B"] }, // Закат
    { start: ["#FF7E5F", "#FD297B"], end: ["#2C3E50", "#34495E"] }, // Сумерки
    { start: ["#2C3E50", "#34495E"], end: ["#1C1C3C", "#000428"] }, // Ночь
  ];

  const duration = 180000; // 3 минуты полный цикл
  const stageDuration = duration / dayGradients.length;

  const interpolateColor = (startColor, endColor, progress) => {
    const [r1, g1, b1] = startColor.match(/\w\w/g).map((c) => parseInt(c, 16));
    const [r2, g2, b2] = endColor.match(/\w\w/g).map((c) => parseInt(c, 16));

    const r = Math.round(r1 + (r2 - r1) * progress);
    const g = Math.round(g1 + (g2 - g1) * progress);
    const b = Math.round(b1 + (b2 - b1) * progress);

    return `rgb(${r}, ${g}, ${b})`;
  };

  useEffect(() => {
    let startTime = performance.now();
    let currentStage = 2;
    let transitionProgress = 0;

    const animateBackground = () => {
      const now = performance.now();
      const elapsed = (now - startTime) % duration;
      const progressInStage = (elapsed % stageDuration) / stageDuration;

      transitionProgress += (progressInStage - transitionProgress) * 0.1;

      const { start, end } = dayGradients[currentStage];

      let topColor = interpolateColor(start[0], end[0], transitionProgress);
      let bottomColor = interpolateColor(start[1], end[1], transitionProgress);

      if (currentStage === dayGradients.length - 1) {
        topColor = interpolateColor("#2C3E50", "#FFB199", transitionProgress);
        bottomColor = interpolateColor("#34495E", "#FF0844", transitionProgress);
      }

      if (currentStage === 2 || currentStage === 3) {
        const sunProgress = (elapsed % stageDuration) / stageDuration;
        setSunPosition(sunProgress * 100);
      }

      setBgGradient(`linear-gradient(to bottom, ${topColor}, ${bottomColor})`);

      if (elapsed >= stageDuration) {
        currentStage = (currentStage + 1) % dayGradients.length;
        startTime = now;
        transitionProgress = 0;
      }

      requestAnimationFrame(animateBackground);
    };

    animateBackground();

    return () => cancelAnimationFrame(animateBackground);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        background: bgGradient,
        transition: "background 1s ease-out",
      }}
    >
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
};

export default DayNightCycle;
