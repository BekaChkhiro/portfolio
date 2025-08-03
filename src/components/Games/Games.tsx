import React, { useState } from 'react';
import { TicTacToe } from './TicTacToe/TicTacToe';
import { MemoryGame } from './MemoryGame/MemoryGame';
import { Calculator } from './Calculator/Calculator';
import { FaGamepad, FaCalculator, FaBrain } from 'react-icons/fa';
import { GiTicTacToe } from 'react-icons/gi';
import './Games.css';

interface Game {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

const games: Game[] = [
  {
    id: 'tictactoe',
    title: 'Tic Tac Toe',
    description: 'Classic 3x3 grid game. Get three in a row to win!',
    icon: <GiTicTacToe />,
    component: <TicTacToe />
  },
  {
    id: 'memory',
    title: 'Memory Game',
    description: 'Match pairs of cards to test your memory!',
    icon: <FaBrain />,
    component: <MemoryGame />
  },
  {
    id: 'calculator',
    title: 'Calculator',
    description: 'Simple calculator for basic math operations.',
    icon: <FaCalculator />,
    component: <Calculator />
  }
];

export const Games: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const selectedGameData = games.find(game => game.id === selectedGame);

  if (selectedGame && selectedGameData) {
    return (
      <div className="game-container">
        <div className="game-header">
          <button 
            className="back-button"
            onClick={() => setSelectedGame(null)}
          >
            ← Back to Games
          </button>
          <h2>{selectedGameData.title}</h2>
        </div>
        <div className="game-content">
          {selectedGameData.component}
        </div>
      </div>
    );
  }

  return (
    <div className="games-container">
      <div className="games-header">
        <h1><FaGamepad /> ChkhiroOS Games</h1>
        <p>Simple games to pass the time and have fun!</p>
      </div>

      <div className="games-grid">
        {games.map((game) => (
          <div 
            key={game.id} 
            className="game-card"
            onClick={() => setSelectedGame(game.id)}
          >
            <div className="game-icon">
              {game.icon}
            </div>
            <h3>{game.title}</h3>
            <p>{game.description}</p>
            <button className="play-button">
              Play Now
            </button>
          </div>
        ))}
      </div>

      <div className="games-footer">
        <p>More games coming soon! 🎮</p>
      </div>
    </div>
  );
};