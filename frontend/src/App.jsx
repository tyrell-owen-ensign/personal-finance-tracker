import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChartPage from "./pages/ChartPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import NavBar from "./components/NavBar.jsx";

function App() {

  return (
    <BrowserRouter>
        <NavBar />
      <Routes>
        <Route path="/" element={<HistoryPage />} />
        <Route path={"/chart"} element={<ChartPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
