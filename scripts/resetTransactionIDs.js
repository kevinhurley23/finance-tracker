import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { placeholderData } from "../src/lib/placeholderData.svelte.js";

function resetTransactionIDs(data) {
  let newID = 1;
  const updateIDs = (envelopes) => {
    envelopes.forEach((envelope) => {
      envelope.transactions.forEach((transaction) => {
        transaction.transactionID = newID++;
      });
    });
  };

  updateIDs(data.budget);
  updateIDs(data.checking);
  updateIDs(data.savings);
  data.highestTransactionID = newID - 1;
}

resetTransactionIDs(placeholderData);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, "../src/lib/placeholderData.svelte.js");

function formatJSON(obj, indent = 2) {
  const jsonString = JSON.stringify(obj, null, indent);
  return jsonString.replace(/"([^"]+)":/g, "$1:");
}

const fileContent = `export const placeholderData = ${formatJSON(
  placeholderData
)};\n`;

fs.writeFileSync(filePath, fileContent, "utf8");
console.log("Transaction IDs have been reset and the file has been updated.");
