export type FullscreenController = {
  exit(): Promise<void>;
  isActive(): Promise<boolean>;
  toggle(): Promise<boolean>;
};

function isTauriRuntime(): boolean {
  return "__TAURI_INTERNALS__" in window;
}

export function createFullscreenController(): FullscreenController {
  return {
    async exit() {
      if (isTauriRuntime()) {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        await getCurrentWindow().setFullscreen(false);
        return;
      }
      if (document.fullscreenElement !== null) await document.exitFullscreen();
    },
    async isActive() {
      if (isTauriRuntime()) {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        return getCurrentWindow().isFullscreen();
      }
      return document.fullscreenElement !== null;
    },
    async toggle() {
      const active = await this.isActive();
      if (active) {
        await this.exit();
        return false;
      }
      if (isTauriRuntime()) {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        await getCurrentWindow().setFullscreen(true);
      } else {
        await document.documentElement.requestFullscreen();
      }
      return true;
    },
  };
}
