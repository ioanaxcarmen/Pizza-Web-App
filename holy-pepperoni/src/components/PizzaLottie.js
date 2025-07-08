import React from "react";
import Lottie from "lottie-react";
import pizzaAnimation from "./openpizza.json";

// Animation component for a pizza icon using in widgets
const PizzaLottie = ({ style, loop = true, ...props }) => (
  <Lottie animationData={pizzaAnimation} loop={loop} style={style} {...props} />
);

export default PizzaLottie;