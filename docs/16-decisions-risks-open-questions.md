# Kararlar, riskler ve açık sorular

Son güncelleme: 31 Ağustos 2026

## Kabul edilmiş çalışma kararları

| Kimlik | Karar                                         | Durum                | Gerekçe                                    |
| ------ | --------------------------------------------- | -------------------- | ------------------------------------------ |
| D-001  | İlk çalışma adı `StemWeave`                   | Geçici kabul         | Stem katkıları ve birlikte örme fikri      |
| D-002  | MVP monorepo                                  | Öneri kabul bekliyor | Ortak contract ve atomik PR                |
| D-003  | Center + tek piyano vertical slice birlikte   | Öneri kabul bekliyor | İki tarafın protokolünü erken doğrulamak   |
| D-004  | Modüler monolit + ayrı worker                 | Öneri kabul bekliyor | Mikroservis operasyon yükünden kaçınmak    |
| D-005  | Tauri + React desktop                         | Öneri kabul bekliyor | Küçük desktop kabuk ve Rust genişleme yolu |
| D-006  | React Native + Expo development build         | Öneri kabul bekliyor | Ortak TypeScript ve native module desteği  |
| D-007  | PostgreSQL metadata ve ilk job queue          | Öneri kabul bekliyor | Daha az servis ve güçlü transaction        |
| D-008  | Orijinal asset immutable                      | Kabul                | Geri dönüş, audit ve A/B karşılaştırma     |
| D-009  | Proje BPM/ölçü kilitli; değişiklik şef onaylı | Kabul                | Ana müzikal sözleşmeyi korumak             |
| D-010  | Enstrüman rengi durumu değil kimliği gösterir | Kabul                | Timeline okunabilirliği                    |
| D-011  | Pixel tema + Consolas                         | Kabul                | Basit ve ayırt edici ürün dili             |
| D-012  | MVP’de profesyonel mix/mastering yok          | Kabul                | Kapsam ve teslim riski                     |

## P0 — Kod başlamadan kapanmalı

1. **İsim kesin mi?** `StemWeave` repo adı olarak kullanılacak mı?
2. **Lisans:** Apache-2.0 önerisi kabul ediliyor mu?
3. **Ekip kapasitesi:** Tek geliştirici tam zamanlı varsayımı doğru mu?
4. **Platform:** İlk alpha macOS + Windows mu?
5. **Piyano sample:** Hangi lisanslı sample paketi kullanılacak?
6. **Mobil audio:** Spike sonucunda hangi engine seçilecek?
7. **Kimlik:** Public alpha için hangi OIDC sağlayıcı/adaptör kullanılacak?

## P1 — M3 öncesi kapanmalı

1. Velocity parmak temas alanı, basılı kalma süresi veya cihaz pressure verisinden nasıl üretilecek?
2. MIDI formatı standard MIDI file mı, domain event JSON mı, ikisi birden mi?
3. Piyano uygulaması offline taslak saklayacak mı?
4. Maksimum contribution dosya boyutu nedir?
5. WAV zorunlu bit depth 24 mü 16 mı?

## P2 — Alpha öncesi kapanmalı

1. Proje daveti e-posta mı, kod mu, ikisi mi?
2. Viewer sosyal yorumları MVP’ye alınacak mı?
3. Telemetry varsayılan açık mı kapalı mı?
4. Veri ve asset retention süreleri nedir?
5. Self-host rehberi public alpha ile yayımlanacak mı?

## Risk matrisi

| Risk                                  | Olasılık | Etki   | Azaltma                                                |
| ------------------------------------- | -------- | ------ | ------------------------------------------------------ |
| Mobil latency hedefi tutmaz           | Yüksek   | Yüksek | İlk hafta gerçek cihaz spike; native module çıkış yolu |
| Sample lisansı uygun değildir         | Orta     | Yüksek | Koddan ayrı asset manifest ve hukuk/lisans kontrolü    |
| Timeline performansı düşer            | Orta     | Yüksek | Canvas/virtualization spike; 50/500 bütçe testi        |
| FFmpeg dağıtım lisansı karışır        | Orta     | Yüksek | PCM/FLAC kapsamı, build flags ve release checklist     |
| Upload veri kaybı                     | Orta     | Yüksek | Checksum, resumable tasarım, asset state machine       |
| Git-benzeri model fazla karmaşık olur | Yüksek   | Orta   | İlk MVP tek main branch; commit operasyon logu sınırlı |
| Tek geliştirici bağlam değiştirir     | Yüksek   | Orta   | Vertical slice ve WIP limiti 1                         |
| İsim çakışması çıkar                  | Orta     | Orta   | Repo açmadan marka/domain/GitHub tam kontrolü          |
| Docker Desktop maliyet koşulu değişir | Düşük    | Orta   | Compose standardı ve alternatif runtime desteği        |

## Karar kaydı şablonu

```text
Kimlik: D-XXX
Tarih:
Durum: Öneri | Kabul | Değiştirildi | İptal
Bağlam:
Karar:
Alternatifler:
Sonuçlar:
İlgili belgeler:
```

## Değişiklik yönetimi

Bir P0 kararı değişirse aşağıdakiler kontrol edilmelidir:

- README teknik özet
- Gereksinim kimlikleri
- Mimari ve sequence diyagramları
- Database migration etkisi
- GitHub milestone ve tarih
- Test kabul kriteri
