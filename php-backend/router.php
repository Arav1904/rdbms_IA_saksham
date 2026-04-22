<?php
declare(strict_types=1);

$rootDir = dirname(__DIR__);
$frontendDir = $rootDir . '/frontend';
$envFile = $rootDir . '/backend/.env';

function load_env_file(string $filePath): array
{
    if (!is_file($filePath)) {
        return [];
    }

    $values = [];
    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return [];
    }

    foreach ($lines as $line) {
        $trimmed = trim($line);
        if ($trimmed === '' || str_starts_with($trimmed, '#')) {
            continue;
        }

        if (!preg_match('/^([A-Z0-9_]+)\s*=\s*(.*)$/', $trimmed, $matches)) {
            continue;
        }

        $value = trim($matches[2]);
        if ((str_starts_with($value, '"') && str_ends_with($value, '"')) || (str_starts_with($value, "'") && str_ends_with($value, "'"))) {
            $value = substr($value, 1, -1);
        }

        $values[$matches[1]] = $value;
    }

    return $values;
}

$env = array_merge([
    'DB_HOST' => 'localhost',
    'DB_PORT' => '5432',
    'DB_NAME' => 'pet_adoption_db',
    'DB_USER' => (string) (getenv('USER') ?: 'hussaintarwalla'),
    'DB_PASSWORD' => '',
    'PORT' => '3000',
], load_env_file($envFile));

