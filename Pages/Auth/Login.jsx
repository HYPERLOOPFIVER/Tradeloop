import React, { useState } from "react";
import { signInUser } from "./AuthMethods";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInUser(email, password);
      
      navigate("/home");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form className={styles.container} onSubmit={handleLogin}>
      <h2 className={styles.trl}>TRADELOOP</h2>
      <h2>Login</h2>
      <input
        className={styles.input}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className={styles.input}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className={styles.button} type="submit">
        Login
      </button>
      <div className={styles.switch}>
        Don't have an account?{" "}
        <button onClick={() => navigate("/signup")}>Sign Up</button>
      </div>
    </form>
  );
};

export default Login;
