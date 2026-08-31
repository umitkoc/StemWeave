# Infrastructure

Bu klasör StemWeave'in yerel ve dağıtım altyapısını içerir.

- `compose.yaml`: PostgreSQL 16, healthcheck ve kalıcı yerel volume tanımları
- `Dockerfile.api`: API image taslağı
- `Dockerfile.worker`: audio worker image taslağı

Yerel PostgreSQL'i başlatmak için:

```bash
docker compose -f infrastructure/compose.yaml up -d postgres
pnpm --filter @stemweave/db db:migrate
```

Migration komutu tekrar çalıştırılabilir; uygulanmış migration'lar Drizzle migration günlüğünden atlanır.
