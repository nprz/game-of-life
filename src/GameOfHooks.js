import React, { useEffect, useRef, useReducer, useState } from "react";

// Style
import styled from "styled-components";
import { IoIosPlay, IoIosPause } from "react-icons/io";

// 18 = 2px border + 8 + 8 padding
const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 16px);
`;

const StyledCanvas = styled.canvas`
  border: 1px solid black;
`;

const ControlBar = styled.div`
    height: 24,
    display: "flex",
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center"
`;

const StyledPauseIcon = styled(IoIosPause)`
  color: black;
  cursor: pointer;
  font-size: 28px;
`;

const StyledPlayIcon = styled(IoIosPlay)`
  color: black;
  cursor: pointer;
  font-size: 28px;
`;

let heightWidth = getWidth();
const verticalLines = 150;
let cellWidth = heightWidth / verticalLines;
let horizontalLines = Math.floor(heightWidth / cellWidth);
let canvasCtx;

const actions = {
  PLAYING: "PLAYING",
  UPDATE_CELLS: "UPDATE_CELLS"
};

function getWidth() {
  const maxCanvasWidth = 600;
  if (window.innerWidth > maxCanvasWidth) return maxCanvasWidth;

  return window.innerWidth - 8;
}

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

function updateAndDraw(state) {
  const { current } = state;

  const currentCopy = [...current];
  let tempRow = [];
  let allCells = [];

  if (!currentCopy.length) {
    const initCells = generateInitialCells();
    draw(initCells);
    return initCells;
  }

  current.forEach((row, rowIndex) => {
    row.forEach((cell, cellIndex) => {
      tempRow.push(generateNext(rowIndex, cellIndex, row.length, currentCopy));
    });
    allCells.push(tempRow);
    tempRow = [];
  });

  canvasCtx.clearRect(0, 0, heightWidth, heightWidth);
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
  const [width, setWidth] = useState(getWidth());
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // canvas setup
    canvasCtx = canvasRef.current.getContext("2d");
    if (state.playing) {
      const id = setInterval(() => {
        requestAnimationFrame(() => {
          dispatch({ type: actions.UPDATE_CELLS });
        });
      }, 1000 / 10);

      return () => {
        clearInterval(id);
      };
    }
  }, [state.playing]);

  useEffect(() => {
    function handleResize() {
      setWidth(getWidth());

      heightWidth = getWidth();
      cellWidth = heightWidth / verticalLines;
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Container>
      <StyledCanvas
        ref={canvasRef}
        width={heightWidth}
        height={heightWidth}
      ></StyledCanvas>
      <ControlBar>
        {state.playing ? (
          <StyledPauseIcon
            onClick={() => {
              dispatch({ type: actions.PLAYING, playing: false });
            }}
          />
        ) : (
          <StyledPlayIcon
            onClick={() => dispatch({ type: actions.PLAYING, playing: true })}
          />
        )}
      </ControlBar>
    </Container>
  );
}

export default GameOfLife;

const initialState = {
  current: [],
  playing: true
};

function reducer(state, action) {
  if (action.type === actions.UPDATE_CELLS) {
    return {
      ...state,
      current: updateAndDraw(state)
    };
  } else if (action.type === actions.PLAYING) {
    return {
      ...state,
      playing: action.playing
    };
  } else {
    return state;
  }
}
