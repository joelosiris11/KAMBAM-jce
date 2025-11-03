import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import { KanbanProvider } from './context/KanbanContext'
import App from './App'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <KanbanProvider>
      <App />
    </KanbanProvider>
  </AuthProvider>
)

