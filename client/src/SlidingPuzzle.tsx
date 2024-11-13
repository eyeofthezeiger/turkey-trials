// SlidingPuzzle.tsx

import React, { useEffect, useState } from "react";

const correctOrder = [1, 2, 3, 4, 5, 6, 7, 8, null];

const SlidingPuzzle: React.FC = () => {
  const [grid, setGrid] = useState<(number | null)[]>([]);
  const [completionTime, setCompletionTime] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    const shuffledGrid = shuffleGrid([...correctOrder]);
    setGrid(shuffledGrid);
  }, []);

  // Timer effect to update elapsed time in milliseconds when timer is running
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (timerRunning) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - (startTime || Date.now()));
      }, 1); // Update every millisecond
    }

    return () => clearInterval(interval); // Clean up the interval on unmount or when timer stops
  }, [timerRunning, startTime]);

  // Shuffle the grid at the start
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

      // Start the timer if it's the first move
      if (!timerRunning) {
        setStartTime(Date.now());
        setTimerRunning(true);
      }

      // Check for puzzle completion
      if (JSON.stringify(newGrid) === JSON.stringify(correctOrder)) {
        console.log("Puzzle solved!");
        setCompletionTime(Date.now() - (startTime || Date.now())); // Set completion time
        setTimerRunning(false); // Stop the timer
      }
    }
  };

  const renderGrid = () => {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 100px)", gap: "5px" }}>
        {grid.map((block, index) => (
          <div
            key={index}
            onClick={() => moveBlock(index)}
            style={{
              width: "100px",
              height: "100px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid black",
              fontSize: "24px",
              backgroundColor: block ? "#add8e6" : "#f0f0f0",
              cursor: canMove(index) ? "pointer" : "default",
            }}
          >
            {block !== null ? block : ""}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Sliding Block Puzzle</h1>
      {renderGrid()}
      <p>Arrange the blocks in the order: 1 2 3, 4 5 6, 7 8</p>
      <h3>Time: {timerRunning ? `${elapsedTime} ms` : "0 ms"}</h3>
      {completionTime !== null && (
        <h2>Congratulations! Puzzle completed in {completionTime} milliseconds.</h2>
      )}
    </div>
  );
};

export default SlidingPuzzle;
