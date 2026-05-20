DROP VIEW IF EXISTS balance;
DROP TABLE IF EXISTS transaction;
DROP TABLE IF EXISTS category;
DROP TYPE IF EXISTS transaction_type;

CREATE TYPE transaction_type AS ENUM ('income', 'expense');

CREATE TABLE category
(
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(100)     NOT NULL,
    color CHAR(7)          NOT NULL,
    type  transaction_type NOT NULL
);

CREATE TABLE transaction
(
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100)     NOT NULL,
    type        transaction_type NOT NULL,
    amount      DECIMAL(10, 2)   NOT NULL,
    date        DATE             NOT NULL,
    description TEXT,
    category_id INT REFERENCES category (id),
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE VIEW balance AS
    SELECT
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) -
        SUM(CASE WHEN type - 'expense' THEN amount ELSE 0 END) AS total
    FROM transaction;