import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LogExpense() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
  const thisMonth = new Date().toISOString().slice(0, 7); // yyyy-mm


  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(today); // default today's date
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [recent, setRecent] = useState(null);

  const [mpDesc, setMpDesc] = useState('');
  const [mpAmount, setMpAmount] = useState('');
  const [mpCategory, setMpCategory] = useState('');
  const [mpStart, setMpStart] = useState(thisMonth); // default current month
  const [mpEnd, setMpEnd] = useState(thisMonth);     // optional
  const [mpNote, setMpNote] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

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
      if (data.error?.includes("Insufficient balance")) {
        alert("⚠️ You ran out of balance.");
      }
      setMessage(`❌ ${data.error}`);
    }
  };

  const handleMonthlySubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/monthly-payment", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({
    description: mpDesc,
    amount: parseFloat(mpAmount),
    category: mpCategory,
    startMonth: mpStart,
    endMonth: mpEnd || null,
    note: mpNote
  })
});

const data = await res.json();
if (res.ok) {
  alert("✅ Monthly payment scheduled!");
  setMpDesc(""); setMpAmount(""); setMpCategory("");
  setMpStart(thisMonth); setMpEnd(thisMonth); setMpNote("");
} else {
  alert(`❌ ${data.error || "Failed to schedule payment"}`);
}

  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Log New Expense</h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-lg shadow">
        <input
          type="text"
          className="border rounded p-2"
          placeholder="What is the expense?"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
        <input
          type="number"
          className="border rounded p-2"
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
        />
        <select
          className="border rounded p-2"
          value={category}
          onChange={e => setCategory(e.target.value)}
          required
        >
          <option value="">Select category</option>
          <option value="Food">Food</option>
          <option value="Personal">Personal</option>
          <option value="Shopping">Shopping</option>
          <option value="Travel">Travel</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="date"
          className="border p-2 rounded w-full cursor-pointer"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
          
        />
        <textarea
          className="col-span-1 md:col-span-2 border rounded p-2"
          placeholder="Extra Note (optional)"
          value={note}
          onChange={e => setNote(e.target.value)}
        />
        <button
          type="submit"
          className="col-span-1 md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Log Expense
        </button>
      </form>

      {message && <p className="mt-4 text-lg font-medium">{message}</p>}

      {recent && (
        <div className="mt-6 border rounded-lg p-4 bg-gray-50">
          <h3 className="font-semibold text-lg mb-2">Just Logged:</h3>
          <p><strong>Description:</strong> {recent.description}</p>
          <p><strong>Amount:</strong> ₹{recent.amount.toFixed(2)}</p>
          <p><strong>Category:</strong> {recent.category}</p>
          <p><strong>Date:</strong> {new Date(recent.date).toLocaleDateString()}</p>
          {recent.note && <p><strong>Note:</strong> {recent.note}</p>}
        </div>
      )}

      {/* --- Monthly Section --- */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Monthly Payments</h2>
        <form onSubmit={handleMonthlySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-lg shadow">
          <input
            type="text"
            className="border rounded p-2"
            placeholder="What is the expense?"
            value={mpDesc}
            onChange={e => setMpDesc(e.target.value)}
            required
          />
          <input
            type="number"
            className="border rounded p-2"
            placeholder="Monthly Amount"
            value={mpAmount}
            onChange={e => setMpAmount(e.target.value)}
            required
          />
          <select
            className="border rounded p-2"
            value={mpCategory}
            onChange={e => setMpCategory(e.target.value)}
            required
          >
            <option value="">Select category</option>
            <option value="Food">Food</option>
            <option value="Utilities">Utilities</option>
            <option value="Subscription">Subscription</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="month"
            className="border p-2 rounded w-full cursor-pointer"
            value={mpStart}
            onChange={e => setMpStart(e.target.value)}
            placeholder="Start month"
            required
          />
          <input
            type="month"
            className="border rounded p-2"
            value={mpEnd}
            onChange={e => setMpEnd(e.target.value)}
            placeholder="End month"
          />
          <textarea
            className="col-span-1 md:col-span-2 border rounded p-2"
            placeholder="Extra Note (optional)"
            value={mpNote}
            onChange={e => setMpNote(e.target.value)}
          />
          <button
            type="submit"
            className="col-span-1 md:col-span-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            Schedule Monthly Payment
          </button>
        </form>
      </div>
    </div>
  );
}
