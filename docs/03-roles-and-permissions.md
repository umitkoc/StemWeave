# Roller ve yetkiler

Durum: Öneri

## Ürün rolleri

### Proje sahibi

- Projeyi oluşturur ve arşivler.
- Üyeleri ve rolleri yönetir.
- Şef yetkisine sahiptir.
- Proje sahipliğini devredebilir.

### Şef / aranjör

- Proje kurallarını yönetir.
- Katkıları timeline’a yerleştirir.
- Marker, track ve klip düzenler.
- Değişiklik ister ve katkıları merge eder.
- Ön miks ve yayın adayı oluşturur.

### Müzisyen

- Yetkili olduğu enstrümanla kayıt üretir.
- Katkı ve revizyon gönderir.
- Kendisine atanan yorumlara cevap verir.
- Ana timeline’ı doğrudan değiştiremez.
- Merge işlemi yapamaz.

### Mix mühendisi

- Kendisine atanan kaynaklar için processing revision üretir.
- Gain, pan, EQ, compressor ve reverb reçetesi ekleyebilir.
- Kaynak kaydı değiştiremez.
- Sürümü incelemeye gönderebilir; merge edemez.

### Mastering mühendisi

- Onaylanmış tam miks üzerinde mastering revision üretir.
- Tekil enstrüman kliplerini değiştirmez.
- Release candidate gönderir; yayınlama yetkisi varsayılan olarak yoktur.

### İzleyici

- Yalnızca yayınlanan sürümleri dinler.
- Proje ayarlarını, taslak katkıları ve çalışma dosyalarını göremez.
- Sosyal özellikler MVP sonrasına bırakılmıştır.

## Durum bazlı yetki özeti

| İşlem                   | Sahip |   Şef |    Müzisyen |       Mix | Mastering |          İzleyici |
| ----------------------- | ----: | ----: | ----------: | --------: | --------: | ----------------: |
| Proje oluşturma         |  Evet |  Evet |       Hayır |     Hayır |     Hayır |             Hayır |
| Üye/rol yönetme         |  Evet | Hayır |       Hayır |     Hayır |     Hayır |             Hayır |
| Proje kuralı değiştirme |  Evet |  Evet |       İstek |     İstek |     İstek |             Hayır |
| Katkı gönderme          |  Evet |  Evet |        Evet |     Hayır |     Hayır |             Hayır |
| Timeline düzenleme      |  Evet |  Evet |       Hayır |     Hayır |     Hayır |             Hayır |
| Processing revision     |  Evet |  Evet | Kendi kaydı |      Evet |     Hayır |             Hayır |
| Yorum yazma             |  Evet |  Evet |   Proje içi | Proje içi | Proje içi | Sonraya bırakıldı |
| Merge/onay              |  Evet |  Evet |       Hayır |     Hayır |     Hayır |             Hayır |
| Master revision         |  Evet |  Evet |       Hayır |     Hayır |      Evet |             Hayır |
| Yayınlama               |  Evet |  Evet |       Hayır |     Hayır |     Hayır |             Hayır |
| Yayını dinleme          |  Evet |  Evet |        Evet |      Evet |      Evet |              Evet |

## Yetkilendirme kuralları

1. Roller global değil proje bazlıdır.
2. API, her mutation işleminde üyelik ve yetkiyi tekrar doğrular.
3. Bir müzisyenin enstrüman kapsamı `project_member_instruments` ile sınırlandırılabilir.
4. Atanan görev erişim sağlamaz; kullanıcının proje üyeliği de bulunmalıdır.
5. Şef kendi onayını geri alabilir ancak audit kaydı silinmez.
6. Son proje sahibi projeden ayrılamaz; önce sahipliği devretmelidir.
7. Açık kaynak repo rolleri ürün rollerinden ayrıdır.

## GitHub rolleri

- Maintainer
- Reviewer
- Contributor
- Security responder
- Release manager

Bu roller uygulama veritabanına yazılmaz; GitHub takım ve CODEOWNERS yapısıyla yönetilir.
