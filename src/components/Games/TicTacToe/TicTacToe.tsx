import React, { useState } from 'react';
import './TicTacToe.css';

type Player = 'X' | 'O' | null;

export const TicTacToe: React.FC = () => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<Player | 'tie' | null>(null);
  const [scores, setScores] = useState({ X: 0, O: 0, ties: 0 });

  const winningLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  const checkWinner = (squares: Player[]): Player | 'tie' | null => {
    for (const line of winningLines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    
    if (squares.every(square => square !== null)) {
      return 'tie';
    }
    
    return null;
  };

  const handleClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameResult = checkWinner(newBoard);
    if (gameResult) {
      setWinner(gameResult);
      setScores(prev => ({
        ...prev,
        [gameResult === 'tie' ? 'ties' : gameResult]: prev[gameResult === 'tie' ? 'ties' : gameResult] + 1
      }));
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
  };

  const resetScores = () => {
    setScores({ X: 0, O: 0, ties: 0 });
    resetGame();
  };

  return (
    <div className="tictactoe-container">
      <div className="game-info">
        <div className="scoreboard">
          <div className="score-item">
            <span className="player-x">Player X</span>
            <span className="score">{scores.X}</span>
          </div>
          <div className="score-item">
            <span>Ties</span>
            <span className="score">{scores.ties}</span>
          </div>
          <div className="score-item">
            <span className="player-o">Player O</span>
            <span className="score">{scores.O}</span>
          </div>
        </div>

        <div className="game-status">
          {winner ? (
            winner === 'tie' ? (
              <span className="tie">It's a tie! 🤝</span>
            ) : (
              <span className={`winner ${winner.toLowerCase()}`}>
                Player {winner} wins! 🎉
              </span>
            )
          ) : (
            <span className={`current-player ${currentPlayer.toLowerCase()}`}>
              Player {currentPlayer}'s turn
            </span>
          )}
        </div>
      </div>

      <div className="board">
        {board.map((cell, index) => (
          <button
            key={index}
            className={`cell ${cell ? cell.toLowerCase() : ''}`}
            onClick={() => handleClick(index)}
            disabled={!!cell || !!winner}
          >
            {cell}
          </button>
        ))}
      </div>

      <div className="game-controls">
        <button className="control-btn" onClick={resetGame}>
          New Game
        </button>
        <button className="control-btn secondary" onClick={resetScores}>
          Reset Scores
        </button>
      </div>
    </div>
  );
};