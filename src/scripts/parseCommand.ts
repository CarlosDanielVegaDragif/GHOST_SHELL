import { commands } from "./commands";
import type { TerminalContext } from "./commands";

export function parseCommand(input: string, ctx: TerminalContext) {
  const parts = input.trim().toLowerCase().split(" ");
  const commandName = parts[0];
  const args = parts.slice(1);

  const command = commands[commandName];
  if (!command) {
    return [`Command not found: ${commandName}`];
  }

  return command.run(ctx, args);
}

