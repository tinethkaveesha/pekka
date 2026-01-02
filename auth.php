<?php
header('Content-Type: application/json; charset=utf-8');
// Update these to match your environment
$dbHost = '127.0.0.1';
$dbUser = 'root';
$dbPass = '';
$dbName = 'pekka_auth';

try {
	$pdo = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass, [
		PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
		PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
	]);
} catch (PDOException $e) {
	http_response_code(500);
	echo json_encode(['success' => false, 'message' => 'Cannot connect to database. Run db_setup.php first or check credentials.']);
	exit;
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

if ($action === 'signup') {
	$username = trim($_POST['username'] ?? '');
	$password = $_POST['password'] ?? '';

	if (!$username || !$password) {
		echo json_encode(['success' => false, 'message' => 'Missing fields']);
		exit;
	}

	// uniqueness check on username
	$stmt = $pdo->prepare("SELECT id FROM users WHERE username = :username LIMIT 1");
	$stmt->execute(['username' => $username]);
	if ($stmt->fetch()) {
		echo json_encode(['success' => false, 'message' => 'Username already taken']);
		exit;
	}

	$hash = password_hash($password, PASSWORD_DEFAULT);
	$insert = $pdo->prepare("INSERT INTO users (username, password_hash, created_at) VALUES (:username, :hash, NOW())");
	$insert->execute(['username' => $username, 'hash' => $hash]);

	echo json_encode(['success' => true, 'message' => 'Account created']);
	exit;
}

if ($action === 'login') {
	$username = trim($_POST['username'] ?? '');
	$password = $_POST['password'] ?? '';
	if (!$username || !$password) {
		echo json_encode(['success' => false, 'message' => 'Missing fields']);
		exit;
	}
	$stmt = $pdo->prepare("SELECT id, username, password_hash FROM users WHERE username = :username LIMIT 1");
	$stmt->execute(['username' => $username]);
	$user = $stmt->fetch();
	if (!$user || !password_verify($password, $user['password_hash'])) {
		echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
		exit;
	}
	// login success (session can be started here if desired)
	session_start();
	$_SESSION['user_id'] = $user['id'];
	$_SESSION['username'] = $user['username'];
	echo json_encode(['success' => true, 'message' => 'Logged in']);
	exit;
}

echo json_encode(['success' => false, 'message' => 'Unsupported action']);