function pdo(): PDO
{
    static $pdo = null;
    global $env;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = sprintf(
        'pgsql:host=%s;port=%d;dbname=%s',
        $env['DB_HOST'],
        (int) $env['DB_PORT'],
        $env['DB_NAME']
    );

    $pdo = new PDO($dsn, $env['DB_USER'], $env['DB_PASSWORD'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    return $pdo;
}

function request_method(): string
{
    return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
}

function request_path(): string
{
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    return is_string($path) && $path !== '' ? $path : '/';
}

function request_json(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    try {
        $decoded = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
        return is_array($decoded) ? $decoded : [];
    } catch (Throwable $throwable) {
        return [];
    }
}

function json_response(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function html_response(string $filePath): never
{
    if (!is_file($filePath)) {
        http_response_code(404);
        echo 'Not Found';
        exit;
    }

    http_response_code(200);
    header('Content-Type: text/html; charset=utf-8');
    readfile($filePath);
    exit;
}

function redirect_to(string $location): never
{
    header('Location: ' . $location, true, 302);
    exit;
}

function db_query_all(string $sql, array $params = []): array
{
    $statement = pdo()->prepare($sql);
    $statement->execute($params);
    return $statement->fetchAll();
}

function db_query_one(string $sql, array $params = []): ?array
{
    $statement = pdo()->prepare($sql);
    $statement->execute($params);
    $row = $statement->fetch();
    return $row === false ? null : $row;
}

function db_execute(string $sql, array $params = []): int
{
    $statement = pdo()->prepare($sql);
    $statement->execute($params);
    return $statement->rowCount();
}

function derive_scrypt_hex(string $password, string $salt): string
{
    $script = <<<'NODE'
const crypto = require('crypto');
const [password, salt] = process.argv.slice(1);
process.stdout.write(crypto.scryptSync(password, salt, 64).toString('hex'));
NODE;

    $nodeBinary = '/usr/local/bin/node';
    $command = escapeshellarg($nodeBinary) . ' -e ' . escapeshellarg($script) . ' -- ' . escapeshellarg($password) . ' ' . escapeshellarg($salt);
    $output = [];
    $exitCode = 0;
    exec($command, $output, $exitCode);

    if ($exitCode !== 0 || !$output) {
        throw new RuntimeException('Unable to derive password hash');
    }

    return trim(implode("\n", $output));
}

function scrypt_hash(string $password, ?string $salt = null): string
{
    if ($salt === null) {
        $salt = bin2hex(random_bytes(16));
    }

    return (string) $salt . ':' . derive_scrypt_hex($password, (string) $salt);
}

function verify_password(string $password, string $storedHash): bool
{
    $parts = explode(':', $storedHash, 2);
    if (count($parts) !== 2 || $parts[0] === '' || $parts[1] === '') {
        return false;
    }

    try {
        $actualHash = scrypt_hash($password, $parts[0]);
    } catch (Throwable $throwable) {
        return false;
    }

    $actualParts = explode(':', $actualHash, 2);
    return hash_equals($parts[1], $actualParts[1]);
}

function pet_base_select_sql(): string
{
    return <<<SQL
SELECT p.*,
       d.size, d.is_trained,
       c.is_indoor, c.fur_length,
       o.species_name,
       s.shelter_name
FROM Pets p
LEFT JOIN Dog d ON p.pet_id = d.pet_id
LEFT JOIN Cat c ON p.pet_id = c.pet_id
LEFT JOIN Other_Animal o ON p.pet_id = o.pet_id
LEFT JOIN Shelter s ON p.shelter_id = s.shelter_id
SQL;
}

function render_dashboard_stats(): array
{
    $pets = db_query_one(<<<SQL
SELECT
    COUNT(*) FILTER (WHERE adoption_status = 'Available') AS available,
    COUNT(*) FILTER (WHERE adoption_status = 'Adopted') AS adopted,
    COUNT(*) FILTER (WHERE adoption_status = 'Reserved') AS reserved,
    COUNT(*) AS total
FROM Pets
SQL) ?? ['available' => 0, 'adopted' => 0, 'reserved' => 0, 'total' => 0];

    $adopters = db_query_one('SELECT COUNT(*) AS total FROM Adopters') ?? ['total' => 0];

    $applications = db_query_one(<<<SQL
SELECT
    COUNT(*) FILTER (WHERE status = 'Pending') AS pending,
    COUNT(*) FILTER (WHERE status = 'Approved') AS approved,
    COUNT(*) FILTER (WHERE status = 'Rejected') AS rejected
FROM Adoption_Applications
SQL) ?? ['pending' => 0, 'approved' => 0, 'rejected' => 0];

    $appointments = db_query_one('SELECT COUNT(*) AS total FROM Appointments') ?? ['total' => 0];

    return [
        'pets' => $pets,
        'adopters' => $adopters,
        'applications' => $applications,
        'appointments' => $appointments,
    ];
}

function serve_static_or_page(string $requestPath, string $frontendDir): bool
{
    $pageRoutes = [
        '/' => 'login.html',
        '/login' => 'login.html',
        '/dashboard' => 'index.html',
        '/index' => 'index.html',
        '/pets' => 'pets.html',
        '/adopters' => 'adopters.html',
        '/applications' => 'applications.html',
        '/appointments' => 'appointments.html',
        '/providers' => 'providers.html',
        '/staff' => 'staff.html',
    ];

    if ($requestPath === '/index.html') {
        redirect_to('/dashboard');
    }

    if ($requestPath === '/login.html') {
        redirect_to('/login');
    }

    if (isset($pageRoutes[$requestPath])) {
        html_response($frontendDir . '/' . $pageRoutes[$requestPath]);
    }

    $relativePath = ltrim($requestPath, '/');
    $staticPath = $frontendDir . '/' . $relativePath;
    if (is_file($staticPath)) {
        return false;
    }

    html_response($frontendDir . '/login.html');
}

function current_limit(array $source, string $key, int $default): int
{
    return isset($source[$key]) ? max(1, (int) $source[$key]) : $default;
}

function current_page(array $source): int
{
    return isset($source['page']) ? max(1, (int) $source['page']) : 1;
}

function handle_pets_list(array $query): void
{
    $status = $query['status'] ?? null;
    $gender = $query['gender'] ?? null;
    $search = $query['search'] ?? null;
    $page = current_page($query);
    $limit = current_limit($query, 'limit', 12);
    $offset = ($page - 1) * $limit;

    $conditions = [];
    $params = [];

    if (is_string($status) && $status !== '') {
        $conditions[] = 'p.adoption_status = ?';
        $params[] = $status;
    }
    if (is_string($gender) && $gender !== '') {
        $conditions[] = 'p.gender = ?';
        $params[] = $gender;
    }
    if (is_string($search) && $search !== '') {
        $conditions[] = '(p.name ILIKE ? OR p.breed ILIKE ?)';
        $params[] = '%' . $search . '%';
        $params[] = '%' . $search . '%';
    }

    $where = $conditions ? 'WHERE ' . implode(' AND ', $conditions) : '';
    $countRow = db_query_one('SELECT COUNT(*) AS count FROM Pets p ' . $where, $params) ?? ['count' => 0];

    $pets = db_query_all(
        pet_base_select_sql() . "\n" . $where . "\nORDER BY p.intake_date DESC LIMIT ? OFFSET ?",
        array_merge($params, [$limit, $offset])
    );

    json_response([
        'pets' => $pets,
        'total' => (int) $countRow['count'],
        'page' => $page,
        'pages' => (int) ceil(((int) $countRow['count']) / $limit),
    ]);
}

function handle_pet_get(string $petId): void
{
    $pet = db_query_one(
        pet_base_select_sql() . "\nWHERE p.pet_id = ?",
        [$petId]
    );

    if ($pet === null) {
        json_response(['error' => 'Pet not found'], 404);
    }

    $appointments = db_query_all(<<<SQL
SELECT a.*, pcp.name AS provider_name
FROM Appointments a
JOIN Pet_Care_Providers pcp ON a.provider_id = pcp.provider_id
WHERE a.pet_id = ?
ORDER BY a.appointment_date DESC
SQL, [$petId]);

    json_response(array_merge($pet, ['appointments' => $appointments]));
}

function handle_pet_create(): void
{
    $body = request_json();
    $pdo = pdo();

    $petId = (string) ($body['pet_id'] ?? '');
    $name = $body['name'] ?? null;
    $breed = $body['breed'] ?? null;
    $age = $body['age'] ?? null;
    $gender = $body['gender'] ?? null;
    $weightKg = $body['weight_kg'] ?? null;
    $intakeDate = $body['intake_date'] ?? null;
    $adoptionStatus = $body['adoption_status'] ?? 'Available';
    $isVaccinated = isset($body['is_vaccinated']) ? (bool) $body['is_vaccinated'] : false;
    $shelterId = $body['shelter_id'] ?? null;
    $type = $body['type'] ?? null;
    $size = $body['size'] ?? null;
    $isTrained = isset($body['is_trained']) ? (bool) $body['is_trained'] : false;
    $isIndoor = isset($body['is_indoor']) ? (bool) $body['is_indoor'] : true;
    $furLength = $body['fur_length'] ?? null;
    $speciesName = $body['species_name'] ?? null;

    try {
        $pdo->beginTransaction();
        db_execute(<<<SQL
INSERT INTO Pets (pet_id, name, breed, age, gender, weight_kg, intake_date, adoption_status, is_vaccinated, shelter_id)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
SQL, [$petId, $name, $breed, $age, $gender, $weightKg, $intakeDate, $adoptionStatus, $isVaccinated, $shelterId]);

        if ($type === 'Dog') {
            db_execute('INSERT INTO Dog (pet_id, size, is_trained) VALUES (?, ?, ?)', [$petId, $size, $isTrained]);
        } elseif ($type === 'Cat') {
            db_execute('INSERT INTO Cat (pet_id, is_indoor, fur_length) VALUES (?, ?, ?)', [$petId, $isIndoor, $furLength]);
        } elseif ($type === 'Other') {
            db_execute('INSERT INTO Other_Animal (pet_id, species_name) VALUES (?, ?)', [$petId, $speciesName]);
        }

        $pdo->commit();
        json_response(['message' => 'Pet added successfully', 'pet_id' => $petId], 201);
    } catch (Throwable $throwable) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        json_response(['error' => $throwable->getMessage()], 500);
    }
}

function handle_pet_update(string $petId): void
{
    $body = request_json();
    $existing = db_query_one('SELECT * FROM Pets WHERE pet_id = ?', [$petId]);
    if ($existing === null) {
        json_response(['error' => 'Pet not found'], 404);
    }

    $name = $body['name'] ?? $existing['name'];
    $breed = $body['breed'] ?? $existing['breed'];
    $age = $body['age'] ?? $existing['age'];
    $gender = $body['gender'] ?? $existing['gender'];
    $weightKg = $body['weight_kg'] ?? $existing['weight_kg'];
    $adoptionStatus = $body['adoption_status'] ?? $existing['adoption_status'];
    $isVaccinated = array_key_exists('is_vaccinated', $body) ? (bool) $body['is_vaccinated'] : (bool) $existing['is_vaccinated'];

    db_execute(<<<SQL
UPDATE Pets
SET name = ?, breed = ?, age = ?, gender = ?, weight_kg = ?, adoption_status = ?, is_vaccinated = ?
WHERE pet_id = ?
SQL, [$name, $breed, $age, $gender, $weightKg, $adoptionStatus, $isVaccinated, $petId]);

    $updated = db_query_one('SELECT * FROM Pets WHERE pet_id = ?', [$petId]);
    json_response(['message' => 'Pet updated', 'beforeUpdate' => $existing, 'afterUpdate' => $updated]);
}

function handle_adopters_list(array $query): void
{
    $search = $query['search'] ?? null;
    $page = current_page($query);
    $limit = current_limit($query, 'limit', 10);
    $offset = ($page - 1) * $limit;

    $conditions = [];
    $params = [];
    if (is_string($search) && $search !== '') {
        $conditions[] = '(first_name ILIKE ? OR last_name ILIKE ? OR email ILIKE ?)';
        $params[] = '%' . $search . '%';
        $params[] = '%' . $search . '%';
        $params[] = '%' . $search . '%';
    }
    $where = $conditions ? 'WHERE ' . implode(' AND ', $conditions) : '';
    $count = db_query_one('SELECT COUNT(*) AS count FROM Adopters ' . $where, $params) ?? ['count' => 0];

    $adopters = db_query_all(<<<SQL
SELECT a.*, i.occupation, o.org_reg_no,
       (SELECT COUNT(*) FROM Adoption_Applications aa WHERE aa.adopter_id = a.adopter_id) AS app_count
FROM Adopters a
LEFT JOIN Individual i ON a.adopter_id = i.adopter_id
LEFT JOIN Organization o ON a.adopter_id = o.adopter_id
$where
ORDER BY a.adopter_id
LIMIT ? OFFSET ?
SQL, array_merge($params, [$limit, $offset]));

    json_response([
        'adopters' => $adopters,
        'total' => (int) $count['count'],
        'page' => $page,
    ]);
}

function handle_adopter_get(string $adopterId): void
{
    $adopter = db_query_one(<<<SQL
SELECT a.*, i.occupation, o.org_reg_no
FROM Adopters a
LEFT JOIN Individual i ON a.adopter_id = i.adopter_id
LEFT JOIN Organization o ON a.adopter_id = o.adopter_id
WHERE a.adopter_id = ?
SQL, [$adopterId]);

    if ($adopter === null) {
        json_response(['error' => 'Not found'], 404);
    }

    $applications = db_query_all(<<<SQL
SELECT aa.*, p.name AS pet_name, p.breed
FROM Adoption_Applications aa
JOIN Pets p ON aa.pet_id = p.pet_id
WHERE aa.adopter_id = ?
ORDER BY aa.application_date DESC
SQL, [$adopterId]);

    json_response(array_merge($adopter, ['applications' => $applications]));
}

function handle_adopter_create(): void
{
    $body = request_json();
    $pdo = pdo();

    $adopterId = (string) ($body['adopter_id'] ?? '');
    $firstName = $body['first_name'] ?? null;
    $lastName = $body['last_name'] ?? null;
    $email = $body['email'] ?? null;
    $phone = $body['phone'] ?? null;
    $address = $body['address'] ?? null;
    $type = $body['type'] ?? null;
    $occupation = $body['occupation'] ?? null;
    $orgRegNo = $body['org_reg_no'] ?? null;

    try {
        $pdo->beginTransaction();
        db_execute('INSERT INTO Adopters (adopter_id, first_name, last_name, email, phone, address) VALUES (?, ?, ?, ?, ?, ?)', [$adopterId, $firstName, $lastName, $email, $phone, $address]);

        if ($type === 'Organization') {
            db_execute('INSERT INTO Organization (adopter_id, org_reg_no) VALUES (?, ?)', [$adopterId, $orgRegNo]);
        } else {
            db_execute('INSERT INTO Individual (adopter_id, occupation) VALUES (?, ?)', [$adopterId, $occupation]);
        }

        $pdo->commit();
        json_response(['message' => 'Adopter registered', 'adopter_id' => $adopterId], 201);
    } catch (Throwable $throwable) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        json_response(['error' => $throwable->getMessage()], 500);
    }
}

function handle_adopter_update(string $adopterId): void
{
    $body = request_json();
    db_execute(<<<SQL
UPDATE Adopters
SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ?
WHERE adopter_id = ?
SQL, [
        $body['first_name'] ?? null,
        $body['last_name'] ?? null,
        $body['email'] ?? null,
        $body['phone'] ?? null,
        $body['address'] ?? null,
        $adopterId,
    ]);
    json_response(['message' => 'Adopter updated']);
}

function handle_application_list(array $query): void
{
    $status = $query['status'] ?? null;
    $page = current_page($query);
    $limit = current_limit($query, 'limit', 10);
    $offset = ($page - 1) * $limit;

    $conditions = [];
    $params = [];
    if (is_string($status) && $status !== '') {
        $conditions[] = 'aa.status = ?';
        $params[] = $status;
    }
    $where = $conditions ? 'WHERE ' . implode(' AND ', $conditions) : '';
    $count = db_query_one('SELECT COUNT(*) AS count FROM Adoption_Applications aa ' . $where, $params) ?? ['count' => 0];

    $applications = db_query_all(<<<SQL
SELECT aa.*, p.name AS pet_name, p.breed, p.adoption_status AS pet_status,
       ad.first_name || ' ' || ad.last_name AS adopter_name, ad.phone, ad.email
FROM Adoption_Applications aa
JOIN Pets p ON aa.pet_id = p.pet_id
JOIN Adopters ad ON aa.adopter_id = ad.adopter_id
$where
ORDER BY aa.application_date DESC
LIMIT ? OFFSET ?
SQL, array_merge($params, [$limit, $offset]));

    json_response([
        'applications' => $applications,
        'total' => (int) $count['count'],
        'page' => $page,
    ]);
}

function handle_application_create(): void
{
    $body = request_json();
    $applicationId = (string) ($body['application_id'] ?? '');
    $applicationDate = $body['application_date'] ?? null;
    $adopterId = $body['adopter_id'] ?? null;
    $petId = $body['pet_id'] ?? null;
    $notes = $body['notes'] ?? null;

    $pet = db_query_one('SELECT adoption_status FROM Pets WHERE pet_id = ?', [$petId]);
    if ($pet === null) {
        json_response(['error' => 'Pet not found'], 404);
    }
    if ($pet['adoption_status'] === 'Adopted') {
        json_response(['error' => 'Pet is already adopted'], 400);
    }

    $adopter = db_query_one('SELECT 1 FROM Adopters WHERE adopter_id = ?', [$adopterId]);
    if ($adopter === null) {
        json_response(['error' => 'Adopter not found'], 404);
    }

    db_execute(<<<SQL
INSERT INTO Adoption_Applications (application_id, application_date, adopter_id, pet_id, notes)
VALUES (?, COALESCE(?, CURRENT_DATE), ?, ?, ?)
SQL, [$applicationId, $applicationDate, $adopterId, $petId, $notes]);

    json_response(['message' => 'Application submitted', 'application_id' => $applicationId], 201);
}

function handle_application_status_update(string $applicationId): void
{
    $body = request_json();
    $status = $body['status'] ?? null;

    if (!in_array($status, ['Pending', 'Approved', 'Rejected'], true)) {
        json_response(['error' => 'Invalid status'], 400);
    }

    $rows = db_execute('UPDATE Adoption_Applications SET status = ? WHERE application_id = ?', [$status, $applicationId]);
    if ($rows === 0) {
        json_response(['error' => 'Application not found'], 404);
    }

    json_response(['message' => 'Application ' . $status]);
}

function handle_appointments_list(array $query): void
{
    $page = current_page($query);
    $limit = current_limit($query, 'limit', 10);
    $offset = ($page - 1) * $limit;

    $count = db_query_one('SELECT COUNT(*) AS count FROM Appointments') ?? ['count' => 0];
    $appointments = db_query_all(<<<SQL
SELECT a.*, p.name AS pet_name, p.breed,
       pcp.name AS provider_name, pcp.visiting_fee
FROM Appointments a
JOIN Pets p ON a.pet_id = p.pet_id
JOIN Pet_Care_Providers pcp ON a.provider_id = pcp.provider_id
ORDER BY a.appointment_date DESC
LIMIT ? OFFSET ?
SQL, [$limit, $offset]);

    json_response([
        'appointments' => $appointments,
        'total' => (int) $count['count'],
        'page' => $page,
    ]);
}

function handle_appointment_create(): void
{
    $body = request_json();
    db_execute(<<<SQL
INSERT INTO Appointments (appointment_id, appointment_date, service_type, duration_mins, notes, pet_id, provider_id)
VALUES (?, ?, ?, ?, ?, ?, ?)
SQL, [
        $body['appointment_id'] ?? null,
        $body['appointment_date'] ?? null,
        $body['service_type'] ?? null,
        $body['duration_mins'] ?? null,
        $body['notes'] ?? null,
        $body['pet_id'] ?? null,
        $body['provider_id'] ?? null,
    ]);
    json_response(['message' => 'Appointment scheduled', 'appointment_id' => $body['appointment_id'] ?? null], 201);
}

function handle_providers_list(): void
{
    $providers = db_query_all(<<<SQL
SELECT pcp.*,
       v.vet_license_no, v.specialization,
       g.tools_used, g.grooming_styles,
       (SELECT COUNT(*) FROM Appointments a WHERE a.provider_id = pcp.provider_id) AS appointment_count
FROM Pet_Care_Providers pcp
LEFT JOIN Veterinarian v ON pcp.provider_id = v.provider_id
LEFT JOIN Groomer g ON pcp.provider_id = g.provider_id
ORDER BY pcp.name
SQL);

    json_response($providers);
}

function handle_provider_create(): void
{
    $body = request_json();
    $pdo = pdo();

    try {
        $pdo->beginTransaction();
        db_execute(<<<SQL
INSERT INTO Pet_Care_Providers (provider_id, name, qualification, phone, email, visiting_fee)
VALUES (?, ?, ?, ?, ?, ?)
SQL, [
            $body['provider_id'] ?? null,
            $body['name'] ?? null,
            $body['qualification'] ?? null,
            $body['phone'] ?? null,
            $body['email'] ?? null,
            $body['visiting_fee'] ?? null,
        ]);

        if (($body['type'] ?? null) === 'Veterinarian') {
            db_execute('INSERT INTO Veterinarian (provider_id, vet_license_no, specialization) VALUES (?, ?, ?)', [$body['provider_id'] ?? null, $body['vet_license_no'] ?? null, $body['specialization'] ?? null]);
        } elseif (($body['type'] ?? null) === 'Groomer') {
            db_execute('INSERT INTO Groomer (provider_id, tools_used, grooming_styles) VALUES (?, ?, ?)', [$body['provider_id'] ?? null, $body['tools_used'] ?? null, $body['grooming_styles'] ?? null]);
        }

        $pdo->commit();
        json_response(['message' => 'Provider added', 'provider_id' => $body['provider_id'] ?? null], 201);
    } catch (Throwable $throwable) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        json_response(['error' => $throwable->getMessage()], 500);
    }
}

