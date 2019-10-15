import React, { useEffect, useRef, useReducer } from "react";

// Styles
import styled from "styled-components";
import { IoIosPlay, IoIosPause } from "react-icons/io";

const ControlContainer = styled.div`
  height: 24,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column"
`;

const ControlBar = styled.div`
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

const actions = {
  PLAYING: "PLAYING",
  UPDATE_ONE: "UPDATE_ONE",
  UPDATE_TWO: "UPDATE_TWO",
  ALTERNATE: "ALTERNATE"
};

// make a compnent with a much simpler animation
function GameOfLife() {
  const canvasRef = useRef(null);
  // const [one, setOne] = useState([]);
  // const [two, setTwo] = useState([]);
  // const [updateState, setUpdateState] = useState(0);
  // const [playing, setPlaying] = useState(true);
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    // TODO: rewrite this so it's dynamic
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const verticalLines = 50;
    const cellWidth = height / verticalLines;
    const horizontalLines = Math.floor(width / cellWidth);
    let activeCells = [];
    let temp = [];

    function updateAndDraw(cellWidth, ctx) {
      if (!state.playing) return;
      // TODO: update this with correct width and height that is dynamic
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      let current;
      let temp = [];
      let greaterArray = [];

      console.log(state);
      if (state.alternate % 2 === 0) {
        current = "one";
      } else {
        current = "two";
      }
      // create next board
      state[current].forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
          generateNextStep(
            rowIndex,
            current.length,
            cellIndex,
            row.length,
            current,
            temp
          );
        });
        greaterArray.push(temp);
        temp = [];
      });

      // draw board
      draw(greaterArray, ctx, cellWidth);
      dispatch({
        type: actions.UPDATE_ONE,
        one: state.alternate % 2 === 0 ? [] : [...greaterArray]
      });
      dispatch({
        type: actions.UPDATE_TWO,
        two: state.alternate % 2 === 0 ? [...greaterArray] : []
      });
      dispatch({ type: actions.ALTERNATE, alternate: state.alternate + 1 });

      // setOne(updateState % 2 === 0 ? [] : [...greaterArray]);
      // setTwo(updateState % 2 === 0 ? [...greaterArray] : []);
      // setUpdateState(updateState + 1);
    }

    for (let i = 0; i < verticalLines; i++) {
      for (let j = 0; j < horizontalLines; j++) {
        if (Math.floor(Math.random() * 100) < 35) {
          temp.push(1);
        } else {
          temp.push(0);
        }
      }
      activeCells.push(temp);
      temp = [];
    }

    // there was logic in here that was only supposed to run once, now it's
    // running every render!!
    dispatch({ type: actions.UPDATE_ONE, one: activeCells });
    //setOne(activeCells);
    draw(activeCells, ctx, cellWidth);

    const id = setInterval(() => {
      requestAnimationFrame(() => updateAndDraw(cellWidth, ctx));
    }, 1000 / 1);

    // does this actually need to run?
    return () => {
      console.log("time to clear the interval");
      clearInterval(id);
    };
  }, []);

  function draw(currentBoard, ctx, cellWidth) {
    ctx.fillStyle = "black";
    currentBoard.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        if (cell === 1) {
          ctx.fillRect(
            cellIndex * cellWidth,
            rowIndex * cellWidth,
            cellWidth,
            cellWidth
          );
        }
      });
    });
  }

  function generateNextStep(
    rowIndex,
    numOfRows,
    cellIndex,
    numOfCells,
    currentBoard,
    temp
  ) {
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
        currentBoard[neighbor.row][neighbor.cell] === 1
      ) {
        liveNeighborCount++;
      }
    });

    // Calculate next cell state
    if (currentBoard[rowIndex][cellIndex] === 1 && liveNeighborCount < 2) {
      // underpopulation
      temp.push(0);
    } else if (
      currentBoard[rowIndex][cellIndex] === 1 &&
      liveNeighborCount > 3
    ) {
      // overpopulation
      temp.push(0);
    } else if (
      currentBoard[rowIndex][cellIndex] === 0 &&
      liveNeighborCount === 3
    ) {
      // reproduction
      temp.push(1);
    } else if (
      currentBoard[rowIndex][cellIndex] === 1 &&
      (liveNeighborCount === 3 || liveNeighborCount === 2)
    ) {
      // stable living conditions
      temp.push(1);
    } else {
      // remain dead
      temp.push(currentBoard[rowIndex][cellIndex]);
    }
  }

  return (
    <>
      <canvas ref={canvasRef} width={800} height={400}></canvas>
      <ControlContainer>
        <ControlBar>
          {state.playing ? (
            <StyledPauseIcon
              onClick={() =>
                dispatch({ type: actions.PLAYING, playing: false })
              }
            />
          ) : (
            <StyledPlayIcon
              onClick={() => dispatch({ type: actions.PLAYING, playing: true })}
            />
          )}
        </ControlBar>
      </ControlContainer>
    </>
  );
}

export default GameOfLife;

const initialState = {
  one: [],
  two: [],
  alternate: 0,
  playing: true
};

function reducer(state, action) {
  const { one, two, alternate, playing } = state;

  console.log(action);
  if (action.type === actions.UPDATE_ONE) {
    return {
      ...state,
      one: action.one
    };
  } else if (action.type === actions.UPDATE_TWO) {
    return {
      ...state,
      two: action.two
    };
  } else if (action.type === actions.ALTERNATE) {
    return {
      ...state,
      alternate: action.alternate
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
