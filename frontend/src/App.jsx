import React, { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white">
          <h1 className="text-4xl font-bold text-center">Bhetiyo</h1>
          <p className="text-center text-indigo-200 mt-2">
            AI-powered Lost & Found Platform
          </p>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Lost Something?</h2>
                <p className="text-gray-600 mb-4">
                  Post details about your lost item and let our AI find matches for you.
                </p>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                  Post Lost Item
                </button>
              </div>

              <div className="bg-green-50 p-6 rounded-xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Found Something?</h2>
                <p className="text-gray-600 mb-4">
                  Help someone find their lost item by posting what you found.
                </p>
                <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                  Post Found Item
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="bg-purple-50 p-6 rounded-xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">How It Works</h2>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">1</span>
                    <span>Post lost or found items with details</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">2</span>
                    <span>AI matches items based on similarity</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">3</span>
                    <span>Get notified of potential matches</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">4</span>
                    <span>Connect with finders/owners safely</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-6 rounded-xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">AI Features</h2>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Text embedding similarity matching</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Location-based matching</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Smart notification system</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center shadow-sm">
              <div className="text-3xl font-bold text-indigo-600">1000+</div>
              <div className="text-gray-600">Items Recovered</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center shadow-sm">
              <div className="text-3xl font-bold text-green-600">500+</div>
              <div className="text-gray-600">Happy Users</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center shadow-sm">
              <div className="text-3xl font-bold text-purple-600">95%</div>
              <div className="text-gray-600">Match Accuracy</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-6 text-center text-gray-600">
          <p>© 2025 bhetiyo. Helping people reconnect with their lost belongings.</p>
        </div>
      </div>
    </div>
  )
}

export default App