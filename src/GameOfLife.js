import React, { Component } from "react";

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

class Life extends Component {
  constructor(props) {
    super(props);

    this.state = {
      one: [],
      two: [],
      switch: 0,
      playing: true
    };
  }

  componentDidMount() {
    const ctx = this.canvas.getContext("2d");
    const width = this.canvas.width;
    const height = this.canvas.height;
    const verticalLines = 50;
    const cellWidth = height / verticalLines;
    const horizontalLines = Math.floor(width / cellWidth);
    let activeCells = [];
    let temp = [];

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

    this.setState(
      {
        one: activeCells
      },
      () => {
        ctx.fillStyle = "black";
        activeCells.forEach((row, rowIndex) => {
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
    );

    setInterval(() => {
      requestAnimationFrame(() => this.draw(cellWidth, ctx));
    }, 1000 / 10);
  }

  play = () => {
    this.setState({
      playing: true
    });
  };

  pause = () => {
    this.setState({
      playing: false
    });
  };

  draw = (cellWidth, ctx) => {
    if (!this.state.playing) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let CURRENT;
    let NEXT;
    let temp = [];
    let greaterArray = [];

    if (this.state.switch % 2 === 0) {
      CURRENT = "one";
      NEXT = "two";
    } else {
      CURRENT = "two";
      NEXT = "one";
    }

    // create next board
    this.state[CURRENT].forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        this.generateNextStep(
          rowIndex,
          this.state[CURRENT].length,
          cellIndex,
          row.length,
          this.state[CURRENT],
          temp
        );
      });
      greaterArray.push(temp);
      temp = [];
    });

    // draw board
    ctx.fillStyle = "black";
    greaterArray.forEach((row, rowIndex) => {
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

    this.setState(prevState => ({
      switch: prevState.switch + 1,
      one: prevState.switch % 2 === 0 ? [] : [...greaterArray],
      two: prevState.switch % 2 === 0 ? [...greaterArray] : []
    }));
  };

  generateNextStep = (
    rowIndex,
    numOfRows,
    cellIndex,
    numOfCells,
    currentBoard,
    temp
  ) => {
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
      // Don't access part of array that doesn't exist
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
  };

  render() {
    return (
      <>
        <canvas
          ref={canvas => (this.canvas = canvas)}
          width={800}
          height={400}
          className="canvas"
        ></canvas>
        <ControlContainer>
          <ControlBar>
            {this.state.playing ? (
              <StyledPauseIcon onClick={this.pause} />
            ) : (
              <StyledPlayIcon onClick={this.play} />
            )}
          </ControlBar>
        </ControlContainer>
      </>
    );
  }
}

export default Life;
