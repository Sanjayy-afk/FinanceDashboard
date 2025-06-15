import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaHome } from "react-icons/fa";

export default function TopBar() {
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("/api/currentUser", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        setUser(data);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // ❌ Hide only on /dashboard
  if (location.pathname === "/dashboard") return null;

  return (
    <div className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center shadow">
      <div className="flex items-center gap-4">
        {user && <span className="text-white font-medium"> User - {user.username}</span>}
        
      </div>

      <div className="relative flex center gap-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-white hover:text-blue-300"
          title="Go to Dashboard"
        >
          <FaHome size={20} />
        </button>
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
        >
          User Menu
        </button>
        {userMenuOpen && (
          <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg border rounded z-10">
            <button
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/");
              }}
              className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
