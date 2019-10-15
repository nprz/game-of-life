import React, { useRef, useEffect, useState } from "react";

// Styles
import styled from "styled-components";

function MovingCircle() {
  const canvasRef = useRef(null);
  const context = useRef(null);
  let xpos = 0;

  useEffect(() => {
    // canvas setup
    context.current = canvasRef.current.getContext("2d");
    setInterval(() => {
      requestAnimationFrame(draw);
    }, 1000 / 100);
  }, []);

  function draw() {
    context.current.clearRect(0, 0, 600, 600);
    context.current.beginPath();
    context.current.arc(xpos, 300, 20, 0, Math.PI * 2);
    context.current.fill();
    xpos++;
  }

  return <canvas ref={canvasRef} width={600} height={600}></canvas>;
}

export default MovingCircle;
