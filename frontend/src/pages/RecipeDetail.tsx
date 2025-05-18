import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { BeakerIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

interface Ingredient {
  name: string
  amount: number
  unit: string
  isOptional: boolean
}

interface Recipe {
  id: string
  name: string
  description: string
  glass: string
  garnish: string
  type: string
  ingredients: Ingredient[]
  instructions: string[]
  created_at: string
  updated_at: string
}

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await axios.get<Recipe>(`http://localhost:8080/api/recipes/${id}`)
        console.log('Fetched recipe:', response.data)
        setRecipe(response.data)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching recipe:', err)
        setError('Failed to fetch recipe')
        setLoading(false)
      }
    }

    fetchRecipe()
  }, [id])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-600 text-lg">{error || 'Recipe not found'}</div>
          <Link
            to="/"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Recipes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Recipes
          </Link>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden flex-1">
          <div className="grid md:grid-cols-[1fr,2fr] lg:grid-cols-[1fr,3fr] h-full">
            <div className="aspect-auto md:aspect-auto bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4 sm:p-8 min-h-[300px] md:h-full">
              <BeakerIcon className="h-16 w-16 sm:h-24 sm:w-24 text-white opacity-75" />
            </div>

            <div className="p-4 sm:p-8 flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{recipe.name}</h1>
              <p className="text-gray-600 mb-6">{recipe.description}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
                  {recipe.glass}
                </span>
                {recipe.garnish && (
                  <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700">
                    {recipe.garnish}
                  </span>
                )}
              </div>

              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Ingredients</h2>
                  <ul className="space-y-2">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="text-gray-600">
                        <span className="font-medium">{ingredient.amount} {ingredient.unit}</span> {ingredient.name}
                        {ingredient.isOptional && ' (optional)'}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
                  <ol className="list-decimal list-inside space-y-3">
                    {recipe.instructions.map((instruction, index) => (
                      <li key={index} className="text-gray-600">
                        <span className="ml-2">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Created: {new Date(recipe.created_at).toLocaleDateString()}
                  {recipe.updated_at !== recipe.created_at && 
                    ` • Updated: ${new Date(recipe.updated_at).toLocaleDateString()}`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 