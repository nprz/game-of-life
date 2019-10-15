import React, { useEffect, useRef, useReducer } from "react";

// TODO:
// - make this a github repo
// - move logic into separate files
// - ability to resize
// - play/pause (reset? change frame rate?)

const heightWidth = 600;
const verticalLines = 100;
let cellWidth = heightWidth / verticalLines;
let horizontalLines = Math.floor(heightWidth / cellWidth);
let canvasCtx;

const actions = {
  PLAYING: "PLAYING",
  UPDATE_CELLS: "UPDATE_CELLS"
};

function generateInitialCells() {
  let row = [];
  let allCells = [];

  for (let i = 0; i < verticalLines; i++) {
    for (let j = 0; j < horizontalLines; j++) {
      if (Math.floor(Math.random() * 100) < 45) {
        row.push(1);
      } else {
        row.push(0);
      }
    }
    allCells.push(row);
    row = [];
  }

  draw(allCells);
  return allCells;
}

function draw(currentCells) {
  // NOTE: context and cellWidth are global and should not
  // need to be passed down
  canvasCtx.fillStyle = "black";
  currentCells.forEach((row, rowIndex) => {
    row.forEach((cell, cellIndex) => {
      if (cell === 1) {
        canvasCtx.fillRect(
          cellIndex * cellWidth,
          rowIndex * cellWidth,
          cellWidth,
          cellWidth
        );
      }
    });
  });
}

function updateAndDraw(current) {
  let tempRow = [];
  let allCells = [];

  if (!current.length) {
    const initCells = generateInitialCells();
    draw(initCells);
    return initCells;
  }

  current.forEach((row, rowIndex) => {
    row.forEach((cell, cellIndex) => {
      tempRow.push(generateNext(rowIndex, cellIndex, row.length, current));
    });
    allCells.push(tempRow);
    tempRow = [];
  });

  canvasCtx.clearRect(0, 0, 600, 600);
  draw(allCells);
  return allCells;
}

function generateNext(rowIndex, cellIndex, numOfCells, currentCells) {
  const numOfRows = currentCells.length;
  const neighbors = [
    { row: rowIndex - 1, cell: cellIndex - 1 },
    { row: rowIndex - 1, cell: cellIndex },
    { row: rowIndex - 1, cell: cellIndex + 1 },
    { row: rowIndex, cell: cellIndex - 1 },
    { row: rowIndex, cell: cellIndex + 1 },
    { row: rowIndex + 1, cell: cellIndex - 1 },
    { row: rowIndex + 1, cell: cellIndex },
    { row: rowIndex + 1, cell: cellIndex + 1 }
  ];
  let liveNeighborCount = 0;

  neighbors.forEach(neighbor => {
    // don't access part of array that doesn't exist
    if (
      neighbor.row > -1 &&
      neighbor.row < numOfRows &&
      neighbor.cell > -1 &&
      neighbor.cell < numOfCells &&
      currentCells[neighbor.row][neighbor.cell] === 1
    ) {
      liveNeighborCount++;
    }
  });

  // Calculate next cell state
  if (currentCells[rowIndex][cellIndex] === 1 && liveNeighborCount < 2) {
    // underpopulation
    return 0;
  } else if (currentCells[rowIndex][cellIndex] === 1 && liveNeighborCount > 3) {
    // overpopulation
    return 0;
  } else if (
    currentCells[rowIndex][cellIndex] === 0 &&
    liveNeighborCount === 3
  ) {
    // reproduction
    return 1;
  } else if (
    currentCells[rowIndex][cellIndex] === 1 &&
    (liveNeighborCount === 3 || liveNeighborCount === 2)
  ) {
    // stable living conditions
    return 1;
  } else {
    // remain dead
    return 0;
  }
}

function GameOfLife() {
  const canvasRef = useRef(null);
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // canvas setup
    canvasCtx = canvasRef.current.getContext("2d");

    const id = setInterval(() => {
      requestAnimationFrame(() => {
        dispatch({ type: actions.UPDATE_CELLS });
      });
    }, 1000 / 10);

    return () => {
      clearInterval(id);
    };
  }, []);

  return <canvas ref={canvasRef} width={600} height={600}></canvas>;
}

export default GameOfLife;

const initialState = {
  current: [],
  playing: true
};

function reducer(state, action) {
  const { current, playing } = state;

  if (action.type === actions.UPDATE_CELLS) {
    return {
      ...state,
      current: updateAndDraw([...state.current])
    };
  } else if (action.type === actions.PLAYING) {
    return state;
  } else {
    return state;
  }
}
