# Ürün vizyonu ve kapsam

Durum: Öneri

## Problem

Birden fazla müzisyen farklı cihaz ve uygulamalarda kayıt üretirken tempo, ölçü, dosya formatı, sürüm ve onay süreçleri dağınık kalır. Gelen kayıtları bir araya getiren kişi hangi kaydın güncel olduğunu, kim tarafından üretildiğini ve hangi işlemlerden geçtiğini takip etmekte zorlanır.

## Çözüm

StemWeave iki ana ürün yüzeyi sunar:

1. **Music Center:** Şefin projeyi oluşturduğu, katkıları zaman çizelgesine yerleştirdiği, yorumladığı, onayladığı ve yayın adayı çıkardığı desktop uygulaması.
2. **Enstrüman uygulamaları:** Piyano, cello, gitar, violin, bateri, brass ve flute için projeden gelen kurallara göre kayıt üreten uygulamalar.

## Ürün ilkeleri

1. Kaynak kayıt değiştirilemez; her işlem yeni sürüm üretir.
2. Proje BPM ve ölçüsü varsayılan olarak kilitlidir.
3. Tempo değişikliği şef onayı olmadan ana düzenlemeye giremez.
4. Enstrüman rengi ve ikonu bütün ürünlerde aynı kalır.
5. Durum bilgisi enstrüman rengini değiştirmez; çerçeve, ikon ve etiket kullanır.
6. İlk arayüz basit, blok tabanlı, pixel temalı ve Consolas yazı tipli olur.
7. MVP profesyonel DAW’ın tamamını kopyalamaz.
8. Desktop Center ve tek bir piyano uygulaması birlikte doğrulanır.
9. Kod açık kaynak olabilir; ses paketlerinin lisansı koddan ayrı yönetilir.
10. Büyük ses dosyaları Git deposunda saklanmaz.

## MVP kapsamı

- Kullanıcı ve proje oluşturma
- Proje BPM, ölçü, ton ve sample rate kuralları
- Şef ve müzisyen üyeliği
- Piyano uygulamasının proje manifestini alması
- Metronom ve ölçüye hizalı piyano kaydı
- MIDI olayları ve render edilmiş ön dinleme sesinin gönderilmesi
- Gelen katkılar paneli
- Timeline’a sürükle-bırak
- Klipi sağa-sola taşıma, kısaltma, mute ve solo
- Marker ekleme
- Yorum, değişiklik isteği ve yeni revizyon gönderme
- Katkıyı onaylama/merge etme
- Basit stereo ön miks oluşturma
- İşlem geçmişi ve temel bildirimler

## MVP dışında

- VST/AU eklenti barındırma
- Profesyonel mastering zinciri
- Gerçek zamanlı aynı timeline üzerinde eş zamanlı düzenleme
- Yapay zekâ ile müzik üretme
- Otomatik stem separation
- Halka açık sosyal ağ ve puan ekonomisi
- Telif ödeme ve gelir paylaşımı
- Değişken tempo haritası
- Yedi enstrümanın tamamı
- Çevrimdışı çatışma çözümleme

## İlk başarı ölçütü

Yeni bir kullanıcı, yardım almadan şu akışı 10 dakika içinde tamamlayabilmelidir:

1. Proje oluşturmak
2. Piyano uygulamasını projeye bağlamak
3. Dört ölçü kayıt almak
4. Kaydı Center’a göndermek
5. Kaydı timeline’a yerleştirmek
6. Ön dinlemek
7. Bir yorum eklemek
8. Revizyonu onaylamak
9. Basit WAV ön miks almak

## İsim ve marka

`StemWeave` çalışma adıdır. İlk aramada aynı isimli doğrudan bir müzik yazılımı görülmemiştir; bu hukuki marka uygunluk araştırması yerine geçmez.
