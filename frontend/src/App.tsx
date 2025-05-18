import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import CreateRecipe from './pages/CreateRecipe'
import RecipeDetail from './pages/RecipeDetail'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="create" element={<CreateRecipe />} />
          <Route path="recipe/:id" element={<RecipeDetail />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
