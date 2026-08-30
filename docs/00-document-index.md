# Dokümantasyon indeksi

Bu klasördeki belgeler, kod yazılmadan önce MVP sınırını ve teknik sözleşmeleri belirler.

## Okuma sırası

1. [`01-product-vision-and-scope.md`](01-product-vision-and-scope.md) — Ürün amacı ve MVP sınırı
2. [`02-requirements.md`](02-requirements.md) — Fonksiyonel ve fonksiyonel olmayan gereksinimler
3. [`03-roles-and-permissions.md`](03-roles-and-permissions.md) — Ürün rolleri ve yetkiler
4. [`04-technology-stack.md`](04-technology-stack.md) — Kullanılacak ürünler ve seçim gerekçeleri
5. [`05-system-architecture.md`](05-system-architecture.md) — Sistem bileşenleri ve sınırları
6. [`06-end-to-end-workflows.md`](06-end-to-end-workflows.md) — Uçtan uca ürün akışları
7. [`07-use-case-diagrams.md`](07-use-case-diagrams.md) — Use case diyagramları
8. [`08-sequence-diagrams.md`](08-sequence-diagrams.md) — Sequence diyagramları
9. [`09-domain-class-diagram.md`](09-domain-class-diagram.md) — Domain sınıfları
10. [`10-database-schema.md`](10-database-schema.md) — PostgreSQL tabloları, kolonlar ve tipler
11. [`11-github-and-open-source.md`](11-github-and-open-source.md) — GitHub ve açık kaynak çalışma modeli
12. [`12-docker-and-local-development.md`](12-docker-and-local-development.md) — Docker ve yerel geliştirme
13. [`13-roadmap-and-estimates.md`](13-roadmap-and-estimates.md) — Zaman çizelgesi ve tahminler
14. [`14-step-by-step-implementation.md`](14-step-by-step-implementation.md) — Uygulama adımları ve teslim kriterleri
15. [`15-testing-security-observability.md`](15-testing-security-observability.md) — Kalite, güvenlik ve gözlemlenebilirlik
16. [`16-decisions-risks-open-questions.md`](16-decisions-risks-open-questions.md) — Kararlar, riskler ve açık sorular
17. [`17-glossary.md`](17-glossary.md) — Ortak terimler

## Belge durumu etiketleri

- `Öneri`: Henüz kesinleşmemiştir.
- `Kabul`: MVP için bağlayıcı karardır.
- `Sonraya bırakıldı`: MVP kapsamına dahil değildir.
- `Araştırma kapısı`: Kodlamadan önce teknik deneme gerekir.

## Değişiklik kuralı

Bir gereksinim veya mimari karar değiştirildiğinde şu belgeler birlikte kontrol edilir:

1. Gereksinimler
2. Roller ve yetkiler
3. Diyagramlar
4. Veritabanı şeması
5. API/sözleşme etkisi
6. Yol haritası
7. Test kabul kriterleri
