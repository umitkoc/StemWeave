import type { Measure } from "@stemweave/contracts";
import { instrumentCatalog } from "@stemweave/instrument-catalog";
import { pixelCssVariables } from "@stemweave/pixel-ui";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";

import type { CreateProjectInput, ProjectApi } from "./api/project-api";
import { createProjectApi } from "./api/project-api";
import { CreateProjectDialog } from "./components/CreateProjectDialog";
import { InstrumentIcon } from "./components/InstrumentIcon";
import { Timeline, writeContributionDrag } from "./components/Timeline";
import { useWorkspaceShortcuts } from "./hooks/useWorkspaceShortcuts";
import type { FullscreenController } from "./platform/fullscreen";
import { createFullscreenController } from "./platform/fullscreen";
import { demoContributions, initialClips, initialMarkers } from "./timeline/demo-data";
import type { TimelineClip, TimelineMarker } from "./timeline/model";

type WorkspaceProject = {
  readonly bpm: number;
  readonly id: string;
  readonly keySignature: string;
  readonly measure: Measure;
  readonly name: string;
  readonly sampleRateHz: number;
};

const demoProject: WorkspaceProject = {
  bpm: 120,
  id: "demo-project",
  keySignature: "C MAJOR",
  measure: "4/4",
  name: "PIXEL SENFONİ NO.1",
  sampleRateHz: 48_000,
};

type AppProps = {
  readonly fullscreenController?: FullscreenController;
  readonly projectApi?: ProjectApi;
};

