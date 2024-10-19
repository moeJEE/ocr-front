import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, ChevronRight, ChevronLeft, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';

export default function Sidebar({ onChatSelect }) {
  const [expanded, setExpanded] = useState(true);
  const [chatHistories, setChatHistories] = useState([]);
  const { user } = useUser();

  const fetchChatHistories = useCallback(async () => {
    if (user) {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/chat-histories/${user.id}`);
        setChatHistories(response.data);
      } catch (error) {
        console.error('Error fetching chat histories:', error);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchChatHistories();
  }, [fetchChatHistories]);

  const deleteChatHistories = async () => {
    if (user) {
      try {
        await axios.delete(`http://127.0.0.1:5000/chat-histories/${user.id}`);
        setChatHistories([]);
      } catch (error) {
        console.error('Error deleting chat histories:', error);
      }
    }
  };

  return (
    
    <aside className={`h-screen bg-white text-gray-800 border-r shadow-sm transition-all flex flex-col ${expanded ? 'w-64' : 'w-20'}`}>
      <div className="p-4 flex justify-between items-center">
        <button onClick={() => setExpanded(!expanded)} className="text-gray-800">
          {expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
      <div className="p-4 mt-auto">
  <button
    onClick={deleteChatHistories}
    className={`
      w-full flex items-center justify-center py-2 px-4
      bg-transparent text-red-500 border border-red-500 rounded
      hover:bg-red-500 hover:text-white
      transition-colors duration-300
      ${expanded ? '' : 'p-2'}
    `}
  >
    <Trash2 size={20} />
    {expanded && <span className="ml-2">Delete All Chats</span>}
  </button>
</div>
     
      <nav className="mt-4 flex-grow overflow-y-auto">
        <ul>
          {chatHistories.map((chat) => {
            const truncatedTitle = chat.title.length > 20 ? chat.title.slice(0, 20) + '...' : chat.title;
            return (
              <li
                key={chat.id}
                className="relative flex items-center py-2 px-4 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => onChatSelect(chat.id)}
              >
                <MessageCircle size={20} />
                <span className={`ml-4 transition-all ${expanded ? 'block' : 'hidden'}`}>
                  {truncatedTitle}
                </span>
              </li>
            );
          })}
        </ul>
      </nav>

    </aside>
  );
}