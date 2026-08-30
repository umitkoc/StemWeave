# Adım 3 — Ortak sözleşmeler

**Durum**: Tamamlandı

## Yapılanlar
- `@stemweave/contracts` paketine `zod` eklendi.
- `version.ts` (versiyon sabitleri) ve `errors.ts` (hata kodları) eklendi.
- Zod şemaları (`schemas/project.ts`, `schemas/contribution.ts`, `schemas/instrument.ts`, `schemas/tempo.ts`) oluşturuldu.
  - BPM (20-300), ölçü formatları (4/4 vb.) ve checksum uzunlukları gibi kısıtlamalar eklendi.
- Geçerli ve geçersiz test verileri (`__tests__/fixtures.ts`) hazırlandı.
- Hata üreten sınır değerleri ve desteklenmeyen versiyon senaryolarını doğrulayan `vitest` unit testleri eklendi ve tüm testlerin başarılı olduğu görüldü (`schemas.test.ts`).

Artık API, Center (Masaüstü) ve Mobil (Piyano) uygulamaları bu ortak şemaları içe aktararak (import) güvenle veri doğrulaması yapabilir.
