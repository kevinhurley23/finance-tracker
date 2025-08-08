import { todayObj } from "./dates.js";

// Load saved state from localStorage or use default values
const savedState = JSON.parse(localStorage.getItem("UIstate")) || {
  sectionDisplayed: "activity",
  subsectionDisplayed: ["checking"],
  testingMode: false,
  canToggleTestingMode: true,
  showConnectErrorModal: false,
  exactMatch: false,
  groupByEnvelope: false,
  darkTheme: window.matchMedia('(prefers-color-scheme: dark)') ? true : false
};

export const UIstate = $state(savedState);

export const data = $state({
  // Initialize object with empty values so VS Code doesn't complain about nonexistent keys
  budget: [],
  checking: [],
  savings: [],
  ready: false,
  maxEnvelopes: 0,
  highestTransactionID: 0,
  firstTransactionDate: "",
  lastTransactionDate: "",
});
export async function fetchData() {
  try {
    const response = await fetch("../php/read.php");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const responseData = await response.json();
    Object.assign(data, responseData);
  } catch (error) {
    console.error("Fetch error:", error);
    Object.assign(data, placeholderData);
    UIstate.showConnectErrorModal = true;
    UIstate.testingMode = true;
    UIstate.canToggleTestingMode = false;
    setTimeout(() => (UIstate.showConnectErrorModal = false), 2000);
  }
  data.ready = true;
  data.maxEnvelopes = data.checking.length;
  populateMonths();
  populateEnvelopeIDs();
}

export const accountNames = ["budget", "checking", "savings"];
export const accountsAndEnvelopes = $state({});
function populateEnvelopeIDs() {
  accountNames.forEach((account) => {
    accountsAndEnvelopes[account] = {};
    data[account].forEach((envelope) => {
      accountsAndEnvelopes[account][envelope.envelopeID] =
        envelope.envelopeTitle;
    });
  });
  // console.log(accountsAndEnvelopes);
}

export const analyzers = [
  "One Envelope Over Time",
  "Compare Envelopes",
  "Income vs Expenses",
  "Search Transactions",
  "Find and Replace",
];

export const transactionsToCopy = $state([]);

export let months = $state([]);
function populateMonths() {
  let dateIterator = new Date(data.firstTransactionDate);
  dateIterator.setDate(dateIterator.getDate() + 1);
  while (dateIterator <= todayObj) {
    months.push(dateIterator.toISOString().slice(0, 7));
    dateIterator.setMonth(dateIterator.getMonth() + 1);
  }
}

const lastMonth = new Date(todayObj.getFullYear(), todayObj.getMonth() - 1, 1)
  .toISOString()
  .slice(0, 7);
const twoMonthsAgoObj = new Date(
  todayObj.getFullYear(),
  todayObj.getMonth() - 2,
  1
);
const twoMonthsAgo = twoMonthsAgoObj.toISOString().slice(0, 7);

