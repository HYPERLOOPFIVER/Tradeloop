import React, { useEffect, useState } from "react";
import { db } from "../../../Firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../../Firebase";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios for API requests
import styles from './Dashboard.module.css';
import { Link } from "react-router-dom";
import BottomNavbar from "./BottomNavbar";

const Buy = () => {
  const [user] = useAuthState(auth);
  const [portfolio, setPortfolio] = useState(null);
  const [userData, setUserData] = useState(null);
  const [stockPrices, setStockPrices] = useState({});
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [amountToSell, setAmountToSell] = useState(0); // New state to store the amount in dollars for selling
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }

    // Fetch user portfolio
    const fetchPortfolio = async () => {
      if (user) {
        const portfolioRef = doc(db, "portfolio", user.uid);
        const portfolioSnap = await getDoc(portfolioRef);
        if (portfolioSnap.exists()) {
          setPortfolio(portfolioSnap.data());
        } else {
          console.log("Portfolio not found");
        }
      }
    };

    // Fetch user data
    const fetchUserData = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          console.log("User data not found");
        }
      }
    };

    fetchPortfolio();
    fetchUserData();
  }, [user, navigate]);

  // Fetch stock price using Finnhub API
  const fetchStockPrice = async (symbol) => {
    if (!symbol) return;
    const apiKey = "ctg0chhr01qi0nfef030ctg0chhr01qi0nfef03g";  // Use your Finnhub API key here

    try {
      const response = await axios.get(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
      );
      const { c, h, l, o, pc } = response.data; // c: current price, h: high, l: low, o: open, pc: previous close
      setStockPrices((prevState) => ({
        ...prevState,
        [symbol]: c, // Set the current price
      }));
    } catch (error) {
      console.error("Error fetching stock price:", error);
    }
  };

  // Trigger fetching stock prices when portfolio or symbol changes
  useEffect(() => {
    if (portfolio) {
      portfolio.stocks.forEach((stock) => {
        fetchStockPrice(stock.symbol);
      });
    }
  }, [portfolio]);

  // Handle buying stock
  const handleBuyStock = async () => {
    if (portfolio && symbol && stockPrices[symbol] > 0 && quantity > 0 && userData) {
      const totalCost = stockPrices[symbol] * quantity;
      if (userData.balance < totalCost) {
        alert("Insufficient funds to purchase stock.");
        return;
      }

      const portfolioRef = doc(db, "portfolio", user.uid);
      const userRef = doc(db, "users", user.uid);
      const updatedStocks = [...portfolio.stocks];
      const stockIndex = updatedStocks.findIndex((item) => item.symbol === symbol);

      if (stockIndex !== -1) {
        updatedStocks[stockIndex].quantity += quantity;
      } else {
        updatedStocks.push({
          symbol,
          quantity,
          averagePrice: stockPrices[symbol],
          investment: totalCost,
        });
      }

      await updateDoc(userRef, { balance: userData.balance - totalCost });
      await updateDoc(portfolioRef, { stocks: updatedStocks });

      const portfolioSnap = await getDoc(portfolioRef);
      setPortfolio(portfolioSnap.data());

      const userSnap = await getDoc(userRef);
      setUserData(userSnap.data());

      setSymbol("");
      setQuantity(1);
    }
  };

  // Handle selling stock
  const handleSellStock = async (symbol) => {
    if (portfolio && symbol && stockPrices[symbol] > 0 && amountToSell > 0 && userData) {
      const portfolioRef = doc(db, "portfolio", user.uid);
      const userRef = doc(db, "users", user.uid);
      const updatedStocks = [...portfolio.stocks];
      const stockIndex = updatedStocks.findIndex((item) => item.symbol === symbol);

      if (stockIndex !== -1 && updatedStocks[stockIndex].quantity > 0) {
        const sharesToSell = Math.floor(amountToSell / stockPrices[symbol]); // Calculate how many shares to sell
        if (updatedStocks[stockIndex].quantity >= sharesToSell) {
          // Deduct the quantity of stocks being sold
          updatedStocks[stockIndex].quantity -= sharesToSell;

          const totalReturn = stockPrices[symbol] * sharesToSell;

          // Remove stock from portfolio if all shares are sold
          if (updatedStocks[stockIndex].quantity === 0) {
            updatedStocks.splice(stockIndex, 1);
          }

          // Update user's balance and portfolio in Firestore
          await updateDoc(userRef, { balance: userData.balance + totalReturn });
          await updateDoc(portfolioRef, { stocks: updatedStocks });

          // Fetch the updated portfolio and user data
          const portfolioSnap = await getDoc(portfolioRef);
          setPortfolio(portfolioSnap.data());

          const userSnap = await getDoc(userRef);
          setUserData(userSnap.data());

          setAmountToSell(0); // Reset the amount field after selling
        } else {
          alert("Insufficient stock quantity to sell.");
        }
      }
    }
  };

  // Handle selling all stock
  const handleSellAllStock = async (symbol) => {
    if (!portfolio || !symbol || stockPrices[symbol] <= 0 || !userData) {
      alert("Invalid sell operation. Please check your inputs.");
      return;
    }

    const portfolioRef = doc(db, "portfolio", user.uid);
    const userRef = doc(db, "users", user.uid);

    // Find the stock in the user's portfolio
    const updatedStocks = [...portfolio.stocks];
    const stockIndex = updatedStocks.findIndex((item) => item.symbol === symbol);

    if (stockIndex !== -1) {
      const currentStock = updatedStocks[stockIndex];

      // Sell all shares (no need to calculate the amountToSell)
      const sharesToSell = currentStock.quantity; // Sell all shares

      // Update the investment amount: We reduce the investment by the amount for the sold shares
      const investmentPerShare = currentStock.investment / currentStock.quantity;
      currentStock.investment -= investmentPerShare * sharesToSell;

      // Update the total return from the sell transaction
      const totalReturn = sharesToSell * stockPrices[symbol];

      // Remove stock from portfolio if all shares are sold
      updatedStocks.splice(stockIndex, 1);

      // Update Firestore: User balance and portfolio
      await updateDoc(userRef, { balance: userData.balance + totalReturn });
      await updateDoc(portfolioRef, { stocks: updatedStocks });

      // Fetch updated data
      const portfolioSnap = await getDoc(portfolioRef);
      setPortfolio(portfolioSnap.data());

      const userSnap = await getDoc(userRef);
      setUserData(userSnap.data());
    } else {
      alert("Stock not found in your portfolio.");
    }
  };

  // Calculate total gain/loss
  const totalGainLoss = portfolio ? portfolio.stocks.reduce((acc, stock) => {
    return acc + (stock.quantity * (stockPrices[stock.symbol] || 0) - stock.investment);
  }, 0).toFixed(2) : 0;

  return (
  <>  
 <center> <h3 className={styles.head}>TRADELOOP</h3></center>
  <div className={styles.dashboard}>
    <h1>Welcome back, {userData?.Name}</h1>
    <p>Email: {userData?.email}</p>

   <h2>"Money Isn’t Just Currency, It’s Power."</h2>

    <h3>Buy Stocks</h3>
    <div className={styles.buyStock}>
      <input
        type="text"
        placeholder="Stock Symbol (e.g., AMZN)"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        onBlur={() => fetchStockPrice(symbol)}
      />
      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        min="1"
        placeholder="Quantity"
      />
      <button onClick={handleBuyStock}>Buy</button>
      <p>Current Price: ${stockPrices[symbol] || "Fetching..."}</p>
    </div>

  
    <BottomNavbar/>
  </div></>
  );
};

export default Buy;