export function App({
  fullscreenController = createFullscreenController(),
  projectApi = createProjectApi(),
}: AppProps) {
  const [clips, setClips] = useState<readonly TimelineClip[]>(initialClips);
  const [focusMode, setFocusMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [markers, setMarkers] = useState<readonly TimelineMarker[]>(initialMarkers);
  const [project, setProject] = useState<WorkspaceProject>(demoProject);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [showChannels, setShowChannels] = useState(true);
  const [showContributions, setShowContributions] = useState(true);
  const [status, setStatus] = useState("Hazır — katkıyı kendi renk kanalına sürükleyin.");

  async function leaveFocus() {
    setFocusMode(false);
    if (await fullscreenController.isActive()) {
      await fullscreenController.exit();
      setFullscreen(false);
    }
  }

  const shortcutActions = useMemo(
    () => ({
      escape: () => void leaveFocus(),
      toggleChannels: () => setShowChannels((value) => !value),
      toggleContributions: () => setShowContributions((value) => !value),
      toggleFocus: () => setFocusMode((value) => !value),
    }),
    [fullscreenController],
  );
  useWorkspaceShortcuts(shortcutActions);

  async function toggleFullscreen() {
    try {
      const active = await fullscreenController.toggle();
      setFullscreen(active);
      setFocusMode(active);
      setStatus(active ? "Tam ekran odak modu açık. Çıkmak için Escape." : "Tam ekran kapatıldı.");
    } catch {
      setStatus("Tam ekran isteği işletim sistemi tarafından reddedildi.");
    }
  }

  async function createProject(input: CreateProjectInput) {
    const summary = await projectApi.createProject(input);
    const manifest = await projectApi.getManifest(summary.id);
    setProject({
      bpm: manifest.bpm,
      id: manifest.projectId,
      keySignature: input.keySignature ?? "BELİRTİLMEDİ",
      measure: manifest.measure,
      name: summary.name.toUpperCase(),
      sampleRateHz: 48_000,
    });
    setClips([]);
    setMarkers([]);
    setProjectDialogOpen(false);
    setStatus(`${summary.name} projesi API üzerinde oluşturuldu.`);
  }

  function useDemo() {
    setProject(demoProject);
    setClips(initialClips);
    setMarkers(initialMarkers);
    setProjectDialogOpen(false);
    setStatus("Yerel demo proje yüklendi; değişiklikler persist edilmez.");
  }

  const contributionsVisible = showContributions && !focusMode;
  const channelsVisible = showChannels && !focusMode;

  return (
    <div
      className={`app-shell ${focusMode ? "focus-mode" : ""}`}
      data-fullscreen={fullscreen}
      style={pixelCssVariables() as CSSProperties}
    >
      <header className="command-bar">
        <button className="brand-block" onClick={() => setProjectDialogOpen(true)} type="button">
          <span className="brand-mark">SW</span>
          <span>STEMWEAVE</span>
        </button>

        <div className="project-heading">
          <strong>{project.name}</strong>
          <span>#{project.id.slice(0, 8)}</span>
        </div>

        <div aria-label="Proje müzik kuralları" className="rule-locks">
          <span title="Tempo şef onayı olmadan değiştirilemez">🔒 {project.bpm} BPM</span>
          <span title="Ölçü şef onayı olmadan değiştirilemez">🔒 {project.measure}</span>
          <span>{project.keySignature}</span>
          <span>{project.sampleRateHz / 1000} kHz</span>
        </div>

        <nav aria-label="Görünüm kontrolleri" className="view-controls">
          <button
            aria-pressed={showChannels}
            onClick={() => setShowChannels((value) => !value)}
            type="button"
          >
            KANAL <kbd>F6</kbd>
          </button>
          <button
            aria-pressed={showContributions}
            onClick={() => setShowContributions((value) => !value)}
            type="button"
          >
            KATKI <kbd>F7</kbd>
          </button>
          <button
            aria-pressed={focusMode}
            onClick={() => setFocusMode((value) => !value)}
            type="button"
          >
            ODAK <kbd>F9</kbd>
          </button>
          <button aria-pressed={fullscreen} onClick={() => void toggleFullscreen()} type="button">
            TAM EKRAN
          </button>
        </nav>
      </header>

      <section aria-label="Transport" className="transport-bar">
        <button aria-label="Başa sar" type="button">
          |◀
        </button>
        <button aria-label="Oynat" className="play-button" type="button">
          ▶
        </button>
        <button aria-label="Durdur" type="button">
          ■
        </button>
        <span className="time-display">001 . 01 . 000</span>
        <span className="transport-note">ÇİFT TIK: MARKER / CTRL+SÜRÜKLE: PAN</span>
      </section>

      <main className={`workspace ${contributionsVisible ? "with-contributions" : ""}`}>
        <Timeline
          clips={clips}
          contributions={demoContributions}
          markers={markers}
          measure={project.measure}
          onClipsChange={setClips}
          onMarkersChange={setMarkers}
          onStatus={setStatus}
          showChannels={channelsVisible}
        />

        {contributionsVisible ? (
          <aside aria-label="Gelen katkılar" className="contributions-panel">
            <div className="panel-heading">
              <span>GELEN SESLER</span>
              <strong>{demoContributions.length}</strong>
            </div>
            <p>Kartı aynı renkli enstrüman kanalına sürükleyin.</p>
            <div className="contribution-list">
              {demoContributions.map((contribution) => {
                const instrument = instrumentCatalog.find(
                  (item) => item.id === contribution.instrumentId,
                );
                if (instrument === undefined) return null;
                return (
                  <article
                    className="contribution-card"
                    draggable
                    key={contribution.id}
                    onDragStart={(event) => writeContributionDrag(event, contribution.id)}
                    style={{ "--card-color": instrument.colorHex } as CSSProperties}
                  >
                    <div className="contribution-title">
                      <InstrumentIcon iconKey={instrument.iconKey} />
                      <span>
                        <strong>{contribution.name}</strong>
                        <small>{instrument.displayName.toUpperCase()}</small>
                      </span>
                    </div>
                    <dl>
                      <div>
                        <dt>MÜZİSYEN</dt>
                        <dd>{contribution.musician}</dd>
                      </div>
                      <div>
                        <dt>REV</dt>
                        <dd>r{contribution.revision}</dd>
                      </div>
                    </dl>
                  </article>
                );
              })}
            </div>
          </aside>
        ) : null}
      </main>

      <footer className="status-bar">
        <span>{status}</span>
        <span>
          {clips.length} KLİP / {markers.length} MARKER
        </span>
      </footer>

      {focusMode ? (
        <button className="focus-exit" onClick={() => void leaveFocus()} type="button">
          ESC — ODAKTAN ÇIK
        </button>
      ) : null}

      {projectDialogOpen ? (
        <CreateProjectDialog
          onCancel={() => setProjectDialogOpen(false)}
          onCreate={createProject}
          onUseDemo={useDemo}
        />
      ) : null}
    </div>
  );
}
