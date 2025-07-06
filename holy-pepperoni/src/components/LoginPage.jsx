import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import logo from './logo.png'; // Adjust the path as necessary
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

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
    const [email, setEmail] = useState("admin@pizza.com");
    const [password, setPassword] = useState("pizza1"); 
    const [error, setError] = useState("");
    const [loginState, setLoginState] = useState('idle'); // 'idle', 'loading', 'success'
    const navigate = useNavigate();

    useEffect(() => {
        if (loginState === 'success') {
            const timer = setTimeout(() => {
                navigate("/dashboard");
            }, 1500); 
            return () => clearTimeout(timer);
        }
    }, [loginState, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoginState('loading');

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();
            localStorage.setItem("authToken", token);
            setLoginState('success');
        } catch (err) {
            setError("Invalid email or password");
            setLoginState('idle');
        }
    };

    return (
        <div style={styles.page}>
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
                    <div style={styles.header}>Holy Pepperoni</div>
                    <div style={styles.card}>
                        <h2 style={{ marginBottom: "12px" }}>Log In</h2>
                        <div style={styles.logo}>
                            <img src={logo} alt="Logo" style={{ width: "100px", height: "100px", borderRadius: "50%" }} />
                        </div>
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
                            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                            <button style={styles.button} type="submit" disabled={loginState === 'loading'}>
                                {loginState === 'loading' ? 'Logging In...' : 'Log In'}
                            </button>
                        </form>
                    </div>
                </>
            )}

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