function handle_staff_list(): void
{
    $staff = db_query_all(<<<SQL
SELECT s.*,
       v.hours_per_week,
       e.salary, e.emp_id,
       CASE WHEN v.staff_id IS NOT NULL THEN 'Volunteer'
            WHEN e.staff_id IS NOT NULL THEN 'Employee'
            ELSE 'Unknown' END AS staff_type,
       (SELECT COUNT(*) FROM Staff_Pet sp WHERE sp.staff_id = s.staff_id) AS pets_cared
FROM Staff s
LEFT JOIN Volunteer v ON s.staff_id = v.staff_id
LEFT JOIN Employee e ON s.staff_id = e.staff_id
ORDER BY s.name
SQL);

    json_response($staff);
}

function handle_staff_create(): void
{
    $body = request_json();
    $pdo = pdo();

    try {
        $pdo->beginTransaction();
        db_execute('INSERT INTO Staff (staff_id, name, role, shift) VALUES (?, ?, ?, ?)', [$body['staff_id'] ?? null, $body['name'] ?? null, $body['role'] ?? null, $body['shift'] ?? null]);

        if (($body['type'] ?? null) === 'Volunteer') {
            db_execute('INSERT INTO Volunteer (staff_id, hours_per_week) VALUES (?, ?)', [$body['staff_id'] ?? null, $body['hours_per_week'] ?? null]);
        } elseif (($body['type'] ?? null) === 'Employee') {
            db_execute('INSERT INTO Employee (staff_id, salary, emp_id) VALUES (?, ?, ?)', [$body['staff_id'] ?? null, $body['salary'] ?? null, $body['emp_id'] ?? null]);
        }

        $pdo->commit();
        json_response(['message' => 'Staff added', 'staff_id' => $body['staff_id'] ?? null], 201);
    } catch (Throwable $throwable) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        json_response(['error' => $throwable->getMessage()], 500);
    }
}

