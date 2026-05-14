<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
$competition = isset($_GET['competition']) ? $_GET['competition'] : '';
if (empty($competition)) {
    echo json_encode(['success' => false, 'message' => 'Code compétition manquant']);
    exit;
}
$stateFile = "../data/display_state_" . preg_replace('/[^a-zA-Z0-9_]/', '', $competition) . ".json";
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $inputJSON = file_get_contents('php://input');
    if (!is_dir('../data')) {
        mkdir('../data', 0777, true);
    }
    file_put_contents($stateFile, $inputJSON);
    echo json_encode(['success' => true]);
} else {
    if (file_exists($stateFile)) {
        $state = file_get_contents($stateFile);
        echo $state; 
    } else {
        echo json_encode(['success' => true, 'state' => null]);
    }
}
?>