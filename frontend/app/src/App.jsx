import React from 'react';
import cam from './assets/cam.png';
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Pair from "./pages/pair";


function App() {
  return (
    <div>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/pair" element={<Pair />} />
    </Routes>
    </div>
  );
}

export default App;
