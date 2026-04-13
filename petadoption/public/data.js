const petRows = [
  {
    pet_id: 'P001',
    name: 'Buddy',
    species: 'Dog',
    breed: 'Labrador',
    age: 2,
    gender: 'Male',
    adoption_status: 'Available',
    shelter_name: 'Happy Paws Shelter',
    weight_kg: '12.5',
    microchip_id: 'MC001',
    is_vaccinated: true,
  },
  {
    pet_id: 'P002',
    name: 'Tommy',
    species: 'Dog',
    breed: 'Pomeranian',
    age: 3,
    gender: 'Male',
    adoption_status: 'Adopted',
    shelter_name: 'Happy Paws Shelter',
    weight_kg: '4.2',
    microchip_id: 'MC002',
    is_vaccinated: true,
  },
  {
    pet_id: 'P003',
    name: 'Whiskers',
    species: 'Cat',
    breed: 'Persian Cat',
    age: 4,
    gender: 'Female',
    adoption_status: 'Available',
    shelter_name: 'Happy Paws Shelter',
    weight_kg: '3.8',
    microchip_id: 'MC003',
    is_vaccinated: false,
  },
  {
    pet_id: 'P004',
    name: 'Rocky',
    species: 'Dog',
    breed: 'German Shepherd',
    age: 5,
    gender: 'Male',
    adoption_status: 'Reserved',
    shelter_name: 'Happy Paws Shelter',
    weight_kg: '30.0',
    microchip_id: 'MC004',
    is_vaccinated: true,
  },
  {
    pet_id: 'P005',
    name: 'Max',
    species: 'Dog',
    breed: 'Beagle',
    age: 1,
    gender: 'Male',
    adoption_status: 'Available',
    shelter_name: 'Happy Paws Shelter',
    weight_kg: '9.0',
    microchip_id: 'MC005',
    is_vaccinated: true,
  },
  {
    pet_id: 'P006',
    name: 'Luna',
    species: 'Cat',
    breed: 'Persian Cat',
    age: 2,
    gender: 'Female',
    adoption_status: 'Available',
    shelter_name: 'Happy Paws Shelter',
    weight_kg: '3.2',
    microchip_id: 'MC006',
    is_vaccinated: false,
  },
];

const adopterRows = [
  {
    adopter_id: 'AD001',
    first_name: 'Riya',
    last_name: 'Shah',
    full_name: 'Riya Shah',
    email: 'riya@email.com',
    phone: '9876543210',
    subclass: 'Individual',
    occupation: 'Software Engineer',
  },
  {
    adopter_id: 'AD002',
    first_name: 'Arjun',
    last_name: 'Mehta',
    full_name: 'Arjun Mehta',
    email: 'arjun@email.com',
    phone: '9123456780',
    subclass: 'Individual',
    occupation: 'Teacher',
  },
  {
    adopter_id: 'AD003',
    first_name: 'Sneha',
    last_name: 'Patel',
    full_name: 'Sneha Patel',
    email: 'sneha@email.com',
    phone: '9988001122',
    subclass: 'Individual',
    occupation: 'Doctor',
  },
  {
    adopter_id: 'AD004',
    first_name: 'Karan',
    last_name: 'Joshi',
    full_name: 'Karan Joshi',
    email: 'karan@email.com',
    phone: '9765001234',
    subclass: 'Individual + Organization',
    occupation: 'Business Owner',
    org_reg_no: 'ORG-MH-2024',
  },
];

const applicationRows = [
  {
    application_id: 'A001',
    application_date: '2024-01-10',
    pet_name: 'Buddy',
    pet_id: 'P001',
    adopter_name: 'Riya Shah',
    adopter_id: 'AD001',
    status: 'Pending',
    notes: 'Interested in Buddy',
  },
  {
    application_id: 'A002',
    application_date: '2024-01-12',
    pet_name: 'Tommy',
    pet_id: 'P002',
    adopter_name: 'Arjun Mehta',
    adopter_id: 'AD002',
    status: 'Approved',
    notes: 'Good home visit done',
  },
  {
    application_id: 'A003',
    application_date: '2024-01-15',
    pet_name: 'Max',
    pet_id: 'P005',
    adopter_name: 'Arjun Mehta',
    adopter_id: 'AD002',
    status: 'Pending',
    notes: '',
  },
  {
    application_id: 'A004',
    application_date: '2024-01-20',
    pet_name: 'Rocky',
    pet_id: 'P004',
    adopter_name: 'Sneha Patel',
    adopter_id: 'AD003',
    status: 'Rejected',
    notes: 'Space constraint',
  },
  {
    application_id: 'A005',
    application_date: '2024-01-22',
    pet_name: 'Whiskers',
    pet_id: 'P003',
    adopter_name: 'Karan Joshi',
    adopter_id: 'AD004',
    status: 'Pending',
    notes: '',
  },
];

const appointmentRows = [
  {
    appointment_id: 'APT001',
    appointment_date: '2024-01-05',
    pet_name: 'Buddy',
    pet_id: 'P001',
    provider_name: 'Dr. Priya Nair',
    provider_id: 'PR001',
    service_type: 'Vaccination',
    duration_mins: 45,
    notes: '',
  },
  {
    appointment_id: 'APT002',
    appointment_date: '2024-01-12',
    pet_name: 'Max',
    pet_id: 'P005',
    provider_name: 'Clean Paws Salon',
    provider_id: 'PR002',
    service_type: 'Grooming',
    duration_mins: 60,
    notes: 'Full bath + trim',
  },
  {
    appointment_id: 'APT003',
    appointment_date: '2024-01-18',
    pet_name: 'Whiskers',
    pet_id: 'P003',
    provider_name: 'Dr. Priya Nair',
    provider_id: 'PR001',
    service_type: 'Checkup',
    duration_mins: 30,
    notes: '',
  },
  {
    appointment_id: 'APT004',
    appointment_date: '2024-01-25',
    pet_name: 'Rocky',
    pet_id: 'P004',
    provider_name: 'Clean Paws Salon',
    provider_id: 'PR002',
    service_type: 'Grooming',
    duration_mins: 45,
    notes: '',
  },
  {
    appointment_id: 'APT005',
    appointment_date: '2024-02-01',
    pet_name: 'Rocky',
    pet_id: 'P004',
    provider_name: 'Dr. Ramesh Iyer',
    provider_id: 'PR003',
    service_type: 'Vaccination',
    duration_mins: 30,
    notes: 'Annual booster',
  },
];

