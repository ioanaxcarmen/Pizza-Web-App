import React from "react";
import Lottie from "lottie-react";
import bellAnimation from "./bell.json";

const BellAnimation = () => (
  <div style={{ width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <Lottie 
      animationData={bellAnimation} 
      loop={true}
    />
  </div>
);

export default BellAnimation;