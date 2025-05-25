import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HashGenerator from "./components/HashGenerator";
import VisualHash from "./components/VisualHash";
import PasswordCracker from "./components/PasswordCracker";
import HashCollisionDemo from "./components/HashCollisionDemo";
import IdenticonGenerator from "./components/IdenticonGenerator";
import SimilarImageFinder from "./components/SimilarImageFinder";
import Home from "./components/Home";
import "./styles/App.css";

function App() {
  document.documentElement.lang = "fa";
  document.documentElement.dir = "rtl";

  return (
    <Router>
      <div className="App">
        <Header />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hash-generator" element={<HashGenerator />} />
            <Route path="/visual-hash" element={<VisualHash />} />
            <Route path="/password-cracker" element={<PasswordCracker />} />
            <Route path="/hash-collision" element={<HashCollisionDemo />} />
            <Route
              path="/identicon-generator"
              element={<IdenticonGenerator />}
            />
            <Route
              path="/similar-image-finder"
              element={<SimilarImageFinder />}
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
