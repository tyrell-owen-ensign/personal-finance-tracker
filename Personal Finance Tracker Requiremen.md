Personal Finance Tracker Requirements:

* The user can add transactions that are either income or expenses. These transactions will track the transaction's:

  * type
  * amount
  * day
  * category
  * name
  * description/purpose
* The user can view a line graph that shows their income and/or expenses over time
* User can edit transactions by:

  * Changing it from expense to income and vice-versa
  * Changing the amount of the transaction
  * Changing the day of the transaction
  * Changing the category of the transaction
  * Changing the transaction's name/title
  * Changing the transaction's description
* User can remove a transaction from the history



Stretch goals (not a part of the mvp):

* Set custom budget allocation percentages

  * Has an optional toggle switch when you record an income transaction
  * The budget will automatically allocate the chosen percentages of an income transaction to the specific budget funds. For example:

    * 50% -> Bills
    * 30% -> Savings
    * 20% -> Personal expenses
* Create multiple accounts to keep track of

  * Allow for transferring between accounts
* Allow the user to edit the lists of categories





**Data Model**:
Table: Transaction

|id|INT, (primary key)|
|-|-|
|name|VARCHAR(100)|
|type|ENUM ('income', 'expense')|
|amount|DECIMAL(10, 2)|
|description|TEXT|
|category\_id|INT, foreign key -> Category.id|
|created\_at|TIMESTAMP|
|date|DATE|

View: Balance

|id|INT, (primary key)|
|-|-|
|balance|INT|


Table: Category

|id|INT, primary key|
|-|-|
|name|VARCHAR(100)|
|color|CHAR(7)|
|type|ENUM, ('income', 'expense')|

note: The default state of these tables will contain:

* For expenses:

  * Bills
  * Personal
  * Groceries
  * Food
* For Income:

  * Gifts
  * Work
  * Side-jobs

The categories will also just be global so that I don't have to worry about handling multiple different users.





**API Contract**:

|GET|/transactions|returns all transactions|
|-|-|-|
|POST|/transactions|create a new transaction|
|PUT|/transactions/:id|updates the specified transaction|
|DELETE|/transactions/:id|deletes the specified transaction|
|GET|/transactions?startDate=2026-01-01&endDate=2026-05-31|Returns the given date range. For a single month, provide the first and last days of the month|
|GET|/categories|returns all categories|





**Development Stack**:

* Frontend

  * React.js
* Backend

  * Node.js
  * Express
  * nodemon
* Database

  * PostgreSQL



For local build the database will run inside a docker container. The frontend and backend will run on the machine directly (dev servers)

