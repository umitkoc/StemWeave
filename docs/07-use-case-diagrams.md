# Use case diyagramları

Durum: Öneri

Mermaid doğrudan UML use-case ovali sağlamadığı için use case’ler aktör–eylem bağlantılarıyla gösterilmiştir.

## Music Center

```mermaid
flowchart LR
    Owner[Proje sahibi]
    Conductor[Şef]
    Musician[Müzisyen]
    Mix[Mix mühendisi]
    Master[Mastering mühendisi]
    Viewer[İzleyici]

    subgraph System[StemWeave]
        UC1([Proje oluştur])
        UC2([Proje kurallarını yönet])
        UC3([Üye ve rol yönet])
        UC4([Katkı gönder])
        UC5([Timeline düzenle])
        UC6([Yorum ve değişiklik iste])
        UC7([Processing revision gönder])
        UC8([Katkıyı merge et])
        UC9([Master revision gönder])
        UC10([Release candidate oluştur])
        UC11([Yayınlanan eseri dinle])
        UC12([Tempo değişikliği iste])
    end

    Owner --> UC1
    Owner --> UC2
    Owner --> UC3
    Owner --> UC5
    Owner --> UC8
    Owner --> UC10
    Conductor --> UC1
    Conductor --> UC2
    Conductor --> UC5
    Conductor --> UC6
    Conductor --> UC8
    Conductor --> UC10
    Musician --> UC4
    Musician --> UC6
    Musician --> UC12
    Mix --> UC7
    Mix --> UC6
    Master --> UC9
    Master --> UC6
    Viewer --> UC11
```

## Enstrüman uygulaması

```mermaid
flowchart LR
    Musician[Müzisyen]
    Conductor[Şef]

    subgraph InstrumentApp[Enstrüman uygulaması]
        A([Projeye bağlan])
        B([Manifesti al])
        C([Metronomu başlat])
        D([Kayıt yap])
        E([Geri al ve düzenle])
        F([Katkı paketini doğrula])
        G([Katkıyı gönder])
        H([Tempo değişikliği iste])
        I([Revizyon gönder])
    end

    Musician --> A
    A --> B
    Musician --> C
    Musician --> D
    Musician --> E
    D --> F
    F --> G
    Musician --> H
    Conductor -. onaylar/reddeder .-> H
    Musician --> I
```

## Include/extend ilişkileri

```mermaid
flowchart TD
    Upload([Katkı gönder]) --> Validate([Manifest ve checksum doğrula])
    Upload --> Store([Asset sakla])
    AddClip([Timeline'a ekle]) --> Authorize([Şef yetkisini doğrula])
    AddClip --> Snap([Müzikal tick'e hizala])
    Merge([Revision merge et]) --> Compare([A/B karşılaştır])
    Merge --> Audit([Audit event oluştur])
    Export([Ön miks oluştur]) --> Snapshot([Arrangement snapshot al])
    Export --> Render([Audio render işi])
```
