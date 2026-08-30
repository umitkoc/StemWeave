# Teknoloji ve ürün seçimleri

Durum: Öneri

## Seçim yaklaşımı

MVP; ücretsiz başlanabilen, açık kaynak, yerelde çalışabilen ve ücretli servise kilitlenmeyen bileşenler üzerine kurulacaktır. Dış servislerin arkasında adaptör arayüzü bulunacaktır.

## Ana seçimler

| Alan                 | Seçim                                 |                          MVP maliyeti | Lisans/Not                                              |
| -------------------- | ------------------------------------- | ------------------------------------: | ------------------------------------------------------- |
| Dil                  | TypeScript                            |                              Ücretsiz | Açık kaynak araç zinciri                                |
| Monorepo             | pnpm workspace + Turborepo            |                              Ücretsiz | Açık kaynak                                             |
| Desktop kabuk        | Tauri 2                               |                              Ücretsiz | MIT veya Apache-2.0                                     |
| Center UI            | React + TypeScript                    |                              Ücretsiz | MIT                                                     |
| Mobil                | React Native + Expo development build |             Ücretsiz yerel geliştirme | Expo araçları MIT; EAS isteğe bağlı hizmet              |
| API                  | Node.js LTS + Fastify                 |                              Ücretsiz | Açık kaynak                                             |
| Sözleşme doğrulama   | Zod + JSON Schema                     |                              Ücretsiz | Açık kaynak                                             |
| Veritabanı           | PostgreSQL                            |                              Ücretsiz | PostgreSQL License                                      |
| ORM/migration        | Drizzle ORM + SQL migration           |                              Ücretsiz | Apache-2.0                                              |
| Desktop preview      | Web Audio API                         |                              Ücretsiz | Platform API’si                                         |
| Audio işleme         | FFmpeg CLI adaptörü                   |                              Ücretsiz | Yapıya göre LGPL/GPL; dağıtım denetimi gerekli          |
| Dosya saklama        | Local filesystem adapter              |                              Ücretsiz | MVP geliştirme ortamı                                   |
| Üretim dosya saklama | S3-compatible adapter                 |                     Sağlayıcıya bağlı | Sağlayıcı değiştirilebilir                              |
| Container            | Docker Engine + Docker Compose        |             Ücretsiz çekirdek araçlar | Docker Desktop kullanım koşulları ayrıca kontrol edilir |
| Test                 | Vitest + Playwright                   |                              Ücretsiz | Açık kaynak                                             |
| CI/CD                | GitHub Actions                        | Açık kaynak kotası dahilinde ücretsiz | Kullanıma göre ücretli olabilir                         |

## Desktop Center

### Tauri neden seçildi?

- React arayüzünü masaüstü uygulamasına paketler.
- Rust tarafına gerektiğinde yerel dosya ve ses yetenekleri eklenebilir.
- İşletim sisteminin webview bileşenini kullanır.
- Electron’a göre daha küçük paket hedeflenebilir.
- UI ile yerel yetenekler mesaj tabanlı ve sınırlı izinlerle ayrılır.

### İlk uygulama sınırı

Tauri yalnızca desktop kabuğu, güvenli dosya iletişimi ve uygulama yaşam döngüsünü yönetir. Domain kuralları React bileşenlerine gömülmez; ortak `packages/domain` ve API’de bulunur.

## Mobil piyano

React Native ekibi yeni uygulamalarda bir framework kullanılmasını önerir; Expo açık kaynak framework ve yerel kod destekli development build sağlar. Expo Go, düşük gecikmeli özel audio modülleri için yeterli kabul edilmeyecektir.

### Araştırma kapısı: düşük gecikmeli audio

İlk haftada iki gerçek cihaz üzerinde teknik spike yapılacaktır:

1. Aynı anda en az 10 nota çalma
2. Velocity ve sustain
3. Dokunma-ses gecikmesi ölçümü
4. iOS sessiz mod ve Android audio focus davranışı
5. Uygulama arka plana geçtiğinde güvenli durdurma
6. Sample preload ve bellek tüketimi

Kabul hedefi sağlanmazsa UI React Native kalır, audio engine Swift/Kotlin native module olarak geliştirilir.

## API ve modüler monolit

MVP’de mikroservis kullanılmayacaktır. Tek deploy edilen API içinde şu modüller bulunacaktır:

- Identity
- Projects
- Membership/RBAC
- Project Rules
- Instruments
- Contributions
- Assets
- Arrangement
- Review
- Notifications
- Releases
- Audit

CPU yoğun render işleri ayrı `audio-worker` sürecinde yürütülür. API ve worker aynı domain paketlerini kullanır.

## PostgreSQL

PostgreSQL tek kalıcı metadata kaynağıdır. JSONB yalnızca değişken ama doğrulanan metadata ve processing recipe için kullanılır; sorgulanacak temel alanlar normal kolonlarda tutulur.

Redis ilk MVP’de kullanılmayacaktır. İş kuyruğu PostgreSQL job tablosu ve `FOR UPDATE SKIP LOCKED` yaklaşımıyla başlatılır. Ölçek ihtiyacı kanıtlanırsa queue adaptörü eklenir.

## Ses dosyaları

- Veritabanında binary ses tutulmaz.
- Veritabanında storage key, checksum, mime type ve teknik metadata tutulur.
- Yerel geliştirmede dosyalar bind-mounted klasörde saklanır.
- Üretimde S3-compatible storage adapter kullanılır.
- Büyük dosya yükleme için ileride multipart/presigned upload eklenir.
- Sample paketleri ayrı manifest ve lisans dosyasına sahip olur.

## FFmpeg lisans notu

FFmpeg temel olarak LGPL 2.1+ kapsamındadır; bazı isteğe bağlı parçalar etkinleştirilirse GPL uygulanır. Dağıtılan binary’nin derleme bayrakları ve codec lisansları release öncesi kontrol edilmelidir. MVP ilk olarak PCM WAV/FLAC akışına odaklanır.

## Docker Desktop notu

Docker Desktop kişisel kullanım, eğitim, ticari olmayan açık kaynak ve belirli küçük işletmeler için ücretsizdir; büyük işletmelerde ücretli abonelik gerekebilir. Dokümanlar Docker Compose standardını hedefler. Geliştirici Docker Desktop yerine uyumlu bir container runtime kullanabilir.

## Sürüm politikası

- Belgede sabit patch sürümü tutulmaz.
- Repo oluşturulurken güncel LTS/kararlı sürümler pinlenir.
- Lockfile commit edilir.
- Renovate veya Dependabot haftalık PR açar.
- Major sürüm yükseltmeleri ADR ve manuel test gerektirir.

## Resmî kaynaklar

- [Tauri mimarisi](https://v2.tauri.app/concept/architecture/)
- [React Native başlangıç](https://reactnative.dev/docs/getting-started)
- [Expo geliştirme yaklaşımı](https://docs.expo.dev/workflow/overview/)
- [PostgreSQL lisansı](https://www.postgresql.org/about/licence/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Docker Desktop koşulları](https://docs.docker.com/desktop/setup/install/windows-install/)
- [FFmpeg lisans açıklaması](https://ffmpeg.org/legal.html)
