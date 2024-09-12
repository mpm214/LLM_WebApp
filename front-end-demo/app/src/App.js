import React, { useState, useEffect } from 'react';
import './App.css';
import './small_components.css';
import './big_components.css';
import logo from './assets/sigma.png';
import addBtn from './assets/add-30.png';
import msgIcon from './assets/message.svg';
import home from './assets/home.svg';
import saved from './assets/bookmark.svg';
import rocket from './assets/rocket.svg';
import sendBtn from './assets/send.svg';
import r_chevron from './assets/right_arrow.png';
import link from './assets/link.png';
import { sendMsgToOpenAI } from './openai';
import { searchArXiv, queryQdrant } from './services/api';


// ArticleRecommendation component
const ArticleRecommendation = ({ title, authors, categories, match }) => (
  <div className="component">
    <div className="small-text-content">{title}</div>
    <div className="info-group">
      <div className="authors">
        <span>Authors: </span>
        <span>{authors.join(', ')}</span>
      </div>
      <div className="categories">
        <span>Categories: </span>
        <span>{categories.join(', ')}</span>
      </div>
      <div className="match">
        <span>Match: </span>
        <span>{match}%</span>
      </div>
    </div>
    <div className="expand-icon">
      <img src={r_chevron} alt="expand" />
    </div>
  </div>
);

function App() {
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState([]);
  const [qdrantResults, setQdrantResults] = useState(null);

  useEffect(() => {
    console.log("Articles updated:", articles);
  }, [articles]);

  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage = { role: "user", content: input };
    setChatLog(prevLog => [...prevLog, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendMsgToOpenAI(input);
      const aiMessage = { role: "assistant", content: response };
      setChatLog(prevLog => [...prevLog, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = { role: "error", content: "An error occurred. Please try again." };
      setChatLog(prevLog => [...prevLog, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setShowSearch(true);
    setChatLog([]);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim() === "") return;
  
    setIsLoading(true);
    try {
      console.log("Initiating search for:", searchQuery);
      const response = await searchArXiv(searchQuery);
      console.log("Search result:", JSON.stringify(response, null, 2));
  
      setChatLog(prevLog => [
        ...prevLog,
        { role: "user", content: `Search: ${searchQuery}` },
        { role: "system", content: "ArXiv API Response:" },
        { role: "system", content: JSON.stringify(response, null, 2) }
      ]);
  
      setArticles([]); // Clear previous articles
      setQdrantResults(null); // Clear previous Qdrant results
    } catch (error) {
      console.error("Error in ArXiv search:", error);
      setChatLog(prevLog => [
        ...prevLog,
        { role: "error", content: `An error occurred during the search: ${error.message}` }
      ]);
    } finally {
      setSearchQuery("");
      setShowSearch(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="sideBar">
        <div className="upperSide">
          <div className="upperSideTop">
            <img src={logo} alt="Logo" className="logo" />
            <span className="brand">sigma</span>
          </div>
          <button className="midBtn" onClick={handleNewChat}>
            <img src={addBtn} alt="new chat" className="addBtn" />
            New Chat
          </button>
          <div className="upperSideBottom">
            <button className="query">
              <img src={msgIcon} alt="Query" />
              What is Programming
            </button>
            <button className="query">
              <img src={msgIcon} alt="Query" />
              How to use an API
            </button>
          </div>
        </div>
        <div className="lowerSide">
          <div className="listItems">
            <img src={home} alt="home" className="listItemsImg" />
            Home
          </div>
          <div className="listItems">
            <img src={saved} alt="saved" className="listItemsImg" />
            Saved
          </div>
          <div className="listItems">
            <img src={rocket} alt="rocket" className="listItemsImg" />
            Upgrade to Super Sigma
          </div>
        </div>
      </div>
      <div className="main">
        <div className="chats">
          {showSearch && (
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Enter your search query"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit">Search</button>
            </form>
          )}
          {chatLog.map((message, index) => (
            <div key={index} className={`chat ${message.role}`}>
              {message.role === 'system' && message.content.startsWith('{') ? (
                <pre className="json-response">
                  <code>{message.content}</code>
                </pre>
              ) : (
                <p className="txt">
                  {message.content}
                </p>
              )}
            </div>
          ))}
          
          {isLoading && <div className="chat loading">Loading...</div>}
          
          {qdrantResults && (
      <div className="qdrant-results">
        <h3>AI-generated answer based on research papers:</h3>
        <p>{qdrantResults.answer}</p>
        <h4>Sources:</h4>
        <ul>
          {qdrantResults.sources.map((source, index) => (
            <li key={index}>{source.payload.title}</li>
          ))}
        </ul>
      </div>
    )}
        </div>
        <div className="chatFooter">
          <div className="inp">
            <input 
              type="text" 
              placeholder="enter a prompt here" 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="send" onClick={handleSend} disabled={isLoading}>
              <img src={sendBtn} alt="send" />
            </button>
          </div>
          <p>sigma may produce incorrect results</p>
        </div>
      </div>
    </div>
  );
}

export default App;