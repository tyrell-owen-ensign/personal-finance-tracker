import {getCurrentDate} from '../utils.js';
import {useState} from "react";
import axios from "axios";
import './AddTransactionModal.css';


function AddTransactionModal({onClose, onSuccess, categories, transaction}) {
    const editTransaction = transaction != null; // We'll create a new transaction if there's no parameter passed

    const transaction_id = transaction?.id;

    const [name, setName] = useState(editTransaction ? transaction.name : '');
    const handleNameChange = (e) => setName(e.target.value);

    const [amount, setAmount] = useState(editTransaction ? transaction.amount : 0);
    const handleAmountChange = (e) => setAmount(Math.abs(e.target.value));

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


    const submitHandler = async (e) => {
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
        try {
            if (transaction_id == null) {
                await axios.post(API_URL, transactionData);
            } else {
                await axios.put(`${API_URL}/${transaction_id}`, transactionData);
            }
            onClose();
            onSuccess();
        } catch (error) {
            console.log(error);
        }
    };


    return (
        <div className="modal-overlay">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">{editTransaction ? 'Edit' : 'Add'} Transaction</h3>
                <form onSubmit={submitHandler}
                      className="modal-form">
                    <input type="text" placeholder="Name"
                           value={name} onChange={handleNameChange} required/>

                    <div className="modal-amount-section">
                        <div className={transactionType === 'income' ? 'amount-input-income' : 'amount-input-expense'}>
                            <label>$</label>
                            <input type="number" placeholder="00.00"
                                   value={amount} onChange={handleAmountChange} required/>
                        </div>

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
                           required
                           className="modal-date-picker"/>

                    <textarea placeholder="Description"
                              value={description} onChange={handleDescriptionChange}
                              className="modal-description-box"/>

                    <div className="submit-button">
                        <button type="submit">
                            {editTransaction ? 'Save' : 'Add'}
                        </button>
                        <button onClick={onClose}>Close</button>
                    </div>
                </form>


            </div>
        </div>
    );
}

export default AddTransactionModal;