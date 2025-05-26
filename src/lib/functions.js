import {
  data,
  accountNames,
  UIstate,
  transactionsToCopy,
} from "./data.svelte.js";

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

export function dateFormat(dateStr) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

export function formatMonthYear(dateStr) {
  const date = new Date(dateStr);
  date.setDate(1);
  date.setMonth(date.getMonth() + 1);
  return date.toLocaleString("default", { month: "long", year: "numeric" });
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

export function findEnvelopeIndex(accountTitle, envelopeID) {
  const account = data[accountTitle];
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
  const envelopeIndex = findEnvelopeIndex(accountTitle, envelopeID);
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
  const envelopeIndex = findEnvelopeIndex(accountTitle, envelopeID);
  const transactionIndex = data[accountTitle][
    envelopeIndex
  ].transactions.indexOf(
    data[accountTitle][envelopeIndex].transactions.find(
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
    console.log(
      `Updated ${property} of transaction ${transactionID} to ${value}`
    );
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
  const envelopeIndex = findEnvelopeIndex(accountTitle, envelopeID);
  const transactionIndex = data[accountTitle][
    envelopeIndex
  ].transactions.indexOf(
    data[accountTitle][envelopeIndex].transactions.find(
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
