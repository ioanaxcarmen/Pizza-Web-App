import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import logo from './logo.png'; 
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// Inline styles for the login page and its elements
const styles = {
    page: {
        minHeight: "100vh",
        background: "#fefaf0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center", 
        paddingTop: "0",
    },
    header: {
        width: "100%",
        background: "#faa28a",
        color: "#000000ff",
        padding: "24px 0",
        fontSize: "2.5rem",
        fontWeight: "bold",
        textAlign: "center",
        position: 'absolute',
        top: 0,
    },
    card: {
        background: "#fff",
        padding: "32px 24px",
        borderRadius: "12px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
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
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
};

const LoginPage = () => {
    // State for email and password input fields
    const [email, setEmail] = useState("admin@pizza.com");
    const [password, setPassword] = useState("pizza1"); 
    // State for error messages
    const [error, setError] = useState("");
    // State for login process: 'idle', 'loading', or 'success'
    const [loginState, setLoginState] = useState('idle');
    const navigate = useNavigate();

    // Redirect to dashboard after successful login, with a short delay for animation
    useEffect(() => {
        if (loginState === 'success') {
            const timer = setTimeout(() => {
                navigate("/dashboard");
            }, 1500); // 1.5 second delay for success animation
            return () => clearTimeout(timer);
        }
    }, [loginState, navigate]);

    // Handles the login form submission
    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoginState('loading');

        try {
            // Attempt to sign in with Firebase authentication
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // Get the user's authentication token
            const token = await userCredential.user.getIdToken();
            // Store the token in localStorage for session management
            localStorage.setItem("authToken", token);
            setLoginState('success');
        } catch (err) {
            // Show error message if login fails
            setError("Invalid email or password");
            setLoginState('idle');
        }
    };

    return (
        <div style={styles.page}>
            {/* Show success animation if login was successful */}
            {loginState === 'success' ? (
                <div className="lottie-container">
                    <DotLottieReact
                        src="https://lottie.host/9a555a02-d84a-48a8-abac-6ebf2fcbdfd7/TkrPy7rkZY.lottie"
                        loop
                        autoplay
                    />
                </div>
            ) : (
                <>
                    {/* App header */}
                    <div style={styles.header}>Holy Pepperoni</div>
                    {/* Login card */}
                    <div style={styles.card}>
                        <h2 style={{ marginBottom: "12px" }}>Log In</h2>
                        {/* Logo image */}
                        <div style={styles.logo}>
                            <img src={logo} alt="Logo" style={{ width: "100px", height: "100px", borderRadius: "50%" }} />
                        </div>
                        {/* Login form */}
                        <form style={{ width: "100%" }} onSubmit={handleLogin}>
                            <div>
                                <label style={styles.label}>Email</label>
                                <input
                                    style={styles.input} type="email" value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required autoComplete="username"
                                />
                            </div>
                            <div>
                                <label style={styles.label}>Password</label>
                                <input
                                    style={styles.input} type="password" value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required autoComplete="current-password"
                                />
                            </div>
                            {/* Show error message if login fails */}
                            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                            {/* Login button, shows loading state if logging in */}
                            <button style={styles.button} type="submit" disabled={loginState === 'loading'}>
                                {loginState === 'loading' ? 'Logging In...' : 'Log In'}
                            </button>
                        </form>
                    </div>
                </>
            )}

            {/* Style for the Lottie animation container */}
            <style>
                {`
                .lottie-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100vw;
                    height: 100vh;
                }
                `}
            </style>
        </div>
    );
};

export default LoginPage;