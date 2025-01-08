<?php

include 'dbcon.php';

$backupDir = '../db-backups/';
$backupFiles = array_diff(scandir($backupDir), array('.', '..'));

if (empty($backupFiles)) {
    die("No backup files found in the directory.");
}

echo "Available backup files:\n";
foreach ($backupFiles as $index => $file) {
    echo "[$index] $file\n";
}

echo "Enter the number of the backup file you want to restore: ";
$handle = fopen("php://stdin", "r");
$choice = trim(fgets($handle));

if (!isset($backupFiles[$choice])) {
    die("Invalid choice.");
}

$backupFile = $backupDir . $backupFiles[$choice];
$command = "mysql --user=" . USERNAME . " --password=" . PASSWORD . " --host=" . HOSTNAME . " " . DATABASE . " < " . $backupFile;

system($command, $output);

if ($output === 0) {
    echo "Restore successful.";
} else {
    echo "Restore failed.";
}

?>
