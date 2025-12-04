import { Application } from "pixi.js";
import { setCreationEngine } from "./app/getCreationEngine";
import { LoadScreen } from "./app/screens/LoadScreen";
import { MainScreen } from "./app/screens/main/MainScreen";
import { userSettings } from "./app/utils/userSettings";
import { CreationEngine } from "./creation-engine/CreationEngine";

declare global {
  var __PIXI_APP__: Application;
}

/**
 * Importing these modules will automatically register there plugins with the engine.
 */
import "@pixi/sound";
import { Colors } from "./app/utils/colors";
import { GameEngine } from "./game-engine/GameEngine";
import { setGameEngine } from "./app/getGameEngine";

// Create a new creation engine instance
const creationEngine = new CreationEngine();
setCreationEngine(creationEngine);
const gameEngine = new GameEngine();
setGameEngine(gameEngine);

(async () => {
  // Initialize the creation engine instance
  await creationEngine.init({
    background: Colors.Tarawera,
    resizeOptions: { minWidth: 800, minHeight: 1280, letterbox: false },
  });

  // Initialize the user settings
  userSettings.init();

  globalThis.__PIXI_APP__ = creationEngine;
  // Show the load screen
  await creationEngine.navigation.showScreen(LoadScreen);
  // Show the main screen once the load screen is dismissed
  await creationEngine.navigation.showScreen(MainScreen);
})();
