import type { BGM, SFX } from "./creation-engine/audio/audio";
import type { Navigation } from "./creation-engine/navigation/navigation";
import type {
  CreationResizePluginOptions,
  DeepRequired,
} from "./creation-engine/resize/ResizePlugin";

declare global {
  namespace PixiMixins {
    interface Application extends DeepRequired<CreationResizePluginOptions> {
      audio: {
        bgm: BGM;
        sfx: SFX;
        getMasterVolume: () => number;
        setMasterVolume: (volume: number) => void;
      };
      navigation: Navigation;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ApplicationOptions extends CreationResizePluginOptions {}
  }
}

export {};
