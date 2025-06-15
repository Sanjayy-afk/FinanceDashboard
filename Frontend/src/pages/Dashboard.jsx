// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Chart from 'chart.js/auto';
// import 'chartjs-gauge';
// import MessageDropdown from "../components/MessageDropdown";

// export default function Dashboard() {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [userMenuOpen, setUserMenuOpen] = useState(false);
//   const [expenseStats, setExpenseStats] = useState(null);

//   const role = user?.role;

//   useEffect(() => {
//     const fetchUser = async () => {
//       const token = localStorage.getItem("token");
//       if (!token) return navigate("/");

//       try {
//         const res = await fetch("/api/currentUser", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (!res.ok) throw new Error("Unauthorized");
//         const data = await res.json();
//         setUser(data);

//         // Also fetch stats after getting user
//         const statRes = await fetch("/api/expense-stats", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const statData = await statRes.json();
//         setExpenseStats(statData);
//       } catch {
//         navigate("/");
//       }
//     };

//     fetchUser();
//   }, []);

//   useEffect(() => {
//     if (!expenseStats || !user) return;

//     const allUsersCanvas = document.getElementById("allUsersChart");
//     const primaryCanvas = document.getElementById("primaryChart");
//     const spentCanvas = document.getElementById("spentAddedChart");

//     // Prevent canvas null errors
//     if ((role === "primary" && (!allUsersCanvas || !primaryCanvas)) || !spentCanvas) return;

//     // Clean up old charts
//     Chart.getChart("allUsersChart")?.destroy();
//     Chart.getChart("primaryChart")?.destroy();
//     Chart.getChart("spentAddedChart")?.destroy();

//     if (role === "primary" && allUsersCanvas) {
//       new Chart(allUsersCanvas, {
//         type: "doughnut",
//         data: {
//           labels: Object.keys(expenseStats.allUsersCategory || {}),
//           datasets: [{
//             data: Object.values(expenseStats.allUsersCategory || {}),
//             backgroundColor: ["#f87171", "#60a5fa", "#facc15", "#34d399", "#a78bfa"]
//           }]
//         },
//         options: { responsive: true }
//       });
//     }

//     if (primaryCanvas) {
//       new Chart(primaryCanvas, {
//         type: "doughnut",
//         data: {
//           labels: Object.keys(expenseStats.primaryCategory || {}),
//           datasets: [{
//             data: Object.values(expenseStats.primaryCategory || {}),
//             backgroundColor: ["#f87171", "#60a5fa", "#facc15", "#34d399", "#a78bfa"]
//           }]
//         },
//         options: { responsive: true }
//       });
//     }

//     new Chart(spentCanvas, {
//       type: "bar",
//       data: {
//         labels: ["Added", "Spent"],
//         datasets: [{
//           label: "₹ Amount",
//           data: [expenseStats.added, expenseStats.spent],
//           backgroundColor: ["#4ade80", "#f87171"]
//         }]
//       },
//       options: { responsive: true, scales: { y: { beginAtZero: true } } }
//     });
//   }, [expenseStats, user]);

//   const handleTopUp = async () => {
//     const confirmTopUp = window.confirm("Top up balance to ₹10,000?");
//     if (!confirmTopUp) return;
//     const res = await fetch("/api/topup", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${localStorage.getItem("token")}`,
//       },
//     });
//     const data = await res.json();
//     if (res.ok) {
//       setUser((prev) => ({ ...prev, balance: data.balance }));
//     }
//   };

//   if (!user) return <p className="text-center mt-10 text-gray-600">Loading...</p>;

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <span className="text-lg font-semibold text-gray-700">Welcome, {user.username}</span>
//         <div className="flex items-center gap-4">
//           <button
//             onClick={() => navigate('/log-expense')}
//             className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//           >
//             +
//           </button>
//           <MessageDropdown />
//           <div className="relative">
//             <button
//               onClick={() => setUserMenuOpen(!userMenuOpen)}
//               className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
//             >
//               User Menu
//             </button>
//             {userMenuOpen && (
//               <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg border rounded">
//                 <button
//                   onClick={() => {
//                     localStorage.removeItem("token");
//                     navigate("/");
//                   }}
//                   className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
//                 >
//                   Logout
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Info Boxes */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//         <div className="bg-blue-100 text-blue-700 p-4 rounded-lg shadow">
//           <p className="font-semibold">Hi, <span className="font-bold">{user.username}</span></p>
//         </div>
//         <div className="bg-green-100 text-green-700 p-4 rounded-lg shadow">
//           <p className="font-semibold">Balance: ₹{user.balance.toFixed(2)}</p>
//         </div>
//         {role === "primary" && (
//           <button
//             onClick={handleTopUp}
//             className="bg-yellow-100 text-yellow-800 p-4 rounded-lg shadow hover:bg-yellow-200"
//           >
//             Increase Balance
//           </button>
//         )}
//       </div>

//       {/* Charts */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
//         {/* Expense Breakdown */}
//         <div className="bg-white p-4 rounded shadow">
//           <h3 className="font-semibold mb-2">Expense Breakdown</h3>
//           {expenseStats && (
//             <>
//               {role === "primary" && (
//                 <>
//                   <canvas id="allUsersChart" className="mb-6"></canvas>
//                   <canvas id="primaryChart"></canvas>
//                 </>
//               )}
//               {role !== "primary" && (
//                 <canvas id="primaryChart"></canvas>
//               )}
//             </>
//           )}
//         </div>

