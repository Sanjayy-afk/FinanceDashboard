// src/pages/AddMember.jsx
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
          // localStorage.removeItem("token");
          navigate("/dashboard");
        } else {
          fetchMembers(); // ✅ Load existing family members
        }
      })
      .catch(() => {
        alert("Session expired.");
        localStorage.removeItem("token");
        navigate("/");
      });
  }, []);

  // 📥 Fetch existing secondary members
  const fetchMembers = () => {
    fetch("/api/members", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMembers(data.members || []));
  };

  // ➕ Submit handler
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
      fetchMembers(); // 🔄 Refresh list
    } else {
      setMessage(`❌ ${data.error || "Failed to add member"}`);
    }
  };

  return (
    <div className="add-member-page">
      <h2>Add Secondary Member</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Amount to allocate"
          required
        />
        <button type="submit">Add Member</button>
      </form>
      {message && <p>{message}</p>}

      <h3>Family Members</h3>
      <ul>
        {members.map((m, i) => (
          <li key={i}>{m.username} - ₹{m.balance.toFixed(2)}</li>
        ))}
      </ul>
    </div>
  );
}
