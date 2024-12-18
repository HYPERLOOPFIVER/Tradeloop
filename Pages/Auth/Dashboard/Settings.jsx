// Settings.js

import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../../Firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';
import styles from './Settings.module.css'; // Make sure you style your settings page
import BottomNavbar from './BottomNavbar';

const Settings = () => {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
          setBalance(userSnap.data().balance);
        }
      };
      fetchUserData();
    }
  }, [user]);

  // Function to handle password change
  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    try {
      await updatePassword(user, newPassword);
      alert('Password updated successfully');
      setNewPassword('');
    } catch (error) {
      setPasswordError('Error updating password: ' + error.message);
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <h1>Settings</h1>
      
      {/* Display User Balance */}
      <div className={styles.balanceSection}>
        <h2>Your Balance</h2>
        <p>${balance}</p>
      </div>

      {/* Change Password Section */}
      <div className={styles.passwordSection}>
        <h2>Change Password</h2>
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button onClick={handlePasswordChange}>Change Password</button>
        {passwordError && <p className={styles.error}>{passwordError}</p>}
      </div>
      <BottomNavbar/>
    </div>
  );
};

export default Settings;
