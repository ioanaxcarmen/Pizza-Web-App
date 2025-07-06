// import React from 'react';
// import { Link, useNavigate } from 'react-router-dom';

// const styles = {
//   header: {
//     width: "100vw",
//     background: "#faa28a",
//     color: "#000000ff",
//     padding: "24px 0",
//     fontSize: "2.5rem",
//     fontWeight: "bold",
//     marginBottom: "32px",
//     marginTop: "30px",
//     boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
//     textAlign: "center",
//     position: "relative",
//     left: "50%",
//     transform: "translateX(-50%)",
//     maxWidth: "100vw",
//   },
//   container: {
//     background: "#fff",
//     minHeight: "100vh",
//     padding: "0",
//   },
//   subheading: {
//     textAlign: "center",
//     fontSize: "1.4rem",
//     fontWeight: "bold",
//     marginTop: "24px",
//     marginBottom: "48px",
//   },
//   buttonGrid: {
//     display: "grid",
//     gridTemplateColumns: "1fr 1fr",
//     gap: "20px",
//     margin: "0 auto 32px auto",
//     maxWidth: "440px",
//     justifyContent: "center",
//   },
//   button: {
//     background: "#f7d9afff",
//     color: "#000000ff",
//     border: "none",
//     borderRadius: "50px",
//     padding: "18px 0",
//     width: "180px",
//     fontSize: "1.1rem",
//     fontWeight: "bold",
//     cursor: "pointer",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     textDecoration: "none",
//     textAlign: "center",
//     margin: "0 auto"
//   },
//   backButton: {
//     background: "#faa28a", 
//     color: "#000000ff",
//     border: "none",
//     borderRadius: "50px",
//     padding: "18px 0",
//     width: "180px",
//     fontSize: "1.1rem",
//     fontWeight: "bold",
//     cursor: "pointer",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     textDecoration: "none",
//     textAlign: "center",
//     margin: "0 auto",
//     marginTop: "16px"
//   }
// };

// const CustomerMenuPage = () => {
//   const navigate = useNavigate();

//   return (
//     <div style={styles.container}>
//       <div style={styles.header}>Customer Menu</div>
//       <div style={styles.subheading}>Please select a Key Performance Indicator to view.</div>
//       <div style={styles.buttonGrid}>
//         <Link to="/customer/top-10" style={styles.button}>Top 10 Customers</Link>
//         <Link to="/customer/order-frequency" style={styles.button}>Customer Order Frequency</Link>
//         <Link to="/customer/avg-spend" style={styles.button}>Average Spend Over Time</Link>
//         <Link to="/customer/store-share" style={styles.button}>Customer Share by Store</Link> {/* New button */}
//         {/* Add more links for other customer-related KPIs */}
//       </div>
//       <button
//         style={styles.backButton}
//         onClick={() => navigate("/dashboard")}
//       >
//         Back to Main Menu
//       </button>
//     </div>
//   );
// };

// export default CustomerMenuPage;