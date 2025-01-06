import React, { useEffect, useState } from "react";
import { socket } from "./socket";
import GameRoom from "./components/GameRoom";
import WelcomeScreen from "./components/WelcomeScreen";
import DayNightCycle from "./components/DayNightCycle";

export default function App() {
  const [name, setName] = useState(localStorage.getItem("playerName"));

  useEffect(() => {
    if (name) {
      socket.emit("join", name);
    }
  }, [name]);

  return (
    <DayNightCycle>
      {name ? (
        <GameRoom />
      ) : (
        <WelcomeScreen
          setName={(newName) => {
            localStorage.setItem("playerName", newName);
            setName(newName);
          }}
        />
      )}
    </DayNightCycle>
  );
}
