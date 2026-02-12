# GHOST_SHELL

GHOST_SHELL is a terminal-driven incremental hacking game built with React and TypeScript.  
The entire gameplay experience happens through a simulated command-line interface, where players interact with programs, manage infrastructure, and expand their digital operation.

This repository represents an MVP focused on core progression systems, terminal architecture, and state-driven game flow.

---

## 🎮 Overview

You play as an operator inside a fictional darknet shell, managing resources, expanding infrastructure, and growing influence through hacking targets and investing in miners and hackers.

The game emphasizes:

- Command-driven interaction
- Mode-based state management
- Modular terminal program architecture
- Expandable progression systems

---

## 🚀 Tech Stack

- **React**
- **TypeScript**
- **Vite**
- Functional components with Hooks
- State-driven UI architecture

---

## 🏗 Architecture Highlights

### Terminal as a State Machine

The terminal operates through mode-based input handling:

- `shell`
- `minercore`
- `minercoreShop`
- (extensible for future programs)

Each mode defines its own valid commands and behavior, allowing scalable program simulation inside a single interface.

---

### Centralized Input Handling

User input is processed at the application level and routed depending on the current terminal mode.  
This ensures:

- Clear separation between UI and game logic
- Scalable command registration
- Predictable state transitions

---

### Asynchronous Systems

Hacking uses a timed progression system:

- Interval-driven progress updates
- Dynamic reward calculation
- Reactive UI updates (progress bar)
- Audio feedback integration

---

### Modular Command System

Commands are parsed through a dedicated parsing layer, enabling:

- Easy command expansion
- Context-based command availability
- Future integration of risk/detection mechanics

---

## 🧠 Core Features (MVP)

- Fully interactive terminal-based interface
- Command-driven gameplay inspired by real shells
- 50 hackable companies with scaling difficulty
- Miners and hackers generating passive income
- Mode-based in-terminal programs
- Real-time hacking progress system
- Audio feedback for rewards and hacking activity
- Auto-scrolling and auto-focus UX improvements

---

## 🔄 Current Gameplay Loop

1. Scan available targets
2. Hack companies based on level requirements
3. Gain money and experience
4. Invest in miners and hackers
5. Increase operational efficiency
6. Repeat and scale

---

## 📈 Planned Features

- Risk & detection systems
- Counter-hacking mechanics
- Active security events
- Defensive infrastructure systems
- Deeper economy balancing
- Persistent progression systems

---

## 🎯 Design Goals

- Simulate a believable terminal-based environment
- Maintain clean separation between UI and game logic
- Build systems that scale without architectural rewrites
- Focus on extensibility from the MVP stage

---

## 📦 Installation

```bash
git clone https://github.com/CarlosDanielVegaDragif/GHOST_SHELL.git
cd ghost_shell
npm install
npm run dev
