import React from 'react';
import cam from './assets/cam.png';
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Pair from "./pages/pair";
import User from "./pages/User";


function App() {
  return (
    <div>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/pair" element={<Pair />} />
      <Route path="/user" element={<User />} />
    </Routes>
    </div>
  );
}

export default App;
