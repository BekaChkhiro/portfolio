import React, { useState } from 'react';
import './Calculator.css';

export const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const result = calculate(currentValue, inputValue, operation);

      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    if (previousValue !== null && operation) {
      const inputValue = parseFloat(display);
      const result = calculate(previousValue, inputValue, operation);
      
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const toggleSign = () => {
    if (display !== '0') {
      setDisplay(display.charAt(0) === '-' ? display.slice(1) : '-' + display);
    }
  };

  const percentage = () => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  };

  return (
    <div className="calculator">
      <div className="calculator-display">
        <div className="display-text">{display}</div>
      </div>
      
      <div className="calculator-buttons">
        <button className="btn function" onClick={clear}>C</button>
        <button className="btn function" onClick={toggleSign}>±</button>
        <button className="btn function" onClick={percentage}>%</button>
        <button className="btn operator" onClick={() => inputOperation('÷')}>÷</button>
        
        <button className="btn number" onClick={() => inputNumber('7')}>7</button>
        <button className="btn number" onClick={() => inputNumber('8')}>8</button>
        <button className="btn number" onClick={() => inputNumber('9')}>9</button>
        <button className="btn operator" onClick={() => inputOperation('×')}>×</button>
        
        <button className="btn number" onClick={() => inputNumber('4')}>4</button>
        <button className="btn number" onClick={() => inputNumber('5')}>5</button>
        <button className="btn number" onClick={() => inputNumber('6')}>6</button>
        <button className="btn operator" onClick={() => inputOperation('-')}>-</button>
        
        <button className="btn number" onClick={() => inputNumber('1')}>1</button>
        <button className="btn number" onClick={() => inputNumber('2')}>2</button>
        <button className="btn number" onClick={() => inputNumber('3')}>3</button>
        <button className="btn operator" onClick={() => inputOperation('+')}>+</button>
        
        <button className="btn number zero" onClick={() => inputNumber('0')}>0</button>
        <button className="btn number" onClick={inputDecimal}>.</button>
        <button className="btn equals" onClick={performCalculation}>=</button>
      </div>
    </div>
  );
};