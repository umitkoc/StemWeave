# StemWeave

StemWeave, farklı enstrüman uygulamalarından gelen kayıtların bir şef tarafından ortak bir zaman çizelgesinde düzenlendiği, sürümlendiği, incelendiği ve yayınlandığı açık kaynak bir müzik iş birliği platformudur.

> Durum: Adım 4 backend dilimi çalışıyor. Henüz kullanıcıya dönük masaüstü/mobil arayüz yoktur.

## İlk MVP hedefi

Şefin 120 BPM ve 4/4 ölçüyle proje oluşturması, piyano uygulamasının bu kuralları alması, dört ölçülük bir katkı göndermesi ve katkının Music Center zaman çizelgesine renkli bir blok olarak yerleştirilmesidir.

## Çalışma biçimi

1. Önce belgeler üzerinde karar verilir.
2. Kararlar `docs/16-decisions-risks-open-questions.md` içinde kaydedilir.
3. Kabul edilen kararlar sözleşme ve testlere dönüştürülür.
4. Kod, `docs/14-step-by-step-implementation.md` sırasıyla geliştirilir.
5. Her aşama uçtan uca çalışan küçük bir ürün dilimiyle kapatılır.

## Dokümantasyon

Başlangıç noktası: [`docs/00-document-index.md`](docs/00-document-index.md)

## Yerel başlangıç

Önerilen çalışma ortamı Node.js 22.23.1 ve Corepack ile sağlanan pnpm 11.19.0'dır.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm check
pnpm build
```

`pnpm check`; biçim, Markdown bağlantıları, lint, TypeScript ve testleri tek komutta denetler.

PostgreSQL ve API entegrasyon testi:

```bash
docker compose -f infrastructure/compose.yaml up -d postgres
pnpm --filter @stemweave/db db:migrate
pnpm test:integration
```

## Monorepo yerleşimi

| Yol                     | Sorumluluk                                             |
| ----------------------- | ------------------------------------------------------ |
| `apps/center-desktop`   | Music Center masaüstü uygulama sınırı                  |
| `apps/piano-mobile`     | İlk mobil enstrüman uygulaması sınırı                  |
| `services/api`          | Modüler monolit API sınırı                             |
| `services/audio-worker` | Render ve ses analizi işçisi sınırı                    |
| `packages/*`            | Paylaşılan sözleşme, domain, SDK, UI ve test paketleri |
| `infrastructure`        | Docker ve dağıtım dosyaları; Adım 2'de uygulanacak     |

## Geçici teknik özet

- Monorepo: pnpm workspace + Turborepo
- Desktop Center: Tauri + React + TypeScript
- İlk enstrüman: React Native + Expo development build
- API: TypeScript tabanlı modüler monolit
- Veritabanı: PostgreSQL
- Dosya saklama: yerel dosya sistemi adaptörü; daha sonra S3 uyumlu adaptör
- Preview: Web Audio API
- Render/analiz: ayrı audio worker ve FFmpeg adaptörü
- Yerel servisler: Docker Compose

## İsim notu

`StemWeave` çalışma adıdır. Repo ve paket isimleri yayımlanmadan önce GitHub organizasyonu, alan adı ve marka uygunluğu ayrıca doğrulanmalıdır.
