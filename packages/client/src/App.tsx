import React, { useState, useEffect } from "react";
import HostScreen from "./host/HostScreen";
import FinalRound from "./screens/FinalRound";
import Round1 from "./screens/Round1";
import Round2 from "./screens/Round2";
import Round3 from "./screens/Round3";
import StartPage from "./screens/StartPage";
import backgroundMusic from "./assets/thanksgiving-cheerful-holiday-pop-179004.mp3"; // Adjust path as needed
import { ClientProvider } from "./utils/client";

const App: React.FC = () => {
  const [round, setRound] = useState(0);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const bgMusic = new Audio(backgroundMusic);
    bgMusic.loop = true;
    bgMusic.volume = 0.5; // Adjust the volume
    setAudio(bgMusic);

    return () => {
      // Cleanup: Pause and reset audio when unmounting
      bgMusic.pause();
      bgMusic.currentTime = 0;
    };
  }, []);

  const startMusic = () => {
    if (audio && audio.paused) {
      audio
        .play()
        .catch((error) =>
          console.error("Error playing background music:", error),
        );
    }
  };

  const toggleMute = () => {
    if (audio) {
      audio.muted = !audio.muted;
      setIsMuted(!isMuted);
    }
  };

  const advanceRound = () => setRound((prevRound) => prevRound + 1);

  return (
    <ClientProvider>
      <div
        style={{ textAlign: "center", position: "relative" }}
        onClick={startMusic} // Start music on the first user interaction
      >
        {/* Mute/Unmute Button */}
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 1000,
          }}
        >
          <button onClick={toggleMute}>
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
    </ClientProvider>
  );
};

export default App;
