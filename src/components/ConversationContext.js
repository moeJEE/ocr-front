import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';

const ConversationContext = createContext();

export const ConversationProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const { user } = useUser();

  const fetchConversations = useCallback(async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/conversations/${user.id}`);
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  const addConversation = async (title) => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/conversations', {
        user_id: user.id,
        title: title
      });
      setConversations([...conversations, response.data.conversation]);
      setCurrentConversation(response.data.conversation);
    } catch (error) {
      console.error('Error adding conversation:', error);
    }
  };

  const updateConversation = async (conversationId, messages) => {
    try {
      await axios.put(`http://127.0.0.1:5000/conversations/${conversationId}`, {
        messages: messages
      });
      setConversations(conversations.map(conv => 
        conv.id === conversationId ? {...conv, messages: messages} : conv
      ));
      setCurrentConversation(prev => prev.id === conversationId ? {...prev, messages: messages} : prev);
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  };

  return (
    <ConversationContext.Provider value={{
      conversations,
      currentConversation,
      setCurrentConversation,
      addConversation,
      updateConversation
    }}>
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = () => useContext(ConversationContext);