function handle_auth_login(): void
{
    $body = request_json();
    $username = $body['username'] ?? null;
    $password = $body['password'] ?? null;

    if (!is_string($username) || $username === '' || !is_string($password) || $password === '') {
        json_response(['error' => 'Username and password are required'], 400);
    }

    $user = db_query_one(<<<SQL
SELECT username, full_name, role, email, password_hash
FROM App_Users
WHERE username = ?
SQL, [$username]);

    if ($user === null || !verify_password($password, (string) $user['password_hash'])) {
        json_response(['error' => 'Invalid username or password'], 401);
    }

    json_response([
        'message' => 'Login successful',
        'user' => [
            'username' => $user['username'],
            'name' => $user['full_name'],
            'role' => $user['role'],
            'email' => $user['email'],
        ],
    ]);
}

function handle_auth_register(): void
{
    $body = request_json();
    $name = $body['name'] ?? null;
    $email = $body['email'] ?? null;
    $username = $body['username'] ?? null;
    $password = $body['password'] ?? null;
    $role = $body['role'] ?? 'Staff';

    if (!is_string($name) || $name === '' || !is_string($username) || $username === '' || !is_string($password) || $password === '') {
        json_response(['error' => 'Name, username, and password are required'], 400);
    }

    db_execute(<<<SQL
INSERT INTO App_Users (username, full_name, email, password_hash, role)
VALUES (?, ?, ?, ?, ?)
SQL, [$username, $name, $email, scrypt_hash($password), $role]);

    json_response([
        'message' => 'Registration successful',
        'user' => [
            'username' => $username,
            'name' => $name,
            'role' => $role,
            'email' => $email,
        ],
    ], 201);
}

