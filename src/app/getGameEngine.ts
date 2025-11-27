import { GameEngine } from "./game-engine/GameEngine";

let instance: GameEngine | null = null;

/**
 * Get the game application engine
 * This is a simple way to access the engine instance from anywhere in the app
 */
export function gameEngine(): GameEngine {
  if (instance === null) {
    throw new Error("GameEngine not initialized. Call setGameEngine() first.");
  }
  return instance;
}

export function setGameEngine(app: GameEngine) {
  instance = app;
}
