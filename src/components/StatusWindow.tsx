import React, { useState, useRef } from "react";
import "./StatusWindow.css";

type StatusProps = {
  stats: { money: number; xp: number; level: number; pc: number; miners: number; hackers: number };
  onClose: () => void;
};

export function StatusWindow({ stats, onClose }: StatusProps) {
  const [position, setPosition] = useState({ x: 200, y: 120 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

  const windowRef = useRef<HTMLDivElement>(null);

  function onMouseDown(e: React.MouseEvent) {
    setDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragging) return;

    setPosition({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  }

  function onMouseUp() {
    setDragging(false);

    if (!windowRef.current) return;

    const rect = windowRef.current.getBoundingClientRect();

    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;

    setPosition(prev => ({
      x: clamp(prev.x, 0, maxX),
      y: clamp(prev.y, 0, maxY),
    }));
  }

  return (
    <div
      ref={windowRef}
      className="status-window"
      style={{
        left: position.x,
        top: position.y,
      }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      <div
        className="status-header"
        onMouseDown={onMouseDown}
      >
        STATUS
        <button onClick={onClose}>✕</button>
      </div>

      <div className="status-body">
        <p>Money: ${stats.money}</p>
        <p>XP: {stats.xp}</p>
        <p>Level: {stats.level}</p>
        <p>PC: {stats.pc}</p>
        <p>Miners: {stats.miners}</p>
        <p>Hackers: {stats.hackers}</p>
      </div>
    </div>
  );
}

