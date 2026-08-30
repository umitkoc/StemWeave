# GitHub ve açık kaynak mimarisi

Durum: Öneri

## Başlangıç kararı

MVP tek repo içinde geliştirilecektir:

```text
github.com/<organization>/stemweave
```

Center ve piano için ayrı repo açılmayacaktır. Ortak sözleşmeler ve tek uçtan uca değişiklik aynı pull request içinde test edilecektir.

## Repo yapısı

```text
.github/
├── CODEOWNERS
├── ISSUE_TEMPLATE/
│   ├── bug.yml
│   ├── feature.yml
│   └── architecture.yml
├── PULL_REQUEST_TEMPLATE.md
├── dependabot.yml
└── workflows/
    ├── ci.yml
    ├── docs.yml
    ├── security.yml
    ├── desktop-build.yml
    ├── mobile-build.yml
    └── release.yml
apps/
services/
packages/
infrastructure/
docs/
CONTRIBUTING.md
CODE_OF_CONDUCT.md
SECURITY.md
GOVERNANCE.md
LICENSE
NOTICE
```

## Branch modeli

- `main` her zaman testleri geçen ve paketlenebilir branch’tir.
- Çalışmalar kısa ömürlü branch’lerde yapılır.
- Kalıcı `develop` branch kullanılmaz.
- Doğrudan `main` push kapatılır.
- Merge yöntemi varsayılan olarak squash merge olur.

Branch örnekleri:

```text
feature/project-manifest
feature/piano-recorder
fix/timeline-snap
docs/database-schema
spike/mobile-audio-latency
```

## Pull request kuralları

Her PR:

1. Bir issue veya karar kaydına bağlanır.
2. Değişiklik kapsamını ve nedenini açıklar.
3. Test planı içerir.
4. UI değişiminde ekran görüntüsü/video içerir.
5. Database değişiminde ileri migration ve geri dönüş planı içerir.
6. Contract değişiminde Center ve enstrüman uyumluluğunu gösterir.
7. Lisans etkileyen bağımlılık ekliyorsa lisans notu içerir.
8. Büyük audio fixture eklemez.

## Zorunlu kontroller

- Markdown link ve lint
- TypeScript typecheck
- ESLint/format
- Unit test
- Contract test
- Database migration test
- API integration test
- Center component test
- Playwright smoke test
- Secret scan
- Dependency review
- License/SBOM kontrolü

## CODEOWNERS önerisi

```text
/packages/contracts/       @stemweave/core-maintainers
/packages/domain/          @stemweave/core-maintainers
/services/api/             @stemweave/backend-maintainers
/services/audio-worker/    @stemweave/audio-maintainers
/apps/center-desktop/      @stemweave/center-maintainers
/apps/piano-mobile/        @stemweave/instrument-maintainers
/infrastructure/           @stemweave/platform-maintainers
/docs/                     @stemweave/docs-maintainers
```

İlk aşamada aynı kişiler birden fazla takımda olabilir.

## GitHub Issue etiketleri

- `area:center`
- `area:piano`
- `area:api`
- `area:audio`
- `area:database`
- `area:docs`
- `type:bug`
- `type:feature`
- `type:spike`
- `type:security`
- `good-first-issue`
- `help-wanted`
- `breaking-change`
- `blocked`
- `needs-decision`

## Milestone yapısı

- `M0 Documentation Baseline`
- `M1 Project Contract`
- `M2 Center Skeleton`
- `M3 Piano Vertical Slice`
- `M4 Review and Revisions`
- `M5 Rough Mix Export`
- `M6 Public Alpha`

## Sürümleme

- Ürün sürümü SemVer kullanır.
- MVP öncesi `0.x` sürümleri breaking change içerebilir.
- Paylaşılan paketlerde Changesets kullanılması önerilir.
- Contract schema version ürün sürümünden ayrı tutulur.
- Desktop, API ve mobile uyumluluk matrisi release notunda bulunur.

## Lisans önerisi

- Kod için başlangıç önerisi: `Apache-2.0`.
- Patent grant içerdiği ve ticari/açık kaynak kullanımda esnek olduğu için önerilir.
- Kesin lisans kullanıcı onayı olmadan eklenmemelidir.
- Ses sample’ları kod lisansının parçası değildir.
- Sample paketinde yalnızca dağıtım hakkı açık olan `CC0`, uygun `CC-BY` veya özgün kayıtlar bulunmalıdır.
- `CC-BY-NC` sample ticari ürün planıyla çelişebilir.

## Büyük dosya politikası

- Üretim sesleri Git’e girmez.
- Test için saniyelik küçük, lisansı açık fixture kullanılabilir.
- Git LFS, ürün asset deposu olarak kullanılmaz.
- Sample paketleri bağımsız release/manifest ve checksum ile dağıtılır.

## Açık kaynak katkı akışı

1. Contributor issue seçer.
2. Tasarım etkisi varsa kısa proposal açar.
3. Fork/branch üzerinde çalışır.
4. Test ve dokümanla PR gönderir.
5. CODEOWNER inceler.
6. CI başarılı olur.
7. Squash merge yapılır.
8. Changeset release notuna dönüşür.

## Repo oluşturulduktan sonra ilk ayarlar

1. `main` branch protection aç.
2. En az bir review zorunlu yap.
3. Status check’leri zorunlu yap.
4. Force push ve branch delete engelle.
5. Private vulnerability reporting aç.
6. Dependabot/renovation aç.
7. Discussions alanını mimari sorular için aç.
8. GitHub Project board’u milestone’lara bağla.
