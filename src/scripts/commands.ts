import minercoreAscii from '../ascii/mining.txt?raw'
import marketAscii from '../ascii/market.txt?raw'
import hiringAscii from '../ascii/hiringmenu.txt?raw'
import type { Company } from './CompanyData';

export type TerminalCommand = {
  name: string;
  description: string;
  run: (ctx: TerminalContext, args: string[]) => string[]; // respuestas de la terminal
};

export type TerminalContext = {
  clear: () => void;
  openStatus: () => void;
  getCompanies: () => Company[];
  hack: (companyId: string) => string[];
  openMinerCore: () => void;
  openMarket: () => void;
  openHireMenu: () => void;
  saveGame: (slot: string) => string[];
  loadGame: (slot: string) => string[];
};

export const commands: Record<string, TerminalCommand> = {
  help: {
    name: "help",
    description: "List available commands",
    run: () => [
      "Available commands:",
      "- help | shows a list of available commands",
      "- clear | clears the terminal",
      "- whoami | shows current user",
      "- status | open status window",
      "- scan | scans for data bases",
      "- hack <id> | attempts to hack specified data base",
      "- minercore | opens the 'minercore' program",
      "- market | opens the 'market' program",
      "- hire | opens the hiring interface",
      "- save <slot> | save your current stats to a slot",
      "- load <slot> | load stats from a slot",
    ]
  },

  whoami: {
    name: "whoami",
    description: "Show current user",
    run: () => [
      "root"
    ]
  },
  
  clear: {
    name: "clear",
    description: "Clear the terminal",
    run: ({ clear }) => {
      clear();
      return [];
    }
  },

  status: {
    name: "status",
    description: "Open status window",
    run: ({ openStatus }) => {
      openStatus();
      return [];
    }
  },

  //Hacking commands
  scan: {
    name: "scan",
    description: "Scan available companies",
    run: ({ getCompanies }) => {
      const companies = getCompanies();

      return companies.map(c =>
        `Id: ${c.id} | ${c.name} | Difficulty: ${c.difficulty}`
      );
    }
  },

  hack: {
  name: "hack",
  description: "Attempts to hack specified data base",
  run: ( ctx, args ) => {
      if (!args[0]) {
        return ["Usage: hack <database_id>"];
      }

      return ctx.hack(args[0]);
    }
  },
  minercore: {
  name: "minercore",
  description: "Open MinerCore",
  run: ({ openMinerCore }) => {
    openMinerCore();
    return [
      minercoreAscii,
    ];
  }
},

  market: {
  name: "market",
  description: "Open market",
    run: ({ openMarket }) => {
      openMarket();
      return [
        marketAscii,
      ];
    }
  },

  hire: {
    name: "hire",
    description: "Opens hiring interface",
    run: ({ openHireMenu }) => {
      openHireMenu();
      return[
        hiringAscii,
      ];
    }
  },
  save: {
    name: "save",
    description: "Save player stats to a slot: save <slot>",
    run: (ctx, args) => {
      if (!args[0]) {
        return ["Usage: save <slot>"]; 
      }
      return ctx.saveGame(args[0]);
    }
  },

  load: {
    name: "load",
    description: "Load player stats from a slot: load <slot>",
    run: (ctx, args) => {
      if (!args[0]) {
        return ["Usage: load <slot>"]; 
      }
      return ctx.loadGame(args[0]);
    }
  },
};

