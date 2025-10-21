import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AdminUsers from "./pages/AdminUsers"; // ⚠️ tu créeras ce fichier ensuite
import "./App.css";

function Home() {
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    fetch("http://localhost:8000/") // backend exposé sur le port 8000
      .then((res) => res.text())
      .then(setStatus)
      .catch(() => setStatus("API unreachable"));
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Soundsync Frontend</h1>
      <p>API Status: {status}</p>
      <Link to="/admin/users" style={{ color: "blue", textDecoration: "underline" }}>
        Aller à la gestion des utilisateurs
      </Link>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Routes>
    </Router>
  );
}

export default App;
