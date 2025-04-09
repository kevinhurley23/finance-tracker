<?php

// To run, cd to the php directory and run: php backup.php

include 'dbcon.php';

$backupDir = '../db-backups/';
if (!is_dir($backupDir)) {
    mkdir($backupDir, 0777, true);
}

$backupFile = $backupDir . 'backup_' . date('Y-m-d_H-i-s') . '.sql';
$command = "mysqldump --user=" . USERNAME . " --password=" . PASSWORD . " --host=" . HOSTNAME . " " . DATABASE . " > " . $backupFile;

system($command, $output);

if ($output === 0) {
    echo "Backup successful. File: " . $backupFile;
} else {
    echo "Backup failed.";
}

?>