const placeholderData = {
  highestTransactionID: 89,
  firstTransactionDate: `${twoMonthsAgo}-01`,
  budget: [
    {
      envelopeID: 1,
      envelopeTitle: "Income",
      envelopeDescription: null,
      transactions: [
        {
          transactionID: 1,
          envelopeID: 1,
          transactionDescription: "Bryant",
          date: `2025-01-01`,
          amount: 4616.52,
          repeating: false,
        },
        {
          transactionID: 2,
          envelopeID: 1,
          transactionDescription: "Takeda",
          date: `2025-01-01`,
          amount: 7800,
          repeating: false,
        },
      ],
    },
    {
      envelopeID: 3,
      envelopeTitle: "Savings",
      envelopeDescription: null,
      transactions: [
        {
          transactionID: 3,
          envelopeID: 3,
          transactionDescription: "Home",
          date: `2025-01-01`,
          amount: 500,
          repeating: false,
        },
        {
          transactionID: 4,
          envelopeID: 3,
          transactionDescription: "Car",
          date: `2025-01-01`,
          amount: 392,
          repeating: false,
        },
        {
          transactionID: 5,
          envelopeID: 3,
          transactionDescription: "Utilities",
          date: `2025-01-01`,
          amount: 229,
          repeating: false,
        },
        {
          transactionID: 6,
          envelopeID: 3,
          transactionDescription: "Travel",
          date: `2025-01-01`,
          amount: 250,
          repeating: false,
        },
        {
          transactionID: 7,
          envelopeID: 3,
          transactionDescription: "Emergency",
          date: `2025-01-01`,
          amount: 250,
          repeating: false,
        },
      ],
    },
    {
      envelopeID: 4,
      envelopeTitle: "Housing",
      envelopeDescription: "Mortgages and HOA",
      transactions: [
        {
          transactionID: 8,
          envelopeID: 4,
          transactionDescription: "Mortgage",
          date: `2025-01-01`,
          amount: 918,
          repeating: false,
        },
        {
          transactionID: 9,
          envelopeID: 4,
          transactionDescription: "HOA",
          date: `2025-01-14`,
          amount: 150,
          repeating: false,
        },
      ],
    },
    {
      envelopeID: 5,
      envelopeTitle: "Transportation",
      envelopeDescription: null,
      transactions: [
        {
          transactionID: 10,
          envelopeID: 5,
          transactionDescription: "Tesla Lease",
          date: `2025-01-01`,
          amount: 515,
          repeating: false,
        },
        {
          transactionID: 11,
          envelopeID: 5,
          transactionDescription: "Honda Loan",
          date: `2025-01-13`,
          amount: 305,
          repeating: false,
        },
        {
          transactionID: 12,
          envelopeID: 5,
          transactionDescription: "Gas",
          date: `2025-01-13`,
          amount: 100,
          repeating: false,
        },
      ],
    },
    {
      envelopeID: 6,
      envelopeTitle: "Utilities",
      envelopeDescription:
        "Utilities that are billed monthly and are pretty regular (electric, phone, internet)",
      transactions: [
        {
          transactionID: 13,
          envelopeID: 6,
          transactionDescription: "Internet",
          date: `2025-01-01`,
          amount: 82.77,
          repeating: false,
        },
        {
          transactionID: 14,
          envelopeID: 6,
          transactionDescription: "T-Mobile",
          date: `2025-01-01`,
          amount: 39,
          repeating: false,
        },
        {
          transactionID: 15,
          envelopeID: 6,
          transactionDescription: "Electric",
          date: `2025-01-05`,
          amount: 160,
          repeating: false,
        },
      ],
    },
    {
      envelopeID: 7,
      envelopeTitle: "Groceries and Home",
      envelopeDescription:
        "Include items purchased for the home from Amazon, etc.",
      transactions: [
        {
          transactionID: 16,
          envelopeID: 7,
          transactionDescription: "Grocery Stores",
          date: `2025-01-01`,
          amount: 1000,
          repeating: false,
        },
        {
          transactionID: 17,
          envelopeID: 7,
          transactionDescription: "Amazon",
          date: `2025-01-01`,
          amount: 200,
          repeating: false,
        },
      ],
    },
    {
      envelopeID: 8,
      envelopeTitle: "Health",
      envelopeDescription: "Gym, doctors, chiropractor",
      transactions: [
        {
          transactionID: 18,
          envelopeID: 8,
          transactionDescription: "Planet Fitness",
          date: `2025-01-17`,
          amount: 10.64,
          repeating: false,
        },
        {
          transactionID: 19,
          envelopeID: 8,
          transactionDescription: "Chiropractor",
          date: `2025-01-01`,
          amount: 40,
          repeating: false,
        },
      ],
    },
    {
      envelopeID: 11,
      envelopeTitle: "Streaming Services",
      envelopeDescription: null,
      transactions: [
        {
          transactionID: 20,
          envelopeID: 11,
          transactionDescription: "Youtube Premium",
          date: `2025-01-03`,
          amount: 24.45,
          repeating: false,
        },
        {
          transactionID: 21,
          envelopeID: 11,
          transactionDescription: "Netflix",
          date: `2025-01-08`,
          amount: 24.45,
          repeating: false,
        },
        {
          transactionID: 22,
          envelopeID: 11,
          transactionDescription: "Spotify",
          date: `2025-01-28`,
          amount: 12.75,
          repeating: false,
        },
      ],
    },
  ],
  checking: [
    {
      envelopeID: 13,
      envelopeTitle: "Income",
      envelopeDescription: null,
      transactions: [
        {
          transactionID: 23,
          envelopeID: 13,
          transactionDescription: "Starting Balance",
          date: `${twoMonthsAgo}-01`,
          amount: 8904,
          repeating: true,
        },
        {
          transactionID: 24,
          envelopeID: 13,
          transactionDescription: "Bryant",
          date: `${twoMonthsAgo}-01`,
          amount: 4616.52,
          repeating: true,
        },
        {
          transactionID: 25,
          envelopeID: 13,
          transactionDescription: "Takeda",
          date: `${twoMonthsAgo}-01`,
          amount: 7707.82,
          repeating: true,
        },
        {
          transactionID: 63,
          envelopeID: 13,
          transactionDescription: "Starting Balance",
          date: `${lastMonth}-01`,
          amount: 9542,
          repeating: true,
        },
        {
          transactionID: 64,
          envelopeID: 13,
          transactionDescription: "Bryant",
          date: `${lastMonth}-01`,
          amount: 4616.52,
          repeating: true,
        },
        {
          transactionID: 65,
          envelopeID: 13,
          transactionDescription: "Takeda",
          date: `${lastMonth}-01`,
          amount: 10657.93,
          repeating: true,
        },
      ],
    },
    {
      envelopeID: 15,
      envelopeTitle: "Savings",
      envelopeDescription: null,
      transactions: [
        {
          transactionID: 26,
          envelopeID: 3,
          transactionDescription: "Home",
          date: `${twoMonthsAgo}-01`,
          amount: 500,
          repeating: true,
        },
        {
          transactionID: 27,
          envelopeID: 3,
          transactionDescription: "Car",
          date: `${twoMonthsAgo}-01`,
          amount: 392,
          repeating: true,
        },
        {
          transactionID: 28,
          envelopeID: 3,
          transactionDescription: "Utilities",
          date: `${twoMonthsAgo}-01`,
          amount: 229,
          repeating: true,
        },
        {
          transactionID: 29,
          envelopeID: 3,
          transactionDescription: "Travel",
          date: `${twoMonthsAgo}-01`,
          amount: 250,
          repeating: true,
        },
        {
          transactionID: 30,
          envelopeID: 3,
          transactionDescription: "Emergency",
          date: `${twoMonthsAgo}-01`,
          amount: 250,
          repeating: true,
        },
        {
          transactionID: 66,
          envelopeID: 3,
          transactionDescription: "Home",
          date: `${lastMonth}-01`,
          amount: 500,
          repeating: true,
        },
        {
          transactionID: 67,
          envelopeID: 3,
          transactionDescription: "Car",
          date: `${lastMonth}-01`,
          amount: 392,
          repeating: true,
        },
        {
          transactionID: 68,
          envelopeID: 3,
          transactionDescription: "Utilities",
          date: `${lastMonth}-01`,
          amount: 229,
          repeating: true,
        },
        {
          transactionID: 69,
          envelopeID: 3,
          transactionDescription: "Travel",
          date: `${lastMonth}-01`,
          amount: 250,
          repeating: true,
        },
        {
          transactionID: 70,
          envelopeID: 3,
          transactionDescription: "Emergency",
          date: `${lastMonth}-01`,
          amount: 250,
          repeating: true,
        },
      ],
    },
    {
      envelopeID: 16,
      envelopeTitle: "Housing",
      envelopeDescription: "Mortgages and HOA",
      transactions: [
        {
          transactionID: 31,
          envelopeID: 16,
          transactionDescription: "Mortgage",
          date: `${twoMonthsAgo}-01`,
          amount: 918,
          repeating: true,
        },
        {
          transactionID: 32,
          envelopeID: 16,
          transactionDescription: "HOA",
          date: `${twoMonthsAgo}-14`,
          amount: 150,
          repeating: true,
        },
        {
          transactionID: 71,
          envelopeID: 16,
          transactionDescription: "Mortgage",
          date: `${lastMonth}-01`,
          amount: 918,
          repeating: true,
        },
        {
          transactionID: 72,
          envelopeID: 16,
          transactionDescription: "HOA",
          date: `${lastMonth}-14`,
          amount: 150,
          repeating: true,
        },
      ],
    },
    {
      envelopeID: 17,
      envelopeTitle: "Transportation",
      envelopeDescription: null,
      transactions: [
        {
          transactionID: 33,
          envelopeID: 17,
          transactionDescription: "Tesla Lease",
          date: `${twoMonthsAgo}-05`,
          amount: 515,
          repeating: true,
        },
        {
          transactionID: 34,
          envelopeID: 17,
          transactionDescription: "Honda Loan",
          date: `${twoMonthsAgo}-08`,
          amount: 305.79,
          repeating: true,
        },
        {
          transactionID: 35,
          envelopeID: 17,
          transactionDescription: "Gas",
          date: `${twoMonthsAgo}-05`,
          amount: 31.38,
          repeating: false,
        },
        {
          transactionID: 73,
          envelopeID: 17,
          transactionDescription: "Tesla Lease",
          date: `${lastMonth}-05`,
          amount: 515,
          repeating: true,
        },
        {
          transactionID: 74,
          envelopeID: 17,
          transactionDescription: "Honda Loan",
          date: `${lastMonth}-08`,
          amount: 305.79,
          repeating: true,
        },
        {
          transactionID: 75,
          envelopeID: 17,
          transactionDescription: "Gas",
          date: `${lastMonth}-05`,
          amount: 51.24,
          repeating: false,
        },
      ],
    },
    {
      envelopeID: 18,
      envelopeTitle: "Utilities",
      envelopeDescription:
        "Utilities that are billed monthly and are pretty regular (electric, phone, internet)",
      transactions: [
        {
          transactionID: 36,
          envelopeID: 18,
          transactionDescription: "Electric",
          date: `${twoMonthsAgo}-05`,
          amount: 133.22,
          repeating: true,
        },
        {
          transactionID: 37,
          envelopeID: 18,
          transactionDescription: "T-Mobile",
          date: `${twoMonthsAgo}-01`,
          amount: 39,
          repeating: true,
        },
        {
          transactionID: 38,
          envelopeID: 18,
          transactionDescription: "Internet",
          date: `${twoMonthsAgo}-02`,
          amount: 83,
          repeating: true,
        },
        {
          transactionID: 76,
          envelopeID: 18,
          transactionDescription: "Electric",
          date: `${lastMonth}-05`,
          amount: 104.32,
          repeating: true,
        },
        {
          transactionID: 77,
          envelopeID: 18,
          transactionDescription: "T-Mobile",
          date: `${lastMonth}-01`,
          amount: 39,
          repeating: true,
        },
        {
          transactionID: 78,
          envelopeID: 18,
          transactionDescription: "Internet",
          date: `${lastMonth}-02`,
          amount: 83,
          repeating: true,
        },
      ],
    },
    {
      envelopeID: 19,
      envelopeTitle: "Groceries and Home",
      envelopeDescription:
        "Include items purchased for the home from Amazon, etc.",
      transactions: [
        {
          transactionID: 39,
          envelopeID: 19,
          transactionDescription: "Aldi",
          date: `${twoMonthsAgo}-03`,
          amount: 190.11,
          repeating: false,
        },
        {
          transactionID: 40,
          envelopeID: 19,
          transactionDescription: "Stop and Shop",
          date: `${twoMonthsAgo}-09`,
          amount: 100.25,
          repeating: false,
        },
        {
          transactionID: 41,
          envelopeID: 19,
          transactionDescription: "Walmart",
          date: `${twoMonthsAgo}-17`,
          amount: 83.46,
          repeating: false,
        },
        {
          transactionID: 79,
          envelopeID: 19,
          transactionDescription: "Aldi",
          date: `${lastMonth}-03`,
          amount: 200.11,
          repeating: false,
        },
        {
          transactionID: 80,
          envelopeID: 19,
          transactionDescription: "Stop and Shop",
          date: `${lastMonth}-09`,
          amount: 150.25,
          repeating: false,
        },
        {
          transactionID: 81,
          envelopeID: 19,
          transactionDescription: "Walmart",
          date: `${lastMonth}-17`,
          amount: 120.46,
          repeating: false,
        },
      ],
    },
    {
      envelopeID: 20,
      envelopeTitle: "Health",
      envelopeDescription: "Gym, doctors, chiropractor",
      transactions: [
        {
          transactionID: 42,
          envelopeID: 20,
          transactionDescription: "Chiropractor",
          date: `${twoMonthsAgo}-04`,
          amount: 40,
          repeating: false,
        },
        {
          transactionID: 43,
          envelopeID: 20,
          transactionDescription: "Chiropractor",
          date: `${twoMonthsAgo}-19`,
          amount: 40,
          repeating: false,
        },
        {
          transactionID: 44,
          envelopeID: 20,
          transactionDescription: "Planet Fitness",
          date: `${twoMonthsAgo}-17`,
          amount: 10.64,
          repeating: true,
        },
        {
          transactionID: 82,
          envelopeID: 20,
          transactionDescription: "Chiropractor",
          date: `${lastMonth}-04`,
          amount: 40,
          repeating: false,
        },
        {
          transactionID: 83,
          envelopeID: 20,
          transactionDescription: "Planet Fitness",
          date: `${lastMonth}-17`,
          amount: 10.64,
          repeating: true,
        },
      ],
    },
    {
      envelopeID: 23,
      envelopeTitle: "Streaming Services",
      envelopeDescription: null,
      transactions: [
        {
          transactionID: 45,
          envelopeID: 23,
          transactionDescription: "Netflix",
          date: `${twoMonthsAgo}-08`,
          amount: 24.45,
          repeating: true,
        },
        {
          transactionID: 46,
          envelopeID: 23,
          transactionDescription: "Youtube Premium",
          date: `${twoMonthsAgo}-03`,
          amount: 24.45,
          repeating: true,
        },
        {
          transactionID: 47,
          envelopeID: 23,
          transactionDescription: "Spotify",
          date: `${twoMonthsAgo}-28`,
          amount: 12.75,
          repeating: true,
        },
        {
          transactionID: 84,
          envelopeID: 23,
          transactionDescription: "Netflix",
          date: `${lastMonth}-08`,
          amount: 24.45,
          repeating: true,
        },
        {
          transactionID: 85,
          envelopeID: 23,
          transactionDescription: "Youtube Premium",
          date: `${lastMonth}-03`,
          amount: 24.45,
          repeating: true,
        },
        {
          transactionID: 86,
          envelopeID: 23,
          transactionDescription: "Spotify",
          date: `${lastMonth}-28`,
          amount: 12.75,
          repeating: true,
        },
      ],
    },
  ],
  savings: [
    {
      envelopeID: 25,
      envelopeTitle: "Home",
      envelopeDescription: "Condo insurance and home repair/improvement",
      transactions: [
        {
          transactionID: 48,
          envelopeID: 25,
          transactionDescription: "Starting Balance",
          date: `${twoMonthsAgo}-01`,
          amount: 9500,
          repeating: false,
        },
        {
          transactionID: 49,
          envelopeID: 25,
          transactionDescription: "Deposit",
          date: `${lastMonth}-01`,
          amount: 500,
          repeating: true,
        },
      ],
    },
    {
      envelopeID: 26,
      envelopeTitle: "Cars",
      envelopeDescription:
        "Honda insurance, taxes, money for maintenance and down payments on future cars",
      transactions: [
        {
          transactionID: 50,
          envelopeID: 26,
          transactionDescription: "Starting Balance",
          date: `${twoMonthsAgo}-01`,
          amount: 4176,
          repeating: false,
        },
        {
          transactionID: 51,
          envelopeID: 25,
          transactionDescription: "Oil Change",
          date: `${twoMonthsAgo}-10`,
          amount: -79.55,
          repeating: false,
        },
        {
          transactionID: 52,
          envelopeID: 25,
          transactionDescription: "Deposit",
          date: `${lastMonth}-01`,
          amount: 392,
          repeating: true,
        },
      ],
    },
    {
      envelopeID: 28,
      envelopeTitle: "Utilities",
      envelopeDescription:
        "Billed less than monthly (e.g. sewer tax bill) or amounts vary significantly (e.g. propane)",
      transactions: [
        {
          transactionID: 53,
          envelopeID: 28,
          transactionDescription: "Starting Balance",
          date: `${twoMonthsAgo}-01`,
          amount: 1822,
          repeating: false,
        },
        {
          transactionID: 54,
          envelopeID: 28,
          transactionDescription: "Propane",
          date: `${twoMonthsAgo}-20`,
          amount: -74.38,
          repeating: true,
        },
        {
          transactionID: 55,
          envelopeID: 28,
          transactionDescription: "Garbage",
          date: `${lastMonth}-16`,
          amount: -141.27,
          repeating: false,
        },
        {
          transactionID: 87,
          envelopeID: 28,
          transactionDescription: "Deposit",
          date: `${lastMonth}-01`,
          amount: 229,
          repeating: true,
        },
      ],
    },
    {
      envelopeID: 30,
      envelopeTitle: "Travel",
      envelopeDescription: null,
      transactions: [
        {
          transactionID: 57,
          envelopeID: 30,
          transactionDescription: "Starting Balance",
          date: `${twoMonthsAgo}-01`,
          amount: 5204,
          repeating: false,
        },
        {
          transactionID: 58,
          envelopeID: 25,
          transactionDescription: "Flights to SC",
          date: `${twoMonthsAgo}-02`,
          amount: -453.78,
          repeating: false,
        },
        {
          transactionID: 88,
          envelopeID: 25,
          transactionDescription: "Deposit",
          date: `${lastMonth}-01`,
          amount: 250,
          repeating: true,
        },
      ],
    },
    {
      envelopeID: 31,
      envelopeTitle: "Emergency",
      envelopeDescription: null,
      transactions: [
        {
          transactionID: 60,
          envelopeID: 31,
          transactionDescription: "Starting Balance",
          date: `${twoMonthsAgo}-01`,
          amount: 6750,
          repeating: false,
        },
        {
          transactionID: 89,
          envelopeID: 25,
          transactionDescription: "Deposit",
          date: `${lastMonth}-01`,
          amount: 250,
          repeating: true,
        },
      ],
    },
    {
      envelopeID: 32,
      envelopeTitle: "Income",
      envelopeDescription: null,
      transactions: [
        {
          transactionID: 62,
          envelopeID: 32,
          transactionDescription: "Balance",
          date: `${twoMonthsAgo}-01`,
          amount: 30359.51,
          repeating: false,
        },
      ],
    },
  ],
};
