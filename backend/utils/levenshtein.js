// Функция для вычисления расстояния Левенштейна
function levenshtein(a, b) {
    const tmp = [];
  
    for (let i = 0; i <= b.length; i++) {
      tmp[i] = [i];
    }
  
    for (let i = 0; i <= a.length; i++) {
      tmp[0][i] = i;
    }
  
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        tmp[i][j] = Math.min(
          tmp[i - 1][j] + 1,
          tmp[i][j - 1] + 1,
          tmp[i - 1][j - 1] + (a[j - 1] === b[i - 1] ? 0 : 1)
        );
      }
    }
  
    return tmp[b.length][a.length];
  }
  
  // Функция для удаления несущественных слов (предлогов и частиц)
  function removeStopWords(str) {
    const stopWords = ["на", "за", "в", "с", "по", "и", "а", "для", "от"]; // Можно добавить другие часто встречающиеся слова
    return str
      .toLowerCase()
      .split(" ")
      .filter((word) => !stopWords.includes(word))
      .join(" ");
  }
  
  // Функция для проверки схожести
  function isSimilar(a, b, threshold = 0.7) {
    // Убираем несущественные слова из строк
    const cleanedA = removeStopWords(a);
    const cleanedB = removeStopWords(b);
  
    const maxLen = Math.max(cleanedA.length, cleanedB.length);
    const distance = levenshtein(cleanedA, cleanedB);
    const similarity = 1 - distance / maxLen; // Нормируем значение схожести
  
    return similarity >= threshold; // Сравниваем с порогом
  }
  
  module.exports = isSimilar;
  