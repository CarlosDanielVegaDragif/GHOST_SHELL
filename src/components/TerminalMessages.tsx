import { useRef, useEffect } from "react";
import { TerminalMessage } from './TerminalMessage'
import './TerminalMessages.css'

type TerminalMsg = { id: string; sender: string; message: string };

function TerminalMessages({ terminalMessages }: { terminalMessages: TerminalMsg[] }) {
  const terminalMessagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const containerElem = terminalMessagesRef.current;
    if (containerElem) {
      containerElem.scrollTop = containerElem.scrollHeight;
    }
  }, [terminalMessages]);
  
  let senderPrefix = '';

  return (
    <div className='terminal-messages-container' ref={terminalMessagesRef}>
      {terminalMessages.map((terminalMessage) => {
        if(terminalMessage.sender !== 'user'){
          senderPrefix = '['+terminalMessage.sender.toUpperCase()+'] '+terminalMessage.message;
        }else {
          senderPrefix = '[root@darknet:~#] '+terminalMessage.message;
        }
        return (
        <TerminalMessage 
          message={senderPrefix}
          sender={terminalMessage.sender}
          key={terminalMessage.id}
          />
        );
      })}
    </div>
  )
}

export default TerminalMessages;
