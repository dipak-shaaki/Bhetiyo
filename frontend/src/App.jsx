import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Stats from './components/Stats';
import ItemForm from './components/ItemForm';
import SignInPage from './components/SignInPage';
import SignUpPage from './components/SignUpPage';
import DashboardPage from './components/DashboardPage';
import ItemDetailPage from './components/ItemDetailPage';
import EditItemPage from './components/EditItemPage';
import './App.css';

// Wrapper component to ensure ThemeProvider is available in all routes
const AppContent = () => {
  const [activeTab, setActiveTab] = useState('lost');

  const handleFormSubmit = (itemData) => {
    // In a real app, you might want to update a global state or refresh the items list
    console.log('Item created:', itemData);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex flex-col">
      <Navbar />

      <Routes>
        <Route path="/" element={
          <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  AI-Powered Lost & Found Platform
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Report lost or found items and let our AI match them automatically
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-600">
                <div className="bg-gray-900 dark:bg-gray-800 p-6">
                  <h2 className="text-2xl font-bold text-white text-center">
                    {activeTab === 'lost' ? 'Report Lost Item' : 'Report Found Item'}
                  </h2>
                </div>

                <div className="p-6">
                  <div className="flex justify-center mb-6">
                    <div className="inline-flex rounded-md shadow-sm" role="group">
                      <button
                        type="button"
                        className={`px-6 py-3 text-sm font-medium rounded-l-lg transition-colors duration-200 ${activeTab === 'lost'
                          ? 'bg-black dark:bg-white text-white dark:text-black'
                          : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500'
                          }`}
                        onClick={() => setActiveTab('lost')}
                      >
                        Lost Item
                      </button>
                      <button
                        type="button"
                        className={`px-6 py-3 text-sm font-medium rounded-r-lg transition-colors duration-200 ${activeTab === 'found'
                          ? 'bg-black dark:bg-white text-white dark:text-black'
                          : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500'
                          }`}
                        onClick={() => setActiveTab('found')}
                      >
                        Found Item
                      </button>
                    </div>
                  </div>

                  {/* ItemForm no longer needs isLoggedIn prop */}
                  <ItemForm activeTab={activeTab} onSubmit={handleFormSubmit} />
                </div>
              </div>

              <Stats />
            </div>
          </main>
        } />

        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/items/:id" element={<ItemDetailPage />} />
        <Route path="/items/:id/edit" element={<EditItemPage />} />
      </Routes>

      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Router>
  );
}

export default App;