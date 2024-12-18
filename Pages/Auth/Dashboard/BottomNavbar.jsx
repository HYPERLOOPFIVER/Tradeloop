import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth'; // To check the user's state
import { auth } from '../../../Firebase';  // Import your Firebase auth
import styles from './Dashboard.module.css';
import { MdHomeFilled } from "react-icons/md";
import { FaWallet } from "react-icons/fa6";
import { GoGraph } from "react-icons/go";
import { IoSettings } from "react-icons/io5";

const BottomNavbar = () => {
  const [user, loading] = useAuthState(auth);  // Get current authenticated user
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && !loading) {
      navigate('/login'); // Redirect to login page if user is not logged in
    }
  }, [user, loading, navigate]);

  if (loading) {
    return null; // Avoid rendering navbar while loading user state
  }

  return (
    <div className={styles.bottomNavbar}>
      <ul>
        <li>
          <Link to="/home" className={styles.active}>
            <MdHomeFilled />
          </Link>
        </li>
        <li>
          <Link to="/dashboard">
            <FaWallet />
          </Link>
        </li>
        <li>
          <Link to="/stocks">
            <GoGraph />
          </Link>
        </li>
        <li>
          <Link to="/settings">
            <IoSettings />
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default BottomNavbar;
