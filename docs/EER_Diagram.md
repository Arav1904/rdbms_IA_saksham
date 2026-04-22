# Pet Adoption and Care System - EER Diagram

This file provides the EER model for the project database used in `setup.sql`.

Presentation style version (for screenshot/export):
- `docs/EER_Diagram_Presentation.html`

```mermaid
erDiagram
    Shelter ||--o{ Pets : houses

    Pets ||--o| Dog : specializes_as
    Pets ||--o| Cat : specializes_as
    Pets ||--o| Other_Animal : specializes_as

    Adopters ||--o| Individual : specializes_as
    Adopters ||--o| Organization : specializes_as

    Pet_Care_Providers ||--o| Veterinarian : specializes_as
    Pet_Care_Providers ||--o| Groomer : specializes_as

    Adopters ||--o{ Adoption_Applications : submits
    Pets ||--o{ Adoption_Applications : receives

    Pets ||--o{ Appointments : has
    Pet_Care_Providers ||--o{ Appointments : conducts

    Staff ||--o| Volunteer : specializes_as
    Staff ||--o| Employee : specializes_as

    Staff ||--o{ Staff_Pet : assigned_to
    Pets ||--o{ Staff_Pet : cared_by

    Adoption_Applications ||--o{ Application_Audit : logs

    Shelter {
        varchar shelter_id PK
        varchar shelter_name
        varchar address
        int capacity
        varchar phone
    }

    Pets {
        varchar pet_id PK
        varchar name
        varchar breed
        int age
        varchar gender
        decimal weight_kg
        date intake_date
        varchar adoption_status
        boolean is_vaccinated
        varchar shelter_id FK
    }

    Dog {
        varchar pet_id PK,FK
        varchar size
        boolean is_trained
    }

    Cat {
        varchar pet_id PK,FK
        boolean is_indoor
        varchar fur_length
    }

    Other_Animal {
        varchar pet_id PK,FK
        varchar species_name
    }

    Adopters {
        varchar adopter_id PK
        varchar first_name
        varchar last_name
        varchar email
        varchar phone
        varchar address
    }

    Individual {
        varchar adopter_id PK,FK
        varchar occupation
    }

    Organization {
        varchar adopter_id PK,FK
        varchar org_reg_no
    }

    Adoption_Applications {
        varchar application_id PK
        date application_date
        varchar status
        text notes
        varchar adopter_id FK
        varchar pet_id FK
    }

    Pet_Care_Providers {
        varchar provider_id PK
        varchar name
        varchar qualification
        varchar phone
        varchar email
        decimal visiting_fee
    }

    Veterinarian {
        varchar provider_id PK,FK
        varchar vet_license_no
        varchar specialization
    }

    Groomer {
        varchar provider_id PK,FK
        varchar tools_used
        varchar grooming_styles
    }

    Appointments {
        varchar appointment_id PK
        date appointment_date
        varchar service_type
        int duration_mins
        text notes
        varchar pet_id FK
        varchar provider_id FK
    }

    Staff {
        varchar staff_id PK
        varchar name
        varchar role
        varchar shift
    }

    Volunteer {
        varchar staff_id PK,FK
        int hours_per_week
    }

    Employee {
        varchar staff_id PK,FK
        decimal salary
        varchar emp_id
    }

    Staff_Pet {
        varchar staff_id PK,FK
        varchar pet_id PK,FK
    }

    App_Users {
        varchar username PK
        varchar full_name
        varchar email
        text password_hash
        varchar role
        timestamp created_at
    }

    Application_Audit {
        int audit_id PK
        varchar application_id
        varchar adopter_id
        varchar pet_id
        timestamp logged_at
        varchar action_type
    }
```

## Specialization Constraints (EER Notes)

- `Pets -> Dog/Cat/Other_Animal`: treated as disjoint in app workflow.
- `Adopters -> Individual/Organization`: overlapping allowed (one adopter may appear in both).
- `Pet_Care_Providers -> Veterinarian/Groomer`: disjoint specialization.
- `Staff -> Volunteer/Employee`: disjoint specialization.

## Mapping to SQL

All entities, keys, and relationships above are implemented in `setup.sql` using primary keys, foreign keys, junction tables, triggers, and views.