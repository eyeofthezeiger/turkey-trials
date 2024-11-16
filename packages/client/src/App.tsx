import React, { useState, useEffect } from "react";
import TVFrame from "./components/TVFrame";
import "./app.css";
import HostScreen from "./host/HostScreen";
import FinalRound from "./screens/FinalRound";
import Round1 from "./screens/Round1";
import Round2 from "./screens/Round2";
import Round3 from "./screens/Round3";
import StartPage from "./screens/StartPage";
import backgroundMusic from "./assets/thanksgiving-cheerful-holiday-pop-179004.mp3";
import { ClientProvider } from "./utils/client";

const App: React.FC = () => {
  const [round, setRound] = useState(0);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [leafPile, setLeafPile] = useState<string[]>([]);

  useEffect(() => {
    const bgMusic = new Audio(backgroundMusic);
    bgMusic.loop = true;
    bgMusic.volume = 0.5;
    setAudio(bgMusic);

    return () => {
      bgMusic.pause();
      bgMusic.currentTime = 0;
    };
  }, []);

  const startMusic = () => {
    if (audio && audio.paused) {
      audio.play().catch((error) => console.error("Error playing background music:", error));
    }
  };

  const toggleMute = () => {
    if (audio) {
      audio.muted = !audio.muted;
      setIsMuted(!isMuted);
    }
  };

  // Simulate leaves falling and piling up
  useEffect(() => {
    const interval = setInterval(() => {
      setLeafPile((prevPile) => [
        ...prevPile,
        `leaf-${Math.floor(Math.random() * 5) + 1}`, // Random leaf type
      ]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const advanceRound = () => setRound((prevRound) => prevRound + 1);

  return (
    <ClientProvider>
      <div className="fall-background">
        {/* Background Trees and Falling Leaves */}
        <div className="trees">
          <div className="tree"></div>
          <div className="tree"></div>
          <div className="tree"></div>
        </div>
        <div className="falling-leaves">
          {leafPile.map((leaf, index) => (
            <div
              key={index}
              className={`leaf ${leaf}`}
              style={{
                left: `${Math.random() * 100}%`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            ></div>
          ))}
        </div>
        <div className="leaf-pile">
          {leafPile.map((leaf, index) => (
            <div key={index} className={`leaf-pile-item ${leaf}`}></div>
          ))}
        </div>
        <TVFrame>
          {/* Static Content */}
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              width: "100%",
              color: "#00e0ff",
              textAlign: "center",
              zIndex: 10,
            }}
            onClick={startMusic}
          >
            {/* Mute/Unmute Button */}
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 15,
              }}
            >
              <button
                style={{
                  backgroundColor: "#ff007a",
                  color: "#fff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  boxShadow: "0 0 10px #ff007a",
                }}
                onClick={toggleMute}
              >
                {isMuted ? "Unmute Music" : "Mute Music"}
              </button>
            </div>

            {/* Game Rounds */}
            {round === 0 && <StartPage onStart={() => setRound(1)} />}
            {round === 1 && <Round1 onAdvance={advanceRound} />}
            {round === 2 && <Round2 onAdvance={advanceRound} />}
            {round === 3 && <Round3 onAdvance={advanceRound} />}
            {round === 4 && <FinalRound onWin={() => setRound(5)} />}
            {round === 5 && <h1>Congratulations! You've won the tournament!</h1>}

            {/* Host Screen */}
            <HostScreen currentRound={round} />
          </div>
        </TVFrame>
      </div>
    </ClientProvider>
  );
};

export default App;
