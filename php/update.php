<?php
include './dbcon.php';

// Get the POST data
$postData = file_get_contents('php://input');
$updateData = json_decode($postData, true);

// Check if necessary data is set
if (isset($updateData['transactionID']) && isset($updateData['property']) && isset($updateData['value'])) {
  $transactionID = $updateData['transactionID'];
  $property = $updateData['property'];
  $value = $updateData['value'];

  // Prepare the SQL statement
  $stmt = $connection->prepare("UPDATE transactions SET $property = ? WHERE transactionID = ?");
  
  // Determine the type of the value and bind parameters accordingly
  if (is_float($value)) {
    $stmt->bind_param("di", $value, $transactionID);
  } elseif (is_bool($value)) {
    $boolValue = $value ? 1 : 0;
    $stmt->bind_param("ii", $boolValue, $transactionID);
  } else {
    $stmt->bind_param("si", $value, $transactionID);
  }

  // Execute the statement
  if ($stmt->execute()) {
    echo json_encode(["message" => "Transaction updated successfully"]);
  } else {
    echo json_encode(["message" => $stmt->error]);
  }

  $stmt->close();
} else {
  echo json_encode(["message" => "Required data not provided"]);
}

$connection->close();
?>