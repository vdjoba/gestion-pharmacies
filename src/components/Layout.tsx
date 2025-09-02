import React from 'react'
import Header from './Header'

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      <main className="flex-grow w-full">
        {children}
      </main>
      <footer className="bg-white shadow-md mt-16 w-full">
        <div className="container mx-auto px-6 py-4 text-center text-gray-600">
          Votre santé, notre priorité.
        </div>
      </footer>
    </div>
  )
}

export default Layout