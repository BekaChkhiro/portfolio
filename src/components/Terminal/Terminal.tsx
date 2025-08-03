import React, { useState, useRef, useEffect } from 'react';
import './Terminal.css';

interface TerminalLine {
  type: 'command' | 'output' | 'error';
  content: string;
  timestamp?: Date;
}

export const Terminal: React.FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'output', content: 'ChkhiroOS Terminal v1.0.0' },
    { type: 'output', content: 'Type "help" to see available commands.' },
    { type: 'output', content: '' }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const commands: { [key: string]: (args: string[]) => string | string[] } = {
    help: () => [
      'Available commands:',
      '  help          - Show this help message',
      '  clear         - Clear the terminal',
      '  echo <text>   - Echo text back',
      '  date          - Show current date and time',
      '  whoami        - Show current user',
      '  ls            - List directory contents',
      '  pwd           - Show current directory',
      '  cat <file>    - Display file contents',
      '  mkdir <dir>   - Create directory (simulated)',
      '  touch <file>  - Create file (simulated)',
      '  neofetch      - Display system information',
      '  cowsay <text> - Make a cow say something',
      '  fortune       - Display a random fortune'
    ],
    clear: () => {
      setLines([]);
      return '';
    },
    echo: (args) => args.join(' '),
    date: () => new Date().toString(),
    whoami: () => 'chkhiro-user',
    ls: () => [
      'Desktop/',
      'Documents/',
      'Downloads/',
      'Pictures/',
      'Projects/',
      'portfolio.txt',
      'readme.md'
    ],
    pwd: () => '/home/chkhiro-user',
    cat: (args) => {
      const file = args[0];
      if (!file) return 'cat: missing file operand';
      
      const files: { [key: string]: string } = {
        'portfolio.txt': 'Welcome to my portfolio! Check out my projects and skills.',
        'readme.md': '# ChkhiroOS\n\nA modern, interactive portfolio operating system.\n\nBuilt with React, TypeScript, and lots of ❤️',
      };
      
      return files[file] || `cat: ${file}: No such file or directory`;
    },
    mkdir: (args) => {
      const dir = args[0];
      if (!dir) return 'mkdir: missing operand';
      return `mkdir: created directory '${dir}'`;
    },
    touch: (args) => {
      const file = args[0];
      if (!file) return 'touch: missing file operand';
      return `touch: created file '${file}'`;
    },
    neofetch: () => [
      '                   -`                    chkhiro-user@ChkhiroOS',
      '                  .o+`                   ---------------------',
      '                 `ooo/                   OS: ChkhiroOS 1.0.0',
      '                `+oooo:                  Host: Portfolio System',
      '               `+oooooo:                 Kernel: React 18.2.0',
      '               -+oooooo+:                Uptime: ' + Math.floor(Math.random() * 60) + ' mins',
      '             `/:-:++oooo+:               Shell: ChkhiroSH',
      '            `/++++/+++++++:              Resolution: Responsive',
      '           `/++++++++++++++:             DE: ChkhiroOS Desktop',
      '          `/+++ooooooooo+++/             Theme: Aurora [GTK3]',
      '         ./ooosssso++osssssso+`          Terminal: ChkhiroTerm',
      '        .oossssso-````/ossssss+`         CPU: Developer Brain',
      '       -osssssso.      :ssssssso.        Memory: ∞ GB',
      '      :osssssss/        osssso+++.',
      '     /ossssssss/        +ssssooo/-',
      '   `/ossssso+/:-        -:/+osssso+-',
      '  `+sso+:-`                 `.-/+oso:',
      ' `++:.                           `-/+/',
      ' .`                                 `/'
    ],
    cowsay: (args) => {
      const text = args.join(' ') || 'Hello from ChkhiroOS!';
      const border = '_'.repeat(text.length + 2);
      return [
        ` ${border}`,
        `< ${text} >`,
        ` ${'-'.repeat(text.length + 2)}`,
        '        \\   ^__^',
        '         \\  (oo)\\_______',
        '            (__)\\       )\\/\\',
        '                ||----w |',
        '                ||     ||'
      ];
    },
    fortune: () => {
      const fortunes = [
        'The best code is written when you\'re having fun!',
        'Debugging is like being the detective in a crime movie where you are also the murderer.',
        'Programming is 10% science, 20% ingenuity, and 70% getting the ingenuity to work with the science.',
        'There are only 10 types of people in the world: those who understand binary and those who don\'t.',
        'Code never lies, comments sometimes do.',
        'A bug in the code is worth two in the documentation.',
        'Programming is the art of telling another human what one wants the computer to do.'
      ];
      return fortunes[Math.floor(Math.random() * fortunes.length)];
    }
  };

  const executeCommand = (command: string) => {
    const trimmedCommand = command.trim();
    if (!trimmedCommand) return;

    const [cmd, ...args] = trimmedCommand.split(' ');
    const commandFunc = commands[cmd.toLowerCase()];

    setLines(prev => [
      ...prev,
      { type: 'command', content: `$ ${trimmedCommand}`, timestamp: new Date() }
    ]);

    if (commandFunc) {
      const result = commandFunc(args);
      if (result) {
        const outputLines = Array.isArray(result) ? result : [result];
        setLines(prev => [
          ...prev,
          ...outputLines.map(line => ({ type: 'output' as const, content: line }))
        ]);
      }
    } else {
      setLines(prev => [
        ...prev,
        { type: 'error', content: `Command not found: ${cmd}. Type 'help' for available commands.` }
      ]);
    }

    setCommandHistory(prev => [...prev, trimmedCommand]);
    setCurrentInput('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(currentInput);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex === commandHistory.length - 1 
          ? -1 
          : historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentInput(newIndex === -1 ? '' : commandHistory[newIndex]);
      }
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="terminal-container" onClick={() => inputRef.current?.focus()}>
      <div className="terminal-header">
        <div className="terminal-controls">
          <div className="control-dot red"></div>
          <div className="control-dot yellow"></div>
          <div className="control-dot green"></div>
        </div>
        <div className="terminal-title">ChkhiroOS Terminal</div>
      </div>
      
      <div className="terminal-body" ref={terminalRef}>
        {lines.map((line, index) => (
          <div key={index} className={`terminal-line ${line.type}`}>
            {line.content}
          </div>
        ))}
        
        <div className="terminal-input-line">
          <span className="prompt">$ </span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="terminal-input"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};