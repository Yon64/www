<?php
require_once __DIR__ . '/_bootstrap.php';
$response = ['success' => false];
$data = json_decode(file_get_contents('php://input'), true);
$competitionCodeWithPrefix = $data['competitionCode'] ?? null;
if (empty($competitionCodeWithPrefix)) {
    http_response_code(400); 
    echo json_encode(['success' => false, 'message' => "ID de compétition invalide."]);    
    exit;
}
$competitionCodeNumeric = (int) str_replace('M', '', $competitionCodeWithPrefix);
try {
    $pdo->beginTransaction();
    $pdo->prepare("DELETE FROM {$tableSlots} WHERE Code_competition = ?")->execute([$competitionCodeWithPrefix]);
    $pdo->prepare("DELETE FROM {$tableHeats} WHERE Code_competition = ?")->execute([$competitionCodeWithPrefix]);
    $pdo->prepare("DELETE FROM {$tableCategories} WHERE Code_competition = ?")->execute([$competitionCodeWithPrefix]);
    $pdo->prepare("DELETE FROM {$tableSettings} WHERE Code_competition = ?")->execute([$competitionCodeWithPrefix]);
    $pdo->prepare("DELETE FROM {$tableSchedules} WHERE Code_competition = ?")->execute([$competitionCodeWithPrefix]);
    $pdo->prepare("DELETE FROM {$tableRanking} WHERE Code_competition = ?")->execute([$competitionCodeWithPrefix]);
    $pdo->prepare("DELETE FROM {$tableManualResults} WHERE id_competition = ?")->execute([$competitionCodeNumeric]);
    $pdo->prepare("DELETE FROM {$tableManualCompetitions} WHERE id = ?")->execute([$competitionCodeNumeric]);
    $pdo->commit();
    $response['success'] = true;
} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    $response['message'] = 'Erreur lors de la suppression: ' . $e->getMessage();
}
echo json_encode($response);
?>