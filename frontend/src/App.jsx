import { useState } from "react";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("paychase_user");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("paychase_token");
    localStorage.removeItem("paychase_user");

    setUser(null);
  };

  // Not logged in
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Admin
  if (user.role === "ADMIN") {
    return (
      <div>
        <AdminDashboard />

        <button
          onClick={handleLogout}
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            padding: "10px 18px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  // Client
  if (user.role === "CLIENT") {
    return (
      <div>
        <ClientDashboard />

        <button
          onClick={handleLogout}
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            padding: "10px 18px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  return <h2>Invalid user role</h2>;
}

export default App;