
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AddMember from './pages/AddMember';
import LogExpense from './pages/LogExpense';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LoggedExpenses from "./pages/LoggedExpenses";

function App() {
  return (
    
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes with sidebar layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-member" element={<AddMember />} />
          <Route path="/log-expense" element={<LogExpense />} />
          <Route path="/logged-expenses" element={<LoggedExpenses/>} />
        </Route>
      </Routes>
    
  );
}

export default App;