function handle_health(): void
{
    try {
        db_query_one('SELECT 1');
        json_response(['status' => 'ok', 'database' => 'connected', 'timestamp' => gmdate('c')]);
    } catch (Throwable $throwable) {
        json_response([
            'status' => 'degraded',
            'database' => 'disconnected',
            'error' => $throwable->getMessage(),
            'timestamp' => gmdate('c'),
        ], 503);
    }
}

function handle_dashboard_recent_activity(): void
{
    $applications = db_query_all(<<<SQL
SELECT 'Application' AS type,
       aa.application_date AS date,
       ad.first_name || ' ' || ad.last_name AS actor,
       p.name AS subject,
       aa.status AS detail
FROM Adoption_Applications aa
JOIN Adopters ad ON aa.adopter_id = ad.adopter_id
JOIN Pets p ON aa.pet_id = p.pet_id
ORDER BY aa.application_date DESC
LIMIT 5
SQL);

    $appointments = db_query_all(<<<SQL
SELECT 'Appointment' AS type,
       a.appointment_date AS date,
       pcp.name AS actor,
       p.name AS subject,
       a.service_type AS detail
FROM Appointments a
JOIN Pets p ON a.pet_id = p.pet_id
JOIN Pet_Care_Providers pcp ON a.provider_id = pcp.provider_id
ORDER BY a.appointment_date DESC
LIMIT 5
SQL);

    $combined = array_merge($applications, $appointments);
    usort($combined, static fn(array $left, array $right): int => strtotime((string) $right['date']) <=> strtotime((string) $left['date']));

    json_response(array_slice($combined, 0, 8));
}

