// src/layout/Layout.jsx
import { Outlet } from "react-router-dom";
import { useState } from "react";

export default function Layout() {
  const [financeOpen, setFinanceOpen] = useState(false);
  const [functionsOpen, setFunctionsOpen] = useState(false);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
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
      </aside>

      {/* Main content */}
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
