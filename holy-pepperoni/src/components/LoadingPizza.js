import React from "react";
import Lottie from "lottie-react";
import pizzaLoading from "./pizzaloading.json"; // Adjust the path if you move the JSON

const LoadingPizza = () => (
  <div style={{ textAlign: "center", padding: 32 }}>
    <Lottie 
      animationData={pizzaLoading} 
      loop={true} 
      style={{ width: 220, height: 220, margin: "0 auto" }} 
    />
    <div style={{ marginTop: 16, fontWeight: 500, fontSize: 18 }}>
      Loading pizza data...
    </div>
  </div>
);

export default LoadingPizza;
