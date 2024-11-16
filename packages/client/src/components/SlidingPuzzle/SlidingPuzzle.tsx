import React, { useEffect, useState } from "react";
import pet1 from "../../assets/pet1.jpg";
import pet2 from "../../assets/pet2.jpg";
import pet3 from "../../assets/pet3.jpg";
import pet4 from "../../assets/pet4.jpg";
import pet5 from "../../assets/pet5.jpg";
import pet6 from "../../assets/pet6.jpg";
import pet7 from "../../assets/pet7.jpg";

// Map of image names to imports
const images = {
  pet1,
  pet2,
  pet3,
  pet4,
  pet5,
  pet6,
  pet7,
} as const;

// Type for image keys
type ImageKeys = keyof typeof images;

// Simulated server response (hardcoded for now)
const serverResponse = {
  imageName: "pet3", // Change this to test different images (e.g., pet1, pet2, etc.)
};

const correctOrder = [1, 2, 3, 4, 5, 6, 7, 8, null];

const SlidingPuzzle: React.FC = () => {
  const [grid, setGrid] = useState<(number | null)[]>([]);
  const [completionTime, setCompletionTime] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [puzzleImage, setPuzzleImage] = useState<string>("");

  useEffect(() => {
    // Simulate fetching the image name from the server
    const fetchImageFromServer = () => {
      const selectedImage = images[serverResponse.imageName as ImageKeys];
      setPuzzleImage(selectedImage);
    };

    fetchImageFromServer();

    const shuffledGrid = shuffleGrid([...correctOrder]);
    setGrid(shuffledGrid);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (timerRunning) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - (startTime || Date.now()));
      }, 1);
    }

    return () => clearInterval(interval);
  }, [timerRunning, startTime]);

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

      if (!timerRunning) {
        setStartTime(Date.now());
        setTimerRunning(true);
      }

      if (JSON.stringify(newGrid) === JSON.stringify(correctOrder)) {
        console.log("Puzzle solved!");
        setCompletionTime(Date.now() - (startTime || Date.now()));
        setTimerRunning(false);
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
              border: "1px solid black",
              backgroundColor: block !== null ? "transparent" : "#f0f0f0",
              backgroundImage: block !== null ? `url(${puzzleImage})` : "none",
              backgroundSize: "300px 300px", // Adjust based on the full image size
              backgroundPosition: getBackgroundPosition(block), // Position for each piece
              cursor: canMove(index) ? "pointer" : "default",
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

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Sliding Block Puzzle</h1>
      {renderGrid()}
      <p>Arrange the blocks to form the correct image</p>
      <h3>Time: {timerRunning ? `${elapsedTime} ms` : "0 ms"}</h3>
      {completionTime !== null && (
        <h2>Congratulations! Puzzle completed in {completionTime} milliseconds.</h2>
      )}
      <div style={{ marginTop: "20px" }}>
        <h3>Completed Picture:</h3>
        <img
          src={puzzleImage}
          alt="Completed Puzzle"
          style={{ width: "300px", height: "300px", border: "1px solid black" }}
        />
      </div>
    </div>
  );
};

export default SlidingPuzzle;
