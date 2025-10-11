
import React, { useState, useEffect, useRef } from 'react';
import './ChatPage.css';

function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const socket = useRef(null);

    useEffect(() => {
        socket.current = new WebSocket('ws://' + window.location.host + '/ws/chat/');

        socket.current.onmessage = (e) => {
            const data = JSON.parse(e.data);
            setMessages(prevMessages => [...prevMessages, data.message]);
        };

        socket.current.onclose = () => {
            console.error('Chat socket closed unexpectedly');
        };

        return () => {
            socket.current.close();
        };
    }, []);

    const sendMessage = () => {
        if (input.trim()) {
            socket.current.send(JSON.stringify({ 'message': input }));
            setInput('');
        }
    };

    return (
        <div className="chat-container">
            <h1>Venti Chat</h1>
            <div id="chat-log">
                {messages.map((msg, index) => (
                    <div key={index}>{msg}</div>
                ))}
            </div>
            <div className="input-container">
                <input 
                    type="text" 
                    id="chat-input" 
                    placeholder="Type your message..." 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button id="send-button" onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
}

export default ChatPage;
