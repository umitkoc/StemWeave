# Gereksinimler

Durum: Öneri

## Fonksiyonel gereksinimler

### Proje yönetimi

- **FR-001:** Şef ad, açıklama, BPM, ölçü, ton ve sample rate seçerek proje oluşturabilmelidir.
- **FR-002:** Sistem her proje kuralı değişikliğinde yeni bir `ProjectRuleVersion` üretmelidir.
- **FR-003:** Proje BPM değeri MVP’de 30–300 aralığında olmalıdır.
- **FR-004:** MVP ölçü seçenekleri 4/4, 3/4 ve 6/8 ile sınırlandırılmalıdır.
- **FR-005:** Ton bilgisi isteğe bağlı olabilmelidir.
- **FR-006:** Proje ayarlarını yalnızca şef veya proje sahibi değiştirebilmelidir.
- **FR-007:** Tempo değişiklikleri mevcut katkıları sessizce değiştirmemelidir.

### Üyelik ve roller

- **FR-010:** Proje sahibi kullanıcıları projeye davet edebilmelidir.
- **FR-011:** Her üyenin proje bazında bir veya daha fazla rolü olabilmelidir.
- **FR-012:** Yetki kontrolleri hem istemcide hem API tarafında yapılmalıdır.
- **FR-013:** Viewer yalnızca yayınlanan sürümleri görebilmelidir.

### Enstrüman uygulaması

- **FR-020:** Uygulama projeye bağlandığında güncel proje manifestini almalıdır.
- **FR-021:** Metronom proje BPM’sine göre çalışmalıdır.
- **FR-022:** Kayıt başlangıcı ölçü/vuruş ızgarasına hizalanmalıdır.
- **FR-023:** Piyano uygulaması nota başlangıcı, süresi, velocity ve sustain olaylarını kaydetmelidir.
- **FR-024:** Katkı paketi MIDI olayları, metadata ve ön dinleme sesini içermelidir.
- **FR-025:** Uygulama ana proje BPM’sinden farklı gönderim yapmak isterse tempo değişiklik isteği oluşturmalıdır.
- **FR-026:** Onaysız farklı BPM kaydı ana katkı havuzuna alınmamalıdır.

### Katkı ve varlık yönetimi

- **FR-030:** Her katkı değiştirilemez bir kaynak varlığa bağlanmalıdır.
- **FR-031:** Aynı katkının her yeniden gönderimi yeni revizyon olmalıdır.
- **FR-032:** Ses dosyası yüklenirken tür, boyut, checksum ve teknik özellikler doğrulanmalıdır.
- **FR-033:** Desteklenen MVP ses biçimleri WAV ve FLAC olmalıdır.
- **FR-034:** Ön dinleme için ayrı, daha küçük bir proxy dosyası üretilebilmelidir.
- **FR-035:** Silme işlemi varsayılan olarak soft-delete olmalıdır.

### Timeline

- **FR-040:** Gelen katkılar sağ panelde listelenmelidir.
- **FR-041:** Şef katkıyı uygun enstrüman kanalına sürükleyebilmelidir.
- **FR-042:** Klip başlangıcı müzikal tick cinsinden saklanmalıdır; piksel konumu veri olmamalıdır.
- **FR-043:** Klip sağa-sola taşınabilmelidir.
- **FR-044:** Klip başlangıç ve bitiş noktaları kaynağı bozmadan kırpılabilmelidir.
- **FR-045:** Timeline yatay ve dikey kaydırılabilmelidir.
- **FR-046:** `Ctrl + fare sürükleme` görünümü kaydırmalıdır.
- **FR-047:** Üst cetvel ölçüleri göstermeli ve marker eklemelidir.
- **FR-048:** Sol kanal ve sağ katkı panelleri düğme/kısayolla kapatılabilmelidir.
- **FR-049:** Odak modunda yalnızca müzik timeline alanı görünmelidir.
- **FR-050:** Undo/redo eylem geçmişi bulunmalıdır.

### İnceleme ve sürümleme

- **FR-060:** Şef bir klip veya zaman aralığına yorum yazabilmelidir.
- **FR-061:** Yorum bir kullanıcıya atanabilmelidir.
- **FR-062:** Atanan kullanıcı bildirim almalıdır.
- **FR-063:** İşlenmiş ses kaynak varlığın altında yeni bir `ProcessingRevision` olmalıdır.
- **FR-064:** Şef kaynak ve işlenmiş sürümü A/B dinleyebilmelidir.
- **FR-065:** Şef değişiklik isteyebilmeli, onaylayabilmeli veya revizyonu pasif yapabilmelidir.
- **FR-066:** Merge işlemi aktif revizyon işaretini atomik olarak güncellemelidir.

### Export ve yayın

- **FR-070:** Şef timeline’dan stereo WAV ön miks isteyebilmelidir.
- **FR-071:** Render arka plan işi olarak yürütülmelidir.
- **FR-072:** Başarılı render değiştirilemez bir `ReleaseCandidate` üretmelidir.
- **FR-073:** MVP’de yalnızca şef yayın adayı oluşturabilmelidir.

## Fonksiyonel olmayan gereksinimler

- **NFR-001:** Center macOS ve Windows’ta çalışmalıdır; Linux topluluk hedefidir.
- **NFR-002:** Timeline 50 kanal ve 500 klipte kullanıcı hareketlerine görünür gecikme oluşturmamalıdır.
- **NFR-003:** Yerel ön dinleme kontrollerinin hedef tepkisi 100 ms altında olmalıdır.
- **NFR-004:** Mobil piyano dokunma-ses gecikmesi cihaz testinde ölçülmeli; MVP kabul hedefi 35 ms veya daha iyi olmalıdır.
- **NFR-005:** Büyük dosya yükleme yeniden denenebilir ve checksum ile doğrulanabilir olmalıdır.
- **NFR-006:** API işlemleri proje rolü ve kaynak sahipliğiyle yetkilendirilmelidir.
- **NFR-007:** Parolalar seçilen kimlik sağlayıcı tarafından güvenli biçimde yönetilmelidir; düz metin tutulmamalıdır.
- **NFR-008:** Loglarda erişim anahtarı, parola veya ham ses içeriği bulunmamalıdır.
- **NFR-009:** Tüm domain değişiklikleri audit event üretmelidir.
- **NFR-010:** Veri modeli PostgreSQL migration’larıyla sürümlenmelidir.
- **NFR-011:** Ortak sözleşmeler runtime doğrulama ve TypeScript tipi üretmelidir.
- **NFR-012:** UI yalnızca renge bağlı olmamalı; ikon ve metin de kullanmalıdır.
- **NFR-013:** Etkileşimli dokunma hedefleri mobilde yaklaşık 44×44 px olmalıdır.
- **NFR-014:** Kod ve dokümantasyon temiz kurulumdan CI içinde üretilebilmelidir.
- **NFR-015:** Üretim ses dosyaları Git’e commit edilmemelidir.

## MVP kabul koşulları

1. Temiz makinede belgelenen komutlarla yerel sistem ayağa kalkar.
2. Proje oluşturma ve manifest alma testleri geçer.
3. Piyano katkısı doğru BPM/ölçü metadata’sıyla yüklenir.
4. Yanlış proje kuralı sunucuda reddedilir veya değişiklik isteğine yönlendirilir.
5. Katkı timeline’a eklenir ve yeniden açıldığında aynı müzikal konumda görünür.
6. Revizyon ve yorum geçmişi kaybolmaz.
7. WAV ön miks işi tamamlanır ve indirilebilir.
8. Şef dışındaki kullanıcı korunan işlemleri yapamaz.
