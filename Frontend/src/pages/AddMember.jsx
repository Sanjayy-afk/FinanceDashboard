import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddMember() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [members, setMembers] = useState([]);

  // 🔐 Check token + role
  useEffect(() => {
    if (!token) return navigate("/");

    fetch("/api/currentUser", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.role !== "primary") {
          alert("Access denied: Only primary users allowed.");
          navigate("/dashboard");
        } else {
          fetchMembers();
        }
      })
      .catch(() => {
        alert("Session expired.");
        localStorage.removeItem("token");
        navigate("/");
      });
  }, []);

  const fetchMembers = () => {
    fetch("/api/members", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMembers(data.members || []));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch('/api/add-member', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ username, password, amount: Number(amount) })
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("✅ Member added!");
      setUsername("");
      setPassword("");
      setAmount("");
      fetchMembers();
    } else {
      setMessage(`❌ ${data.error || "Failed to add member"}`);
    }
  };

  const handleRemove = async (userToRemove) => {
    const res = await fetch(`/api/remove-member/${userToRemove}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      fetchMembers();
    } else {
      alert("❌ Failed to remove member");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Add Secondary Member</h2>

      <form onSubmit={handleSubmit} className="space-y-4 bg-gray-100 p-4 rounded-md shadow">
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username"
          required
          className="w-full p-3 rounded border border-gray-300"
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full p-3 rounded border border-gray-300"
        />
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Amount to allocate"
          required
          className="w-full p-3 rounded border border-gray-300"
        />
        <button
          type="submit"
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 rounded"
        >
          ➕ Add Member
        </button>
      </form>

      {message && <p className="mt-4 text-center font-medium">{message}</p>}

      <h3 className="text-xl font-semibold mt-8 mb-2">Family Members</h3>
      <ul className="divide-y divide-gray-300 bg-white shadow rounded-md">
        {members.map((m, i) => (
          <li key={i} className="flex justify-between items-center p-3">
            <span>{m.username} - ₹{m.balance.toFixed(2)}</span>
            <button
              onClick={() => handleRemove(m.username)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
