import React from "react";
import Lottie from "lottie-react";
import pizzaAnimation from "./openpizza.json";

const PizzaLottie = ({ style, loop = true, ...props }) => (
  <Lottie animationData={pizzaAnimation} loop={loop} style={style} {...props} />
);

export default PizzaLottie;