const providerRows = [
  {
    provider_id: 'PR001',
    name: 'Dr. Priya Nair',
    qualification: 'BVSc, MVSc',
    phone: '9988776655',
    email: 'drpriya@vet.com',
    visiting_fee: '800.00',
    subclass: 'Veterinarian',
  },
  {
    provider_id: 'PR002',
    name: 'Clean Paws Salon',
    qualification: 'Certified Groomer',
    phone: '9765432100',
    email: 'cleanpaws@mail.com',
    visiting_fee: '400.00',
    subclass: 'Groomer',
  },
  {
    provider_id: 'PR003',
    name: 'Dr. Ramesh Iyer',
    qualification: 'BVSc',
    phone: '9123001122',
    email: 'ramesh@vet.com',
    visiting_fee: '700.00',
    subclass: 'Veterinarian',
  },
];

const staffRows = [
  { staff_id: 'ST001', name: 'Anjali Rao', role: 'Caretaker', shift: 'Morning', subclass: 'Volunteer', hours_per_week: 20 },
  { staff_id: 'ST002', name: 'Vikram Nair', role: 'Caretaker', shift: 'Evening', subclass: 'Employee', salary: '28000.00', emp_id: 'EMP-2022-001' },
  { staff_id: 'ST003', name: 'Meena Pillai', role: 'Manager', shift: 'Morning', subclass: 'Employee', salary: '45000.00', emp_id: 'EMP-2021-005' },
];

const donationRows = [
  { donation_id: 'DON001', amount: '2000.00', donation_date: '2024-01-15', purpose: 'Food supplies', payment_mode: 'Cash', adopter_name: 'Riya Shah' },
  { donation_id: 'DON002', amount: '5000.00', donation_date: '2024-02-01', purpose: 'Medical fund', payment_mode: 'UPI', adopter_name: 'Arjun Mehta' },
  { donation_id: 'DON003', amount: '1500.00', donation_date: '2024-02-10', purpose: 'General support', payment_mode: 'Bank Transfer', adopter_name: 'Karan Joshi' },
];

const trainingRows = [
  { program_id: 'TR001', program_name: 'Basic Obedience', duration_weeks: 4, trainer_name: 'Rohan Verma' },
  { program_id: 'TR002', program_name: 'Advanced Agility', duration_weeks: 8, trainer_name: 'Suresh Pillai' },
];

const auditRows = applicationRows.map((row, index) => ({
  audit_id: `AUD${String(index + 1).padStart(3, '0')}`,
  application_id: row.application_id,
  adopter_id: row.adopter_id,
  pet_id: row.pet_id,
  logged_at: `2024-02-${String(index + 1).padStart(2, '0')} 10:3${index}:00`,
  action_type: 'INSERT',
}));

