const SELECT_OPTIONS = {
  pets: {
    shelter_id: "SELECT shelter_id AS value, shelter_name AS label FROM Shelter ORDER BY shelter_name",
  },
  applications: {
    adopter_id: "SELECT adopter_id AS value, adopter_id || ' - ' || first_name || ' ' || last_name AS label FROM Adopters ORDER BY adopter_id",
    pet_id: "SELECT pet_id AS value, pet_id || ' - ' || name || ' (' || adoption_status || ')' AS label FROM Pets ORDER BY pet_id",
  },
  appointments: {
    pet_id: "SELECT pet_id AS value, pet_id || ' - ' || name || ' (' || adoption_status || ')' AS label FROM Pets WHERE adoption_status <> 'Adopted' ORDER BY name",
    provider_id: "SELECT provider_id AS value, provider_id || ' - ' || name AS label FROM Pet_Care_Providers ORDER BY provider_id",
  },
  providers: {},
  medical: {
    pet_id: "SELECT pet_id AS value, pet_id || ' - ' || name AS label FROM Pets ORDER BY pet_id",
    provider_id: "SELECT v.provider_id AS value, v.provider_id || ' - ' || p.name AS label FROM Veterinarian v JOIN Pet_Care_Providers p ON v.provider_id = p.provider_id ORDER BY v.provider_id",
  },
  donations: {
    adopter_id: "SELECT adopter_id AS value, adopter_id || ' - ' || first_name || ' ' || last_name AS label FROM Adopters ORDER BY adopter_id",
  },
  shelters: {},
  dogs: {
    pet_id: "SELECT pet_id AS value, pet_id || ' - ' || name AS label FROM Pets ORDER BY pet_id",
  },
  cats: {
    pet_id: "SELECT pet_id AS value, pet_id || ' - ' || name AS label FROM Pets ORDER BY pet_id",
  },
  "other-animals": {
    pet_id: "SELECT pet_id AS value, pet_id || ' - ' || name AS label FROM Pets ORDER BY pet_id",
  },
  "pet-photos": {
    pet_id: "SELECT pet_id AS value, pet_id || ' - ' || name AS label FROM Pets ORDER BY pet_id",
  },
  individuals: {
    adopter_id: "SELECT adopter_id AS value, adopter_id || ' - ' || first_name || ' ' || last_name AS label FROM Adopters ORDER BY adopter_id",
  },
  organizations: {
    adopter_id: "SELECT adopter_id AS value, adopter_id || ' - ' || first_name || ' ' || last_name AS label FROM Adopters ORDER BY adopter_id",
  },
  references: {
    adopter_id: "SELECT adopter_id AS value, adopter_id || ' - ' || first_name || ' ' || last_name AS label FROM Adopters ORDER BY adopter_id",
  },
  veterinarians: {
    provider_id: "SELECT provider_id AS value, provider_id || ' - ' || name AS label FROM Pet_Care_Providers ORDER BY provider_id",
  },
  groomers: {
    provider_id: "SELECT provider_id AS value, provider_id || ' - ' || name AS label FROM Pet_Care_Providers ORDER BY provider_id",
  },
  availability: {
    provider_id: "SELECT provider_id AS value, provider_id || ' - ' || name AS label FROM Pet_Care_Providers ORDER BY provider_id",
  },
  staff: {},
  volunteers: {
    staff_id: "SELECT staff_id AS value, staff_id || ' - ' || name AS label FROM Staff ORDER BY staff_id",
  },
  employees: {
    staff_id: "SELECT staff_id AS value, staff_id || ' - ' || name AS label FROM Staff ORDER BY staff_id",
  },
  "staff-pet": {
    staff_id: "SELECT staff_id AS value, staff_id || ' - ' || name AS label FROM Staff ORDER BY staff_id",
    pet_id: "SELECT pet_id AS value, pet_id || ' - ' || name AS label FROM Pets ORDER BY pet_id",
  },
  training: {},
  "dog-training": {
    pet_id: "SELECT d.pet_id AS value, d.pet_id || ' - ' || p.name AS label FROM Dog d JOIN Pets p ON d.pet_id = p.pet_id ORDER BY d.pet_id",
    program_id: "SELECT program_id AS value, program_id || ' - ' || program_name AS label FROM Training_Programs ORDER BY program_id",
  },
  "audit-log": {},
};

export function getOptionsQuery(entityKey, fieldName) {
  return SELECT_OPTIONS[entityKey]?.[fieldName] ?? null;
}
