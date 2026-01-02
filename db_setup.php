<?php
// Update credentials for your MySQL server if necessary
$dbHost = '127.0.0.1';
$dbUser = 'root';
$dbPass = '';
$dbName = 'pekka_auth';

try {
	$pdo = new PDO("mysql:host=$dbHost;charset=utf8mb4", $dbUser, $dbPass, [
		PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
	]);

	$pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci");
	$pdo->exec("USE `$dbName`");
	$pdo->exec("
	CREATE TABLE IF NOT EXISTS users (
		id INT AUTO_INCREMENT PRIMARY KEY,
		username VARCHAR(100) NOT NULL UNIQUE,
		email VARCHAR(255) DEFAULT NULL,
		password_hash VARCHAR(255) NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	");
	echo "Database and users table created successfully. You can now use auth.php";
} catch (PDOException $e) {
	echo 'Error: ' . $e->getMessage();
}
