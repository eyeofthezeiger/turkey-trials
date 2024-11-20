/* components/Transition.tsx */
import React, { useEffect, useState } from 'react';
import './Transition.css'; // Import the CSS file for the Transition component

interface TransitionProps {
  state: string;
  winners: string[];
}

const Transition: React.FC<TransitionProps> = ({ state, winners }) => {
  const [countdown, setCountdown] = useState(5); // 5-second countdown

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Ensure countdown doesn't go below zero
  useEffect(() => {
    if (countdown < 0) {
      setCountdown(0);
    }
  }, [countdown]);

  let message = '';
  if (state === 'transition_to_game1') {
    message = 'Get ready for Game 1!';
  } else if (state === 'transition_to_game2') {
    message = 'Prepare for Game 2!';
  } else if (state === 'transition_to_game3') {
    message = 'Next up: Game 3!';
  } else if (state === 'transition_to_final') {
    message = 'Final Round is coming!';
  } else if (state === 'transition_to_tournament_over') {
    message = 'Tournament Over!';
  } else {
    message = 'Get Ready!';
  }

  return (
    <div className="transition-screen">
      <h1>{message}</h1>
      {winners.length > 0 && (
        <div>
          <h2>Winners of the last round:</h2>
          <ul>
            {winners.map((winnerId, index) => (
              <li key={index}>{winnerId}</li>
            ))}
          </ul>
        </div>
      )}
      <h3>Next game starts in: {countdown} seconds</h3>
    </div>
  );
};

export default Transition;
