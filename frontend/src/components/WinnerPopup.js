import React from "react";
import styles from "../style/WinnerPopup.module.css";

export default function WinnerPopup({ winner, onClose }) {
    if (!winner) return null;

    const winnerPhrases = [
        "Ты победил! Как настоящий герой из WoW, сражавшийся за эльфийское пиво! 🍺",
        "Поздравляем! Ты стал мастером пивных боёв! Настоящий воин пива! 🍻",
        "Как истинный воин, ты завоевал победу и право на стакан холодного пива! 🍺⚔️",
        "В твоих венах течет пиво, как в героях WoW! Ты победил! 🏆🍻",
        "Как могучий воин аниме, ты пробил путь к победе и заслуженно получаешь пиво! 🍺💥",
        "Ты победил, как главный герой аниме, всегда на пике силы, с бокалом пива в руке! 🍻🎌",
        "Ты словно великий воин WoW, победивший в эпической битве и заслуживший своё пиво! 🍺⚔️",
        "Поздравляем, ты стал победителем, и теперь твое пиво – это твой самый ценный трофей! 🏅🍻",
        "Как настоящий аниме-герой, ты победил, и теперь твоя награда – это волшебное пиво! 🍺✨",
        "Ты победил, как истинный чемпион! Пора насладиться заслуженной порцией пива, как в лучших аниме! 🍻🔥",
    ];

    const randomPhrase =
        winnerPhrases[Math.floor(Math.random() * winnerPhrases.length)];

    return (
        <div className={styles.popupOverlay}>
            <div className={styles.popupContent}>
                <h2>{randomPhrase}</h2>
                <p>Выпьем за {winner}, друзья!</p>
                <button onClick={onClose} className={styles.closeButton}>
                    Закрыть
                </button>
            </div>
        </div>
    );
}
