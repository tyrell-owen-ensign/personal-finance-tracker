import {useEffect, useState} from "react";
import axios from "axios";
import './HistoryPage.css';
import AddTransactionPage from "./AddTransactionPage.jsx";


function HistoryPage() {


    const [month, setMonth] = useState(getCurrentDate());
    const [transactions, setTransactions] = useState([]);
    const [groupedTransactions, setGroupedTransactions] = useState([]);
    const [balance, setBalance] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categories, setCategories] = useState([]);


    const groupByDate = (transactions) => {
        const grouped = transactions.reduce((acc, transaction) => {
            const date = transaction.date.split('T')[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(transaction);
            return acc;
        }, {});

        return Object.entries(grouped).map(([date, transactions]) => ({
            date,
            transactions
        }));
    };

    /**
     * returns the arguments for the current month
     * Format: "startDate=YYYY-MM-DD&endDate=YYYY-MM-DD"
     * @returns string
     */
    const createAPIArguments = () => {
        const [year, currentMonth] = month.split('-');
        const lastDay = new Date(year, parseInt(currentMonth), 0);
        const lastDayString = String(lastDay.getDate()).padStart(2, "0");
        return `startDate=${year}-${currentMonth}-01&endDate=${year}-${currentMonth}-${lastDayString}`;
    }

    useEffect(() => {
        const fetchBalance = async () => {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/balance`);
            setBalance(parseFloat(response.data.total));
        };
        fetchBalance();


        const fetchCategories = async () => {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/categories`);
            setCategories(response.data);
        };
        fetchCategories();

    }, []);

    const fetchTransactions = async () => {
        const url = `${import.meta.env.VITE_API_URL}/transactions?${createAPIArguments()}`;
        const response = await axios.get(url);
        setTransactions(response.data);

        setGroupedTransactions(groupByDate(response.data));
    };

    useEffect(() => {
        try {
            fetchTransactions();
        } catch (error) {
            console.error(error);
        }
    }, [month]);


    /**
     * Takes in a direction (number) and sets the month to either the month before or the month after.
     * A negative number indicates decrement (previous month)
     * A positive number indicates increment (next month)
     * @param direction
     */
    const changeMonth = (direction) => {
        let [year, currentMonth] = month.split("-");
        year = parseInt(year);
        currentMonth = parseInt(currentMonth);

        if (direction < 0) {
            currentMonth--;
            if (currentMonth <= 0) {
                year--;
                currentMonth = 12;
            }
        } else {
            currentMonth++;
            if (currentMonth >= 13) {
                year++;
                currentMonth = 1;
            }
        }
        const monthStr = String(currentMonth).padStart(2, "0");
        setMonth(`${year}-${monthStr}`);
    }

    /**
     * Takes a Date in the string format "YYYY-MM-DD" and returns the day of the week
     * ex. "2026-05-12" -> "Monday"
     * @param dateString
     * @returns string
     */
    const getDayOfWeek = (dateString) => {
        const daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const date = new Date(dateString + "T00:00:00"); // add the time to the date to prevent UTC bug
        return daysOfTheWeek[date.getDay()];
    }

    return (
        <div>
            {/* Month Picker */}
            <div>
                <button onClick={() => changeMonth(-1)}>Previous
                </button>

                <input type="month"
                       value={month}
                       onChange={(e) => setMonth(e.target.value)}/>

                <button onClick={() => changeMonth(1)}>Next
                </button>
            </div>

            {/* Balance View */}
            <div className={balance < 0 ? 'balance-negative' : 'balance-positive'}>
                <h3>${balance}</h3>
            </div>


            {/* Transaction View */}
            <div>
                {groupedTransactions.map((group) => (
                    <div key={group.date}>
                        <h4>{group.date.split('-')[2] + ' - ' + getDayOfWeek(group.date)}</h4>
                        {group.transactions.map((transaction) => (
                            <div key={transaction.id}
                                 className={transaction.type === 'income' ? 'transaction-income' : 'transaction-expense'}>
                                <p>{transaction.type === 'income' ? '+' : '-'}</p>
                                <p>{transaction.name}</p>
                                <p>${transaction.amount}</p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* This button will be a floating action button to pop-up the add-transaction page */}
            <button onClick={() => setIsModalOpen(true)}>Add</button>
            {isModalOpen &&
                <AddTransactionModal onClose={() => setIsModalOpen(false)} onSuccess={() => fetchTransactions()}
                                     categories={categories}/>}
        </div>
    );
}

function AddTransactionModal({onClose, onSuccess, categories, transaction}) {
    const editTransaction = transaction != null; // We'll create a new transaction if there's no parameter passed

    const transaction_id = transaction?.id;

    const [name, setName] = useState(editTransaction ? transaction.name : '');
    const handleNameChange = (e) => setName(e.target.value);

    const [amount, setAmount] = useState(editTransaction ? transaction.amount : 0);
    const handleAmountChange = (e) => setAmount(e.target.value);

    const [date, setDate] = useState(editTransaction ? transaction.date.split('T')[0] : getCurrentDate());

    const [category_id, setCategory_id] = useState(editTransaction ? transaction.category_id : 1);
    const [transactionType, setTransactionType] = useState(editTransaction ? categories.find(c => c.id === transaction.category_id).type : 'expense');
    const handleCategoryChange = (e) => {
        const value = parseInt(e.target.value);
        setCategory_id(value);
        setTransactionType(categories.find(c => c.id === value).type);
    };

    const [description, setDescription] = useState(editTransaction ? transaction.description : '');
    const handleDescriptionChange = (e) => setDescription(e.target.value);


    const submitHandler = (e) => {
        e.preventDefault();

        const transactionData = {
            name: name,
            type: transactionType,
            amount: amount,
            date: date,
            description: description,
            category_id: category_id,
        };

        const API_URL = `${import.meta.env.VITE_API_URL}/transactions`;
        if (transaction_id == null) { // We Need to Post a new transaction
            const postTransaction = async () => {
                const response = await axios.post(API_URL, transactionData);
            }
            try {
                postTransaction();
            } catch (error) {
                console.error(error);
            }
        } else { // Call a PUT to edit a transaction
            const putTransaction = async () => {
                const response = await axios.put(API_URL + `${transaction_id}`, transactionData);
            }
            try {
                putTransaction();
            } catch (error) {
                console.error(error);
            }
        }
        onClose();
        onSuccess();
    };


    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>{editTransaction ? 'Edit' : 'Add'} Transaction</h3>
                <form onSubmit={submitHandler}>
                    <input type="text" placeholder="Name"
                           value={name} onChange={handleNameChange} required/>

                    <div>
                        <label>{transactionType === 'income' ? '+' : '-'}$</label>
                        <input type="number" placeholder="00.00"
                               value={amount} onChange={handleAmountChange} required/>

                        <select value={category_id} onChange={handleCategoryChange}>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <input type="date" value={date}
                           onChange={(e) => setDate(e.target.value)}
                           required/>

                    <textarea placeholder="Description"
                              value={description} onChange={handleDescriptionChange}/>

                    <button type="submit">
                        {editTransaction ? 'Save' : 'Add'}
                    </button>
                </form>


            </div>
        </div>
    );
}

function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const monthStr = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${monthStr}-${day}`;
}

export default HistoryPage;