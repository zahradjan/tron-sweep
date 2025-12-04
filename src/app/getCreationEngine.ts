import type { CreationEngine } from "../creation-engine/CreationEngine";

let instance: CreationEngine | null = null;

/**
 * Get the main application engine
 * This is a simple way to access the engine instance from anywhere in the app
 */
export function creationEngine(): CreationEngine {
  if (instance === null) {
    throw new Error(
      "CreationEngine not initialized. Call setCreationEngine() before accessing the engine."
    );
  }
  return instance;
}

export function setCreationEngine(app: CreationEngine) {
  instance = app;
}
