import { useState, useEffect, useRef } from 'react'
import { TerminalInput } from './components/TerminalInput.tsx'
import TerminalMessages from './components/TerminalMessages.tsx'
import { StatusWindow } from './components/StatusWindow.tsx'
import { companies as initialCompanies, type Company } from './scripts/CompanyData';

 type TerminalMessage = { id: string; sender: string; message: string };
import { parseCommand } from './scripts/parseCommand.ts'
//ascii
import minercoreAscii from './ascii/mining.txt?raw'
import minercoreShopAscii from './ascii/minersShop.txt?raw'
// audio asset for currency gain
const moneySoundUrl = new URL('./sounds/moneySound.wav', import.meta.url).href;
// audio asset for hack progress increments
const progressSoundUrl = new URL('./sounds/progressSound.wav', import.meta.url).href;
import './App.css'

function App() {
  const [terminalMessages, setTerminalMessages] = useState<TerminalMessage[]>([]);

  const [companies] = useState<Company[]>(initialCompanies);
  const [activeHack, setActiveHack] = useState<null | {
  companyId: string;
  progress: number;
}>(null);
  
  const [hacking, setHacking] = useState(false);
  const [miningActive, setMiningActive] = useState(false);
  type TerminalMode = "shell" | "minercore" | "minercoreShop" | "market" | "hiring";

  const [terminalMode, setTerminalMode] = useState<TerminalMode>("shell");
  
  const [playerStats, setPlayerStats] = useState({
    money: 150,
    xp: 0,
    level: 1,
    pc: 1,
    miners: 0,
    hackers: 0,
  });

  const [theme, setTheme] = useState<'theme-dark' | 'theme-light'>('theme-dark');
  const moneyAudioRef = useRef<HTMLAudioElement | null>(null);
  const progressAudioRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    moneyAudioRef.current = new Audio(moneySoundUrl);
    progressAudioRef.current = new Audio(progressSoundUrl);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'theme-light' || saved === 'theme-dark') setTheme(saved);
    } catch (e) {
      // ignore (SSR or blocked storage)
    }
  }, []);

  function toggleTheme() {
    setTheme(prev => {
      const next = prev === 'theme-dark' ? 'theme-light' : 'theme-dark';
      try { localStorage.setItem('theme', next); } catch (e) {}
      return next;
    });
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem('playerStats');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const merged = {
        money: typeof parsed.money === 'number' ? parsed.money : 150,
        xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
        level: typeof parsed.level === 'number' ? parsed.level : 1,
        pc: typeof parsed.pc === 'number' ? parsed.pc : 1,
        miners: typeof parsed.miners === 'number' ? parsed.miners : 0,
        hackers: typeof parsed.hackers === 'number' ? parsed.hackers : 0,
      };
      setPlayerStats(merged);
    } catch (e) {
      // ignore malformed saved data
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('playerStats', JSON.stringify(playerStats));
    } catch (e) {
      // ignore storage errors
    }
  }, [playerStats]);

  const [windows, setWindows] = useState({
    status: false,
  });

  const terminalContext = {
    clear: () => setTerminalMessages([]),
    openStatus: () =>
      setWindows(prev => ({ ...prev, status: true })),
    getCompanies: () => companies,
    addMoney: () => {
      setPlayerStats(prev => ({
        ...prev,
        money: prev.money + 1000
      }));
      try {
        if (moneyAudioRef.current) {
          moneyAudioRef.current.currentTime = 0;
          void moneyAudioRef.current.play();
        }
      } catch (e) {}
    },
    saveGame: (slot: string) => {
      try {
        const key = `save_slot_${slot}`;
        const payload = { playerStats, theme, savedAt: Date.now() };
        localStorage.setItem(key, JSON.stringify(payload));
        return [`Saved to slot ${slot}`];
      } catch (e) {
        return [`[ERROR] Could not save to slot ${slot}`];
      }
    },
    loadGame: (slot: string) => {
      try {
        const key = `save_slot_${slot}`;
        const raw = localStorage.getItem(key);
        if (!raw) return [`[ERROR] Slot ${slot} is empty`];
        const parsed = JSON.parse(raw);
        if (parsed.playerStats) setPlayerStats(parsed.playerStats);
        if (parsed.theme) setTheme(parsed.theme);
        return [`Loaded slot ${slot}`];
      } catch (e) {
        return [`[ERROR] Could not load slot ${slot}`];
      }
    },
    hack: (companyId: string) => {
      const company = companies.find(c => c.id === companyId);

      if (!company) {
        return ["Target not found"];
      }

      if (playerStats.level < company.difficulty) {
        return ["[ERROR] Not enough skills"];
      }

      setHacking(true);

      setActiveHack({
        companyId,
        progress: 0,
      });

      return [`Hacking ${company.name}...`];
    },
    openMinerCore: () => {
      setTerminalMessages([]);
      setTerminalMode("minercore");
    },

    closeMinerCore: () => {
      setTerminalMessages([]);
      setTerminalMode("shell");
    },

    openMarket: () => {
      setTerminalMessages([]);
      setTerminalMode("market");
    },

    closeMarket: () => {
      setTerminalMessages([]);
      setTerminalMode("shell");
    },

    openHireMenu: () => {
      setTerminalMessages([]);
      setTerminalMode("hiring");
    },

    closeHireMenu: () => {
      setTerminalMessages([]);
      setTerminalMode("shell");
    },
   };

   function handleTerminalInput(input: string) {
    const trimmed = input.trim().toLowerCase();

    if (!trimmed || hacking) return;

    setTerminalMessages(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        sender: "user",
        message: input,
      }
    ]);

    // === MINERCORE MODE ===
    if (terminalMode === "minercore") {
      handleMinerCoreInput(trimmed);
      return;
    }

    if (terminalMode === "minercoreShop") {
      handleMinerCoreShopInput(trimmed);
      return;
    }

    if (terminalMode === "market") {
      handleMarketInput(trimmed);
      return;
    }

    if (terminalMode === "hiring") {
      handleHiringMenuInput(trimmed);
      return;
    }

    // === NORMAL SHELL ===
    const responses = parseCommand(trimmed, terminalContext);

    setTerminalMessages(prev => [
      ...prev,
      ...responses.map(r => ({
        id: crypto.randomUUID(),
        sender: "terminal",
        message: r,
      }))
    ]);
  }

  function handleMinerCoreInput(input: string) {
    switch (input) {
      case "1":
        if (playerStats.miners <= 0) {
          pushMessage("[ERROR] No miners available", 'terminal');
          return;
        }
        setMiningActive(true);
        pushMessage("[MINERCORE] Mining started", 'terminal');
        return;

      case "2":
        setTerminalMessages([]);
        pushMessage(minercoreShopAscii, 'menu');
        setTerminalMode("minercoreShop");
        return;

      case "3":
        setTerminalMode("shell");
        setTerminalMessages([]);
        pushMessage("[SYSTEM] Exited MinerCore", 'terminal');
        return;

      default:
        pushMessage("[ERROR] Invalid option", 'terminal');
    }
  }

  const minersPrice: number[] =
    [3000, 4600, 5500, 6500, 7000, 10000];
  const minersTiers: string[] =
    ["BASIC MINER", "SLOW MINER", "MID MINER", "HIGH MINER", "ULTRA MINER", "BEAST MINER"];
  // income per tick for each miner tier (index 0 = BASIC)
  const minersIncome: number[] = [250, 500, 1000, 1500, 2000, 3000];

  function handleMinerCoreShopInput(input: string) {
    switch (input) {
      case "m1":
        if (playerStats.money >= minersPrice[0]) {
          buyMiners(0);
        }
        else {
          pushMessage("You don't have enough currency to buy 'BASIC MINER'", 'shop');
        }
        return;
      case "m2":
        if (playerStats.money >= minersPrice[1]) {
          buyMiners(1);
        }
        else {
          pushMessage("You don't have enough currency to buy 'SLOW MINER'", 'shop');
        }
        return;
      case "m3":
        if (playerStats.money >= minersPrice[2]) {
          buyMiners(2);
        }
        else {
          pushMessage("You don't have enough currency to buy 'MID MINER'", 'shop');
        }
        return;
      case "m4":
        if (playerStats.money >= minersPrice[3]) {
          buyMiners(3);
        }
        else {
          pushMessage("You don't have enough currency to buy 'HIGH MINER'", 'shop');
        }
        return;
      case "m5":
        if (playerStats.money >= minersPrice[4]) {
          buyMiners(4);
        }
        else {
          pushMessage("You don't have enough currency to buy 'ULTRA MINER'", 'shop');
        }
        return;
      case "m6":
        if (playerStats.money >= minersPrice[5]) {
          buyMiners(5);
        }
        else {
          pushMessage("You don't have enough currency to buy 'BEAST MINER'", 'shop');
        }
        return;
      case "back":
        setTerminalMode("minercore");
        setTerminalMessages([]);
        pushMessage(minercoreAscii, 'menu');
        return;
      default:
        pushMessage("[ERROR] Invalid option", 'terminal');
    }
  }

  function buyMiners(minerTier: number) {
    pushMessage(`You have successfully acquired ${minersTiers[minerTier]}`, 'shop');
    setPlayerStats(prev => ({
      ...prev,
      miners: prev.miners = minerTier + 1,
      money: prev.money - minersPrice[minerTier],
    }));
    console.log("money: " + (playerStats.money - minersPrice[minerTier]) + ", price: " + minersPrice[minerTier]);
    console.log("money: " + (playerStats.money - minersPrice[minerTier]));
  }

  const pcPrice: number[] = 
    [1000, 2500, 3500, 5000, 7500];
  const pcTiers: string[] =
    ['SLOW PC', 'MID PC', 'HIGH PC', 'ULTRA PC', 'BEAST PC'];

  function handleMarketInput(input: string) {
    switch (input) {
      case "1":
        if (playerStats.money >= pcPrice[0]) {
          buyPC(0);
        }
        else {
          pushMessage("You don't have enough currency to buy 'SLOW PC'", 'shop');
        }
        return;
      case "2":
        if (playerStats.money >= pcPrice[1]) {
          buyPC(1);
        }
        else {
          pushMessage("You don't have enough currency to buy 'MID PC'", 'shop');
        }
        return;
      case "3":
        if (playerStats.money >= pcPrice[2]) {
          buyPC(2);
        }
        else {
          pushMessage("You don't have enough currency to buy 'HIGH PC'", 'shop');
        }
        return;
      case "4":
        if (playerStats.money >= pcPrice[3]) {
          buyPC(3);
        }
        else {
          pushMessage("You don't have enough currency to buy 'ULTRA PC'", 'shop');
        }
        return;
      case "5":
        if (playerStats.money >= pcPrice[4]) {
          buyPC(4);
        }
        else {
          pushMessage("You don't have enough currency to buy 'BEAST PC'", 'shop');
        }
        return;
      case "back":
        setTerminalMode("shell");
        setTerminalMessages([]);
        return;
      default:
        pushMessage("[ERROR] Invalid option", 'terminal');
    }
  }

  function buyPC(pcTier: number) {
    pushMessage(`You have successfully acquired ${pcTiers[pcTier]}`, 'shop');
    setPlayerStats(prev => ({
      ...prev,
      pc: prev.pc = pcTier + 2,
      money: prev.money - pcPrice[pcTier],
    }));
  }

  function pushMessage(text: string, sender: string) {
    setTerminalMessages(m => [
      ...m,
      {
        id: crypto.randomUUID(),
        sender: sender,
        message: text,
      }
    ]);
  }

  const hackersPrice: number[] =
  [500, 1500, 3000, 5000];
  const hackersTiers: string[] =
  ['BEGINNER HACKER', 'INTERMEDIATE HACKER', 'ADVANCED HACKER', 'ELITE HACKER'];

  //Hackers will generate income for you in the background

  function handleHiringMenuInput(input: string) {
    switch (input) {
      case "1":
        if (playerStats.money >= hackersPrice[0]) {
          hireHacker(0);
        }
        else {
          pushMessage("You don't have enough currency to hire 'BEGINNER HACKER'", 'shop');
        }
        return;
      case "2":
        if (playerStats.money >= hackersPrice[1]) {
          hireHacker(1);
        }
        else {
          pushMessage("You don't have enough currency to hire 'INTERMEDIATE HACKER'", 'shop');
        }
        return;
      case "3":
        if (playerStats.money >= hackersPrice[2]) {
          hireHacker(2);
        }
        else {
          pushMessage("You don't have enough currency to hire 'ADVANCED HACKER'", 'shop');
        }
        return;
      case "4":
        if (playerStats.money >= hackersPrice[3]) {
          hireHacker(3);
        }
        else {
          pushMessage("You don't have enough currency to hire 'ELITE HACKER'", 'shop');
        }
        return;
      case "back":
        setTerminalMode("shell");
        setTerminalMessages([]);
        return;
      default:
        pushMessage("[ERROR] Invalid option", 'terminal');
    }
  }

  function hireHacker(hackerTier: number) {
    pushMessage(`You have successfully hired a ${hackersTiers[hackerTier]}`, 'shop');
    setPlayerStats(prev => ({
      ...prev,
      hackers: prev.hackers + 1,
      money: prev.money - hackersPrice[hackerTier],
    }));
  }

  // Background mining effect: when mining is active and player has miners,
  // credit `minersIncome[tier]` to player every X ms.
  useEffect(() => {
    if (!miningActive) return;
    if (playerStats.miners <= 0) return;

    const tierIndex = Math.max(0, playerStats.miners - 1);
    const income = minersIncome[tierIndex] ?? minersIncome[0];
    const intervalMs = 5000; // every 5 seconds

    const id = window.setInterval(() => {
      setPlayerStats(prev => ({
        ...prev, 
        money: prev.money + income,
        xp: prev.xp + Math.floor(income / 10),}));
    }, intervalMs);

    // play currency sound on miner income
    // (play after updating state so UI update and sound are concurrent)
    const playOnTick = () => {
      try {
        if (moneyAudioRef.current) {
          moneyAudioRef.current.currentTime = 0;
          void moneyAudioRef.current.play();
        }
      } catch (e) {}
    };

    const playId = window.setInterval(playOnTick, intervalMs);

    return () => {
      clearInterval(id);
      clearInterval(playId);
    };
  }, [miningActive, playerStats.miners]);

  useEffect(() => {
    if (!activeHack) return;
    const interval = setInterval(() => {
      setActiveHack(prev => {
        if (!prev) return null;

        const company = companies.find(c => c.id === prev.companyId);
        if (prev.progress >= 100) {

          setHacking(false);

          setTerminalMessages(m => [
            ...m,
            {
              id: crypto.randomUUID(),
              sender: "terminal",
              message: `[SUCCESS] ${company?.name} compromised`,
            }
          ]);

          setPlayerStats(stats => ({
            ...stats,
            xp: stats.xp + Math.floor(10 * company!.multipliers.xp),
            money: stats.money + Math.floor(100 * company!.multipliers.money),
          }));

          try {
            if (moneyAudioRef.current) {
              moneyAudioRef.current.currentTime = 0;
              void moneyAudioRef.current.play();
            }
          } catch (e) {}

          if (playerStats.xp >= 100) {
            setPlayerStats(prev => ({
              ...prev,
              xp: 0,
              level: prev.level + 1
            }));
          }

          return null;
        }

        const increment = Math.max(0.1, playerStats.pc - company!.difficulty / 4);
        const newProgress = Math.min(100, prev.progress + increment);

        // play progress tick sound when progress increases
        if (newProgress > prev.progress) {
          try {
            if (progressAudioRef.current) {
              progressAudioRef.current.currentTime = 0;
              void progressAudioRef.current.play();
            }
          } catch (e) {}
        }

        return { ...prev, progress: newProgress };
      });
    }, 300);

    return () => clearInterval(interval);
  }, [activeHack, playerStats.pc]);

  // focus input when window/tab gains focus
  useEffect(() => {
    const handler = () => inputRef.current?.focus();
    window.addEventListener('focus', handler);
    return () => window.removeEventListener('focus', handler);
  }, []);

  useEffect(() => {
    if(playerStats.hackers == 0) return;
    const interval = setInterval(() => {
      setPlayerStats(prev => ({
        ...prev,
        money: prev.money + (prev.hackers * 100),
        xp: prev.xp + (prev.hackers * 2),
      }));
    }, 5000);
    // play currency sound on hacker income ticks
    const playTick = () => {
      try {
        if (moneyAudioRef.current) {
          moneyAudioRef.current.currentTime = 0;
          void moneyAudioRef.current.play();
        }
      } catch (e) {}
    };
    const playInterval = setInterval(playTick, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(playInterval);
    };
  }, [playerStats.hackers]);

  useEffect(() => {
    const bootMessages = [
      'Initializing GHOST_SHELL_v2.7.3...',
      'Loading kernel modules... OK',
      'Establishing encrypted connection... OK',
      'Bypassing firewall protocols... OK',
      'Welcome back, GHOST',
    ];

    let index = 0;
    let mounted = true;

    const tick = () => {
      if (!mounted) return;
      if (index >= bootMessages.length) return;
      const msg = bootMessages[index++];
      if (msg == null) { // protección extra
        console.warn('boot message undefined at index', index - 1);
        setTimeout(tick, 600);
        return;
      }

      setTerminalMessages(prev => [
        ...prev,
        {
          message: msg,
          sender: 'system',
          id: crypto.randomUUID(),
        },
      ]);

      setTimeout(tick, 600);
    };

    tick();

    return () => {
      mounted = false;
    };
  }, []);

  
  return (
    <div className={`ghost-shell ${theme}`}>
      <header className="ghost-header">
        <div>GHOST_SHELL_v2.7.3 | root@darknet:~#</div>
        <div>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'theme-dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      <main className="ghost-terminal">
      
        <TerminalMessages 
        terminalMessages={terminalMessages}
        />
        {activeHack && (
          <div className="hack-progress">
            Hacking... {activeHack.progress}%
            <div className="progress-bar">
              <div style={{ width: `${activeHack.progress}%` }} />
            </div>
          </div>
        )}

        <TerminalInput ref={inputRef} onSubmit={handleTerminalInput} />


        {windows.status && (
        <StatusWindow
          stats={playerStats}
          onClose={() =>
            setWindows(prev => ({ ...prev, status: false }))
          }
        />
        )}
      </main>
    </div>
  );
}

export default App
