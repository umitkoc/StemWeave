# Güvenlik politikası

StemWeave henüz yayınlanmış bir sürüme sahip değildir.

## Açık bildirme

Güvenlik açığını public issue, discussion veya pull request içinde paylaşmayın. Lütfen güvenlik açıklarını doğrudan [GitHub Private Vulnerability Reporting](https://github.com/umitkoc/StemWeave/security/advisories/new) üzerinden bildirin.

Raporda şunlar bulunmalıdır:

- Etkilenen commit veya sürüm
- Etkilenen bileşen
- Tekrar üretme adımları
- Olası etki
- Varsa önerilen düzeltme

Token, parola, özel proje sesi veya başka bir kullanıcının verisini rapora eklemeyin.

## Destek kapsamı

Public alpha öncesinde yalnızca `main` branch desteklenir. İlk sürümden sonra desteklenen sürüm matrisi burada yayımlanacaktır.

## Güvenli geliştirme

- Secret’lar commit edilmez.
- Büyük ve güvenilmeyen media dosyaları izole worker’da analiz edilir.
- Yetkilendirme API tarafında uygulanır.
- Dependency ve CodeQL taramaları CI’da çalışır.
