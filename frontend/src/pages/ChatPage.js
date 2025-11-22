import React, { useState, useEffect, useRef } from "react";
import MainLayout from "../components/layout/MainLayout";
import "./ChatPage.css";

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socket = useRef(null);
  const chatLogRef = useRef(null);

  useEffect(() => {
    // Note: This is a general chat room. For club-specific chats, see ClubDashboard.
    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
    const socketUrl = `${wsScheme}://${window.location.host}/ws/chat/`;

    socket.current = new WebSocket(socketUrl);

    socket.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMessages((prevMessages) => [...prevMessages, data.message]);
    };

    socket.current.onclose = () => {
      console.error("Chat socket closed unexpectedly");
    };

    return () => {
      socket.current.close();
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom on new message
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() && socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify({ message: input }));
      setInput("");
    }
  };

  return (
    <MainLayout>
      <div className="main-content">
        <div className="chat-page-container card">
          <h3>
            <span className="material-icons">chat</span> Venti General Chat
          </h3>
          <div className="chat-messages" ref={chatLogRef}>
            {messages.map((msg, index) => (
              <div className="message-item" key={index}>
                <div className="message-text">{msg}</div>
              </div>
            ))}
            {messages.length === 0 && (
              <p className="no-messages">No messages yet. Say hello!</p>
            )}
          </div>
          <div className="chat-input-area">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <button className="btn btn-primary" onClick={sendMessage}>
              <span className="material-icons">send</span>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default ChatPage;
