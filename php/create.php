<?php
include './dbcon.php';

// Get the POST data
$postData = file_get_contents('php://input');
$newTransaction = json_decode($postData, true);

// Prepare and bind
$stmt = $connection->prepare("INSERT INTO transactions (transactionDescription, date, amount, repeating, envelopeID) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("ssdii", $transactionDescription, $date, $amount, $repeating, $envelopeID);

// Set parameters and handle null values
$transactionDescription = $newTransaction['transactionDescription'] ?? null;
$date = $newTransaction['date'] ?? null;
$amount = $newTransaction['amount'] ?? null;
$repeating = isset($newTransaction['repeating']) ? $newTransaction['repeating'] : null;
$envelopeID = $newTransaction['envelopeID'] ?? null;

if ($stmt->execute()) {
  echo json_encode(["message" => "Transaction saved successfully"]);
} else {
  echo json_encode(["message" => "Error saving transaction: " . $stmt->error]);
}

$stmt->close();
$connection->close();
?>