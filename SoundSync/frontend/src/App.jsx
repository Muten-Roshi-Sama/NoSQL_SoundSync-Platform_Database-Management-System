import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
  fetch("http://localhost:8000/")  // backend exposé sur le port 8000
    .then(res => res.text())
    .then(setStatus)
    .catch(() => setStatus("API unreachable"));
}, []);


  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Soundsync Frontend</h1>
      <p>API Status: {status}</p>
    </div>
  );
}

export default App;
