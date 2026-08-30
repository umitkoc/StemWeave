# Domain sınıf diyagramı

Durum: Öneri

```mermaid
classDiagram
    class User {
      +UUID id
      +string displayName
      +string email
      +UserStatus status
    }

    class Project {
      +UUID id
      +string name
      +ProjectStatus status
      +UUID ownerId
      +changeRules()
      +archive()
    }

    class ProjectMember {
      +UUID id
      +UUID projectId
      +UUID userId
      +Role[] roles
    }

    class ProjectRuleVersion {
      +UUID id
      +int version
      +decimal bpm
      +int numerator
      +int denominator
      +string keySignature
      +int sampleRateHz
      +int ticksPerQuarter
      +activate()
    }

    class InstrumentDefinition {
      +string id
      +string name
      +string colorToken
      +string iconKey
    }

    class Contribution {
      +UUID id
      +ContributionStatus status
      +int takeNumber
      +decimal recordedBpm
      +long durationTicks
      +submit()
      +reject()
    }

    class Asset {
      +UUID id
      +AssetKind kind
      +string storageKey
      +string sha256
      +long sizeBytes
      +AssetStatus status
    }

    class ArrangementBranch {
      +UUID id
      +string name
      +BranchStatus status
      +UUID headCommitId
    }

    class ArrangementCommit {
      +UUID id
      +UUID parentCommitId
      +string message
      +datetime createdAt
    }

    class TimelineTrack {
      +UUID id
      +int orderIndex
      +decimal gainDb
      +decimal pan
      +bool muted
      +bool solo
    }

    class TimelineClip {
      +UUID id
      +long startTick
      +long trimStartTick
      +long durationTicks
      +int version
      +move()
      +trim()
      +activateRevision()
    }

    class ProcessingRequest {
      +UUID id
      +ProcessingStatus status
      +UUID assigneeId
      +requestChanges()
      +complete()
    }

    class ProcessingRevision {
      +UUID id
      +int revisionNumber
      +JSON recipe
      +RevisionStatus status
      +submit()
      +merge()
    }

    class ReviewThread {
      +UUID id
      +long startTick
      +long endTick
      +ReviewStatus status
    }

    class ReviewComment {
      +UUID id
      +string body
      +datetime createdAt
    }

    class TempoChangeRequest {
      +UUID id
      +decimal fromBpm
      +decimal requestedBpm
      +ChangeRequestStatus status
      +approveForBranch()
      +approveForProject()
      +reject()
    }

    class ReleaseCandidate {
      +UUID id
      +int version
      +ReleaseStatus status
      +approve()
      +publish()
    }

    Project "1" --> "many" ProjectMember
    User "1" --> "many" ProjectMember
    Project "1" --> "many" ProjectRuleVersion
    Project "1" --> "many" Contribution
    ProjectRuleVersion "1" --> "many" Contribution
    InstrumentDefinition "1" --> "many" Contribution
    Contribution "1" --> "many" Asset
    Project "1" --> "many" ArrangementBranch
    ArrangementBranch "1" --> "many" ArrangementCommit
    ArrangementBranch "1" --> "many" TimelineTrack
    TimelineTrack "1" --> "many" TimelineClip
    Contribution "1" --> "many" TimelineClip
    TimelineClip "1" --> "many" ProcessingRequest
    ProcessingRequest "1" --> "many" ProcessingRevision
    ProcessingRevision "1" --> "1" Asset
    TimelineClip "1" --> "many" ReviewThread
    ReviewThread "1" --> "many" ReviewComment
    Project "1" --> "many" TempoChangeRequest
    ArrangementCommit "1" --> "many" ReleaseCandidate
    ReleaseCandidate "1" --> "1" Asset
```

## Aggregate sınırları

- **Project aggregate:** Project, ProjectRuleVersion ve üyelik politikaları
- **Contribution aggregate:** Contribution ve kaynak asset bağlantıları
- **Arrangement aggregate:** Branch, commit, track ve clip
- **Processing aggregate:** ProcessingRequest ve ProcessingRevision
- **Review aggregate:** ReviewThread ve ReviewComment
- **Release aggregate:** ReleaseCandidate ve çıktı asset’i

Aggregate’ler birbirine nesne referansı yerine kimlik üzerinden bağlanır. Transaction sınırı aggregate sınırını geçmemelidir; merge gibi koordinasyonlar application service tarafından yürütülür.
