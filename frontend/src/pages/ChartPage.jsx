import {useEffect, useState} from "react";
import axios from 'axios';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';
import './ChartPage.css';


function ChartPage() {
    const [categories, setCategories] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [selection, setSelection] = useState(1);

    // Checkbox Variables
    const [viewTotal, setViewTotal] = useState(true);
    const [viewIncome, setViewIncome] = useState(false);
    const [viewExpense, setViewExpense] = useState(false);
    const [viewBills, setViewBills] = useState(false);
    const [viewPersonal, setViewPersonal] = useState(false);
    const [viewGroceries, setViewGroceries] = useState(false);
    const [viewFood, setViewFood] = useState(false);
    const [viewGifts, setViewGifts] = useState(false);
    const [viewWork, setViewWork] = useState(false);
    const [viewSideJobs, setViewSideJobs] = useState(false);

    // Dropdown State Variables
    const [viewIncomeDropdown, setViewIncomeDropdown] = useState(false);
    const [viewExpenseDropdown, setViewExpenseDropdown] = useState(false);

    /**
     * Sets the initial dateRange strings for the current month
     */
    const getInitialDateRange = () => {
        const start = new Date();
        const year = start.getFullYear()
        const month = String(start.getMonth() + 1).padStart(2, '0');
        const endDate = String(start.getDate()).padStart(2, '0');

        return {startDate: `${year}-${month}-01`, endDate: `${year}-${month}-${endDate}`};
    }

    const [dateRange, setDateRange] = useState(getInitialDateRange());


    const handleRangeChange = (selection) => {
        const start = dateRange.endDate;
        let [year, month] = start.split('-');

        // Selection of 0 indicates that all transactions should be fetched. Therefore, we will skip this since it's
        // unnecessary to calculate this
        if (selection !== 0) {
            let difference = parseInt(month) - (selection - 1);
            if (difference < 1) { // year wrapping required
                difference = 12 - Math.abs(difference);
                year = parseInt(year) - 1;
            }
            month = String(difference).padStart(2, '0');
        }

        const startDate = (selection === 0) ? null : `${year}-${month}-01`;
        const endDate = dateRange.endDate;
        setDateRange({startDate, endDate});
    };

    useEffect(() => {
        const fetchCategories = async () => {
            const url = `${import.meta.env.VITE_API_URL}/categories`;
            const response = await axios.get(url);
            setCategories(response.data);
        };

        fetchCategories();
    }, []);


    /**
     * Takes all transactions from the API and returns them as an array of objects in this format:
     * {date: 'YYYY-MM-DD', income: number, expense: number}
     * @param transactions
     */
    const groupByDate = (transactions) => {

        const createDataPoint = (date) => {
            const dataPoint = {date};
            dataPoint['Total'] = 0;
            dataPoint['Income'] = 0;
            dataPoint['Expense'] = 0;
            categories.forEach(category => {
                dataPoint[category.name] = 0;
            });
            return dataPoint;
        };

        const grouped = transactions.reduce((acc, transaction) => {
            const date = transaction.date.split('T')[0];
            if (!acc[date]) {
                acc[date] = createDataPoint(date);
            }

            const category = categories.find(c => c.id === transaction.category_id);
            if (!category) return acc; // This prevents crashes if categories hasn't populated
            const categoryName = category.name;
            acc[date][categoryName] += parseFloat(transaction.amount);

            acc[date][transaction.type === 'income' ? 'Income' : 'Expense'] += parseFloat(transaction.amount);
            acc[date]['Total'] = acc[date]['Income'] - acc[date]['Expense'];

            return acc;
        }, {});

        return Object.entries(grouped).map(([date, dataPoint]) => dataPoint).sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    useEffect(() => {
        if (!categories || categories.length === 0) return;

        const fetchTransactions = async () => {
            const {startDate, endDate} = dateRange;
            const APIArgs = (startDate === null) ? `` : `?startDate=${startDate}&endDate=${endDate}`;
            const url = `${import.meta.env.VITE_API_URL}/transactions${APIArgs}`;
            const response = await axios.get(url);
            setTransactions(groupByDate(response.data));
        }
        fetchTransactions();
    }, [dateRange, categories]);


    return (
        <div className="chart-page">
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={transactions}>
                    <CartesianGrid stokeDasharray="3 3"/>
                    <XAxis dataKey="date"/>
                    <YAxis/>
                    <Tooltip/>
                    <Legend/>
                    {viewTotal && <Line type="linear" dataKey="Total" stroke="#999999"/>}

                    {viewIncome && <Line type="linear" dataKey="Income" stroke="#00ff00"/>}
                    {viewGifts &&
                        <Line type="linear" dataKey="Gifts" stroke={categories.find(c => c.name === 'Gifts').color}/>}
                    {viewWork &&
                        <Line type="linear" dataKey="Work" stroke={categories.find(c => c.name === 'Work').color}/>}
                    {viewSideJobs && <Line type="linear" dataKey="Side-Jobs"
                                           stroke={categories.find(c => c.name === 'Side-Jobs').color}/>}

                    {viewExpense && <Line type="linear" dataKey="Expense" stroke="#ff0000"/>}
                    {viewBills &&
                        <Line type="linear" dataKey="Bills" stroke={categories.find(c => c.name === 'Bills').color}/>}
                    {viewPersonal && <Line type="linear" dataKey="Personal"
                                           stroke={categories.find(c => c.name === 'Personal').color}/>}
                    {viewGroceries && <Line type="linear" dataKey="Groceries"
                                            stroke={categories.find(c => c.name === 'Groceries').color}/>}
                    {viewFood &&
                        <Line type="linear" dataKey="Food" stroke={categories.find(c => c.name === 'Food').color}/>}
                </LineChart>
            </ResponsiveContainer>
            <div className="date-range-picker">
                <button onClick={() => handleRangeChange(1)}>1mo</button>
                <button onClick={() => handleRangeChange(3)}>3mo</button>
                <button onClick={() => handleRangeChange(6)}>6mo</button>
                <button onClick={() => handleRangeChange(12)}>12mo</button>
                <button onClick={() => handleRangeChange(0)}>All</button>
            </div>
            <div className="category-picker-box">
                <div className="category-picker">
                    <label>
                        <input
                            type="checkbox"
                            checked={viewTotal}
                            onChange={() => setViewTotal(!viewTotal)}
                        />
                        Total
                    </label>
                    <label>
                        <input type="checkbox" checked={viewIncome}
                               onChange={() => setViewIncome(!viewIncome)}/>
                        Income
                    </label>
                    <div className={`dropdown-section ${!viewIncome ? 'hidden' : ''}`}>
                        <label className="dropdown-box">
                            <input type="checkbox" checked={viewGifts}
                                   onChange={() => setViewGifts(!viewGifts)}/>
                            Gifts
                        </label>
                        <label className="dropdown-box">
                            <input type="Checkbox" checked={viewWork}
                                   onChange={() => setViewWork(!viewWork)}/>
                            Work
                        </label>
                        <label className="dropdown-box">
                            <input type="checkbox" checked={viewSideJobs}
                                   onChange={() => setViewSideJobs(!viewSideJobs)}/>
                            Side-Jobs
                        </label>
                    </div>
                    <label>
                        <input type="checkbox" checked={viewExpense}
                               onChange={() => setViewExpense(!viewExpense)}/>
                        Expense
                    </label>
                    <div className={`dropdown-section ${!viewExpense ? 'hidden' : ''}`}>
                        <label className="dropdown-box">
                            <input type="checkbox" checked={viewBills}
                                   onChange={() => setViewBills(!viewBills)}/>
                            Bills
                        </label>
                        <label className="dropdown-box">
                            <input type="checkbox" checked={viewPersonal}
                                   onChange={() => setViewPersonal(!viewPersonal)}/>
                            Personal
                        </label>
                        <label className="dropdown-box">
                            <input type="checkbox" checked={viewGroceries}
                                   onChange={() => setViewGroceries(!viewGroceries)}/>
                            Groceries
                        </label>
                        <label className="dropdown-box">
                            <input type="checkbox" checked={viewFood}
                                   onChange={() => setViewFood(!viewFood)}/>
                            Food
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChartPage;