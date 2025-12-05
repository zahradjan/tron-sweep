import { GameEngine } from "../../game-engine/GameEngine";

export async function pauseAware<T>(
  fn: () => Promise<T>,
  gameEngine: GameEngine
): Promise<T> {
  while (gameEngine.getPaused()) {
    if (gameEngine.getPausePromise()) {
      await gameEngine.getPausePromise();
    }
  }
  return fn();
}
export async function pauseAwareForEach<T>(
  items: T[],
  fn: (item: T) => Promise<void>,
  gameEngine: GameEngine
) {
  for (const item of items) {
    while (gameEngine.getPaused()) {
      if (gameEngine.getPausePromise()) {
        await gameEngine.getPausePromise();
      }
    }
    await fn(item);
  }
}

export async function pauseAwareSync<R>(fn: () => R, gameEngine: GameEngine) {
  while (gameEngine.getPaused()) {
    if (gameEngine.getPausePromise()) {
      await gameEngine.getPausePromise();
    }
  }
  return fn();
}
