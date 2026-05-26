import {useEffect, useState} from "react";
import axios from "axios";
import './HistoryPage.css';
import AddTransactionModal from "./AddTransactionModal.jsx";
import {getCurrentDate} from "../utils.js";


function HistoryPage() {


    const setupMonth = () => {
        const [year, month, day] = getCurrentDate().split('-');
        return `${year}-${month}`;
    }
    const [month, setMonth] = useState(setupMonth());

    const [transactions, setTransactions] = useState([]);
    const [groupedTransactions, setGroupedTransactions] = useState([]);
    const [balance, setBalance] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedTransaction, setSelectedTransaction] = useState(null);


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
        })).sort((a, b) => {
            const aDay = parseInt(a.date.split('-')[2]);
            const bDay = parseInt(b.date.split('-')[2]);
            return bDay - aDay; // This order so the days will go from most recent to least recent
        });
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
    };

    const handleTransactionClick = (transaction) => {
        setSelectedTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleDelete = async (transaction_id) => {
        const confirmed = confirm("Are you sure you want to delete this transaction?");
        if (confirmed) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/transactions/${transaction_id}`);
                fetchTransactions();
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <div>
            {/* Month Picker */}
            <div className="month-picker">
                <button onClick={() => changeMonth(-1)}>Previous
                </button>

                <input type="month"
                       value={month}
                       onChange={(e) => setMonth(e.target.value)}/>

                <button onClick={() => changeMonth(1)}>Next
                </button>
            </div>

            {/* Balance View */}
            <div className="balance-view">
                <h3>Balance:</h3>
                <h3 className={balance < 0 ? 'balance-negative' : 'balance-positive'}>${balance}</h3>
            </div>


            {/* Transaction View */}
            <div className="transaction-view">
                {groupedTransactions.map((group) => (
                    <div key={group.date} className="transaction-day">
                        <h4 className="transaction-day-label">{group.date.split('-')[2] + ' - ' + getDayOfWeek(group.date)}</h4>
                        {group.transactions.map((transaction) => (
                            <div key={transaction.id}
                                 className="transaction-item"
                                 onClick={() => handleTransactionClick(transaction)}>
                                <div
                                    className={transaction.type === 'income' ? 'transaction-income' : 'transaction-expense'}>
                                    <p>{transaction.type === 'income' ? '+' : '-'}</p>
                                    <p>{transaction.name}</p>
                                    <p>${transaction.amount}</p>
                                </div>
                                <button className="delete-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(transaction.id);
                                        }}>
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* This button will be a floating action button to pop-up the add-transaction page */}
            <button onClick={() => setIsModalOpen(true)} className="action-button">Add</button>
            {isModalOpen &&
                <AddTransactionModal transaction={selectedTransaction} onClose={() => setIsModalOpen(false)}
                                     onSuccess={() => fetchTransactions()}
                                     categories={categories}/>}
        </div>
    );
}

export default HistoryPage;