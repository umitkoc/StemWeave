import { useEffect } from "react";

type WorkspaceShortcutActions = {
  readonly escape: () => void;
  readonly toggleChannels: () => void;
  readonly toggleContributions: () => void;
  readonly toggleFocus: () => void;
};

function isEditable(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

export function useWorkspaceShortcuts(actions: WorkspaceShortcutActions): void {
  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        actions.escape();
        return;
      }
      if (isEditable(event.target)) return;

      const action =
        event.key === "F6"
          ? actions.toggleChannels
          : event.key === "F7"
            ? actions.toggleContributions
            : event.key === "F9"
              ? actions.toggleFocus
              : null;
      if (action === null) return;
      event.preventDefault();
      action();
    }

    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [actions]);
}
