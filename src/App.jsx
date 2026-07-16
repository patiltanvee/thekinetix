import React, { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ScrollTop from './components/ScrollTop'
import Home from './pages/Home'
import ExpPage from './pages/ExpPage'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/exp/:id" element={<ExpPage />} />
      </Routes>
      <ScrollTop />
    </>
  )
}