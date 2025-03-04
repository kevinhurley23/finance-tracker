import { data, accountNames, UIstate } from "./data.svelte.js";

export function currencyFormat(amount) {
  if (amount == undefined) {
    return;
  } else {
    let USDollar = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });
    return USDollar.format(amount);
  }
}

export function numberFormat(string) {
  const cleanedString = string.replace(/[$,]/g, "");
  // Check if the cleaned string contains only numbers, periods, and negative signs
  if (/^[-?\d.]+$/.test(cleanedString)) {
    const numberValue = parseFloat(cleanedString);
    return numberValue;
  } else {
    return "NaN";
  }
}

async function fetchRequest(url, body) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}

function findEnvelopeIndex(account, envelopeID) {
  return account.indexOf(account.find((item) => item.envelopeID == envelopeID));
}

export async function addTransaction(
  accountTitle,
  envelopeID,
  description,
  date,
  amount,
  repeating
) {
  const account = data[accountTitle];
  const envelopeIndex = findEnvelopeIndex(account, envelopeID);
  const newTransaction = {
    transactionID: data.highestTransactionID + 1,
    transactionDescription: description,
    date: date,
    amount: amount,
    repeating: repeating,
    envelopeID: envelopeID,
  };
  function updateFrontEnd() {
    data[accountTitle][envelopeIndex].transactions.push(newTransaction);
    data.highestTransactionID++;
  }

  if (UIstate.testingMode) {
    updateFrontEnd();
    return true;
  } else {
    const result = await fetchRequest("../php/create.php", newTransaction);
    if (result) {
      updateFrontEnd();
      return true;
    } else {
      return false;
    }
  }
}

export async function updateTransaction(
  accountTitle,
  envelopeID,
  transactionID,
  property,
  value
) {
  const account = data[accountTitle];
  const envelopeIndex = findEnvelopeIndex(account, envelopeID);
  const transactionIndex = account[envelopeIndex].transactions.indexOf(
    account[envelopeIndex].transactions.find(
      (item) => item.transactionID == transactionID
    )
  );
  const updatedTransaction = {
    transactionID: transactionID,
    property: property,
    value: value,
  };
  function updateFrontEnd() {
    data[accountTitle][envelopeIndex].transactions[transactionIndex][property] =
      value;
  }

  if (UIstate.testingMode) {
    updateFrontEnd();
  } else {
    const result = await fetchRequest("../php/update.php", updatedTransaction);
    if (result) {
      updateFrontEnd();
    }
  }
}

export async function deleteTransaction(
  accountTitle,
  envelopeID,
  transactionID
) {
  const account = data[accountTitle];
  const envelopeIndex = findEnvelopeIndex(account, envelopeID);
  const transactionIndex = account[envelopeIndex].transactions.indexOf(
    account[envelopeIndex].transactions.find(
      (item) => item.transactionID == transactionID
    )
  );
  function updateFrontEnd() {
    data[accountTitle][envelopeIndex].transactions.splice(transactionIndex, 1);
    if (transactionID === data.highestTransactionID) {
      data.highestTransactionID--;
    }
  }

  if (UIstate.testingMode) {
    updateFrontEnd();
  } else {
    const result = await fetchRequest("../php/delete.php", {
      transactionID: transactionID,
    });
    if (result) {
      updateFrontEnd();
    }
  }
}

export async function copyTransactions(selectedMonth) {
  UIstate.showCopyingTransactionsModal = true;
  const previousMonthEnd = new Date(selectedMonth);
  const previousMonthStart = new Date(previousMonthEnd);
  previousMonthStart.setDate(0);
  previousMonthEnd.setDate(previousMonthEnd.getDate() - 1);
  const startStr = previousMonthStart.toISOString().slice(0, 10);
  const endStr = previousMonthEnd.toISOString().slice(0, 10);
  let matchingTransactionCounter = 0;
  for (const account of accountNames) {
    for (const envelope of data[account]) {
      for (const transaction of envelope.transactions) {
        if (
          transaction.date >= startStr &&
          transaction.date <= endStr &&
          transaction.repeating
        ) {
          matchingTransactionCounter++;
          const parts = transaction.date.split("-");
          let year = parseInt(parts[0], 10);
          let month = parseInt(parts[1], 10);
          let day = parseInt(parts[2], 10);
          if (month === 12) {
            month = 1;
            year++;
          } else {
            month++;
          }
          day = day > 28 ? 28 : day;
          const newDate = `${String(year)}-${String(month).padStart(
            2,
            "0"
          )}-${String(day).padStart(2, "0")}`;

          await addTransaction(
            account,
            envelope.envelopeID,
            transaction.transactionDescription,
            newDate,
            transaction.amount,
            true
          );
        }
      }
    }
  }
  if (matchingTransactionCounter === 0) {
    alert(
      "No repeating transactions were found in the previous month to copy."
    );
  }
  UIstate.showCopyingTransactionsModal = false;
}
