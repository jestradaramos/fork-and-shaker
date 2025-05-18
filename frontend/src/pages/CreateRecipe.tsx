import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline'

interface Ingredient {
  name: string
  amount: string
  unit: string
}

interface RecipeForm {
  name: string
  description: string
  glass: string
  garnish: string
  ingredients: Ingredient[]
  instructions: string[]
}

export default function CreateRecipe() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<RecipeForm>({
    name: '',
    description: '',
    glass: '',
    garnish: '',
    ingredients: [{ name: '', amount: '', unit: '' }],
    instructions: [''],
  })

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = [...formData.ingredients]
    newIngredients[index] = { ...newIngredients[index], [field]: value }
    setFormData({ ...formData, ingredients: newIngredients })
  }

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...formData.instructions]
    newInstructions[index] = value
    setFormData({ ...formData, instructions: newInstructions })
  }

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { name: '', amount: '', unit: '' }],
    })
  }

  const removeIngredient = (index: number) => {
    if (formData.ingredients.length > 1) {
      setFormData({
        ...formData,
        ingredients: formData.ingredients.filter((_, i) => i !== index),
      })
    }
  }

  const addInstruction = () => {
    setFormData({
      ...formData,
      instructions: [...formData.instructions, ''],
    })
  }

  const removeInstruction = (index: number) => {
    if (formData.instructions.length > 1) {
      setFormData({
        ...formData,
        instructions: formData.instructions.filter((_, i) => i !== index),
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Convert amount strings to numbers for ingredients
      const formattedData = {
        ...formData,
        ingredients: formData.ingredients.map(ing => ({
          ...ing,
          amount: parseFloat(ing.amount),
          isOptional: false // Add required field from backend
        })),
        type: "cocktail" // Add required field from backend
      }

      console.log('Submitting recipe:', formattedData)
      const response = await axios.post('http://localhost:8080/api/recipes', formattedData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: false // Since we're using "*" for CORS
      })
      console.log('Response:', response)
      console.log('Recipe created successfully:', response.data)
      navigate('/')
    } catch (error) {
      console.error('Error creating recipe:', error)
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status)
        console.error('Response data:', error.response?.data)
        console.error('Response headers:', error.response?.headers)
        alert(`Failed to create recipe: ${error.response?.data || error.message}`)
      } else {
        alert('Failed to create recipe. Please check the console for details.')
      }
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow-sm rounded-lg h-full flex flex-col">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-1 space-y-8 divide-y divide-gray-200 p-4 sm:p-8">
              <div>
                <div>
                  <h3 className="text-2xl font-bold leading-6 text-gray-900">Create New Recipe</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Fill out the form below to create a new cocktail recipe.
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 md:grid-cols-12">
                  <div className="md:col-span-6 lg:col-span-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Recipe Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="block w-full rounded-md border-2 border-secondary bg-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm text-foreground"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-12 lg:col-span-8">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="block w-full rounded-md border-2 border-secondary bg-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm text-foreground"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-6">
                    <label htmlFor="glass" className="block text-sm font-medium text-gray-700">
                      Glass Type
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="glass"
                        id="glass"
                        required
                        value={formData.glass}
                        onChange={(e) => setFormData({ ...formData, glass: e.target.value })}
                        className="block w-full rounded-md border-2 border-secondary bg-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm text-foreground"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-6">
                    <label htmlFor="garnish" className="block text-sm font-medium text-gray-700">
                      Garnish
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="garnish"
                        id="garnish"
                        value={formData.garnish}
                        onChange={(e) => setFormData({ ...formData, garnish: e.target.value })}
                        className="block w-full rounded-md border-2 border-secondary bg-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm text-foreground"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Ingredients</h3>
                  <p className="mt-1 text-sm text-gray-500">Add all ingredients needed for this recipe.</p>
                </div>
                <div className="mt-6 space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {formData.ingredients.map((ingredient, index) => (
                      <div key={index} className="grid grid-cols-12 gap-4 items-start">
                        <div className="col-span-6">
                          <label className="block text-sm font-medium text-gray-700">Ingredient</label>
                          <input
                            type="text"
                            required
                            value={ingredient.name}
                            onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                            className="mt-1 block w-full rounded-md border-2 border-secondary bg-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm text-foreground"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700">Amount</label>
                          <input
                            type="text"
                            required
                            value={ingredient.amount}
                            onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                            className="mt-1 block w-full rounded-md border-2 border-secondary bg-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm text-foreground"
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-sm font-medium text-gray-700">Unit</label>
                          <input
                            type="text"
                            required
                            value={ingredient.unit}
                            onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                            className="mt-1 block w-full rounded-md border-2 border-secondary bg-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm text-foreground"
                          />
                        </div>
                        <div className="col-span-1 flex items-end justify-end">
                          <button
                            type="button"
                            onClick={() => removeIngredient(index)}
                            className="inline-flex items-center p-1.5 border border-transparent rounded-full text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <MinusIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Ingredient
                  </button>
                </div>
              </div>

              <div className="pt-8">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Instructions</h3>
                  <p className="mt-1 text-sm text-gray-500">Add step-by-step instructions for making this cocktail.</p>
                </div>
                <div className="mt-6 space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {formData.instructions.map((instruction, index) => (
                      <div key={index} className="grid grid-cols-12 gap-4">
                        <div className="col-span-11">
                          <label className="block text-sm font-medium text-gray-700">Step {index + 1}</label>
                          <div className="mt-1">
                            <textarea
                              rows={2}
                              required
                              value={instruction}
                              onChange={(e) => handleInstructionChange(index, e.target.value)}
                              className="block w-full rounded-md border-2 border-secondary bg-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm text-foreground"
                            />
                          </div>
                        </div>
                        <div className="col-span-1 flex items-end justify-end">
                          <button
                            type="button"
                            onClick={() => removeInstruction(index)}
                            className="inline-flex items-center p-1.5 border border-transparent rounded-full text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <MinusIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addInstruction}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Step
                  </button>
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-8 py-5 bg-gray-50 rounded-b-lg">
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="w-full sm:w-auto rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Create Recipe
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 