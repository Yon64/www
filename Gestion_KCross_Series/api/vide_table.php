<?php
require_once __DIR__ . '/_bootstrap.php';
try {
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
    foreach ($tables as $table) {
        $sql = "TRUNCATE TABLE `$table`";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
    }
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");
    echo json_encode(['success' => true, 'message' => 'Données supprimées avec succès.']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}