# Adım 5A — Music Center desktop temel kabuğu

**Durum**: Tamamlandı
**Tarih**: 31 Ağustos 2026

## Amaç

Music Center'ın gerçek React arayüzünü, Tauri 2 masaüstü sınırını ve temel pixel timeline etkileşimlerini kurmak. Bu alt teslimde timeline verileri demo belleğinde tutulur; veritabanına kalıcı kayıt Adım 8 kapsamındadır.

## Yapılanlar

- `@stemweave/center-desktop`, React 19 + Vite 8 uygulamasına dönüştürüldü.
- Tauri 2 Rust kabuğu, pencere ayarları, minimum capability izinleri ve Content Security Policy eklendi.
- `@stemweave/pixel-ui` içinde Consolas tabanlı renk, ölçü ve border token'ları oluşturuldu.
- Yedi enstrümanın katalog rengi, adı ve pixel SVG ikonu kanal/kart/klip üzerinde birlikte kullanıldı.
- API'ye bağlı proje oluşturma diyaloğu; BPM, ölçü, ton, count-in ve kilitli 48 kHz alanları eklendi.
- Center geliştirme origin'leri için dar kapsamlı Fastify CORS yapılandırması eklendi.
- BPM/ölçü/ton/sample rate kilit göstergeleri ve transport kabuğu oluşturuldu.
- Siyah-beyaz ölçü çizgili timeline, üst cetvel, marker, yatay/dikey scroll ve `Ctrl + fare` pan eklendi.
- Katkının yalnız aynı enstrüman kanalına sürüklenmesi ve klibin müzikal tick konumunda taşınması uygulandı.
- F6 kanal paneli, F7 katkı paneli, F9 odak modu ile fullscreen/Escape adapter'ı eklendi.
- `docs/completed_tasks/README.md` ile her gelecek görev için zorunlu sonuç kayıt standardı tanımlandı.

## Teknik kararlar

- Timeline kalıcı koordinatı piksel değil `tick`; MVP çözünürlüğü çeyrek nota başına 960 tick olarak korundu.
- Tauri API çağrıları adapter arkasına alındı. Böylece aynı UI, native runtime olmadan tarayıcı ve component testinde çalışabiliyor.
- UI bundle hedefi güncel macOS WebKit ve Windows WebView2 ortak tabanı için ES2020 seçildi.
- Enstrüman kimliği yalnız renkle anlatılmadı; ikon ve metin de gösterilerek NFR-012 korundu.
- Tauri capability yalnız `core:default` ve fullscreen yazma yetkisiyle sınırlandı.

## Doğrulama

- Center TypeScript typecheck başarılı.
- Center ESLint başarılı.
- Center component/unit: 2 dosyada 6 test başarılı.
- Katkı sürükle-bırak, F6/F7/F9, Escape ve fullscreen adapter davranışları test edildi.
- 50 kanal/500 klip sentetik layout testi 100 ms bütçesi altında başarılı.
- Pixel UI token testi başarılı.
- API unit: CORS testi dahil 8 test başarılı.
- Vite production build başarılı: yaklaşık 295 kB JavaScript, gzip yaklaşık 92 kB.
- 1280×720 yerel tarayıcı görsel smoke testi başarılı; marker ekleme ve panel kısayolları gerçek arayüzde doğrulandı.

## Bilinen sınırlamalar

- Geliştirme makinesinde `rustc` ve `cargo` bulunmadığından native Tauri derlemesi bu alt teslimde çalıştırılamadı.
- Windows native smoke testi Windows runner veya fiziksel Windows ortamı bekliyor.
- Timeline/marker/klip değişiklikleri henüz bellekte demo verisidir; yeniden açılışta saklanmaz.
- Transport düğmeleri bu aşamada görsel kabuktur; gerçek ses oynatma motoruna bağlı değildir.
- Profesyonel mix/mastering kontrolleri MVP'nin bu adımında kapsam dışıdır.

## İlgili gereksinimler

- FR-001, FR-003, FR-004
- FR-040–FR-049
- NFR-001, NFR-002, NFR-012, NFR-014

## Sonraki adım

Adım 5B'de Rust toolchain kurularak macOS native Tauri smoke/build doğrulanacak ve Windows build CI üzerinde çalıştırılacaktır. Ardından Adım 6 mobil piyano audio spike'ına geçilecektir.
