import React, { useState } from 'react'
import './TerminalInput.css'
export function TerminalInput({ onSubmit }: { onSubmit: (input: string) => void }) {
  const [inputText, setInputText] = useState('');

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      onSubmit(inputText);
      setInputText('');
    }
  }

  return (
    <div className="terminal-input-container">
      <span className="terminal-prompt">{'root@darknet:~#'}</span>
      <input
        placeholder="type 'help' for suggestions"
        value={inputText}
        onChange={e => setInputText((e.target as HTMLInputElement).value)}
        onKeyDown={handleKeyDown}
        className="terminal-input"
      />
    </div>
  );
}
