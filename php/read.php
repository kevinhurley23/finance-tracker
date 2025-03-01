<?php
include './dbcon.php';

function fetchTableData($connection, $tableName) {
  $query = "SELECT * FROM $tableName";
  $result = mysqli_query($connection, $query);

  if (!$result) {
    die("Query failed " . mysqli_error($connection));
  } else {
    $data = [];
    while ($row = $result->fetch_assoc()) {
      if (isset($row['accountID'])) {
        $row['accountID'] = (int) $row['accountID'];
      }
      if (isset($row['transactionID'])) {
        $row['transactionID'] = (int) $row['transactionID'];
      }
      if (isset($row['envelopeID'])) {
        $row['envelopeID'] = (int) $row['envelopeID'];
      }
      if (isset($row['amount'])) {
        $row['amount'] = (float) $row['amount'];
      }
      if (isset($row['repeating'])) {
        $row['repeating'] = (bool) $row['repeating'];
      }

      $data[] = $row;
    }
    return $data;
  }
}

$accounts = fetchTableData($connection, 'accounts');
$envelopes = fetchTableData($connection, 'envelopes');
$transactions = fetchTableData($connection, 'transactions');

$data = [];

// Initialize the data structure with accounts
foreach ($accounts as $account) {
  $data[$account['accountTitle']] = [];
}

// Populate the data structure with envelopes and transactions
foreach ($envelopes as $envelope) {
  $envelopeData = [
    'envelopeID' => $envelope['envelopeID'],
    'envelopeTitle' => $envelope['envelopeTitle'],
    'envelopeDescription' => $envelope['envelopeDescription'],
    'transactions' => []
  ];

  // Add the envelope to the corresponding account
  $accountTitle = array_search($envelope['accountID'], array_column($accounts, 'accountID'));
  $data[$accounts[$accountTitle]['accountTitle']][] = $envelopeData;
}

// Add transactions to the corresponding envelopes
foreach ($transactions as $transaction) {
  foreach ($data as $accountTitle => &$envelopes) {
    foreach ($envelopes as &$envelope) {
      if ($envelope['envelopeID'] == $transaction['envelopeID']) {
        $envelope['transactions'][] = $transaction;
      }
    }
  }
}

$highestTransactionID = max(array_column($transactions, 'transactionID'));
$data['highestTransactionID'] = $highestTransactionID;
$firstTransactionDate = min(array_column($transactions, 'date'));
$data['firstTransactionDate'] = $firstTransactionDate;
$lastTransactionDate = max(array_column($transactions, 'date'));
$data['lastTransactionDate'] = $lastTransactionDate;

echo json_encode($data);

$connection->close();
?>
