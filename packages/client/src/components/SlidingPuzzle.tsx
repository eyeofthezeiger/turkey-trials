/* components/SlidingPuzzle.tsx */
import React, { useEffect, useState } from "react";
import { Room } from "colyseus.js";
import "./../App.css"; // Import the consolidated CSS file

// Correct order for the sliding puzzle
const correctOrder = [1, 2, 3, 4, 5, 6, 7, 8, null];

// Image assets
import pet1 from "../assets/pet1.jpg";
import pet2 from "../assets/pet2.jpg";
import pet3 from "../assets/pet3.jpg";
import pet4 from "../assets/pet4.jpg";
import pet5 from "../assets/pet5.jpg";
import pet6 from "../assets/pet6.jpg";
import pet7 from "../assets/pet7.jpg";

const images = {
  pet1,
  pet2,
  pet3,
  pet4,
  pet5,
  pet6,
  pet7,
} as const;

interface Props {
  room: Room;
}

const SlidingPuzzle: React.FC<Props> = ({ room }) => {
  const [grid, setGrid] = useState<(number | null)[]>([]);
  const [puzzleImage, setPuzzleImage] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(300000); // 5 minutes in milliseconds
  const [completedPuzzles, setCompletedPuzzles] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [playerPoints, setPlayerPoints] = useState<number>(0);

  interface PointsUpdateMessage {
    points: { [key: string]: number };
  }

  useEffect(() => {
    if (!room) {
      console.error("[Client] Room is not available.");
      return;
    }

    // Listen for server updates
    room.onMessage("new_puzzle", (data) => {
      console.log("[Client] Received new puzzle image:", data.image);
      const selectedImage = images[data.image as keyof typeof images];
      if (selectedImage) {
        setPuzzleImage(selectedImage);
        setGrid(shuffleGrid([...correctOrder]));
      } else {
        console.error("[Client] Invalid image key received:", data.image);
      }
    });

    room.onMessage("timer_update", (data) => {
      console.log("[Client] Timer update:", data.remainingTime);
      setTimer(data.remainingTime);
    });

    room.onMessage("puzzle_completed", (data) => {
      console.log(`[Client] Puzzle completed by ${data.playerId}`);
      if (data.playerId === room.sessionId) {
        setCompletedPuzzles(data.puzzlesCompleted);
      }
    });

    room.onMessage("game_over", () => {
      console.log("[Client] Game over");
      setIsGameOver(true);
    });

    // Listen for points updates
    room.onMessage("points_update", (data: PointsUpdateMessage) => {
      const points = data.points[room.sessionId];
      if (points !== undefined) {
        setPlayerPoints(points);
      }
    });

    // Request initial points
    room.send("request_points");

    return () => {
      room.removeAllListeners();
    };
  }, [room]);

  useEffect(() => {
    if (timer <= 0 && !isGameOver) {
      console.log("[Client] Timer reached zero.");
      setIsGameOver(true);
    }
  }, [timer, isGameOver]);

  const shuffleGrid = (grid: (number | null)[]): (number | null)[] => {
    let shuffledGrid = grid
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

    while (!isSolvable(shuffledGrid)) {
      shuffledGrid = grid
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
    }

    return shuffledGrid;
  };

  const isSolvable = (grid: (number | null)[]): boolean => {
    const gridWithoutNull = grid.filter((n) => n !== null) as number[];
    let inversions = 0;
    for (let i = 0; i < gridWithoutNull.length; i++) {
      for (let j = i + 1; j < gridWithoutNull.length; j++) {
        if (gridWithoutNull[i] > gridWithoutNull[j]) inversions++;
      }
    }
    const emptyRow = Math.floor(grid.indexOf(null) / 3);
    return (inversions + emptyRow) % 2 === 0;
  };

  const emptyIndex = grid.indexOf(null);

  const canMove = (index: number) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const emptyRow = Math.floor(emptyIndex / 3);
    const emptyCol = emptyIndex % 3;
    return (
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow)
    );
  };

  const moveBlock = (index: number) => {
    if (canMove(index)) {
      const newGrid = [...grid];
      newGrid[emptyIndex] = newGrid[index];
      newGrid[index] = null;
      setGrid(newGrid);

      if (JSON.stringify(newGrid) === JSON.stringify(correctOrder)) {
        console.log("[Client] Puzzle solved!");
        const completionTime = 300000 - timer; // Time taken to complete
        room.send("complete_puzzle", completionTime);
      }
    }
  };

  const renderGrid = () => {
    console.log("[Client] Rendering grid with puzzleImage:", puzzleImage);

    return (
      <div className="sliding-puzzle-grid">
        {grid.map((block, index) => (
          <div
            key={index}
            onClick={() => moveBlock(index)}
            className="sliding-puzzle-cell"
            style={{
              backgroundImage: block !== null ? `url(${puzzleImage})` : "none",
              backgroundPosition: getBackgroundPosition(block),
            }}
          />
        ))}
      </div>
    );
  };

  const getBackgroundPosition = (block: number | null) => {
    if (block === null) return "none";

    const row = Math.floor((block - 1) / 3);
    const col = (block - 1) % 3;
    return `-${col * 100}px -${row * 100}px`;
  };

  if (isGameOver) {
    return (
      <div className="sliding-puzzle">
        <h1>Game Over!</h1>
        <h2>You completed {completedPuzzles} puzzles.</h2>
        <h3>Your Points: {playerPoints}</h3>
      </div>
    );
  }

  return (
    <div className="sliding-puzzle">
      <h1>Sliding Puzzle</h1>
      <h3>Your Points: {playerPoints}</h3>
      <p>Time Remaining: {Math.ceil(timer / 1000)} seconds</p>
      <p>Puzzles Completed: {completedPuzzles}</p>
      {puzzleImage ? (
        renderGrid()
      ) : (
        <h3>Loading puzzle image...</h3>
      )}
      <p>Arrange the blocks to form the correct image</p>
      {puzzleImage && (
        <div className="sliding-puzzle-completed">
          <h3>Completed Picture:</h3>
          <img
            src={puzzleImage}
            alt="Completed Puzzle"
            className="sliding-puzzle-image"
          />
        </div>
      )}
    </div>
  );
};

export default SlidingPuzzle;
