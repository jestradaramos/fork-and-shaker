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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-destructive text-lg">{error || 'Recipe not found'}</div>
          <Link
            to="/"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
            className="inline-flex items-center text-primary hover:text-primary/90"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Recipes
          </Link>
        </div>

        <div className="bg-card shadow-lg rounded-lg overflow-hidden flex-1">
          <div className="grid md:grid-cols-[1fr,2fr] lg:grid-cols-[1fr,3fr] h-full">
            <div className="aspect-auto md:aspect-auto bg-primary flex items-center justify-center p-4 sm:p-8 min-h-[300px] md:h-full">
              <BeakerIcon className="h-16 w-16 sm:h-24 sm:w-24 text-primary-foreground opacity-75" />
            </div>

            <div className="p-4 sm:p-8 flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">{recipe.name}</h1>
              <p className="text-muted-foreground mb-6">{recipe.description}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                  {recipe.glass}
                </span>
                {recipe.garnish && (
                  <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                    {recipe.garnish}
                  </span>
                )}
              </div>

              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">Ingredients</h2>
                  <ul className="space-y-2">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="text-muted-foreground">
                        <span className="font-medium">{ingredient.amount} {ingredient.unit}</span> {ingredient.name}
                        {ingredient.isOptional && ' (optional)'}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">Instructions</h2>
                  <ol className="list-decimal list-inside space-y-3">
                    {recipe.instructions.map((instruction, index) => (
                      <li key={index} className="text-muted-foreground">
                        <span className="ml-2">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
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