import { useState, useEffect } from 'react'
import './App.css'

interface ApiResponse {
  message: string;
}

function App() {
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    fetch('http://localhost:5000/api/test')
      .then(response => response.json())
      .then((data: ApiResponse) => setMessage(data.message))
      .catch(error => console.error('Error:', error))
  }, [])

  return (
    <div className="App">
      <h1>React + Flask App</h1>
      <p>Message from backend: {message}</p>
    </div>
  )
}

export default App
