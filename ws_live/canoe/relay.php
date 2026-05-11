<?php
/**
 * Simple PHP Relay for Offline Canoe Graphics
 * Acts as a middleman for OBS Studio which runs in a separate process.
 */

$stateFile = 'state.json';

// Handle POST - Save event
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if ($data && isset($data['type'])) {
        $currentState = [];
        if (file_exists($stateFile)) {
            $currentState = json_decode(file_get_contents($stateFile), true);
        }

        // Store the event and data with a unique ID or timestamp to detect changes
        $currentState[$data['type']] = [
            'data' => $data['data'],
            'uuid' => isset($data['uuid']) ? $data['uuid'] : null,
            'ts' => microtime(true)
        ];

        file_put_contents($stateFile, json_encode($currentState));
        echo json_encode(['status' => 'ok']);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid data']);
    }
    exit;
}

// Handle GET - Return full state
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    header('Content-Type: application/json');
    if (file_exists($stateFile)) {
        header('Cache-Control: no-cache');
        echo file_get_contents($stateFile);
    } else {
        echo json_encode([]);
    }
    exit;
}
?>
