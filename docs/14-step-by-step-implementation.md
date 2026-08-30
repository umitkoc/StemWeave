# Adım adım uygulama planı

Durum: Öneri

Her adım çalışan, test edilen ve dokümante edilen bir sonuç üretmeden sonraki adıma geçilmez.

## Adım 0 — Kararları kapat

### Yapılacaklar

- [ ] `StemWeave` çalışma adını kabul et veya yeni adı belirle.
- [ ] Kod lisansını seç: öneri Apache-2.0.
- [ ] MVP işletim sistemlerini kesinleştir: macOS + Windows.
- [ ] İlk piyano sample kaynağı ve lisansını belirle.
- [ ] Tek geliştirici/ekip kapasitesini yol haritasına yaz.
- [ ] MVP dışı kapsamı onayla.

### Çıkış kriteri

`16-decisions-risks-open-questions.md` içindeki P0 sorular kapalıdır.

## Adım 1 — GitHub repo ve monorepo iskeleti

### Yapılacaklar

- [x] GitHub organization/repo oluştur.
- [x] `main` protection ayarla.
- [x] pnpm workspace oluştur.
- [x] Turborepo pipeline oluştur.
- [x] TypeScript, lint ve format temelini kur.
- [x] `apps`, `services`, `packages`, `infrastructure` klasörlerini oluştur.
- [x] README, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT ve GOVERNANCE ekle.
- [x] İlk CI workflow’u ekle.

### Test

- [x] Kilitli bağımlılıklar `pnpm install --frozen-lockfile` ile kurulabilir.
- [x] `pnpm lint`, `pnpm typecheck`, `pnpm test` boş iskelette geçer.

### Çıkış kriteri

İlk korumalı PR CI üzerinden merge edilir.

### Yerel durum — 31 Ağustos 2026

Monorepo ve workflow dosyaları yerelde hazırlandı. SSH adresi alındıktan sonra repository remote olarak eklendi, `CODEOWNERS` güncellendi, issue template ve güvenlik bağlantıları düzeltildi, ilk push işlemi gerçekleştirildi. Lisans dosyası, Adım 0'daki lisans kararı verilmeden bilinçli olarak eklenmemiştir.

## Adım 2 — Yerel altyapı

### Yapılacaklar

- [x] `compose.yaml` oluştur.
- [x] PostgreSQL healthcheck ekle.
- [x] Local asset volume oluştur.
- [x] `.env.example` oluştur.
- [x] API ve worker Dockerfile taslaklarını ekle.
- [x] Drizzle bağlantısı ve migration komutları ekle.

### Test

- [x] Boş volume’da migration çalışır.
- [ ] İkinci migration çalıştırması veri bozmaz.
- [ ] API readiness PostgreSQL yokken başarısız, varken başarılıdır.

### Çıkış kriteri

Yeni geliştirici README adımlarıyla 15 dakikada altyapıyı açabilir.

## Adım 3 — Ortak sözleşmeler

### Yapılacaklar

- [ ] `ProjectManifest` Zod schema oluştur.
- [ ] `ContributionManifest` schema oluştur.
- [ ] `InstrumentDefinition` schema oluştur.
- [ ] `TempoChangeRequest` schema oluştur.
- [ ] Contract version ve hata kodlarını tanımla.
- [ ] Örnek valid/invalid fixture’lar ekle.

### Test

- [ ] Center ve piano aynı fixture’ı parse eder.
- [ ] BPM, ölçü ve checksum sınır testleri geçer.
- [ ] Eski/gelecek schema version kontrollü hata üretir.

### Çıkış kriteri

Contract paketi API, Center ve mobile tarafından import edilebilir.

## Adım 4 — Project, üyelik ve roller API’si

### Yapılacaklar

- [ ] Development auth adapter ekle.
- [ ] User/project/membership tablolarını migrate et.
- [ ] Proje oluşturma endpoint’i.
- [ ] ProjectManifest endpoint’i.
- [ ] Davet ve rol endpoint’leri.
- [ ] RBAC policy testleri.
- [ ] Audit event üretimi.

### Test

- [ ] Proje + ilk rule version transaction testi.
- [ ] Şef/müzisyen/viewer yetki matrisi integration testi.
- [ ] Son owner’ın ayrılamaması testi.

### Çıkış kriteri

API üzerinden proje oluşturulup piyano rolü atanabilir.

## Adım 5 — Center desktop kabuğu

### Yapılacaklar

- [ ] Tauri + React uygulaması oluştur.
- [ ] Consolas ve pixel design token’larını ekle.
- [ ] Enstrüman katalog renk/ikon paketini bağla.
- [ ] Proje oluşturma ekranı.
- [ ] BPM/ölçü kilit göstergesi.
- [ ] Siyah-beyaz timeline ızgarası.
- [ ] Üst cetvel ve marker.
- [ ] Horizontal/vertical scroll.
- [ ] Ctrl + fare pan.
- [ ] F6 kanal paneli, F7 katkılar, F9 odak modu.
- [ ] Fullscreen API adaptörü ve Escape davranışı.

### Test

- [ ] Keyboard shortcut component testleri.
- [ ] 50 track/500 clip sentetik performans testi.
- [ ] Windows/macOS görsel smoke test.

