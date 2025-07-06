import React from "react";
import Lottie from "lottie-react";
import chefAnimation from "./chef.json"; 

const CookingChef = () => (
  <div style={{ textAlign: "center", padding: 16 }}>
    <Lottie 
      animationData={chefAnimation} 
      loop={true}
    />
  </div>
);

export default CookingChef;