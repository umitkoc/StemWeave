# Sequence diyagramları

Durum: Öneri

## Proje oluşturma ve manifest alma

```mermaid
sequenceDiagram
    actor S as Şef
    participant C as Center
    participant API as API
    participant DB as PostgreSQL
    participant P as Piano App

    S->>C: Proje bilgilerini girer
    C->>API: POST /projects
    API->>DB: project + rule_version transaction
    DB-->>API: projectId, ruleVersionId
    API-->>C: Project
    S->>C: Piyanisti davet eder
    C->>API: POST /projects/{id}/invitations
    API->>DB: invitation kaydı
    API-->>P: Davet bağlantısı/kodu
    P->>API: Daveti kabul et
    API->>DB: membership oluştur
    P->>API: GET /projects/{id}/manifest
    API->>DB: Aktif rule version
    API-->>P: ProjectManifest
```

## Piyano kaydı ve upload

```mermaid
sequenceDiagram
    actor M as Piyanist
    participant P as Piano App
    participant API as API
    participant ST as Asset Storage
    participant DB as PostgreSQL
    participant W as Audio Worker
    participant C as Center

    M->>P: Record
    P->>P: MIDI olayları + preview üret
    P->>API: POST /contributions
    API->>DB: DRAFT contribution
    API-->>P: Upload session
    P->>ST: WAV/MIDI upload
    P->>API: Upload complete + checksum
    API->>ST: Checksum/size doğrula
    API->>DB: asset=PENDING_ANALYSIS
    API->>DB: audio_job oluştur
    W->>DB: Job claim
    W->>ST: Asset oku
    W->>W: Format ve metadata analizi
    W->>DB: asset=READY, contribution=READY_FOR_REVIEW
    API-->>C: Contribution ready bildirimi
```

## Timeline’a yerleştirme ve taşıma

```mermaid
sequenceDiagram
    actor S as Şef
    participant C as Center
    participant API as API
    participant DB as PostgreSQL

    S->>C: Katkıyı track'e sürükler
    C->>C: Pikseli startTick'e dönüştür
    C->>API: POST /branches/{id}/clips
    API->>API: Rol, instrument ve rule doğrula
    API->>DB: TimelineClip + ArrangementCommit
    DB-->>API: Yeni revision
    API-->>C: Güncel clip ve commit
    S->>C: Klipi sağa sürükler
    C->>API: PATCH /clips/{id} startTick
    API->>DB: Optimistic version kontrolü
    API->>DB: Clip güncelle + commit
    API-->>C: Başarılı
```

## Tempo değişiklik isteği

```mermaid
sequenceDiagram
    actor M as Müzisyen
    participant P as Instrument App
    participant API as API
    participant DB as PostgreSQL
    participant C as Center
    actor S as Şef

    M->>P: 90 BPM talep et
    P->>API: POST /tempo-change-requests
    API->>DB: request=PENDING
    API-->>C: Bildirim
    S->>C: Talebi inceler
    alt Reddedildi
        C->>API: REJECT + gerekçe
        API->>DB: request=REJECTED
        API-->>P: Red bildirimi
    else Deneme branch'i
        C->>API: APPROVE_FOR_BRANCH
        API->>DB: branch + rule_version(90 BPM)
        API-->>P: Branch manifest
    else Ana proje değişti
        C->>API: APPROVE_FOR_PROJECT
        API->>DB: yeni active rule_version
        API->>DB: mevcut katkıları uyumluluk incelemesine al
        API-->>P: Yeni ProjectManifest
    end
```

## Processing revision ve merge

```mermaid
sequenceDiagram
    actor S as Şef
    participant C as Center
    participant API as API
    participant DB as PostgreSQL
    actor E as Mix mühendisi
    participant ST as Asset Storage

    S->>C: Processing görevi ata
    C->>API: POST /processing-requests
    API->>DB: request=ASSIGNED
    API-->>E: Bildirim
    E->>ST: İşlenmiş WAV upload
    E->>API: POST /processing-revisions
    API->>DB: revision=SUBMITTED
    API-->>C: İnceleme bildirimi
    S->>C: Kaynak/işlenmiş A/B dinle
    alt Değişiklik istendi
        C->>API: Comment + CHANGES_REQUESTED
        API->>DB: comment ve status
        API-->>E: Zaman kodlu bildirim
    else Onaylandı
        C->>API: POST /revisions/{id}/merge
        API->>DB: Transaction: active_revision değiştir
        API->>DB: Audit event
        API-->>C: MERGED
    end
```

## Render ve release candidate

```mermaid
sequenceDiagram
    actor S as Şef
    participant C as Center
    participant API as API
    participant DB as PostgreSQL
    participant W as Audio Worker
    participant ST as Asset Storage

    S->>C: Ön miks oluştur
    C->>API: POST /branches/{id}/renders
    API->>DB: Snapshot + audio_job=QUEUED
    API-->>C: jobId
    W->>DB: Job claim
    W->>ST: Aktif asset'leri oku
    W->>W: Trim, offset, gain, pan ve mix
    W->>ST: Stereo WAV yaz
    W->>DB: ReleaseCandidate=READY
    API-->>C: Render tamamlandı
    S->>C: Dinle ve onayla
    C->>API: POST /releases/{id}/approve
    API->>DB: release=APPROVED + audit
```
