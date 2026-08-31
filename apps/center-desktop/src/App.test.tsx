import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ProjectApi } from "./api/project-api";
import { App } from "./App";
import type { FullscreenController } from "./platform/fullscreen";

function createDependencies(active = false): {
  readonly fullscreen: FullscreenController;
  readonly projectApi: ProjectApi;
} {
  return {
    fullscreen: {
      exit: vi.fn(async () => undefined),
      isActive: vi.fn(async () => active),
      toggle: vi.fn(async () => !active),
    },
    projectApi: {
      createProject: vi.fn(),
      getManifest: vi.fn(),
    },
  };
}

describe("Music Center kabuğu", () => {
  it("gelen katkıyı aynı enstrüman kanalına bırakır", () => {
    const dependencies = createDependencies();
    const values = new Map<string, string>();
    const dataTransfer = {
      dropEffect: "none",
      effectAllowed: "none",
      getData: (format: string) => values.get(format) ?? "",
      setData: (format: string, value: string) => values.set(format, value),
    } as unknown as DataTransfer;
    render(
      <App fullscreenController={dependencies.fullscreen} projectApi={dependencies.projectApi} />,
    );

    const card = screen.getByText("Piyano tema A").closest("article");
    expect(card).not.toBeNull();
    fireEvent.dragStart(card as HTMLElement, { dataTransfer });
    fireEvent.drop(screen.getByLabelText("Piyano kanalı"), {
      clientX: 64,
      dataTransfer,
    });

    expect(screen.getByRole("button", { name: "Piyano tema A, revizyon 2" })).toBeTruthy();
    expect(screen.getByText(/Piyano tema A, 1\. ölçüye eklendi/)).toBeTruthy();
  });

  it("F6 ve F7 ile kanal/katkı panellerini açıp kapatır", () => {
    const dependencies = createDependencies();
    render(
      <App fullscreenController={dependencies.fullscreen} projectApi={dependencies.projectApi} />,
    );

    expect(screen.getByLabelText("Gelen katkılar")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Piyano kanalını sustur" })).toBeTruthy();

    fireEvent.keyDown(window, { key: "F6" });
    expect(screen.queryByRole("button", { name: "Piyano kanalını sustur" })).toBeNull();

    fireEvent.keyDown(window, { key: "F7" });
    expect(screen.queryByLabelText("Gelen katkılar")).toBeNull();
  });

  it("F9 odak modunu açar ve Escape ile kapatır", () => {
    const dependencies = createDependencies();
    render(
      <App fullscreenController={dependencies.fullscreen} projectApi={dependencies.projectApi} />,
    );

    fireEvent.keyDown(window, { key: "F9" });
    expect(screen.getByText("ESC — ODAKTAN ÇIK")).toBeTruthy();
    expect(screen.queryByLabelText("Gelen katkılar")).toBeNull();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByText("ESC — ODAKTAN ÇIK")).toBeNull();
  });

  it("Escape ile işletim sistemi fullscreen durumundan çıkar", async () => {
    const dependencies = createDependencies(true);
    render(
      <App fullscreenController={dependencies.fullscreen} projectApi={dependencies.projectApi} />,
    );

    fireEvent.keyDown(window, { key: "Escape" });

    await waitFor(() => expect(dependencies.fullscreen.exit).toHaveBeenCalledOnce());
  });
});
