import React from 'react';
import {ThemeProvider} from './context/ThemeContext';
import { Outlet } from 'react-router-dom'; // Renders the current page
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Header from './components/Header';
import Footer from './components/Footer'; // Ensure you have this or remove if not
import SupportChatbot from './components/SupportChatbot'; 

// Styles
import './App.css'; // Your specific component styles

const App = () => {
  return (
    <ThemeProvider><div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div role="note" style={{ textAlign: 'center', padding: '8px 16px', background: '#173f35', color: '#fff', fontSize: '13px' }}>
        Portfolio demo · Use sample details only · AI availability depends on the provider · Use Settings for support email
      </div>
      <ToastContainer />
      
      {/* Header controls the Dark Mode toggle */}
      <Header />
      
      {/* Main Content Area */}
      <main className="container py-3" style={{ flex: 1, position: 'relative' }}>
        <Outlet />
      </main>

      {/* Chatbot overlay */}
      <SupportChatbot />

      {/* Footer */}
      <Footer />
    </div></ThemeProvider>
  );
};

export default App;
