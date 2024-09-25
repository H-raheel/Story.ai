'use client'

import { Message, useChat } from 'ai/react';
import { useEffect, useRef } from 'react';
import styles from "./page.module.css";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, setInput, setMessages } = useChat();
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Custom scroll to the bottom function
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Whenever messages change, scroll to the bottom

  const customHandleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input) return;

    console.log("Submitting question...");

    const newMessage: Message = {
      id: String(Date.now()),
      role: 'user',
      content: input,
    };

    setMessages([...messages, newMessage]);
    setInput('');

    try {
      console.log("Sending request to API...");
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [...messages, newMessage], input }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let aiMessageContent = '';

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        aiMessageContent += decoder.decode(value, { stream: !done });
      }

      const aiMessage: Message = {
        id: String(Date.now()),
        role: 'assistant',
        content: aiMessageContent,
      };

      console.log("API response received: ", aiMessageContent);
      setMessages([...messages, newMessage, aiMessage]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching AI response:', error);
      }
    }
  };

  return (
    <div className="chat">
      <h1 className={styles.chat_title}>Welcome to the AI Chatbot</h1>
      <div className={styles.message_content}>
        {messages.map((m) => (
          <div key={m.id}>
            <span>{m.role === 'user' ? '👤' : '🤖'}: </span>
            <span className={m.role === 'user' ? 'text-blue-400' : ''}>
              {m.content}
            </span>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>
      <div className={styles.text_area}>
        <form onSubmit={customHandleSubmit}>
          <input
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
            className={styles.input}
          />
        </form>
      </div>
    </div>
  )
}
