import { useEffect, useState } from "react";

export default function LoggedExpenses() {
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filterDraft, setFilterDraft] = useState({ username: '', category: '', date: '' });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [page, username, category, date]);

  const fetchUsers = async () => {
    const res = await fetch("/api/all-users", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    setUsers(data.users || []);
  };

  const fetchTransactions = async () => {
    const params = new URLSearchParams({
      page,
      limit: 10,
      ...(username && { username }),
      ...(category && { category }),
      ...(date && { date }),
    });

    const res = await fetch(`/api/transactions?${params.toString()}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    setTransactions(data.transactions);
    setTotalPages(data.totalPages);
  };

  const applyFilters = () => {
    setUsername(filterDraft.username);
    setCategory(filterDraft.category);
    setDate(filterDraft.date);
    setPage(1);
  };

  const clearFilters = () => {
    setFilterDraft({ username: '', category: '', date: '' });
    setUsername('');
    setCategory('');
    setDate('');
    setPage(1);
  };

  return (
    <div className="w-full px-8 py-6 min-h-[80vh] mb-16">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Logged Expenses</h2>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Filter
        </button>
      </div>

      {filtersOpen && (
        <div className="bg-gray-100 rounded-md p-6 mb-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <select
              value={filterDraft.username}
              onChange={(e) => setFilterDraft({ ...filterDraft, username: e.target.value })}
              className="w-full p-2 text-sm rounded"
            >
              <option value="">All Users</option>
              {users.map((u) => (
                <option key={u._id} value={u.username}>
                  {u.username}
                </option>
              ))}
            </select>
            <select
              value={filterDraft.category}
              onChange={(e) => setFilterDraft({ ...filterDraft, category: e.target.value })}
              className="w-full p-2 text-sm rounded"
            >
              <option value="">All Categories</option>
              {[...new Set(transactions.map((t) => t.category))].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={filterDraft.date}
              onChange={(e) => setFilterDraft({ ...filterDraft, date: e.target.value })}
              className="w-full p-2 text-sm rounded"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              onClick={clearFilters}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Clear
            </button>
            <button
              onClick={applyFilters}
              className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-950"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-6 text-sm font-semibold text-gray-700 border-b border-gray-300 pb-2 mb-2">
        <div>Username</div>
        <div>Description</div>
        <div>Amount</div>
        <div>Category</div>
        <div>Date</div>
        <div>Notes</div>
      </div>

      <div className="space-y-3">
        {transactions.map((t, i) => (
          <div key={i} className="grid grid-cols-6 bg-white shadow-sm px-4 py-2 items-center text-sm rounded">
            <div>{t.userId.username}</div>
            <div>{t.description}</div>
            <div className="text-green-700 font-semibold">₹{t.amount}</div>
            <div>{t.category}</div>
            <div>{t.date?.slice(0, 10)}</div>
            <button
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
              onClick={() => alert(t.note || "No notes")}
            >
              Notes
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`mx-1 px-3 py-1 rounded ${
              page === i + 1 ? "bg-blue-700 text-white" : "bg-gray-300"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}







// import { useEffect, useState } from 'react';

// export default function LoggedExpenses() {
//   const [transactions, setTransactions] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [filters, setFilters] = useState({ username: '', category: '', date: '' });
//   const [showNote, setShowNote] = useState(null);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   useEffect(() => {
//     fetchMembers();
//     fetchTransactions();
//   }, [filters, page]);

//   const fetchMembers = async () => {
//     const res = await fetch('/api/all-users', {
//   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
// });
// const data = await res.json();
// setUsers(data.users);
//   };

//   const fetchTransactions = async () => {
//     const params = new URLSearchParams({ ...filters, page });
//     const res = await fetch(`/api/transactions?${params}`, {
//       headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//     });
//     const data = await res.json();
//     setTransactions(data.transactions);
//     setTotalPages(data.totalPages);
//   };

//   const handleFilterChange = (e) => {
//     setFilters({ ...filters, [e.target.name]: e.target.value });
//     setPage(1);
//   };

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-xl font-bold">Logged Expenses</h1>
//         <div className="flex gap-2">
//           <select name="username" className="border px-2 py-1" onChange={handleFilterChange}>
//             <option value="">All Users</option>
//             {users.map(u => <option key={u.username} value={u.username}>{u.username}</option>)}
//           </select>
//           <select name="category" className="border px-2 py-1" onChange={handleFilterChange}>
//             <option value="">All Categories</option>
//             <option value="Food">Food</option>
//             <option value="Transport">Transport</option>
//             <option value="Bills">Bills</option>
//             <option value="Other">Other</option>
//           </select>
//           <input type="date" name="date" className="border px-2 py-1" onChange={handleFilterChange} />
//         </div>
//       </div>

//       <table className="min-w-full border text-sm">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="border p-2">Username</th>
//             <th className="border p-2">Description</th>
//             <th className="border p-2">Amount</th>
//             <th className="border p-2">Category</th>
//             <th className="border p-2">Date</th>
//             <th className="border p-2">Notes</th>
//           </tr>
//         </thead>
//         <tbody>
//           {transactions.map((t, i) => (
//             <tr key={i} className="text-center">
//               <td className="border p-2">{t.userId.username}</td>
//               <td className="border p-2">{t.description}</td>
//               <td className="border p-2">₹{t.amount}</td>
//               <td className="border p-2">{t.category}</td>
//               <td className="border p-2">{new Date(t.date).toLocaleDateString()}</td>
//               <td className="border p-2">
//                 {t.note ? (
//                   <button
//                     className="bg-blue-500 text-white px-2 py-1 rounded"
//                     onClick={() => setShowNote(t.note)}
//                   >
//                     View
//                   </button>
//                 ) : '—'}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Pagination */}
//       <div className="mt-4 flex justify-between">
//         <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 bg-gray-200 rounded">Prev</button>
//         <span>Page {page} of {totalPages}</span>
//         <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 bg-gray-200 rounded">Next</button>
//       </div>

//       {/* Note Modal */}
//       {showNote && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded max-w-sm w-full">
//             <h2 className="font-bold text-lg mb-2">Note</h2>
//             <p>{showNote}</p>
//             <button onClick={() => setShowNote(null)} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">Close</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
