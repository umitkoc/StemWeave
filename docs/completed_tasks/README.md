# Tamamlanan görev kayıtları

Bu klasör, tamamlanan her geliştirme adımının sonradan denetlenebilir sonucunu saklar. Bir görev yalnız kod değişikliğiyle değil, burada yer alan sonuç kaydıyla tamamlanmış sayılır.

## Zorunlu kayıt alanları

Her görev raporu en az şu bilgileri içerir:

1. Durum ve tamamlanma tarihi
2. Amaç ve kapsam
3. Yapılan değişiklikler
4. Teknik kararlar ve gerekçeleri
5. Çalıştırılan testler ve sonuçları
6. Bilinen sınırlamalar veya ertelenen işler
7. İlgili gereksinimler
8. Sonraki adım

## Dosya adlandırma

- Yol haritası adımı: `step-05-center-desktop-shell.md`
- Adımın bağımsız alt teslimi: `step-05a-center-desktop-foundation.md`
- Yol haritası dışı bakım işi: `task-YYYY-MM-DD-kisa-konu.md`

Bir görev kısmen yapılmışsa rapor, tamamlanan alt teslimi adlandırır; ana adım yanlışlıkla tamamlandı olarak işaretlenmez.

## Sonuç şablonu

```markdown
# Görev başlığı

**Durum**: Tamamlandı
**Tarih**: YYYY-AA-GG

## Amaç

## Yapılanlar

## Teknik kararlar

## Doğrulama

## Bilinen sınırlamalar

## İlgili gereksinimler

## Sonraki adım
```
