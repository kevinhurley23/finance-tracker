<?php
include './dbcon.php';

// Get the POST data
$postData = file_get_contents('php://input');
$request = json_decode($postData, true);

// Check if transactionID is set
if (isset($request['transactionID'])) {
  $transactionID = $request['transactionID'];

  // Prepare and bind
  $stmt = $connection->prepare("DELETE FROM transactions WHERE transactionID = ?");
  $stmt->bind_param("i", $transactionID);

  // Execute the statement
  if ($stmt->execute()) {
    echo json_encode(["message" => "Transaction deleted successfully"]);
  } else {
    echo json_encode(["message" => "Error deleting transaction: " . $stmt->error]);
  }

  $stmt->close();
} else {
  echo json_encode(["message" => "transactionID not provided"]);
}

$connection->close();
?>