// AuthMethods.js

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../Firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Function to sign up a new user
export const signUpUser = async (email, password, name) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Create user profile in "users" collection
  await createUserProfile(user.uid, email, name);

  // Create an empty portfolio for new user
  await createPortfolio(user.uid);

  return user;
};

// Function to log in an existing user
export const signInUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Ensure portfolio exists for logged-in user
  await createPortfolio(user.uid);

  return user;
};

// Create user profile in "users" collection
const createUserProfile = async (userUid, email, name) => {
  const userRef = doc(db, "users", userUid);
  await setDoc(userRef, {
    email: email,
    name: name,
    balance: 10000, // Initial balance
    portfolioValue: 0, // Initial portfolio value
    role: "user", // Default role
    timestamp: new Date(),
  });
};

// Create portfolio for new or existing user
const createPortfolio = async (userUid) => {
  const portfolioRef = doc(db, "portfolio", userUid);
  const portfolioSnap = await getDoc(portfolioRef);

  if (!portfolioSnap.exists()) {
    // If portfolio doesn't exist, create an empty one
    await setDoc(portfolioRef, {
      stocks: [],
      totalValue: 0,
    });
  }
};
