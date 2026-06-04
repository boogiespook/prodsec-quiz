<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// CSV file path - use data directory if it exists, otherwise current directory
$dataDir = is_dir('data') && is_readable('data') ? 'data/' : '';
$csvFile = $dataDir . 'leaderboard.csv';

if (!file_exists($csvFile)) {
    echo json_encode([]);
    exit;
}

$scores = [];
$handle = fopen($csvFile, 'r');

// Skip header row
$header = fgetcsv($handle);

// Read all scores
while (($row = fgetcsv($handle)) !== false) {
    if (count($row) >= 6) {
        $scores[] = [
            'name' => $row[0],
            'score' => intval($row[1]),
            'total' => intval($row[2]),
            'percentage' => intval($row[3]),
            'sessions' => $row[4],
            'timestamp' => $row[5]
        ];
    }
}

fclose($handle);

// Sort by percentage (descending), then by timestamp (most recent first)
usort($scores, function($a, $b) {
    if ($a['percentage'] === $b['percentage']) {
        return strtotime($b['timestamp']) - strtotime($a['timestamp']);
    }
    return $b['percentage'] - $a['percentage'];
});

// Return top 50 scores
$topScores = array_slice($scores, 0, 50);

echo json_encode($topScores);
?>
