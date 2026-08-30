# Uçtan uca iş akışları

Durum: Öneri

## E2E-01 — İlk proje ve piyano katkısı

### Ön koşullar

- Şef hesabı vardır.
- Center ve piyano uygulaması API’ye erişebilir.
- PostgreSQL ve asset storage çalışır.

### Adımlar

1. Şef Center’da yeni proje açar.
2. 120 BPM, 4/4, C Major ve 48 kHz seçer.
3. API proje ve ilk rule version kaydını transaction içinde oluşturur.
4. Şef piyanisti davet eder.
5. Piyano uygulaması davet kodu/deep link ile projeye bağlanır.
6. Uygulama güncel ProjectManifest’i alır.
7. Metronom 120 BPM ve 4/4 olarak kilitlenir.
8. Piyanist bir ölçü count-in sonrasında dört ölçü çalar.
9. Uygulama nota, velocity ve sustain olaylarını kaydeder.
10. Uygulama MIDI event JSON ve preview WAV üretir.
11. API upload oturumu açar ve metadata’yı doğrular.
12. Dosyalar storage’a yazılır ve checksum kontrol edilir.
13. Worker ses metadata’sını çıkarır.
14. Katkı `READY_FOR_REVIEW` olur.
15. Center’daki Gelen Sesler panelinde mavi piyano kartı görünür.
16. Şef kartı piyano kanalında 1. ölçüye bırakır.
17. API TimelineClip oluşturur.
18. Center projeyi kapatıp açtığında aynı konum yüklenir.
19. Şef ön dinleme yapar ve katkıyı onaylar.
20. Şef stereo ön miks ister ve WAV indirir.

### Bitiş kriteri

Katkı kimliği, kaynak dosyası, rule version, timeline konumu ve onay event’i kaybolmadan izlenebilmelidir.

## E2E-02 — Farklı BPM isteği

1. Piyano uygulaması proje manifestinde 120 BPM görür.
2. Piyanist 90 BPM talebi açar ve gerekçe yazar.
3. Katkı ana havuza gönderilmez; yerel taslak olarak kalabilir.
4. Şef bildirim alır.
5. Şef talebi reddeder, deneme branch’i açar veya yeni proje kuralı olarak onaylar.
6. Onay ana projeyi etkiliyorsa yeni ProjectRuleVersion oluşur.
7. Mevcut katkılar `RECORD_AGAIN`, `KEEP_ORIGINAL` veya `TIME_STRETCH_REVIEW` durumuna alınır.
8. Her üye yeni manifest için bildirim alır.

## E2E-03 — Mix revizyonu

1. Şef bir klip için mix mühendisine görev atar.
2. Görev klip ve kaynak asset’e referans verir.
3. Mühendis kaynağı indirir veya desteklenen editörde açar.
4. İşlenmiş WAV ve processing recipe gönderir.
5. Yeni revision `SUBMITTED` olur.
6. Şef kaynak ve revision arasında A/B dinleme yapar.
7. Şef zaman aralığına yorum ekleyerek değişiklik ister.
8. Mühendis parent revision’a bağlı yeni revision gönderir.
9. Şef onaylar.
10. TimelineClip `active_processing_revision_id` alanı atomik olarak değişir.
11. Eski sürüm saklanır ancak pasif gösterilir.

## E2E-04 — Ön miks ve release candidate

1. Şef arrangement branch’in güncel commit’ini seçer.
2. Render isteği oluşturur.
3. Worker aktif klip ve revision listesini snapshot olarak alır.
4. Storage’dan asset’leri indirir.
5. Offset, trim, gain ve pan uygular.
6. Stereo PCM WAV üretir.
7. Checksum ve loudness metadata’sı kaydedilir.
8. ReleaseCandidate `READY` olur.
9. Şef dinler, reddeder veya yayın adayı olarak onaylar.

## Hata senaryoları

- Upload yarıda kesilirse oturum yeniden denenebilir.
- Checksum uyuşmazsa asset `REJECTED` olur.
- Rule version eskiyse katkı `RULE_MISMATCH` olur.
- Enstrüman kanalı uyuşmazsa timeline drop reddedilir.
- Render worker çökerse iş `RETRYABLE` olur; aynı idempotency key ile ikinci release üretilmez.
- Yetkisiz mutation `403` ve audit güvenlik olayı üretir.
