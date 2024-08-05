// src/components/Header.js
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 border-b">
      <div className="flex items-center">
    
        <img
          src="https://img.logoipsum.com/243.svg"
          alt="Logo"
          className="h-8 ml-4"
        />
      </div>
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center text-gray-700 focus:outline-none"
        >
          <img
            src="https://ui-avatars.com/api/?background=c7d2fe&color=3730a3&bold=true"
            alt="User"
            className="w-10 h-10 rounded-full"
          />
          <ChevronDown size={20} className="ml-2" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg">
            <ul className="py-1">
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Mon plan</li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Mes GPT</li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Personnaliser ChatGPT</li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Paramètres</li>
              <li className="border-t mt-2"></li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Se déconnecter</li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
