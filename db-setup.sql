CREATE TABLE accounts (
    accountID INT AUTO_INCREMENT PRIMARY KEY,
    accountTitle VARCHAR(50)
);

CREATE TABLE envelopes (
    envelopeID INT AUTO_INCREMENT PRIMARY KEY,
    accountID INT,
    envelopeTitle VARCHAR(50),
    envelopeDescription VARCHAR(255),
    FOREIGN KEY (accountID) references accounts(accountID)
);

CREATE TABLE transactions (
    transactionID INT AUTO_INCREMENT PRIMARY KEY,
    envelopeID INT,
    transactionDescription VARCHAR(255) NOT NULL,
    date DATE,
    amount DECIMAL(10, 2) NOT NULL,
    repeating BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (envelopeID) REFERENCES envelopes(envelopeID)
);

INSERT INTO accounts (accountTitle) VALUES
('Budget'),
('Checking'),
('Savings');

INSERT INTO envelopes (accountID, envelopeTitle, envelopeDescription) VALUES
(1, 'Income', null),
(1, 'Giving', 'Tithing, donations to Brazil, World Vision, Kristen'),
(1, 'Savings', null),
(1, 'Housing', 'Mortgages and HOA'),
(1, 'Transportation', null),
(1, 'Utilities', 'Utilities that are billed monthly and are pretty regular (electric, phone, internet)'),
(1, 'Groceries and Home', 'Include items purchased for the home from Amazon, etc.'),
(1, 'Health', 'Gym, doctors, chiropractor'),
(1, 'Dog', null),
(1, 'Restaurants and Entertainment', null),
(1, 'Streaming Services', null),
(1, 'Clothing and Personal Care', null),
(2, 'Income', null),
(2, 'Giving', 'Tithing, donations to Brazil, World Vision, Kristen'),
(2, 'Savings', null),
(2, 'Housing', 'Mortgages and HOA'),
(2, 'Transportation', null),
(2, 'Utilities', 'Utilities that are billed monthly and are pretty regular (electric, phone, internet)'),
(2, 'Groceries and Home', 'Include items purchased for the home from Amazon, etc.'),
(2, 'Health', 'Gym, doctors, chiropractor'),
(2, 'Dog', null),
(2, 'Restaurants and Entertainment', null),
(2, 'Streaming Services', null),
(2, 'Clothing and Personal Care', null),
(3, 'Income', null),
(3, 'Home', 'Condo insurance and home repair/improvement'),
(3, 'Cars', 'Honda insurance, taxes, money for maintenance and down payments on future cars'),
(3, 'Dog', 'Doggo health insurance and copays for large expenses'),
(3, 'Utilities', 'Billed less than monthly (e.g. sewer tax bill) or amounts vary significantly (e.g. propane)'),
(3, 'Phones', 'Yearly Mint Mobile bill, savings to buy/repair phones'),
(3, 'Travel', null),
(3, 'Emergency', null);

INSERT INTO transactions (envelopeID, transactionDescription, date, amount, repeating) VALUES
(1, 'Bryant', null, 4230, 0),
(1, 'Takeda', null, 7800, 0),
(2, 'GVC', '2024-12-01', 602, 0),
(2, 'Brazil', '2024-12-01', 1300, 0),
(2, 'Kristen', '2024-12-01', 100, 0),
(2, 'World Vision', '2024-12-12', 450, 0),
(3, 'Home', '2024-12-01', 500, 0),
(3, 'Car', '2024-12-01', 392, 0),
(3, 'Dog', '2024-12-01', 200, 0),
(3, 'Utilities', '2024-12-01', 229, 0),
(3, 'Phone', '2024-12-01', 58, 0),
(3, 'Travel', '2024-12-01', 250, 0),
(3, 'Emergency', '2024-12-01', 250, 0),
(3, 'Kevin Personal', '2024-12-01', 200, 0),
(3, 'Natalia Personal', '2024-12-01', 200, 0),
(3, 'Roth IRA', '2024-12-01', 200, 0),
(4, 'CT Mortgage', '2024-12-01', 918, 0),
(4, 'MA Mortgage', '2024-12-01', 2430, 0),
(4, 'MA HOA', '2024-12-01', 528, 0),
(4, 'CT HOA', '2024-12-14', 150, 0),
(13, 'Starting Balance', '2024-12-01', 12100, 1),
(13, 'Bryant', '2024-12-01', 4230, 1),
(13, 'Takeda', '2024-12-01', 7800, 1),
(14, 'GVC', '2024-12-01', 602, 1),
(14, 'Kristen', '2024-12-01', 100, 1),
(14, 'World Vision', '2024-12-12', 450, 1),
(15, 'Kevin Personal', '2024-12-01', 200, 0),
(15, 'Natalia Personal', '2024-12-01', 200, 0),
(15, 'Roth IRA', '2024-12-01', 200, 0),
(16, 'CT Mortgage', '2024-12-01', 918, 0),
(16, 'MA Mortgage', '2024-12-01', 2430, 0),
(16, 'MA HOA', '2024-12-01', 528, 0),
(16, 'CT HOA', '2024-12-14', 150, 0),
(25, 'Balance', '2024-12-01', 28000, 0),
(26, 'Starting Balance', '2024-12-01', 9500, 0),
(27, 'Starting Balance', '2024-12-01', 4176, 0),
(28, 'Starting Balance', '2024-12-01', 2600, 0),
(29, 'Starting Balance', '2024-12-01', 1822, 0),
(30, 'Starting Balance', '2024-12-01', 574, 0),
(31, 'Starting Balance', '2024-12-01', 5204, 0),
(32, 'Starting Balance', '2024-12-01', 6750, 0);