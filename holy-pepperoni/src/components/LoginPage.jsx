import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import logo from './logo.png'; // Adjust the path as necessary

const styles = {
  page: {
    minHeight: "100vh",
    background: "#fefaf0", // cream color
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: "0",
  },
  header: {
    width: "100vw",
    background: "#faa28a", // pink
    color: "#000000ff",
    padding: "24px 0",
    borderTopLeftRadius: "0px",
    borderTopRightRadius: "0px",
    borderBottomLeftRadius: "0px",
    borderBottomRightRadius: "0px",
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: "32px",
    marginTop: "30px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    textAlign: "center",
    position: "relative",
    left: "50%",
    transform: "translateX(-50%)",
    maxWidth: "100vw",
  },
  card: {
    background: "#fff",
    padding: "32px 24px", // Reduced padding for less height
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: "0",
    width: "100%",
    maxWidth: "400px",
    boxSizing: "border-box",
  },
  label: {
    fontWeight: "bold",
    marginBottom: "8px",
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "18px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    boxSizing: "border-box",
  },
  button: {
    background: "#faa28a",
    color: "#000000ff",
    border: "none",
    borderRadius: "50px",
    padding: "12px 0",
    width: "100%",
    fontSize: "1.1rem",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "8px",
  },
  logo: {
    width: "120px",
    height: "120px",
    margin: "18px 0",
    background: "#fff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    color: "#ff69b4",
  },
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem("authToken", token);
      window.alert("Login successful");
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
      window.alert("Invalid email or password");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header} className="login-header">
        Holy Pepperoni
      </div>
      <div style={styles.card} className="login-card">
        <h2 style={{ marginBottom: "12px" }}>Log In</h2>
        <div style={styles.logo}>
          <img
            src={logo}
            alt="Logo"
            style={{ width: "100px", height: "100px", borderRadius: "50%" }}
          />
        </div>
        <form style={{ width: "100%" }} onSubmit={handleLogin}>
          <div>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button style={styles.button} type="submit">
            Log In
          </button>
        </form>
      </div>
      <style>
        {`
          @media (max-width: 600px) {
            .login-header {
              font-size: 1.5rem !important;
              padding: 16px 0 !important;
            }
            .login-card {
              max-width: 95vw !important;
              padding: 8vw 2vw !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default LoginPage;