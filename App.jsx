import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./Pages/Auth/Signup";
import Login from "./Pages/Auth/Login";
import Dashboard from "./Pages/Auth/Dashboard/Dashboard";
import ProtectedRoute from "./Pages/Auth/ProtectedRoute/Protectedroute";
import Buy from "./Pages/Auth/Dashboard/Buystock";
import Stocks from "./Pages/Auth/Dashboard/Stocks";
import HomePage from "./Pages/Auth/Dashboard/Home";
import Settings from "./Pages/Auth/Dashboard/Settings";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Login />} />
        <Route path="/bsp" element={<Buy/>} />
        <Route path="/stocks" element={<Stocks/>} />
        <Route path="/home" element={<HomePage/>} />
        <Route path="/settings" element={<Settings/>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
