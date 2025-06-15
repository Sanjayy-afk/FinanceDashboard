import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } else {
      alert(data.error || "Login failed");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-2/3 bg-yellow-400 flex justify-center items-center text-4xl font-bold text-black text-center p-6">
        Welcome to Finance Dashboard
      </div>
      <div className="w-1/3 flex justify-center items-center bg-white">
        <form
          className="w-4/5 max-w-sm flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <h2 className="text-xl font-semibold text-gray-800">Login</h2>
          <input
            type="text"
            placeholder="Username"
            className="p-3 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="p-3 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="p-3 bg-yellow-400 hover:bg-yellow-300 rounded font-bold"
          >
            Login
          </button>
          <p className="text-sm mt-4 text-center"> Don’t have an account? <a href="/signup" className="text-blue-600 hover:underline">Create New Account</a>
        </p>
        </form>
        
      </div>
      
    </div>
  );
}
