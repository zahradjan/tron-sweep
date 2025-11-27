import { GameEngine } from "./game-engine/GameEngine";

let instance: GameEngine | null = null;

/**
 * Get the game application engine
 * This is a simple way to access the engine instance from anywhere in the app
 */
export function gameEngine(): GameEngine {
  return instance!;
}

export function setGameEngine(app: GameEngine) {
  instance = app;
}
