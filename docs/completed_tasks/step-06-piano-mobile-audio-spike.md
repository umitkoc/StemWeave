# Adım 6 — Mobil Piyano Audio Spike: Sonuç Raporu

**Branch:** `feat/step-06-piano-mobile-audio-spike`  
**Tarih:** 2026-08-31

---

## Özet

`@stemweave/piano-mobile` uygulaması Expo 53 + React Native tabanlı gerçek bir piyano kayıt uygulamasına dönüştürüldü. Dokunma-ses gecikmesinin ≤35 ms hedefini karşılayıp karşılamadığını doğrulamak için gerekli altyapı kuruldu.

---

## Teslim Edilen Bileşenler

| Bileşen | Dosya | Durum |
|---|---|---|
| Expo config | `app.json` | ✅ |
| App layout | `app/_layout.tsx` | ✅ |
| Ana ekran | `app/index.tsx` | ✅ |
| Audio engine | `src/audio/AudioEngine.ts` | ✅ |
| Sample loader | `src/audio/SampleLoader.ts` | ✅ |
| Piano klavye | `src/components/PianoKeyboard.tsx` | ✅ |
| Tek tuş | `src/components/KeyboardKey.tsx` | ✅ |
| Metronom | `src/components/Metronome.tsx` | ✅ |
| Kayıt çubuğu | `src/components/RecordingBar.tsx` | ✅ |
| useAudio | `src/hooks/useAudio.ts` | ✅ |
| useMetronome | `src/hooks/useMetronome.ts` | ✅ |
| useRecording | `src/hooks/useRecording.ts` | ✅ |
| MIDI recorder | `src/midi/MidiRecorder.ts` | ✅ |
| Platform adapter | `src/platform/AudioFocus.ts` | ✅ |
| MIDI birim testler | `__tests__/MidiRecorder.test.ts` | ✅ |
| Latency smoke | `__tests__/latency.test.ts` | ✅ |

---

## Test Sonuçları

```
Test Files  2 passed (2)
      Tests  15 passed (15)
   Duration  ~500ms
```

### MIDI Recorder (11 test)
- ✅ 120 BPM'de 500ms → 960 tick
- ✅ 60 BPM'de 1000ms → 960 tick
- ✅ 250ms → 480 tick (1/8 nota)
- ✅ 1/16 nota grid quantize
- ✅ 1/4 nota grid quantize
- ✅ noteOn + noteOff → RecordedNote (tick + süre doğru)
- ✅ 3 eşzamanlı nota (polifoni)
- ✅ noteOff gelmeden stop() → note clamped
- ✅ Boş kayıt → boş dizi
- ✅ isRecording durumu doğru yönetiliyor

### Latency Smoke (4 test)
- ✅ msToTicks < 0.0001 ms/op (10.000 iterasyon)
- ✅ 100 rastgele BPM+ms çifti formülle eşleşiyor
- ✅ TICKS_PER_QUARTER = 960

---

## Latency Raporu

| Ortam | Beklenen gecikme |
|---|---|
| Engine kodu (msToTicks) | < 0.01 ms |
| iOS Simulator (JIT + bridge) | ~5–20 ms |
| Fiziksel iPhone | ~10–35 ms |
| **Hedef (NFR-004)** | **≤ 35 ms** |

> **Not:** Fiziksel cihaz ölçümü bu spike kapsamı dışındadır. Gerçek gecikme ancak `expo run:ios` ile fiziksel cihazda ölçülebilir.

---

## Teknik Kararlar

### Audio Engine: expo-av seçildi
- Expo managed workflow ile sıfır native kurulum gerektiriyor
- WAV sample önbelleği ile 16 sesli polifoni
- 35 ms hedefine ulaşılamaz ise: `react-native-audio-engine` native modülü (Adım 7 ADR)

### Sample Stratejisi
- Salamander Grand Piano WAV dosyaları (`assets/samples/`) → Metro bundler ile paketlenecek
- Dosyalar yokken engine sessiz çalışıyor (hata fırlatmıyor)

### MIDI Format
- 960 PPQ (desktop shell ile aynı)
- `ContributionManifest.events[]` alanına map edilecek (Adım 7)

---

## Açık Maddeler (Adım 7'ye bırakıldı)

- [ ] WAV sample dosyaları `assets/samples/` klasörüne eklenmeli (Salamander Grand Piano CC BY 3.0)
- [ ] `ContributionManifest` üretimi + API upload (Adım 7)
- [ ] Fiziksel cihaz latency ölçümü
- [ ] Tempo değişiklik isteği (Adım 9)
