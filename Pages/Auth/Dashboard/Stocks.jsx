import React, { useEffect, useState } from 'react';
import { db } from '../../../Firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../Firebase';
import axios from 'axios'; // For fetching stock prices
import styles from './Stocks.module.css'; // Assuming you have a CSS file for styling
import BottomNavbar from './BottomNavbar';

const Stocks = () => {
  const [user] = useAuthState(auth);
  const [portfolio, setPortfolio] = useState(null);
  const [stockPrices, setStockPrices] = useState({});

  // Fetch stock price using Finnhub API
  const fetchStockPrice = async (symbol) => {
    if (!symbol) return;
    const apiKey = 'ctg0chhr01qi0nfef030ctg0chhr01qi0nfef03g';  // Use your Finnhub API key here

    try {
      const response = await axios.get(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
      );
      const { c } = response.data; // c: current price
      setStockPrices((prevState) => ({
        ...prevState,
        [symbol]: c, // Set the current price
      }));
    } catch (error) {
      console.error('Error fetching stock price:', error);
    }
  };

  useEffect(() => {
    if (!user) return;
    
    const fetchPortfolio = async () => {
      const portfolioRef = doc(db, 'portfolio', user.uid);
      const portfolioSnap = await getDoc(portfolioRef);
      if (portfolioSnap.exists()) {
        setPortfolio(portfolioSnap.data());
        // Fetch stock prices for all stocks in portfolio
        portfolioSnap.data().stocks.forEach((stock) => {
          fetchStockPrice(stock.symbol);
        });
      } else {
        console.log('No portfolio found.');
      }
    };

    fetchPortfolio();
  }, [user]);

  return (
    <>
      <center> <h3 className={styles.head}>TRADELOOP</h3></center>
      <div className={styles.stocksPage}>
        <h1>Your Purchased Stocks</h1>
        {portfolio ? (
          <div className={styles.stockList}>
            {portfolio.stocks.map((stock) => {
              const currentPrice = stockPrices[stock.symbol];
              const totalValue = currentPrice ? (stock.quantity * currentPrice).toFixed(2) : 'Loading...';

              return (
                <div key={stock.symbol} className={styles.stockItem}>
                  <h3>{stock.symbol}</h3>
                  <p>Quantity: {stock.quantity}</p>
                  <p>Investment: ${stock.investment ? stock.investment.toFixed(2) : 'Loading...'}</p>
                  <p>Average Purchase Price: ${stock.averagePrice}</p>
                  <p>Current Price: ${currentPrice || 'Loading...'}</p>
                  <p>Total Value: ${totalValue}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p>Loading portfolio...</p>
        )}
        <BottomNavbar/>
      </div>
    </>
  );
};

export default Stocks;