//         {/* Spent vs Added */}
//         <div className="bg-white p-4 rounded shadow">
//           <h3 className="font-semibold mb-2">Spent vs Added</h3>
//           <canvas id="spentAddedChart"></canvas>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from 'chart.js';
import 'chartjs-gauge';
import MessageDropdown from "../components/MessageDropdown";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [expenseStats, setExpenseStats] = useState(null);

  const role = user?.role;

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

        const statRes = await fetch("/api/expense-stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const statData = await statRes.json();
        setExpenseStats(statData);
      } catch {
        navigate("/");
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!expenseStats || !user) return;

    const allUsersCanvas = document.getElementById("allUsersChart");
    const primaryCanvas = document.getElementById("primaryChart");
    const spentCanvas = document.getElementById("spentAddedChart");

    if (role === "primary" && allUsersCanvas) {
  const chart = new Chart(allUsersCanvas, {
    type: "doughnut",
    data: {
      labels: Object.keys(expenseStats.allUsersCategory || {}),
      datasets: [{
        data: Object.values(expenseStats.allUsersCategory || {}),
        backgroundColor: ["#f87171", "#60a5fa", "#facc15", "#34d399", "#a78bfa"],
        borderWidth: 1
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      cutoutPercentage: 80,
      legend: {
      position: 'right',  // Moves legend to the right
      labels: {
        boxWidth: 12,
        padding: 15,
        color: '#333',
        font: { size: 15 }
      }
    }
    }
  });
  allUsersCanvas._chart = chart;
}

if (primaryCanvas) {
  const chart = new Chart(primaryCanvas, {
    type: "doughnut",
    data: {
      labels: Object.keys(expenseStats.primaryCategory || {}),
      datasets: [{
        data: Object.values(expenseStats.primaryCategory || {}),
        backgroundColor: ["#f87171", "#60a5fa", "#facc15", "#34d399", "#a78bfa"],
        borderWidth: 1
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      cutoutPercentage: 80,
      legend: {
      position: 'right',  // Moves legend to the right
      labels: {
        boxWidth: 12,
        padding: 15,
        color: '#333',
        font: { size: 15 }
      }
    }
    }
  });
  primaryCanvas._chart = chart;
}

const gaugeValue = expenseStats.added > 0 ? expenseStats.spent : 0;
const addedValue = expenseStats.added;
const chart = new Chart(spentCanvas, {
  type: 'gauge',
  data: {
    datasets: [{
      value: gaugeValue,
      minValue: 0,
      data: [addedValue],
      backgroundColor: ['#4ade80'],
      borderWidth: 0.5,
    }]
  },
  options: {
    responsive: false,
    maintainAspectRatio: false,
    cutoutPercentage: 80,
    needle: {
      radiusPercentage: 2,
      widthPercentage: 2,
      lengthPercentage: 80,
      color: 'black'
    },
    valueLabel: {
      display: false
    },
    animation: {
      animateRotate: true,
      animateScale: false
    }
  },
  plugins: [{
    afterDraw: function (chart) {
      const ctx = chart.chart.ctx;
      const centerX = chart.chart.width / 2;
      const centerY = chart.chart.height / 2 + 160; // ⬇️ Push down vertically

      ctx.save();
      ctx.font = "550 15px sans-serif ";
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`₹${gaugeValue} / ₹${addedValue}`, centerX, centerY);
      ctx.restore();
    }
  }]
});

spentCanvas._chart = chart;

  }, [expenseStats, user]);

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
      setUser((prev) => ({ ...prev, balance: data.balance }));
    }
  };

  if (!user) return <p className="text-center mt-10 text-gray-600">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <span className="text-lg font-semibold text-gray-700">Welcome, {user.username}</span>
        <div className="flex items-center gap-4">
          <button
          title="Add Expense"
            onClick={() => navigate('/log-expense')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >+</button>
          <MessageDropdown />
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
            >User Menu</button>
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg border rounded">
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    navigate("/");
                  }}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                >Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-100 text-blue-700 p-4 rounded-lg shadow">
          <p className="font-semibold">Hi, <span className="font-bold">{user.username}</span></p>
        </div>
        <div className="bg-green-100 text-green-700 p-4 rounded-lg shadow">
          <p className="font-semibold">Balance: ₹{user.balance.toFixed(2)}</p>
        </div>
        {role === "primary" && (
          <button
            onClick={handleTopUp}
            className="bg-yellow-100 text-yellow-800 p-4 rounded-lg shadow hover:bg-yellow-200"
          >Increase Balance</button>
        )}
      </div>

      {/* Charts Section */}
{expenseStats && (
  <div className="flex flex-col md:flex-row gap-6 mt-8">
    {role === "primary" && (
      <div className="bg-white p-4 rounded shadow flex-1">
        <h3 className="font-semibold text-center mb-2 text-sm">Family Expenditure</h3>
        <canvas id="allUsersChart" width="400" height="400"></canvas>
      </div>
    )}

    <div className="bg-white p-4 rounded shadow flex-1">
      <h3 className="font-semibold text-center mb-2 text-sm">{role === "primary" ? "Your Expense Breakdown" : "Expense Breakdown"}</h3>
      <canvas id="primaryChart" width="400" height="400"></canvas>
    </div>

    <div className="bg-white p-4 rounded shadow flex-1">
      <h3 className="font-semibold text-center mb-2 text-sm">Amount Spent</h3>
      <canvas id="spentAddedChart" width="500" height="400"></canvas>
    </div>
  </div>
)}

    </div>
  );
}





