import { useState } from "react";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Invalid email or password");
        setLoading(false);
        return;
      }

      // Save login information
      localStorage.setItem(
        "paychase_token",
        data.access_token
      );

      localStorage.setItem(
        "paychase_user",
        JSON.stringify(data)
      );

      // Send user data to App.jsx
      onLogin(data);

    } catch (error) {
      console.error(error);
      setError("Unable to connect to PayChase server.");
    }

    setLoading(false);
  };

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f7fa",
      }}
    >
      <div
        style={{
          width: "350px",
          padding: "30px",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        }}
      >
        <h1>PayChase</h1>

        <h2>Login</h2>

        <form onSubmit={handleLogin}>

          <div style={{ marginBottom: "15px" }}>
            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter email"
              required
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter password"
              required
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <p style={{ color: "red" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              cursor: "pointer",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <hr />

        <p>
          <strong>Demo Accounts</strong>
        </p>

        {/* Admin */}
        <button
          type="button"
          onClick={() =>
            fillDemoAccount(
              "admin@paychase.com",
              "Admin@123"
            )
          }
          style={{
            width: "100%",
            padding: "9px",
            marginBottom: "8px",
            cursor: "pointer",
          }}
        >
          👨‍💼 Admin
        </button>

        {/* Client 1 */}
        <button
          type="button"
          onClick={() =>
            fillDemoAccount(
              "client1@paychase.com",
              "Client1@123"
            )
          }
          style={{
            width: "100%",
            padding: "9px",
            marginBottom: "8px",
            cursor: "pointer",
          }}
        >
          👤 Client 1
        </button>

        {/* Client 2 */}
        <button
          type="button"
          onClick={() =>
            fillDemoAccount(
              "client2@paychase.com",
              "Client2@123"
            )
          }
          style={{
            width: "100%",
            padding: "9px",
            marginBottom: "8px",
            cursor: "pointer",
          }}
        >
          👤 Client 2
        </button>

        {/* Client 3 */}
        <button
          type="button"
          onClick={() =>
            fillDemoAccount(
              "client3@paychase.com",
              "Client3@123"
            )
          }
          style={{
            width: "100%",
            padding: "9px",
            marginBottom: "8px",
            cursor: "pointer",
          }}
        >
          👤 Client 3
        </button>

        {/* Client 4 */}
        <button
          type="button"
          onClick={() =>
            fillDemoAccount(
              "client4@paychase.com",
              "Client4@123"
            )
          }
          style={{
            width: "100%",
            padding: "9px",
            cursor: "pointer",
          }}
        >
          👤 Client 4
        </button>

      </div>
    </div>
  );
}

export default Login;