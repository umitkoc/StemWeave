# Adım 4 — Project, üyelik ve roller API'si

**Durum**: Tamamlandı

## Yapılanlar

- Fastify 5 tabanlı modüler API kabuğu ve `/health/live`, `/health/ready` endpoint'leri eklendi.
- Yalnız development/test ortamında çalışan header tabanlı auth adaptörü oluşturuldu. Production ortamında bu adaptör güvenli biçimde reddeder; OIDC Adım 12'de seçilecektir.
- `users`, `projects`, `project_rule_versions`, üyelik, rol, enstrüman ataması, davet ve `audit_events` tabloları Drizzle şemasına eklendi.
- `citext` extension, yedi enstrümanlık başlangıç kataloğu ve `0001_step4_projects.sql` migration'ı üretildi.
- Proje oluşturma işlemi kullanıcı, proje, ilk rule version, OWNER üyeliği ve audit event'i tek PostgreSQL transaction'ında oluşturur.
- Proje manifesti, davet oluşturma/kabul ve üye rollerini değiştirme endpoint'leri eklendi.
- Davet token'ının yalnız SHA-256 özeti veritabanında saklanır. Ham token yalnız oluşturma cevabında döner.
- OWNER, müzisyen ve viewer erişimleri proje bazlı RBAC policy ile ayrıldı. Viewer taslak manifesti göremez, müzisyen üyeleri yönetemez.
- Son OWNER rolünün kaldırılması transaction içinde engellendi; birden fazla OWNER varsa canonical project owner aktarımı desteklendi.
- Her mutation için audit event üretildi.

## Endpoint özeti

| Metot  | Yol                                               | Amaç                         |
| ------ | ------------------------------------------------- | ---------------------------- |
| `POST` | `/v1/projects`                                    | Proje ve ilk kuralı oluştur  |
| `GET`  | `/v1/projects/:projectId/manifest`                | Aktif manifesti getir        |
| `POST` | `/v1/projects/:projectId/invitations`             | Üye/enstrüman daveti oluştur |
| `POST` | `/v1/invitations/:token/accept`                   | Daveti kabul et              |
| `PUT`  | `/v1/projects/:projectId/members/:memberId/roles` | Rolleri atomik değiştir      |

## Development auth header'ları

- `x-dev-user-id`: UUID
- `x-dev-user-email`: geçerli e-posta
- `x-dev-display-name`: görünen ad

Bu header'lar production kimlik çözümü değildir ve production'da etkinleştirilmez.

## Doğrulama

- Repo kalite zinciri: 13 workspace üzerinde 40 görev başarılı.
- Unit/API: 6 test.
- PostgreSQL integration: proje transaction'ı, readiness, son OWNER ve gerçek piyano davet akışı.
- Migration boş veritabanında uygulandı ve ikinci çalıştırmada değişiklik yapmadan başarılı oldu.
- Tüm workspace build görevleri başarılı.

## Sonraki adım

Adım 5'te Center desktop kabuğu bu API'ye bağlanacak; proje oluşturma, BPM/ölçü kilidi ve ilk pixel timeline arayüzü uygulanacaktır.
