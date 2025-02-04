import React, { useEffect, useState } from "react";
import { socket } from "./socket";
import "./App.css";
import GameRoom from "./components/GameRoom";
import WelcomeScreen from "./components/WelcomeScreen";
import DayNightCycle from "./components/DayNightCycle";

export default function App() {
  const [name, setName] = useState(localStorage.getItem("playerName"));
  const [score] = useState(
    JSON.parse(localStorage.getItem("playerScore")) || 0
  );
  const [answered] = useState(
    JSON.parse(localStorage.getItem("playerAnswered")) || false
  );

  useEffect(() => {
    if (name) {
      socket.emit("join", name, score, answered);
    }
  }, [name]);

  return (
    <div>
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
      <div
        className="tenor-gif-embed"
        data-postid="24485314"
        data-share-method="host"
        data-aspect-ratio="1.77778"
        data-width="100%"
      ></div>{" "}
      <script
        type="text/javascript"
        async
        src="https://tenor.com/embed.js"
      ></script>
    </div>
  );
}