function route_api(string $method, string $path): bool
{
    if ($method === 'OPTIONS') {
        http_response_code(204);
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Headers: Content-Type');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        exit;
    }

    if ($method === 'GET' && $path === '/api/health') {
        handle_health();
    }

    if ($method === 'GET' && $path === '/api/dashboard/stats') {
        json_response(render_dashboard_stats());
    }
    if ($method === 'GET' && $path === '/api/dashboard/breed-distribution') {
        json_response(db_query_all(<<<SQL
SELECT breed, COUNT(*) AS count
FROM Pets
WHERE breed IS NOT NULL
GROUP BY breed
ORDER BY count DESC
SQL));
    }
    if ($method === 'GET' && $path === '/api/dashboard/monthly-intakes') {
        json_response(db_query_all(<<<SQL
SELECT TO_CHAR(intake_date, 'Mon YYYY') AS month,
       COUNT(*) AS count,
       DATE_TRUNC('month', intake_date) AS sort_date
FROM Pets
GROUP BY month, sort_date
ORDER BY sort_date
SQL));
    }
    if ($method === 'GET' && $path === '/api/dashboard/recent-activity') {
        handle_dashboard_recent_activity();
    }

    if ($method === 'POST' && $path === '/api/auth/login') {
        handle_auth_login();
    }
    if ($method === 'POST' && $path === '/api/auth/register') {
        handle_auth_register();
    }

    if ($method === 'GET' && $path === '/api/pets') {
        handle_pets_list($_GET);
    }
    if ($method === 'POST' && $path === '/api/pets') {
        handle_pet_create();
    }
    if ($method === 'GET' && preg_match('#^/api/pets/([^/]+)$#', $path, $matches)) {
        handle_pet_get($matches[1]);
    }
    if ($method === 'PUT' && preg_match('#^/api/pets/([^/]+)$#', $path, $matches)) {
        handle_pet_update($matches[1]);
    }
    if ($method === 'DELETE' && preg_match('#^/api/pets/([^/]+)$#', $path, $matches)) {
        if (db_execute('DELETE FROM Pets WHERE pet_id = ?', [$matches[1]]) === 0) {
            json_response(['error' => 'Pet not found'], 404);
        }
        json_response(['message' => 'Pet deleted']);
    }

    if ($method === 'GET' && $path === '/api/adopters') {
        handle_adopters_list($_GET);
    }
    if ($method === 'POST' && $path === '/api/adopters') {
        handle_adopter_create();
    }
    if ($method === 'GET' && preg_match('#^/api/adopters/([^/]+)$#', $path, $matches)) {
        handle_adopter_get($matches[1]);
    }
    if ($method === 'PUT' && preg_match('#^/api/adopters/([^/]+)$#', $path, $matches)) {
        handle_adopter_update($matches[1]);
    }
    if ($method === 'DELETE' && preg_match('#^/api/adopters/([^/]+)$#', $path, $matches)) {
        db_execute('DELETE FROM Adopters WHERE adopter_id = ?', [$matches[1]]);
        json_response(['message' => 'Adopter deleted']);
    }

    if ($method === 'GET' && $path === '/api/applications') {
        handle_application_list($_GET);
    }
    if ($method === 'POST' && $path === '/api/applications') {
        handle_application_create();
    }
    if ($method === 'PATCH' && preg_match('#^/api/applications/([^/]+)/status$#', $path, $matches)) {
        handle_application_status_update($matches[1]);
    }
    if ($method === 'DELETE' && preg_match('#^/api/applications/([^/]+)$#', $path, $matches)) {
        if (db_execute('DELETE FROM Adoption_Applications WHERE application_id = ?', [$matches[1]]) === 0) {
            json_response(['error' => 'Application not found'], 404);
        }
        json_response(['message' => 'Application deleted']);
    }

    if ($method === 'GET' && $path === '/api/appointments') {
        handle_appointments_list($_GET);
    }
    if ($method === 'POST' && $path === '/api/appointments') {
        handle_appointment_create();
    }
    if ($method === 'DELETE' && preg_match('#^/api/appointments/([^/]+)$#', $path, $matches)) {
        db_execute('DELETE FROM Appointments WHERE appointment_id = ?', [$matches[1]]);
        json_response(['message' => 'Appointment deleted']);
    }

    if ($method === 'GET' && $path === '/api/providers') {
        handle_providers_list();
    }
    if ($method === 'POST' && $path === '/api/providers') {
        handle_provider_create();
    }

    if ($method === 'GET' && $path === '/api/staff') {
        handle_staff_list();
    }
    if ($method === 'POST' && $path === '/api/staff') {
        handle_staff_create();
    }

    return false;
}

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');

$method = request_method();
$path = request_path();

if (str_starts_with($path, '/api')) {
    if (!route_api($method, $path)) {
        json_response(['error' => 'Route not found'], 404);
    }
    exit;
}

if (serve_static_or_page($path, $frontendDir) === false) {
    return false;
}
