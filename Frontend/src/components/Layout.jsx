import { Outlet } from "react-router-dom";
import { useState } from "react";
import TopBar from "./TopBar";

export default function Layout() {
  const [financeOpen, setFinanceOpen] = useState(false);
  const [functionsOpen, setFunctionsOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-yellow-300 p-4 flex-shrink-0 shadow-md">
        <h2 className="text-xl font-bold text-center mb-4">Menu</h2>

        <div className="space-y-4">
          {/* Finance Group */}
          <div>
            <button
              onClick={() => setFinanceOpen(!financeOpen)}
              className="w-full text-left font-semibold py-2 px-3 hover:bg-yellow-200 rounded transition"
            >
              Finance
            </button>
            {financeOpen && (
              <div className="ml-2 mt-2 space-y-1">
                <a
                  href="/dashboard"
                  className="block px-4 py-1 rounded hover:bg-yellow-100"
                >
                  Dashboard
                </a>
                <a
                  href="/log-expense"
                  className="block px-4 py-1 rounded hover:bg-yellow-100"
                >
                  Log expense
                </a>
                <a
                  href="/logged-expenses"
                  className="block px-4 py-1 rounded hover:bg-yellow-100"
                >
                  Logged expenses
                </a>
              </div>
            )}
          </div>

          {/* Functions Group */}
          <div>
            <button
              onClick={() => setFunctionsOpen(!functionsOpen)}
              className="w-full text-left font-semibold py-2 px-3 hover:bg-yellow-200 rounded transition"
            >
              Functions
            </button>
            {functionsOpen && (
              <div className="ml-2 mt-2 space-y-1">
                <a
                  href="/add-member"
                  className="block px-4 py-1 rounded hover:bg-yellow-100"
                >
                  Add members
                </a>
                <a
                  href="#"
                  className="block px-4 py-1 rounded hover:bg-yellow-100"
                >
                  Import expenses
                </a>
              </div>
            )}
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <TopBar />


      {/* Main Content */}
      <main className="flex-1 bg-white p-6 overflow-y-auto">
        <Outlet />
      </main>
      </div>
    </div>
  );
}
