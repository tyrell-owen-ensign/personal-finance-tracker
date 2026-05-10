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