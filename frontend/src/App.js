import React from "react";
import Header from "./Components/Header";
// import Footer from "./Components/Footer";
// import { Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SideBar from "./Components/AdminComponents/Sidebar";

function App() {
  return (
    <div className="box">
      <ToastContainer />
      <Header />
      <div className="main">
        {/* <Container> */}
        <Outlet />
        {/* </Container> */}
      </div>
      {/* <Footer /> */}
    </div>
  );
}

export default App;
