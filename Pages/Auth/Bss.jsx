import React, { useState, useEffect } from "react";
import { db } from "./../../Firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./../../Firebase";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from './BuySellPage.module.css';

const BuySellPage = () => {
  const [user] = useAuthState(auth);
  const [portfolio, setPortfolio] = useState(null);
  const [userData, setUserData] = useState(null);
  const [stockPrices, setStockPrices] = useState({});
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }

    // Fetch user data and portfolio
    const fetchUserData = async () => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserData(userSnap.data());
      }
    };

    const fetchPortfolio = async () => {
      const portfolioRef = doc(db, "portfolio", user.uid);
      const portfolioSnap = await getDoc(portfolioRef);
      if (portfolioSnap.exists()) {
        setPortfolio(portfolioSnap.data());
      }
    };

    fetchUserData();
    fetchPortfolio();
  }, [user, navigate]);

  // Fetch stock price using Finnhub API
  const fetchStockPrice = async (symbol) => {
    if (!symbol) return;
    const apiKey = "YOUR_FINNHUB_API_KEY";
    try {
      const response = await axios.get(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
      );
      const { c } = response.data;
      setStockPrices((prevState) => ({
        ...prevState,
        [symbol]: c,
      }));
    } catch (error) {
      console.error("Error fetching stock price:", error);
    }
  };

  // Handle buying stock
  const handleBuyStock = async () => {
    if (user && symbol && stockPrices[symbol] > 0 && quantity > 0 && userData) {
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
    if (portfolio && symbol && stockPrices[symbol] > 0 && quantity > 0 && userData) {
      const portfolioRef = doc(db, "portfolio", user.uid);
      const userRef = doc(db, "users", user.uid);
      const updatedStocks = [...portfolio.stocks];
      const stockIndex = updatedStocks.findIndex((item) => item.symbol === symbol);
  
      if (stockIndex !== -1 && updatedStocks[stockIndex].quantity >= quantity) {
        updatedStocks[stockIndex].quantity -= quantity;
  
        const totalReturn = stockPrices[symbol] * quantity;
  
        if (updatedStocks[stockIndex].quantity === 0) {
          updatedStocks.splice(stockIndex, 1);
        }
  
        await updateDoc(userRef, { balance: userData.balance + totalReturn });
        await updateDoc(portfolioRef, { stocks: updatedStocks });
  
        const portfolioSnap = await getDoc(portfolioRef);
        setPortfolio(portfolioSnap.data());
  
        const userSnap = await getDoc(userRef);
        setUserData(userSnap.data());
      } else {
        alert("Insufficient stock quantity to sell.");
      }
    }
  };
  

  return (
    <div className={styles.buySellPage}>
      <h1 className={styles.title}>Buy/Sell Stocks</h1>

      <div className={styles.buySection}>
        <h3>Buy Stock</h3>
        <input
          className={styles.input}
          type="text"
          placeholder="Stock Symbol (e.g., AAPL)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          onBlur={() => fetchStockPrice(symbol)}
        />
        <input
          className={styles.input}
          type="number"
          placeholder="Quantity"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
        <button className={styles.buyButton} onClick={handleBuyStock}>
          Buy Stock
        </button>
        <p>Current Price: ${stockPrices[symbol] || "Fetching..."}</p>
      </div>

      <div className={styles.sellSection}>
        <h3>Sell Stock</h3>
        <ul>
          {portfolio && portfolio.stocks.map((stock, index) => (
            <li key={index}>
              {stock.symbol}: {stock.quantity} shares
              <button className={styles.sellButton} onClick={() => handleSellStock(stock.symbol)}>
                Sell
              </button>
            </li>
          ))}
        </ul>
      </div>

      <h3>Total Balance: ${userData?.balance}</h3>
    </div>
  );
};

export default BuySellPage;
