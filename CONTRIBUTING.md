# StemWeave’e katkı

StemWeave erken tasarım ve MVP geliştirme aşamasındadır. Küçük, doğrulanabilir ve dokümante edilmiş değişiklikler tercih edilir.

## Başlamadan önce

1. `docs/00-document-index.md` dosyasını okuyun.
2. Mevcut issue’larda aynı çalışma olup olmadığını kontrol edin.
3. Contract, database veya mimari sınırı değiştiren işler için önce architecture issue açın.
4. Büyük değişikliklerde maintainer onayı almadan uygulamaya başlamayın.

## Yerel kurulum

```bash
corepack enable
pnpm install
pnpm check
pnpm build
```

## Branch ve commit

- `feature/...`, `fix/...`, `docs/...` veya `spike/...` kullanın.
- Branch’i kısa ömürlü tutun.
- Commit mesajını değişikliğin amacını anlatacak şekilde yazın.
- Üretim ses dosyalarını veya lisansı belirsiz sample’ları commit etmeyin.

## Pull request

- Issue bağlantısı ekleyin.
- Kabul kriterlerini ve test planını yazın.
- UI değişikliğinde ekran görüntüsü ekleyin.
- Yeni bağımlılıkta lisans ve bakım durumunu belirtin.
- `pnpm check` ve `pnpm build` çalıştırın.

## Kod ilkeleri

- Domain katmanı framework bağımsız kalır.
- Orijinal audio asset değiştirilmez.
- Müzikal zaman piksel değil tick olarak saklanır.
- Yetki kontrolü yalnızca UI’a bırakılmaz.
- Enstrüman rengi durum göstermek için değiştirilmez.

## Güvenlik

Güvenlik açığını public issue olarak bildirmeyin. `SECURITY.md` yolunu kullanın.
