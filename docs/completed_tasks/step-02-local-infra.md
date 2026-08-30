# Adım 2 — Yerel altyapı

**Durum**: Tamamlandı

## Yapılanlar
- Proje kökünde örnek ortam değişkenleri dosyası (`.env.example`) oluşturuldu.
- `infrastructure/compose.yaml` dosyası eklendi; içerisinde PostgreSQL (pg_isready healthcheck ile) ve yerel ses dosyaları için bir Docker volume (stemweave-local-assets) tanımlandı.
- API (`Dockerfile.api`) ve audio worker (`Dockerfile.worker`) servisleri için Dockerfile taslakları oluşturuldu.
- `packages/db` isminde ortak bir Drizzle veritabanı paketi oluşturuldu. İçerisinde PostgreSQL driver (postgres.js) ve Drizzle ORM ayarlandı; örnek bir schema ile ilk migration başarıyla oluşturuldu.

Altyapı şu anda `docker compose` ile ayağa kaldırılabilir ve projede Drizzle kullanılabilir durumdadır.
