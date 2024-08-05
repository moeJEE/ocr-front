// src/components/Sidebar.js
import React, { useState } from 'react';
import {

  DollarSign,
  Settings,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { MessageCircle, Image, FileText } from 'lucide-react';

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);

  const menuItems = [
    { label: 'AI CHAT', icon: <MessageCircle size={20} />, alert: false },
    { label: 'AI PIC', icon: <Image size={20} />, alert: true },
    { label: 'AI DOC', icon: <FileText size={20} />, alert: false },
    { label: 'Plans', icon: <DollarSign size={20} />, alert: false },
  ];

  return (
    <aside className={`h-screen bg-white text-gray-800 border-r shadow-sm transition-all ${expanded ? 'w-64' : 'w-20'}`}>
      <div className="p-4 flex justify-between items-center">
        
        <button onClick={() => setExpanded(!expanded)} className="text-gray-800">
          {expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
      <nav>
        <ul>
          {menuItems.map((item, index) => (
            <li key={index} className="relative flex items-center py-2 px-4 hover:bg-gray-100 transition-colors">
              {item.icon}
              <span className={`ml-4 transition-all ${expanded ? 'block' : 'hidden'}`}>{item.label}</span>
              {item.alert && <span className="absolute right-2 w-2 h-2 bg-blue-500 rounded-full" />}
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto mb-4">
        <div className="border-t flex flex-col items-center p-4">
          <div className="flex items-center w-full">
            <Settings size={20} />
            <span className={`ml-4 transition-all ${expanded ? 'block' : 'hidden'}`}>Settings</span>
          </div>
          <div className="flex items-center w-full mt-4">
            <HelpCircle size={20} />
            <span className={`ml-4 transition-all ${expanded ? 'block' : 'hidden'}`}>Help</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