const petPhotosRows = [
  { photo_id: 1, pet_id: 'P001', photo_url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b' },
  { photo_id: 2, pet_id: 'P003', photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9' },
];

const shelterRows = [
  { shelter_id: 'SH001', shelter_name: 'Happy Paws Shelter', address: '12 MG Road, Mumbai', capacity: 50, phone: '9000000001' },
];

const availabilityRows = [
  { avail_id: 1, provider_id: 'PR001', provider_name: 'Dr. Priya Nair', day_of_week: 'Monday' },
  { avail_id: 2, provider_id: 'PR001', provider_name: 'Dr. Priya Nair', day_of_week: 'Wednesday' },
  { avail_id: 3, provider_id: 'PR001', provider_name: 'Dr. Priya Nair', day_of_week: 'Friday' },
  { avail_id: 4, provider_id: 'PR002', provider_name: 'Clean Paws Salon', day_of_week: 'Tuesday' },
  { avail_id: 5, provider_id: 'PR002', provider_name: 'Clean Paws Salon', day_of_week: 'Thursday' },
  { avail_id: 6, provider_id: 'PR002', provider_name: 'Clean Paws Salon', day_of_week: 'Saturday' },
];

const dogTrainingRows = [
  { pet_id: 'P001', pet_name: 'Buddy', program_id: 'TR001', program_name: 'Basic Obedience' },
  { pet_id: 'P001', pet_name: 'Buddy', program_id: 'TR002', program_name: 'Advanced Agility' },
  { pet_id: 'P004', pet_name: 'Rocky', program_id: 'TR001', program_name: 'Basic Obedience' },
  { pet_id: 'P005', pet_name: 'Max', program_id: 'TR001', program_name: 'Basic Obedience' },
];

const staffPetRows = [
  { staff_id: 'ST001', staff_name: 'Anjali Rao', pet_id: 'P001', pet_name: 'Buddy' },
  { staff_id: 'ST001', staff_name: 'Anjali Rao', pet_id: 'P003', pet_name: 'Whiskers' },
  { staff_id: 'ST001', staff_name: 'Anjali Rao', pet_id: 'P005', pet_name: 'Max' },
  { staff_id: 'ST002', staff_name: 'Vikram Nair', pet_id: 'P002', pet_name: 'Tommy' },
  { staff_id: 'ST002', staff_name: 'Vikram Nair', pet_id: 'P004', pet_name: 'Rocky' },
  { staff_id: 'ST002', staff_name: 'Vikram Nair', pet_id: 'P006', pet_name: 'Luna' },
];

const medicalRows = [
  { record_id: 1, record_date: '2024-01-05', diagnosis: 'Healthy - routine vaccination', treatment: 'Rabies + Parvovirus vaccine', follow_up_date: '2025-01-05', cost: '800.00', pet_name: 'Buddy', provider_name: 'Dr. Priya Nair' },
  { record_id: 2, record_date: '2024-01-18', diagnosis: 'Mild ear infection', treatment: 'Ear drops for 7 days', follow_up_date: '2024-01-25', cost: '700.00', pet_name: 'Whiskers', provider_name: 'Dr. Priya Nair' },
  { record_id: 3, record_date: '2024-02-01', diagnosis: 'Healthy - annual booster', treatment: 'Multi-vaccine administered', follow_up_date: '', cost: '700.00', pet_name: 'Rocky', provider_name: 'Dr. Ramesh Iyer' },
];

const referenceRows = [
  { ref_id: 1, adopter_id: 'AD001', ref_name: 'Priya Desai', ref_phone: '9800011111' },
  { ref_id: 2, adopter_id: 'AD001', ref_name: 'Raj Mehta', ref_phone: '9800022222' },
  { ref_id: 3, adopter_id: 'AD002', ref_name: 'Sunita Shah', ref_phone: '9800033333' },
];

const individualRows = adopterRows.map((row) => ({
  adopter_id: row.adopter_id,
  adopter_name: row.full_name,
  occupation: row.occupation,
}));

const organizationRows = [
  { adopter_id: 'AD004', adopter_name: 'Karan Joshi', org_reg_no: 'ORG-MH-2024' },
];

const veterinarianRows = [
  { provider_id: 'PR001', provider_name: 'Dr. Priya Nair', vet_license_no: 'VET-MH-0012', specialization: 'Small Animal Surgery' },
  { provider_id: 'PR003', provider_name: 'Dr. Ramesh Iyer', vet_license_no: 'VET-MH-0045', specialization: 'General Practice' },
];

const groomerRows = [
  { provider_id: 'PR002', provider_name: 'Clean Paws Salon', tools_used: 'Clippers, Dryer, Combs', grooming_styles: 'Puppy Cut, Teddy Bear Cut' },
];

const volunteerRows = [
  { staff_id: 'ST001', staff_name: 'Anjali Rao', hours_per_week: 20 },
];

const employeeRows = staffRows
  .filter((row) => row.subclass === 'Employee')
  .map((row) => ({
    staff_id: row.staff_id,
    staff_name: row.name,
    salary: row.salary,
    emp_id: row.emp_id,
  }));

const dogRows = petRows
  .filter((row) => row.species === 'Dog')
  .map((row) => ({
    pet_id: row.pet_id,
    pet_name: row.name,
    size: row.pet_id === 'P001' || row.pet_id === 'P004' ? 'Large' : row.pet_id === 'P002' ? 'Small' : 'Medium',
    is_trained: row.pet_id !== 'P002',
  }));

const catRows = petRows
  .filter((row) => row.species === 'Cat')
  .map((row) => ({
    pet_id: row.pet_id,
    pet_name: row.name,
    is_indoor: row.pet_id === 'P006',
    fur_length: row.pet_id === 'P003' ? 'Long' : 'Medium',
  }));

const otherAnimalRows = [];

export const appMeta = {
  name: 'Pet Adoption and Care System',
  subtitle: 'Vanilla HTML/CSS/JS shell for the PostgreSQL-backed CRUD rewrite.',
  summary:
    'A responsive static frontend that preserves the legacy information architecture: dashboard, entity pages, SQL views, and the before/after update result screen.',
};

export const navigationGroups = [
  {
    title: 'Primary',
    items: [
      { key: 'dashboard', label: 'Dashboard', route: '#/dashboard' },
      { key: 'pets', label: 'Pets', route: '#/entity/pets' },
      { key: 'adopters', label: 'Adopters', route: '#/entity/adopters' },
      { key: 'applications', label: 'Applications', route: '#/entity/applications' },
      { key: 'appointments', label: 'Appointments', route: '#/entity/appointments' },
      { key: 'providers', label: 'Providers', route: '#/entity/providers' },
      { key: 'medical', label: 'Medical Records', route: '#/entity/medical' },
      { key: 'staff', label: 'Staff', route: '#/entity/staff' },
      { key: 'donations', label: 'Donations', route: '#/entity/donations' },
      { key: 'training', label: 'Training', route: '#/entity/training' },
    ],
  },
  {
    title: 'Support Tables',
    items: [
      { key: 'shelters', label: 'Shelters', route: '#/entity/shelters' },
      { key: 'dogs', label: 'Dog Subclass', route: '#/entity/dogs' },
      { key: 'cats', label: 'Cat Subclass', route: '#/entity/cats' },
      { key: 'other-animals', label: 'Other Animals', route: '#/entity/other-animals' },
      { key: 'pet-photos', label: 'Pet Photos', route: '#/entity/pet-photos' },
      { key: 'individuals', label: 'Individuals', route: '#/entity/individuals' },
      { key: 'organizations', label: 'Organizations', route: '#/entity/organizations' },
      { key: 'references', label: 'References', route: '#/entity/references' },
      { key: 'veterinarians', label: 'Veterinarians', route: '#/entity/veterinarians' },
      { key: 'groomers', label: 'Groomers', route: '#/entity/groomers' },
      { key: 'availability', label: 'Availability', route: '#/entity/availability' },
      { key: 'volunteers', label: 'Volunteers', route: '#/entity/volunteers' },
      { key: 'employees', label: 'Employees', route: '#/entity/employees' },
      { key: 'staff-pet', label: 'Staff_Pet', route: '#/entity/staff-pet' },
      { key: 'dog-training', label: 'Dog_Training', route: '#/entity/dog-training' },
      { key: 'audit-log', label: 'Audit Log', route: '#/entity/audit-log' },
    ],
  },
  {
    title: 'System',
    items: [
      { key: 'views', label: 'SQL Views', route: '#/views' },
      { key: 'update-result', label: 'Update Result', route: '#/update-result' },
    ],
  },
];

export const dashboardStats = [
  {
    key: 'availablePets',
    label: 'Available pets',
    value: 4,
    note: 'Ready for adoption',
    accent: 'mint',
  },
  {
    key: 'adoptedPets',
    label: 'Adopted pets',
    value: 1,
    note: 'Transferred out of inventory',
    accent: 'stone',
  },
  {
    key: 'pendingApps',
    label: 'Pending applications',
    value: 3,
    note: 'Waiting for review',
    accent: 'gold',
  },
  {
    key: 'adopters',
    label: 'Total adopters',
    value: 4,
    note: 'Individuals + organizations',
    accent: 'blue',
  },
  {
    key: 'appointments',
    label: 'Appointments',
    value: 5,
    note: 'Visits and grooming slots',
    accent: 'violet',
  },
  {
    key: 'medical',
    label: 'Medical records',
    value: 3,
    note: 'Pet health history',
    accent: 'rose',
  },
  {
    key: 'staff',
    label: 'Staff members',
    value: 3,
    note: 'Volunteers and employees',
    accent: 'mint',
  },
  {
    key: 'donations',
    label: 'Total donations',
    value: 8500,
    note: 'Fundraising and support',
    accent: 'gold',
    prefix: 'Rs ',
  },
];

export const relationships = [
  ['HOUSES', 'Shelter → Pets', '1 : N', 'Regular relationship'],
  ['RECEIVES', 'Pets → Adoption_Applications', '1 : N', 'Identifying relationship'],
  ['SUBMITS', 'Adopters → Adoption_Applications', '1 : N', 'Total participation on adopters side'],
  ['SCHEDULES', 'Pets → Appointments', '1 : N', 'Weak entity relationship'],
  ['HANDLES', 'Pet_Care_Providers → Appointments', '1 : N', 'Regular relationship'],
  ['HAS', 'Pets → Medical_Records', '1 : N', 'Identifying relationship'],
  ['CREATES', 'Veterinarian → Medical_Records', '1 : N', 'Subclass relationship'],
  ['HAS (Ref)', 'Adopters → References_Table', '1 : N', 'Identifying weak entity'],
  ['CARES FOR', 'Staff ↔ Pets', 'M : N', 'Junction table Staff_Pet'],
  ['MAKES', 'Adopters → Donation', '1 : N', 'Regular relationship'],
  ['ENROLLS IN', 'Dog ↔ Training_Programs', 'M : N', 'Junction table Dog_Training'],
  ['Is-A (d)', 'Pets → Dog / Cat / Other_Animal', 'Disjoint', 'EER specialization'],
  ['Is-A (o)', 'Adopters → Individual / Organization', 'Overlapping', 'EER specialization'],
  ['Is-A (d)', 'Pet_Care_Providers → Veterinarian / Groomer', 'Disjoint', 'EER specialization'],
  ['Is-A (d)', 'Staff → Volunteer / Employee', 'Disjoint', 'EER specialization'],
];

export const viewDefinitions = [
  {
    key: 'available-pets',
    title: 'Available_Pets',
    badge: 'Simple view',
    description: 'Single-table view of pets currently available for adoption.',
    sql: `CREATE OR REPLACE VIEW Available_Pets AS
SELECT pet_id, name, breed, age, gender, adoption_status
FROM Pets
WHERE adoption_status = 'Available';`,
    rows: petRows.filter((row) => row.adoption_status === 'Available'),
  },
  {
    key: 'pending-applications',
    title: 'Pending_Applications_View',
    badge: '3-table join',
    description: 'Pending applications joined to pet and adopter details.',
    sql: `CREATE OR REPLACE VIEW Pending_Applications_View AS
SELECT aa.application_id, aa.application_date, p.name AS pet_name, p.breed,
       ad.first_name || ' ' || ad.last_name AS adopter_name, ad.phone
FROM Adoption_Applications aa
JOIN Pets p ON aa.pet_id = p.pet_id
JOIN Adopters ad ON aa.adopter_id = ad.adopter_id
WHERE aa.status = 'Pending';`,
    rows: applicationRows.filter((row) => row.status === 'Pending'),
  },
  {
    key: 'appointment-history',
    title: 'Pet_Appointment_History',
    badge: '3-table join',
    description: 'Appointment history with pet and provider context.',
    sql: `CREATE OR REPLACE VIEW Pet_Appointment_History AS
SELECT p.name AS pet_name, p.breed, a.appointment_date, a.service_type,
       a.duration_mins, pcp.name AS provider_name, pcp.visiting_fee
FROM Appointments a
JOIN Pets p ON a.pet_id = p.pet_id
JOIN Pet_Care_Providers pcp ON a.provider_id = pcp.provider_id;`,
    rows: appointmentRows,
  },
];

export const triggerDefinitions = [
  {
    name: 'trg_approval_status',
    fires: 'AFTER UPDATE on Adoption_Applications',
    behavior: "When status becomes 'Approved', the related pet is marked 'Adopted'.",
  },
  {
    name: 'trg_check_pet_status',
    fires: 'BEFORE INSERT on Appointments',
    behavior: "Blocks appointment creation for pets already marked 'Adopted'.",
  },
  {
    name: 'trg_log_application',
    fires: 'AFTER INSERT on Adoption_Applications',
    behavior: 'Writes an audit row into Application_Audit.',
  },
];

export const updateResultSample = {
  entity: 'Pets',
  label: 'P001 - Buddy',
  sql: `UPDATE Pets SET name = 'Buddy', adoption_status = 'Available', is_vaccinated = TRUE
WHERE pet_id = 'P001';`,
  before: {
    pet_id: 'P001',
    name: 'Buddy',
    breed: 'Labrador',
    age: 2,
    adoption_status: 'Reserved',
    is_vaccinated: false,
  },
  after: {
    pet_id: 'P001',
    name: 'Buddy',
    breed: 'Labrador',
    age: 2,
    adoption_status: 'Available',
    is_vaccinated: true,
  },
};

function makeEntity(config) {
  return config;
}

export const entities = {
  pets: makeEntity({
    key: 'pets',
    route: '#/entity/pets',
    title: 'Pets',
    subtitle: 'Main adoption catalogue with shelter assignment and species subclass details.',
    table: 'Pets',
    heroNote: 'The shell keeps the same CRUD shape as the legacy app, but the layout is cleaner and the navigation is now consistent across the app.',
    actions: ['Create pet', 'Edit pet', 'Delete pet', 'Open subclasses'],
    columns: [
      { key: 'pet_id', label: 'Pet ID' },
      { key: 'name', label: 'Name' },
      { key: 'species', label: 'Species' },
      { key: 'breed', label: 'Breed' },
      { key: 'adoption_status', label: 'Status', tone: 'status' },
      { key: 'shelter_name', label: 'Shelter' },
    ],
    fields: [
      { name: 'pet_id', label: 'Pet ID', type: 'text', required: true, placeholder: 'P007' },
      { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Coco' },
      { name: 'breed', label: 'Breed', type: 'text', placeholder: 'Labrador' },
      { name: 'age', label: 'Age', type: 'number', min: 0 },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'] },
      { name: 'weight_kg', label: 'Weight (kg)', type: 'number', step: '0.1' },
      { name: 'adoption_status', label: 'Adoption status', type: 'select', options: ['Available', 'Reserved', 'Adopted'] },
      { name: 'microchip_id', label: 'Microchip ID', type: 'text' },
      { name: 'is_vaccinated', label: 'Vaccinated', type: 'checkbox' },
      { name: 'shelter_name', label: 'Shelter', type: 'select', options: shelterRows.map((row) => row.shelter_name) },
    ],
    records: petRows,
    emptyHint: 'Use the form panel to sketch add/edit/delete states for the pet flow.',
    related: [
      { label: 'Dog rows', route: '#/entity/dogs' },
      { label: 'Cat rows', route: '#/entity/cats' },
      { label: 'Other animals', route: '#/entity/other-animals' },
      { label: 'Pet photos', route: '#/entity/pet-photos' },
    ],
    notes: [
      "This page mirrors the old adoption catalog and still exposes the subclass relationships, but the controls are grouped into a more readable two-column layout.",
    ],
  }),
  adopters: makeEntity({
    key: 'adopters',
    route: '#/entity/adopters',
    title: 'Adopters',
    subtitle: 'Overlapping specialization for individuals and organizations.',
    table: 'Adopters',
    heroNote: 'The adopter page keeps the same entity model, but the overlapping subclass choice is now explicit in the UI instead of being hidden in separate forms.',
    actions: ['Create adopter', 'Edit adopter', 'Delete adopter', 'Manage references'],
    columns: [
      { key: 'adopter_id', label: 'Adopter ID' },
      { key: 'full_name', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'subclass', label: 'Subclass', tone: 'pill' },
      { key: 'occupation', label: 'Occupation' },
    ],
    fields: [
      { name: 'adopter_id', label: 'Adopter ID', type: 'text', required: true, placeholder: 'AD005' },
      { name: 'first_name', label: 'First name', type: 'text', required: true, placeholder: 'Asha' },
      { name: 'last_name', label: 'Last name', type: 'text', required: true, placeholder: 'Iyer' },
      { name: 'email', label: 'Email', type: 'email', placeholder: 'asha@example.com' },
      { name: 'phone', label: 'Phone', type: 'text', required: true, placeholder: '9000000000' },
      { name: 'address', label: 'Address', type: 'text' },
      { name: 'dob', label: 'Date of birth', type: 'date' },
      { name: 'id_proof', label: 'ID proof', type: 'text' },
      { name: 'is_individual', label: 'Individual', type: 'checkbox' },
      { name: 'occupation', label: 'Occupation', type: 'text' },
      { name: 'is_organization', label: 'Organization', type: 'checkbox' },
      { name: 'org_reg_no', label: 'Registration number', type: 'text' },
    ],
    records: adopterRows,
    emptyHint: 'The create form can capture the overlapping Individual and Organization flags as separate blocks.',
    related: [
      { label: 'References', route: '#/entity/references' },
      { label: 'Individuals', route: '#/entity/individuals' },
      { label: 'Organizations', route: '#/entity/organizations' },
    ],
    notes: ['The summary cards call out applications and references so the page can keep the original academic EER emphasis.'],
  }),
  applications: makeEntity({
    key: 'applications',
    route: '#/entity/applications',
    title: 'Adoption Applications',
    subtitle: 'Weak entity with trigger-driven approval flow.',
    table: 'Adoption_Applications',
    heroNote: 'The layout shows the same approval and audit story as the earlier app, but the trigger guidance is now a reusable status panel instead of repeated inline blocks.',
    actions: ['Create application', 'Edit application', 'Delete application', 'Open audit log'],
    columns: [
      { key: 'application_id', label: 'App ID' },
      { key: 'application_date', label: 'Date' },
      { key: 'pet_name', label: 'Pet' },
      { key: 'adopter_name', label: 'Adopter' },
      { key: 'status', label: 'Status', tone: 'status' },
      { key: 'notes', label: 'Notes' },
    ],
    fields: [
      { name: 'application_id', label: 'Application ID', type: 'text', required: true, placeholder: 'A006' },
      { name: 'application_date', label: 'Application date', type: 'date', required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'Approved', 'Rejected'] },
      { name: 'adopter_id', label: 'Adopter', type: 'select', options: adopterRows.map((row) => `${row.adopter_id} - ${row.full_name}`) },
      { name: 'pet_id', label: 'Pet', type: 'select', options: petRows.map((row) => `${row.pet_id} - ${row.name} (${row.adoption_status})`) },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    records: applicationRows,
    emptyHint: 'When this form is connected to PostgreSQL, the approval trigger and audit trigger should stay intact.',
    related: [{ label: 'Audit log', route: '#/entity/audit-log' }],
    notes: [
      "Approved applications should update the pet status to Adopted in the backend, but the shell only surfaces the rule and does not execute it.",
    ],
  }),
  appointments: makeEntity({
    key: 'appointments',
    route: '#/entity/appointments',
    title: 'Appointments',
    subtitle: 'Weak entity linking pets and providers with an adoption-status guard.',
    table: 'Appointments',
    heroNote: 'The page keeps the old trigger warning, but the visual language is quieter and more deliberate so the key constraint is easier to notice.',
    actions: ['Create appointment', 'Edit appointment', 'Delete appointment'],
    columns: [
      { key: 'appointment_id', label: 'Appt ID' },
      { key: 'appointment_date', label: 'Date' },
      { key: 'pet_name', label: 'Pet' },
      { key: 'provider_name', label: 'Provider' },
      { key: 'service_type', label: 'Service', tone: 'pill' },
      { key: 'duration_mins', label: 'Duration' },
    ],
    fields: [
      { name: 'appointment_id', label: 'Appointment ID', type: 'text', required: true, placeholder: 'APT006' },
      { name: 'appointment_date', label: 'Appointment date', type: 'date', required: true },
      { name: 'service_type', label: 'Service type', type: 'text', required: true, placeholder: 'Vaccination' },
      { name: 'duration_mins', label: 'Duration (mins)', type: 'number', min: 15, step: 15 },
      { name: 'pet_id', label: 'Pet', type: 'select', options: petRows.map((row) => `${row.pet_id} - ${row.name}`) },
      { name: 'provider_id', label: 'Provider', type: 'select', options: providerRows.map((row) => `${row.provider_id} - ${row.name}`) },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    records: appointmentRows,
    emptyHint: 'The shell keeps the “adopted pets cannot be booked” rule visible in the form helper block.',
    notes: ['The provider and pet dropdowns are kept separate so the hierarchy remains obvious.'],
  }),
  providers: makeEntity({
    key: 'providers',
    route: '#/entity/providers',
    title: 'Pet Care Providers',
    subtitle: 'Core provider table with veterinarian and groomer subclasses.',
    table: 'Pet_Care_Providers',
    heroNote: 'The provider page uses the same data model, but the subclass and availability panels are presented as related cards instead of an overloaded single screen.',
    actions: ['Create provider', 'Edit provider', 'Delete provider', 'Open subclasses'],
    columns: [
      { key: 'provider_id', label: 'Provider ID' },
      { key: 'name', label: 'Name' },
      { key: 'qualification', label: 'Qualification' },
      { key: 'phone', label: 'Phone' },
      { key: 'visiting_fee', label: 'Fee', tone: 'pill' },
      { key: 'subclass', label: 'Subclass' },
    ],
    fields: [
      { name: 'provider_id', label: 'Provider ID', type: 'text', required: true, placeholder: 'PR004' },
      { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Dr. Nisha Khan' },
      { name: 'qualification', label: 'Qualification', type: 'text' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'visiting_fee', label: 'Visiting fee', type: 'number', step: '0.01' },
    ],
    records: providerRows,
    related: [
      { label: 'Veterinarians', route: '#/entity/veterinarians' },
      { label: 'Groomers', route: '#/entity/groomers' },
      { label: 'Availability', route: '#/entity/availability' },
    ],
    notes: ['This page is the parent node for the provider specialization tree.'],
  }),
  medical: makeEntity({
    key: 'medical',
    route: '#/entity/medical',
    title: 'Medical Records',
    subtitle: 'Weak entity attached to pets and optionally tied to veterinarians.',
    table: 'Medical_Records',
    heroNote: 'The medical screen keeps the high-density data shape but improves spacing, hierarchy, and table scanning so the records are easier to read.',
    actions: ['Create record', 'Edit record', 'Delete record'],
    columns: [
      { key: 'record_id', label: 'Record ID' },
      { key: 'record_date', label: 'Date' },
      { key: 'pet_name', label: 'Pet' },
      { key: 'provider_name', label: 'Veterinarian' },
      { key: 'diagnosis', label: 'Diagnosis' },
      { key: 'cost', label: 'Cost', tone: 'pill' },
    ],
    fields: [
      { name: 'record_id', label: 'Record ID', type: 'number', readonly: true },
      { name: 'record_date', label: 'Record date', type: 'date', required: true },
      { name: 'diagnosis', label: 'Diagnosis', type: 'textarea' },
      { name: 'treatment', label: 'Treatment', type: 'textarea' },
      { name: 'follow_up_date', label: 'Follow-up date', type: 'date' },
      { name: 'cost', label: 'Cost', type: 'number', step: '0.01' },
      { name: 'pet_id', label: 'Pet', type: 'select', options: petRows.map((row) => `${row.pet_id} - ${row.name}`) },
      { name: 'provider_id', label: 'Veterinarian', type: 'select', options: veterinarianRows.map((row) => `${row.provider_id} - ${row.provider_name}`) },
    ],
    records: medicalRows,
    notes: ['The backend should keep the provider foreign key restricted to veterinarians only.'],
  }),
  staff: makeEntity({
    key: 'staff',
    route: '#/entity/staff',
    title: 'Staff',
    subtitle: 'Core staff table with volunteer, employee, and Staff_Pet support tables.',
    table: 'Staff',
    heroNote: 'The page groups the M:N assignment and subclass links into a small related-actions cluster so the relationships are visible without crowding the list.',
    actions: ['Create staff', 'Edit staff', 'Delete staff', 'Open assignments'],
    columns: [
      { key: 'staff_id', label: 'Staff ID' },
      { key: 'name', label: 'Name' },
      { key: 'role', label: 'Role' },
      { key: 'shift', label: 'Shift', tone: 'pill' },
      { key: 'subclass', label: 'Subclass' },
    ],
    fields: [
      { name: 'staff_id', label: 'Staff ID', type: 'text', required: true, placeholder: 'ST004' },
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'role', label: 'Role', type: 'text' },
      { name: 'shift', label: 'Shift', type: 'select', options: ['Morning', 'Evening', 'Night'] },
    ],
    records: staffRows,
    related: [
      { label: 'Volunteers', route: '#/entity/volunteers' },
      { label: 'Employees', route: '#/entity/employees' },
      { label: 'Staff_Pet', route: '#/entity/staff-pet' },
    ],
  }),
  donations: makeEntity({
    key: 'donations',
    route: '#/entity/donations',
    title: 'Donations',
    subtitle: 'Donation records linked to adopters.',
    table: 'Donation',
    heroNote: 'The donations page keeps the same facts but gives the totals and payment mode chips more room to breathe.',
    actions: ['Create donation', 'Edit donation', 'Delete donation'],
    columns: [
      { key: 'donation_id', label: 'Donation ID' },
      { key: 'donation_date', label: 'Date' },
      { key: 'amount', label: 'Amount', tone: 'pill' },
      { key: 'payment_mode', label: 'Payment mode', tone: 'pill' },
      { key: 'adopter_name', label: 'Adopter' },
    ],
    fields: [
      { name: 'donation_id', label: 'Donation ID', type: 'text', required: true },
      { name: 'amount', label: 'Amount', type: 'number', required: true, step: '0.01' },
      { name: 'donation_date', label: 'Donation date', type: 'date', required: true },
      { name: 'purpose', label: 'Purpose', type: 'text' },
      { name: 'payment_mode', label: 'Payment mode', type: 'select', options: ['Cash', 'UPI', 'Bank Transfer', 'Cheque'] },
      { name: 'adopter_id', label: 'Adopter', type: 'select', options: adopterRows.map((row) => `${row.adopter_id} - ${row.full_name}`) },
    ],
    records: donationRows,
  }),
  training: makeEntity({
    key: 'training',
    route: '#/entity/training',
    title: 'Training Programs',
    subtitle: 'Training catalog with dog enrollment junction.',
    table: 'Training_Programs',
    heroNote: 'The page groups the training catalog and the enrollment junction into a single higher-level narrative.',
    actions: ['Create program', 'Edit program', 'Delete program', 'Open enrollments'],
    columns: [
      { key: 'program_id', label: 'Program ID' },
      { key: 'program_name', label: 'Program name' },
      { key: 'duration_weeks', label: 'Duration' },
      { key: 'trainer_name', label: 'Trainer' },
    ],
    fields: [
      { name: 'program_id', label: 'Program ID', type: 'text', required: true },
      { name: 'program_name', label: 'Program name', type: 'text', required: true },
      { name: 'duration_weeks', label: 'Duration (weeks)', type: 'number', min: 1 },
      { name: 'trainer_name', label: 'Trainer name', type: 'text' },
    ],
    records: trainingRows,
    related: [{ label: 'Dog_Training', route: '#/entity/dog-training' }],
  }),
  shelters: makeEntity({
    key: 'shelters',
    route: '#/entity/shelters',
    title: 'Shelters',
    subtitle: 'Independent shelter table used by pets.',
    table: 'Shelter',
    columns: [
      { key: 'shelter_id', label: 'Shelter ID' },
      { key: 'shelter_name', label: 'Shelter name' },
      { key: 'capacity', label: 'Capacity', tone: 'pill' },
      { key: 'phone', label: 'Phone' },
    ],
    fields: [
      { name: 'shelter_id', label: 'Shelter ID', type: 'text', required: true },
      { name: 'shelter_name', label: 'Shelter name', type: 'text', required: true },
      { name: 'address', label: 'Address', type: 'text' },
      { name: 'capacity', label: 'Capacity', type: 'number', min: 1 },
      { name: 'phone', label: 'Phone', type: 'text' },
    ],
    records: shelterRows,
  }),
  dogs: makeEntity({
    key: 'dogs',
    route: '#/entity/dogs',
    title: 'Dog Subclass',
    subtitle: 'Disjoint subclass rows for dogs.',
    table: 'Dog',
    columns: [
      { key: 'pet_id', label: 'Pet ID' },
      { key: 'pet_name', label: 'Pet name' },
      { key: 'size', label: 'Size', tone: 'pill' },
      { key: 'is_trained', label: 'Trained' },
    ],
    fields: [
      { name: 'pet_id', label: 'Pet', type: 'select', options: dogRows.map((row) => `${row.pet_id} - ${row.pet_name}`) },
      { name: 'size', label: 'Size', type: 'select', options: ['Small', 'Medium', 'Large'] },
      { name: 'is_trained', label: 'Is trained', type: 'checkbox' },
    ],
    records: dogRows,
  }),
  cats: makeEntity({
    key: 'cats',
    route: '#/entity/cats',
    title: 'Cat Subclass',
    subtitle: 'Disjoint subclass rows for cats.',
    table: 'Cat',
    columns: [
      { key: 'pet_id', label: 'Pet ID' },
      { key: 'pet_name', label: 'Pet name' },
      { key: 'is_indoor', label: 'Indoor' },
      { key: 'fur_length', label: 'Fur length', tone: 'pill' },
    ],
    fields: [
      { name: 'pet_id', label: 'Pet', type: 'select', options: catRows.map((row) => `${row.pet_id} - ${row.pet_name}`) },
      { name: 'is_indoor', label: 'Indoor', type: 'checkbox' },
      { name: 'fur_length', label: 'Fur length', type: 'select', options: ['Short', 'Medium', 'Long'] },
    ],
    records: catRows,
  }),
  'other-animals': makeEntity({
    key: 'other-animals',
    route: '#/entity/other-animals',
    title: 'Other Animal Subclass',
    subtitle: 'Subclass rows for non-dog and non-cat animals.',
    table: 'Other_Animal',
    columns: [
      { key: 'pet_id', label: 'Pet ID' },
      { key: 'species_name', label: 'Species name' },
    ],
    fields: [
      { name: 'pet_id', label: 'Pet', type: 'select', options: [] },
      { name: 'species_name', label: 'Species name', type: 'text', required: true },
    ],
    records: otherAnimalRows,
    emptyHint: 'No sample rows are seeded for this subclass in the demo database.',
  }),
  'pet-photos': makeEntity({
    key: 'pet-photos',
    route: '#/entity/pet-photos',
    title: 'Pet Photos',
    subtitle: 'Multi-valued photo table for pets.',
    table: 'Pet_Photos',
    columns: [
      { key: 'photo_id', label: 'Photo ID' },
      { key: 'pet_id', label: 'Pet ID' },
      { key: 'photo_url', label: 'Photo URL' },
    ],
    fields: [
      { name: 'photo_id', label: 'Photo ID', type: 'number', readonly: true },
      { name: 'pet_id', label: 'Pet', type: 'select', options: petRows.map((row) => `${row.pet_id} - ${row.name}`) },
      { name: 'photo_url', label: 'Photo URL', type: 'url' },
    ],
    records: petPhotosRows,
  }),
  individuals: makeEntity({
    key: 'individuals',
    route: '#/entity/individuals',
    title: 'Individual Subclass',
    subtitle: 'Overlapping adopter subclass for individual adopters.',
    table: 'Individual',
    columns: [
      { key: 'adopter_id', label: 'Adopter ID' },
      { key: 'adopter_name', label: 'Adopter name' },
      { key: 'occupation', label: 'Occupation' },
    ],
    fields: [
      { name: 'adopter_id', label: 'Adopter', type: 'select', options: adopterRows.map((row) => `${row.adopter_id} - ${row.full_name}`) },
      { name: 'occupation', label: 'Occupation', type: 'text' },
    ],
    records: individualRows,
  }),
  organizations: makeEntity({
    key: 'organizations',
    route: '#/entity/organizations',
    title: 'Organization Subclass',
    subtitle: 'Overlapping adopter subclass for organizations.',
    table: 'Organization',
    columns: [
      { key: 'adopter_id', label: 'Adopter ID' },
      { key: 'adopter_name', label: 'Adopter name' },
      { key: 'org_reg_no', label: 'Registration no.' },
    ],
    fields: [
      { name: 'adopter_id', label: 'Adopter', type: 'select', options: adopterRows.map((row) => `${row.adopter_id} - ${row.full_name}`) },
      { name: 'org_reg_no', label: 'Registration number', type: 'text', required: true },
    ],
    records: organizationRows,
  }),
  references: makeEntity({
    key: 'references',
    route: '#/entity/references',
    title: 'References Table',
    subtitle: 'Weak entity for adopter references.',
    table: 'References_Table',
    columns: [
      { key: 'ref_id', label: 'Ref ID' },
      { key: 'adopter_id', label: 'Adopter ID' },
      { key: 'ref_name', label: 'Reference name' },
      { key: 'ref_phone', label: 'Reference phone' },
    ],
    fields: [
      { name: 'ref_id', label: 'Ref ID', type: 'number', readonly: true },
      { name: 'adopter_id', label: 'Adopter', type: 'select', options: adopterRows.map((row) => `${row.adopter_id} - ${row.full_name}`) },
      { name: 'ref_name', label: 'Reference name', type: 'text', required: true },
      { name: 'ref_phone', label: 'Reference phone', type: 'text', required: true },
    ],
    records: referenceRows,
  }),
  veterinarians: makeEntity({
    key: 'veterinarians',
    route: '#/entity/veterinarians',
    title: 'Veterinarian Subclass',
    subtitle: 'Disjoint provider subclass for veterinarians.',
    table: 'Veterinarian',
    columns: [
      { key: 'provider_id', label: 'Provider ID' },
      { key: 'provider_name', label: 'Provider name' },
      { key: 'vet_license_no', label: 'License no.' },
      { key: 'specialization', label: 'Specialization' },
    ],
    fields: [
      { name: 'provider_id', label: 'Provider', type: 'select', options: veterinarianRows.map((row) => `${row.provider_id} - ${row.provider_name}`) },
      { name: 'vet_license_no', label: 'License number', type: 'text', required: true },
      { name: 'specialization', label: 'Specialization', type: 'text' },
    ],
    records: veterinarianRows,
  }),
  groomers: makeEntity({
    key: 'groomers',
    route: '#/entity/groomers',
    title: 'Groomer Subclass',
    subtitle: 'Disjoint provider subclass for groomers.',
    table: 'Groomer',
    columns: [
      { key: 'provider_id', label: 'Provider ID' },
      { key: 'provider_name', label: 'Provider name' },
      { key: 'tools_used', label: 'Tools used' },
      { key: 'grooming_styles', label: 'Styles' },
    ],
    fields: [
      { name: 'provider_id', label: 'Provider', type: 'select', options: groomerRows.map((row) => `${row.provider_id} - ${row.provider_name}`) },
      { name: 'tools_used', label: 'Tools used', type: 'text' },
      { name: 'grooming_styles', label: 'Grooming styles', type: 'text' },
    ],
    records: groomerRows,
  }),
  availability: makeEntity({
    key: 'availability',
    route: '#/entity/availability',
    title: 'Provider Availability',
    subtitle: 'Multi-valued provider availability table.',
    table: 'Provider_Availability',
    columns: [
      { key: 'avail_id', label: 'Availability ID' },
      { key: 'provider_id', label: 'Provider ID' },
      { key: 'provider_name', label: 'Provider name' },
      { key: 'day_of_week', label: 'Day of week', tone: 'pill' },
    ],
    fields: [
      { name: 'avail_id', label: 'Availability ID', type: 'number', readonly: true },
      { name: 'provider_id', label: 'Provider', type: 'select', options: providerRows.map((row) => `${row.provider_id} - ${row.name}`) },
      { name: 'day_of_week', label: 'Day of week', type: 'select', options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    ],
    records: availabilityRows,
  }),
  volunteers: makeEntity({
    key: 'volunteers',
    route: '#/entity/volunteers',
    title: 'Volunteer Subclass',
    subtitle: 'Disjoint staff subclass for volunteers.',
    table: 'Volunteer',
    columns: [
      { key: 'staff_id', label: 'Staff ID' },
      { key: 'staff_name', label: 'Staff name' },
      { key: 'hours_per_week', label: 'Hours / week' },
    ],
    fields: [
      { name: 'staff_id', label: 'Staff', type: 'select', options: volunteerRows.map((row) => `${row.staff_id} - ${row.staff_name}`) },
      { name: 'hours_per_week', label: 'Hours per week', type: 'number', min: 0 },
    ],
    records: volunteerRows,
  }),
  employees: makeEntity({
    key: 'employees',
    route: '#/entity/employees',
    title: 'Employee Subclass',
    subtitle: 'Disjoint staff subclass for employees.',
    table: 'Employee',
    columns: [
      { key: 'staff_id', label: 'Staff ID' },
      { key: 'staff_name', label: 'Staff name' },
      { key: 'salary', label: 'Salary', tone: 'pill' },
      { key: 'emp_id', label: 'Employee code' },
    ],
    fields: [
      { name: 'staff_id', label: 'Staff', type: 'select', options: employeeRows.map((row) => `${row.staff_id} - ${row.staff_name}`) },
      { name: 'salary', label: 'Salary', type: 'number', step: '0.01' },
      { name: 'emp_id', label: 'Employee code', type: 'text' },
    ],
    records: employeeRows,
  }),
  'staff-pet': makeEntity({
    key: 'staff-pet',
    route: '#/entity/staff-pet',
    title: 'Staff_Pet Junction',
    subtitle: 'Many-to-many assignment table between staff and pets.',
    table: 'Staff_Pet',
    pk: ['staff_id', 'pet_id'],
    columns: [
      { key: 'staff_id', label: 'Staff ID' },
      { key: 'staff_name', label: 'Staff name' },
      { key: 'pet_id', label: 'Pet ID' },
      { key: 'pet_name', label: 'Pet name' },
    ],
    fields: [
      { name: 'staff_id', label: 'Staff', type: 'select', options: staffRows.map((row) => `${row.staff_id} - ${row.name}`) },
      { name: 'pet_id', label: 'Pet', type: 'select', options: petRows.map((row) => `${row.pet_id} - ${row.name}`) },
    ],
    records: staffPetRows,
  }),
  'dog-training': makeEntity({
    key: 'dog-training',
    route: '#/entity/dog-training',
    title: 'Dog_Training Junction',
    subtitle: 'Many-to-many enrollment table between dogs and training programs.',
    table: 'Dog_Training',
    pk: ['pet_id', 'program_id'],
    columns: [
      { key: 'pet_id', label: 'Dog ID' },
      { key: 'pet_name', label: 'Dog name' },
      { key: 'program_id', label: 'Program ID' },
      { key: 'program_name', label: 'Program name' },
    ],
    fields: [
      { name: 'pet_id', label: 'Dog', type: 'select', options: dogRows.map((row) => `${row.pet_id} - ${row.pet_name}`) },
      { name: 'program_id', label: 'Program', type: 'select', options: trainingRows.map((row) => `${row.program_id} - ${row.program_name}`) },
    ],
    records: dogTrainingRows,
  }),
  'audit-log': makeEntity({
    key: 'audit-log',
    route: '#/entity/audit-log',
    title: 'Application Audit',
    subtitle: 'Trigger-generated audit rows for application inserts.',
    table: 'Application_Audit',
    columns: [
      { key: 'audit_id', label: 'Audit ID' },
      { key: 'application_id', label: 'Application ID' },
      { key: 'adopter_id', label: 'Adopter ID' },
      { key: 'pet_id', label: 'Pet ID' },
      { key: 'logged_at', label: 'Logged at' },
      { key: 'action_type', label: 'Action type', tone: 'pill' },
    ],
    fields: [
      { name: 'audit_id', label: 'Audit ID', type: 'number', readonly: true },
      { name: 'application_id', label: 'Application ID', type: 'text' },
      { name: 'adopter_id', label: 'Adopter ID', type: 'text' },
      { name: 'pet_id', label: 'Pet ID', type: 'text' },
      { name: 'logged_at', label: 'Logged at', type: 'text' },
      { name: 'action_type', label: 'Action type', type: 'text' },
    ],
    records: auditRows,
    emptyHint: 'These rows are generated by the application trigger in the database layer.',
  }),
};

export const entityOrder = [
  'pets',
  'adopters',
  'applications',
  'appointments',
  'providers',
  'medical',
  'staff',
  'donations',
  'training',
  'shelters',
  'dogs',
  'cats',
  'other-animals',
  'pet-photos',
  'individuals',
  'organizations',
  'references',
  'veterinarians',
  'groomers',
  'availability',
  'volunteers',
  'employees',
  'staff-pet',
  'dog-training',
  'audit-log',
];
