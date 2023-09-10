import React from "react";
// Components use state to remember things
// You can call useState function from your components to let it remember things
import { useState } from "react";

// export -> makes function accessible outside of this file
// default -> tells other files using this file that this is the main function
// in this file
export default function Board() {
  // To collect data from multiple children, or to have two child components
  // communicate with each other, declare a shared state in their parent
  // component instead. The parent component can then pass the state down to
  // child components via props
  // null passed to useState is used as the initial value for the state var
  const [squares, setSquares] = useState(Array(9).fill(null))
  const [xIsNext, setXIsNext] = useState(true);

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else {
    status = "Next Player: " + (xIsNext ? "X" : "O");
  }

  function handleClick(i) {
    if (squares[i] || calculateWinner(squares)) {
      return;
    }
    // Create a copy using slice array method
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    // Calling setSquares function lets React know that the state of the
    // component has changed. This will trigger a re-render of the components
    // that use squares state as well as it's children
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  }
  // return a JSX element
  return (
    <div>
      <div className="status">{status}</div>
      <div className="board-row">
        {/* The function is not called in onSquareClick. The function is passed,
        which react will call by itself. If you call the function here, the
        state of Board will be updated, which will trigger a re-render of the
        components, which will run handleClick again, leading to an infinite
        loop. Using an arrow function (a shorter way to define functions,
        can be used to resolve the issue.) */}
        <Square value={squares[0]} onSquareClick={() => handleClick(0)}/>
        <Square value={squares[1]} onSquareClick={() => handleClick(1)}/>
        <Square value={squares[2]} onSquareClick={() => handleClick(2)}/>
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)}/>
        <Square value={squares[4]} onSquareClick={() => handleClick(4)}/>
        <Square value={squares[5]} onSquareClick={() => handleClick(5)}/>
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)}/>
        <Square value={squares[7]} onSquareClick={() => handleClick(7)}/>
        <Square value={squares[8]} onSquareClick={() => handleClick(8)}/>
      </div>
    </div>
  );
}

// Your own components should start with capital letters
// The Square component can be passed a prop called value
function Square({value, onSquareClick}) {
  return <button className="square" onClick={onSquareClick}>{value}</button>
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}