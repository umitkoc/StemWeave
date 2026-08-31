import type { FormEvent } from "react";
import { useState } from "react";

import type { CreateProjectInput } from "../api/project-api";

type CreateProjectDialogProps = {
  readonly onCancel: () => void;
  readonly onCreate: (input: CreateProjectInput) => Promise<void>;
  readonly onUseDemo: () => void;
};

export function CreateProjectDialog({ onCancel, onCreate, onUseDemo }: CreateProjectDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const values = new FormData(event.currentTarget);
    const description = String(values.get("description") ?? "").trim();
    const keySignature = String(values.get("keySignature") ?? "").trim();
    const input: CreateProjectInput = {
      bpm: Number(values.get("bpm")),
      countInBars: Number(values.get("countInBars")),
      ...(description.length === 0 ? {} : { description }),
      ...(keySignature.length === 0 ? {} : { keySignature }),
      measure: String(values.get("measure")) as CreateProjectInput["measure"],
      name: String(values.get("name") ?? "").trim(),
    };

    setIsSaving(true);
    try {
      await onCreate(input);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Proje oluşturulamadı.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div aria-modal="true" className="dialog-backdrop" role="dialog">
      <form className="pixel-dialog" onSubmit={(event) => void submit(event)}>
        <div className="dialog-titlebar">
          <h2>YENİ PROJE</h2>
          <button
            aria-label="Pencereyi kapat"
            className="icon-button"
            onClick={onCancel}
            type="button"
          >
            ×
          </button>
        </div>

        <label>
          PROJE ADI
          <input
            autoFocus
            maxLength={160}
            minLength={1}
            name="name"
            required
            defaultValue="Yeni Beste"
          />
        </label>

        <label>
          AÇIKLAMA
          <textarea
            maxLength={4000}
            name="description"
            rows={3}
            defaultValue="İlk ortak düzenleme"
          />
        </label>

        <div className="form-grid">
          <label>
            BPM
            <input defaultValue={120} max={300} min={30} name="bpm" required type="number" />
          </label>
          <label>
            ÖLÇÜ
            <select defaultValue="4/4" name="measure">
              <option>4/4</option>
              <option>3/4</option>
              <option>6/8</option>
            </select>
          </label>
          <label>
            TON
            <select defaultValue="C_MAJOR" name="keySignature">
              <option value="">Belirtilmedi</option>
              <option value="C_MAJOR">C Major</option>
              <option value="A_MINOR">A Minor</option>
              <option value="G_MAJOR">G Major</option>
              <option value="E_MINOR">E Minor</option>
            </select>
          </label>
          <label>
            COUNT-IN
            <select defaultValue="1" name="countInBars">
              <option value="0">Kapalı</option>
              <option value="1">1 ölçü</option>
              <option value="2">2 ölçü</option>
            </select>
          </label>
          <label>
            SAMPLE RATE
            <input aria-label="Sample rate" disabled value="48 kHz (MVP)" />
          </label>
        </div>

        {error === null ? null : <p className="form-error">HATA: {error}</p>}

        <div className="dialog-actions">
          <button className="pixel-button secondary" onClick={onUseDemo} type="button">
            DEMO AÇ
          </button>
          <button className="pixel-button" disabled={isSaving} type="submit">
            {isSaving ? "OLUŞTURULUYOR..." : "PROJEYİ OLUŞTUR"}
          </button>
        </div>
      </form>
    </div>
  );
}
