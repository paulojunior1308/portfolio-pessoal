import React from "react";
import Navbar from "../../services/navbar";

import logo from "../../image/Logo.png";
import "./styles.css";

const Home = () => {
  return (
    <div>
      <Navbar />
      <div className="home-container">
        <img className="background-image" src={logo} alt="Logo" />
      </div>
    </div>
  );
};

export default Home;
