import React from 'react'
import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useTheme } from './ThemeProvider'

const navigation = [
  { name: 'Recipes', href: '/' },
  { name: 'Create Recipe', href: '/create' },
]

export default function Layout() {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Disclosure as="nav" className="bg-card shadow-lg flex-shrink-0">
        {({ open }) => (
          <>
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <Link to="/" className="flex flex-shrink-0 items-center">
                    <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                      <span className="text-xl font-bold text-primary-foreground">F&S</span>
                    </div>
                    <span className="ml-3 text-xl font-bold text-primary">
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
                              ? 'border-b-2 border-primary text-foreground'
                              : 'border-b-2 border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                          }`}
                        >
                          {item.name}
                        </Link>
                      )
                    })}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  >
                    {theme === 'dark' ? (
                      <SunIcon className="h-5 w-5" />
                    ) : (
                      <MoonIcon className="h-5 w-5" />
                    )}
                  </button>
                  <div className="sm:hidden">
                    <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary">
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
                          ? 'border-l-4 border-primary bg-primary/10 text-primary'
                          : 'border-l-4 border-transparent text-muted-foreground hover:border-border hover:bg-secondary hover:text-foreground'
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