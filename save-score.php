<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Get the posted data
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['name']) || !isset($data['score']) || !isset($data['total'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data']);
    exit;
}

// Sanitize inputs
$name = htmlspecialchars(trim($data['name']));
$score = intval($data['score']);
$total = intval($data['total']);
$percentage = round(($score / $total) * 100);
$sessions = isset($data['sessions']) ? htmlspecialchars($data['sessions']) : 'All Sessions';
$timestamp = date('Y-m-d H:i:s');

// Validate
if (empty($name) || $score < 0 || $total <= 0 || $percentage < 70) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid score data or score below 70%']);
    exit;
}

// CSV file path - use data directory if it exists, otherwise current directory
$dataDir = is_dir('data') && is_writable('data') ? 'data/' : '';
$csvFile = $dataDir . 'leaderboard.csv';

// Create file with headers if it doesn't exist
if (!file_exists($csvFile)) {
    $header = "Name,Score,Total,Percentage,Sessions,Timestamp\n";
    file_put_contents($csvFile, $header);
}

// Append the new score
$row = sprintf(
    "\"%s\",%d,%d,%d,\"%s\",\"%s\"\n",
    str_replace('"', '""', $name),
    $score,
    $total,
    $percentage,
    str_replace('"', '""', $sessions),
    $timestamp
);

if (file_put_contents($csvFile, $row, FILE_APPEND | LOCK_EX)) {
    echo json_encode(['success' => true, 'message' => 'Score saved successfully']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save score']);
}
?>
