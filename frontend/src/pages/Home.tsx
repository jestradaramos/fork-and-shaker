import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { BeakerIcon, PlusIcon } from '@heroicons/react/24/outline'

interface Recipe {
  id: string
  name: string
  description: string
  glass: string
  garnish: string
  type: string
  ingredients: Array<{
    name: string
    amount: number
    unit: string
    isOptional: boolean
  }>
  instructions: string[]
}

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get<Recipe[]>('http://localhost:8080/api/recipes')
        console.log('Fetched recipes:', response.data)
        setRecipes(response.data)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching recipes:', err)
        setError('Failed to fetch recipes')
        setLoading(false)
      }
    }

    fetchRecipes()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            Cocktail Recipes
          </h2>
          <Link
            to="/create"
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Recipe
          </Link>
        </div>

        {recipes.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <BeakerIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">No recipes</h3>
              <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new recipe.</p>
              <div className="mt-6">
                <Link
                  to="/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  New Recipe
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 auto-rows-min">
            {recipes.map((recipe) => (
              <Link
                key={recipe.id}
                to={`/recipe/${recipe.id}`}
                className="group relative block overflow-hidden rounded-lg bg-card shadow-md transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <div className="grid md:grid-cols-2 lg:grid-cols-1">
                  <div className="aspect-square lg:aspect-[4/3] bg-primary">
                    <div className="flex items-center justify-center h-full p-4">
                      <BeakerIcon className="h-12 w-12 sm:h-16 sm:w-16 text-primary-foreground opacity-75" />
                    </div>
                  </div>
                  <div className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary line-clamp-1">
                      {recipe.name}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                        {recipe.glass}
                      </span>
                      {recipe.ingredients[0] && (
                        <span className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                          {recipe.ingredients[0].name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 