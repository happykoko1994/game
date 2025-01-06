import React, { useEffect, useState } from 'react';

const DayNightCycle = ({ children }) => {
  const [bgGradient, setBgGradient] = useState('');
  const [opacity, setOpacity] = useState(1);
  const [sunPosition, setSunPosition] = useState(0);

  const dayGradients = [
    { start: ['#FFB199', '#FF0844'], end: ['#FFD1B9', '#FF8C42'] }, // Рассвет
    { start: ['#FFD1B9', '#FF8C42'], end: ['#87CEEB', '#4682B4'] }, // Утро
    { start: ['#87CEEB', '#4682B4'], end: ['#FFD700', '#87CEFA'] }, // День
    { start: ['#FFD700', '#87CEFA'], end: ['#FF7E5F', '#FD297B'] }, // Закат
    { start: ['#FF7E5F', '#FD297B'], end: ['#2C3E50', '#34495E'] }, // Сумерки (темнее, меньше фиолетового)
    { start: ['#2C3E50', '#34495E'], end: ['#1C1C3C', '#000428'] }, // Ночь (темная)
  ];

  const duration = 180000; // Продолжительность полного цикла дня и ночи (4 минуты)
  const stageDuration = duration / dayGradients.length; // Продолжительность одного этапа

  const interpolateColor = (startColor, endColor, progress) => {
    const r1 = parseInt(startColor.substring(1, 3), 16);
    const g1 = parseInt(startColor.substring(3, 5), 16);
    const b1 = parseInt(startColor.substring(5, 7), 16);

    const r2 = parseInt(endColor.substring(1, 3), 16);
    const g2 = parseInt(endColor.substring(3, 5), 16);
    const b2 = parseInt(endColor.substring(5, 7), 16);

    const r = Math.round(r1 + (r2 - r1) * progress);
    const g = Math.round(g1 + (g2 - g1) * progress);
    const b = Math.round(b1 + (b2 - b1) * progress);

    return `rgb(${r}, ${g}, ${b})`;
  };

  useEffect(() => {
    let startTime = performance.now();
    let currentStage = 2; // Начинаем с "День" (индекс 2)
    let transitionProgress = 0; // Прогресс перехода между фазами

    const animateBackground = () => {
      const now = performance.now();
      const elapsed = (now - startTime) % duration;
      const progressInStage = (elapsed % stageDuration) / stageDuration;

      // Интерполяция для плавного перехода
      transitionProgress += (progressInStage - transitionProgress) * 0.1; // Более плавная интерполяция

      // Получаем текущую фазу
      const { start, end } = dayGradients[currentStage];

      let topColor = interpolateColor(start[0], end[0], transitionProgress);
      let bottomColor = interpolateColor(start[1], end[1], transitionProgress);

      // Плавный переход от ночи к рассвету
      if (currentStage === dayGradients.length - 1) {
        topColor = interpolateColor('#2C3E50', '#FFB199', transitionProgress); // Ночь в рассвет
        bottomColor = interpolateColor('#34495E', '#FF0844', transitionProgress); // Ночь в рассвет
      }

      // Двигаем солнце в светлое время суток
      if (currentStage === 2 || currentStage === 3) {
        const sunProgress = (elapsed % stageDuration) / stageDuration; // Прогресс от 0 до 1
        setSunPosition(sunProgress * 100); // Двигаем солнце от 0% до 100%
      }

      // Плавно меняем фоновый градиент с движением солнца
      setBgGradient(`linear-gradient(to bottom, ${topColor}, ${bottomColor}), 
                     linear-gradient(to right, ${start[0]} ${sunPosition}%, ${end[0]} ${sunPosition}%)`);

      // Плавное изменение прозрачности
      setOpacity(progressInStage < 0.5 ? 1 : 0.8);

      // Переход к следующей фазе
      if (elapsed >= stageDuration) {
        currentStage = (currentStage + 1) % dayGradients.length;
        startTime = now;

        // Добавляем задержку перед тем, как начать следующий этап
        transitionProgress = 0; // сбрасываем прогресс, чтобы избежать перехода цветов
      }

      requestAnimationFrame(animateBackground);
    };

    animateBackground();

    return () => cancelAnimationFrame(animateBackground);
  }, []);

  return (
    <div
      style={{
        position: 'relative',  // Обеспечиваем правильное позиционирование фона
        minHeight: '100vh',
        background: bgGradient,
        opacity: opacity,
        transition: 'background 1s ease-out, opacity 1s ease-out',
      }}
    >
      {/* Здесь выводятся все дочерние компоненты поверх фона */}
      <div
        style={{
          position: 'relative',
          zIndex: 1, // Ставим содержимое поверх фона
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default DayNightCycle;
