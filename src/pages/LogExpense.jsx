// src/pages/LogExpense.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LogExpense() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
    const [recent, setRecent] = useState(null); // for preview


const handleSubmit = async (e) => {
  e.preventDefault();

  const res = await fetch("/api/log-expense", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      description,
      amount: parseFloat(amount),
      category,
      date,
      note
    })
  });

  const data = await res.json();
  if (res.ok) {
    setMessage("✅ Expense logged!");
    setRecent(data.transaction);
    setDescription('');
    setAmount('');
    setCategory('');
    setDate('');
    setNote('');
  } else {
    if (data.error.includes("Insufficient balance")) {
      alert("⚠️ You ran out of balance. Expense not logged.");
    }
    setMessage(`❌ ${data.error}`);
  }
};


  return (
    <div className="log-expense-page">
      <h2>Log New Expense</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "10px", maxWidth: 400 }}>
        <input
          type="text"
          placeholder="What is the expense?"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
        />
        <select value={category} onChange={e => setCategory(e.target.value)} required>
          <option value="">Select category</option>
          <option value="Food">Food</option>
          <option value="Personal">Personal</option>
          <option value="Shopping">Shopping</option>
          <option value="Travel">Travel</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />
        <textarea
          placeholder="Extra Note (optional)"
          value={note}
          onChange={e => setNote(e.target.value)}
        />
        <button type="submit">Log Expense</button>
      </form>
      
      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}

      {recent && (
        <div className="preview-box" style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h4>Just Logged:</h4>
          <p><strong>Description:</strong> {recent.description}</p>
          <p><strong>Amount:</strong> ₹{recent.amount.toFixed(2)}</p>
          <p><strong>Category:</strong> {recent.category}</p>
          <p><strong>Date:</strong> {new Date(recent.date).toLocaleDateString()}</p>
          {recent.note && <p><strong>Note:</strong> {recent.note}</p>}
        </div>
      )}
    </div>
  );
}
