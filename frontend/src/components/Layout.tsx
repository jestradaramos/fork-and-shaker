import React from 'react'
import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { Link, Outlet, useLocation } from 'react-router-dom'

const navigation = [
  { name: 'Recipes', href: '/' },
  { name: 'Create Recipe', href: '/create' },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <Disclosure as="nav" className="bg-white shadow-lg flex-shrink-0">
        {({ open }) => (
          <>
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <Link to="/" className="flex flex-shrink-0 items-center">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">F&S</span>
                    </div>
                    <span className="ml-3 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Fork & Shaker
                    </span>
                  </Link>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    {navigation.map((item) => {
                      const isActive = location.pathname === item.href
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                            isActive
                              ? 'border-b-2 border-indigo-500 text-gray-900'
                              : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                          }`}
                        >
                          {item.name}
                        </Link>
                      )
                    })}
                  </div>
                </div>
                <div className="-mr-2 flex items-center sm:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 pb-3 pt-2">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Disclosure.Button
                      key={item.name}
                      as={Link}
                      to={item.href}
                      className={`block py-2 pl-3 pr-4 text-base font-medium ${
                        isActive
                          ? 'border-l-4 border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-l-4 border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                      }`}
                    >
                      {item.name}
                    </Disclosure.Button>
                  )
                })}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
      <main className="flex-1 flex flex-col overflow-auto">
        <div className="flex-1 flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  )
} 