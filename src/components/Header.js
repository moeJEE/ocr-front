import React, { useState } from 'react';
import { ChevronDown, MessageCircle, Image, FileText } from 'lucide-react'; // Import icons
import { SignedIn, UserButton } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenuClick = (option) => {
    setMenuOpen(false); // Close the menu when an option is clicked

    switch (option) {
      case 'chat':
        navigate('/chat'); // Navigate to /chat
        break;
      case 'pic':
        navigate('/chat-pic'); // Navigate to /chat-pic
        break;
      case 'doc':
        navigate('/chat-doc'); // Navigate to /chat-doc
        break;
      default:
        break;
    }
  };

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 border-b">
      <div className="flex items-center">
        <img
          src="/OU.jpg"
          alt="Logo"
          className="h-10 ml-4"
        />
      </div>

      <div className="relative flex items-center justify-center">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center space-x-2 focus:outline-none"
        >
          <span className="font-medium">Menu</span>
          <ChevronDown className={`transition-transform ${menuOpen ? 'rotate-180' : 'rotate-0'}`} />
        </button>
        {menuOpen && (
          <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded-md w-48">
            <ul className="py-2">
              <li
                onClick={() => handleMenuClick('chat')}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
              >
                <MessageCircle className="w-5 h-5" /> {/* AI CHAT icon */}
                <span>NEW AI CHAT</span>
              </li>
              <li
                onClick={() => handleMenuClick('pic')}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
              >
                <Image className="w-5 h-5" /> {/* AI PIC icon */}
                <span>NEW AI PIC</span>
              </li>
              <li
                onClick={() => handleMenuClick('doc')}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
              >
                <FileText className="w-5 h-5" /> {/* AI DOC icon */}
                <span>NEW AI DOC</span>
              </li>
            </ul>
          </div>
        )}
      </div>

      <div>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}