### Çıkış kriteri

Persist edilmemiş demo blokları sürüklenebilir ve timeline akıcıdır.

## Adım 6 — Mobil piano audio spike

### Yapılacaklar

- [ ] Expo development build oluştur.
- [ ] 10+ eşzamanlı nota sample playback.
- [ ] Key count ve octave kaydırma.
- [ ] Velocity yaklaşımı.
- [ ] Sustain.
- [ ] Metronom ve count-in.
- [ ] MIDI event recording.
- [ ] Undo/redo, stop ve başa sar.
- [ ] iOS ve Android fiziksel cihaz ölçümü.

### Test

- [ ] Dokunma-ses latency ölçüm raporu.
- [ ] Nota kaybı ve stuck-note testi.
- [ ] Arka plan/telefon araması güvenli durdurma testi.

### Çıkış kriteri

35 ms hedefi karşılanır veya native engine kararı ADR olarak kaydedilir.

## Adım 7 — Asset ve contribution upload

### Yapılacaklar

- [ ] Asset/contribution migration’ları.
- [ ] Upload session lifecycle.
- [ ] Local storage adapter.
- [ ] SHA-256 doğrulama.
- [ ] Dosya boyutu ve format limitleri.
- [ ] Worker analyze job.
- [ ] Piyano app’ten MIDI JSON + preview WAV gönderimi.
- [ ] Center Gelen Sesler paneli.

### Test

- [ ] Kesilen upload tekrar deneme testi.
- [ ] Yanlış checksum testi.
- [ ] Yanlış rule version testi.
- [ ] Yetkisiz instrument upload testi.

### Çıkış kriteri

Gerçek cihazdaki dört ölçü piyano kaydı Center’da mavi/ikonlu kart olarak görünür.

## Adım 8 — Persist edilen timeline

### Yapılacaklar

- [ ] Branch/commit/track/clip migration’ları.
- [ ] Katkıyı track’e drop endpoint’i.
- [ ] Move, trim, mute, solo işlemleri.
- [ ] Optimistic concurrency/version.
- [ ] Undo/redo command stack.
- [ ] Arrangement commit üretimi.
- [ ] Projeyi yeniden açınca state restore.

### Test

- [ ] Pikselden tick’e dönüşüm property testleri.
- [ ] Eşzamanlı güncelleme conflict testi.
- [ ] Yanlış instrument drop testi.
- [ ] Undo/redo round-trip testi.

### Çıkış kriteri

Şef klibi ekleyip taşıdıktan sonra uygulamayı kapatıp aynı konumu görebilir.

## Adım 9 — Tempo değişiklik akışı

### Yapılacaklar

- [ ] Tempo request endpoint ve ekranı.
- [ ] Reject/branch/project kararları.
- [ ] Yeni rule version üretimi.
- [ ] Eski contribution uyumluluk durumları.
- [ ] Bildirimler.

### Test

- [ ] Müzisyen doğrudan global BPM değiştiremez.
- [ ] Branch onayı main’i değiştirmez.
- [ ] Project onayı tüm istemcilere yeni manifest verir.

### Çıkış kriteri

90 BPM isteği deneme branch’ine güvenle yönlendirilebilir.

## Adım 10 — Review, revision ve merge

### Yapılacaklar

- [ ] Processing request/revision migration’ları.
- [ ] Zaman kodlu review thread.
- [ ] Kullanıcı atama ve notification.
- [ ] İşlenmiş WAV upload.
- [ ] Kaynak/revision A/B player.
- [ ] Changes requested döngüsü.
- [ ] Atomic merge.

### Test

- [ ] Orijinal asset’in değişmediğini kanıtlayan test.
- [ ] Aynı anda iki merge conflict testi.
- [ ] Yetkisiz merge testi.
- [ ] Comment time-range testi.

### Çıkış kriteri

Şef ikinci mix revision’ı onaylayabilir ve birinci revision geçmişte kalır.

## Adım 11 — Audio render ve release candidate

### Yapılacaklar

- [ ] PostgreSQL job claim/retry.
- [ ] Arrangement snapshot.
- [ ] FFmpeg adapter.
- [ ] Offset, trim, gain ve pan.
- [ ] Stereo PCM WAV çıktı.
- [ ] Release candidate ekranı.
- [ ] İndirme ve checksum.

### Test

- [ ] Aynı snapshot iki render’da aynı teknik sonucu üretir.
- [ ] Worker crash/retry testi.
- [ ] Eksik asset testi.
- [ ] Timeout ve büyük dosya limiti.

### Çıkış kriteri

Şef Center’dan çalışan WAV ön miks indirebilir.

## Adım 12 — Alpha hardening

### Yapılacaklar

- [ ] OIDC production auth adapter seç/uygula.
- [ ] Security review.
- [ ] SBOM ve dependency scan.
- [ ] macOS ve Windows paketleme.
- [ ] Veri export/delete akışı.
- [ ] Accessibility kontrolü.
- [ ] Katkı ve kurulum rehberi.
- [ ] Alpha release notu.

### Çıkış kriteri

MVP kabul koşullarının tamamı CI ve manuel test raporunda geçer.
