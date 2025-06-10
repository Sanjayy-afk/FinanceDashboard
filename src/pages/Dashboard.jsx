// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [financeOpen, setFinanceOpen] = useState(false);
  const [functionsOpen, setFunctionsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    try {
      const res = await fetch("/api/currentUser", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      setUser(data);
    } catch {
      navigate("/");
    }
  };

  fetchUser();
}, [location.pathname]);

  const handleTopUp = async () => {
    const confirmTopUp = window.confirm("Top up balance to ₹10,000?");
    if (!confirmTopUp) return;
    const res = await fetch("/api/topup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
    if (res.ok) {
      setUser((prev) => ({ ...prev, balance: data.newBalance }));
    }
  };

  useEffect(() => {
    if (!user) return;

    new Chart(document.getElementById("expenseChart"), {
      type: "pie",
      data: {
        labels: ["Rent", "Groceries", "Misc"],
        datasets: [{
          data: [3000, 1500, 1200],
          backgroundColor: ["#3498db", "#2ecc71", "#f1c40f"]
        }]
      }
    });

    new Chart(document.getElementById("daysRingChart"), {
      type: "doughnut",
      data: {
        labels: ["Remaining", "Used"],
        datasets: [{
          data: [20, 10],
          backgroundColor: ["#2ecc71", "#e74c3c"],
          cutout: "80%",
        }]
      }
    });
  }, [user]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="dashboard-container">
      {/* Sidebar
      <aside className="sidebar">
        <h2>Menu</h2>
        <div className="main-option">
          <div className="menu-group">
            <button className="toggle-btn" onClick={() => setFinanceOpen(!financeOpen)}>Finance</button>
            {financeOpen && (
              <div className="sub-option active">
                <a href="/dashboard">Dashboard</a>
                <a href="/log-expense">Log expense</a>
                <a href="/logged">Logged expenses</a>
              </div>
            )}
          </div>
          <div className="menu-group">
            <button className="toggle-btn" onClick={() => setFunctionsOpen(!functionsOpen)}>Functions</button>
            {functionsOpen && (
              <div className="sub-option active">
                <a href="/add-member">Add members</a>
                <a href="#">Import expenses</a>
              </div>
            )}
          </div>
        </div>
      </aside> */}

      {/* Content */}
      <main className="content">
        <div className="dashboard-header">
          <span className="username">{user.username}</span>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>Home</button>
          <div className="user-menu">
            <button className="btn btn-secondary user-details-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>User Details</button>
            {userMenuOpen && (
              <div className="sub-option active">
                <a href="/" onClick={() => localStorage.removeItem("token")}>Logout</a>
              </div>
            )}
          </div>
        </div>

        <h1>Dashboard</h1>
        <div className="info-boxes">
          <div className="info-box blue">Hi, <span>{user.username}</span></div>
          <div className="info-box green">Balance: ₹{user.balance.toFixed(2)}</div>
          {user.role === "primary" && (
            <div className="info-box mustard" id="topUpBox" onClick={handleTopUp}>
              Increase Balance
            </div>
          )}
        </div>

        <div className="chart-row">
          <div className="chart-container"><canvas id="expenseChart"></canvas></div>
          <div className="chart-container"><canvas id="daysRingChart"></canvas></div>
        </div>
      </main>
    </div>
  );
}
