# Data model

The Convex schema is organized by bounded domains. Relationships are stored as typed document IDs and supported by named indexes for every high-volume read path.

```mermaid
erDiagram
  USERS ||--o| MEMBERS : owns
  MEMBERS ||--o{ MEMBERSHIP_APPLICATIONS : applies
  MEMBERS ||--o{ EVENT_REGISTRATIONS : registers
  EVENTS ||--o{ EVENT_REGISTRATIONS : receives
  EVENTS ||--o{ GALLERY_ITEMS : groups
  PROJECTS ||--o{ PROJECT_MEMBERS : includes
  MEMBERS ||--o{ PROJECT_MEMBERS : contributes
  COMMITTEES ||--o{ COMMITTEE_MEMBERS : contains
  MEMBERS ||--o{ COMMITTEE_MEMBERS : serves
  MEMBERS ||--o{ NOTIFICATIONS : receives
  EVENTS ||--o{ FINANCE_ENTRIES : budgets
  MEMBERS ||--o{ FINANCE_ENTRIES : records
```

## Scale decisions

- Event registrations, project members, committee members, notifications, and finance entries are separate tables rather than growing arrays.
- Member UUID sequence allocation is transactional for each configurable galaxy/star code pair.
- List queries are bounded or paginated and use declared indexes instead of table filters.
- Public content and sensitive member/finance fields have separate response shapes.
- Uploaded files store Convex storage IDs; URLs are resolved at read time.
- Audit records capture privileged mutations without exposing authentication secrets.
