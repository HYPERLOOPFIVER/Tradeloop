import React, { useState } from "react";
import { signUpUser } from "./AuthMethods"; // Import the sign-up method
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate(); // Hook for navigating after sign-up

  const handleSignUp = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    try {
      // Call signUpUser to handle Firebase registration and profile creation
      await signUpUser(email, password, name);
      alert("Sign-Up successful!");
      navigate("/login"); // Navigate to login page after successful sign-up
    } catch (error) {
      alert(error.message); // Handle any errors that occur during sign-up
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#f9f9f9",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <form
        onSubmit={handleSignUp}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          padding: "30px",
          width: "100%",
          maxWidth: "400px",
          background: "#ffffff",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          borderRadius: "10px",
          textAlign: "center",
        }}
      >
        <h2 style={{ margin: "0 0 20px 0", color: "#333" }}>Sign Up</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)} // Capture name input
          style={{
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "5px",
            outline: "none",
            fontSize: "16px",
          }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Capture email input
          style={{
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "5px",
            outline: "none",
            fontSize: "16px",
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Capture password input
          style={{
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "5px",
            outline: "none",
            fontSize: "16px",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px",
            background: "#4caf50",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px",
            cursor: "pointer",
            transition: "background 0.3s ease",
          }}
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignUp;
