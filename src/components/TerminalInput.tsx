import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import './TerminalInput.css'

export const TerminalInput = forwardRef<HTMLInputElement, { onSubmit: (input: string) => void }>(
  ({ onSubmit }, ref) => {
    const [inputText, setInputText] = useState('');
    const [history, setHistory] = useState<string[]>(() => {
      try {
        const raw = localStorage.getItem('terminalHistory');
        return raw ? JSON.parse(raw) as string[] : [];
      } catch (e) {
        return [];
      }
    });
    const [historyIndex, setHistoryIndex] = useState<number | null>(null);
    const savedInputRef = useRef<string>('');
    const internalRef = React.useRef<HTMLInputElement | null>(null);

    useImperativeHandle(ref, () => internalRef.current as HTMLInputElement);

    useEffect(() => {
      try {
        localStorage.setItem('terminalHistory', JSON.stringify(history));
      } catch (e) {}
    }, [history]);

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
      if (event.key === 'Enter') {
        const trimmed = inputText.trim();
        if (trimmed !== '') {
          setHistory(prev => [...prev, trimmed]);
        }
        onSubmit(inputText);
        setInputText('');
        setHistoryIndex(null);
        savedInputRef.current = '';
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (history.length === 0) return;
        if (historyIndex === null) {
          savedInputRef.current = inputText;
          setHistoryIndex(history.length - 1);
          setInputText(history[history.length - 1]);
        } else if (historyIndex > 0) {
          const nextIndex = historyIndex - 1;
          setHistoryIndex(nextIndex);
          setInputText(history[nextIndex]);
        }
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (history.length === 0 || historyIndex === null) return;
        if (historyIndex < history.length - 1) {
          const nextIndex = historyIndex + 1;
          setHistoryIndex(nextIndex);
          setInputText(history[nextIndex]);
        } else {
          // past the newest -> restore saved input
          setHistoryIndex(null);
          setInputText(savedInputRef.current || '');
        }
        return;
      }
    }

    return (
      <div className="terminal-input-container">
        <span className="terminal-prompt">{'root@darknet:~#'}</span>
        <input
          ref={internalRef}
          placeholder="type 'help' for suggestions"
          value={inputText}
          onChange={e => setInputText((e.target as HTMLInputElement).value)}
          onKeyDown={handleKeyDown}
          className="terminal-input"
          autoFocus
        />
      </div>
    );
  }
);

TerminalInput.displayName = 'TerminalInput';
