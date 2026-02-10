import { useEffect, useState } from 'react'
import './TerminalMessage.css'
type TerminalMessageProps = { message: string; sender: string };

export function TerminalMessage({ message, sender }: TerminalMessageProps) {
  const isSystem = sender === "system";
  const [visibleText, setVisibleText] = useState<string>(isSystem ? "" : message);

  useEffect(() => {
    if (!isSystem) return;

    let index = 0;
    const interval = setInterval(() => {
      index++;
      setVisibleText(message.slice(0, index));

      if (index >= message.length) {
        clearInterval(interval);
      }
    }, 20); // velocidad del typing

    return () => clearInterval(interval);
  }, [message, isSystem]);

  return (
    <div className={
      sender === 'user'
        ? 'terminal-message-user'
        : sender === 'terminal'
          ? 'terminal-message-terminal'
          : sender === 'system'
            ? 'terminal-message-system'
            : sender === 'menu' //for any menu thats not the normal terminal
              ? 'terminal-message-menu'
              : sender === 'shop'
                ? 'terminal-message-shop'
                : ''
    }>
      <div className={`terminal-line ${sender}`}>{visibleText}</div>
    </div>
  )
}
