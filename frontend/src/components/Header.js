import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Header.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        !event.target.closest(".nav") &&
        !event.target.closest(".mobile-menu-button")
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Prevent body scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-top">
          <div className="logo">
            <h1>نمایش بصری هش</h1>
            <p>MD5, SHA-1, SHA-256 | طراحی شده توسط یاسین کیانی</p>
          </div>
          <button
            className={`mobile-menu-button ${isMenuOpen ? "active" : ""}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="منوی اصلی"
          >
            <span className="menu-icon"></span>
            <span className="menu-icon"></span>
            <span className="menu-icon"></span>
          </button>
        </div>

        <div
          className={`overlay ${isMenuOpen ? "active" : ""}`}
          onClick={() => setIsMenuOpen(false)}
        ></div>

        <nav className={`nav ${isMenuOpen ? "open" : ""}`}>
          <ul>
            <li>
              <Link
                to="/"
                className={location.pathname === "/" ? "active" : ""}
              >
                صفحه اصلی
              </Link>
            </li>
            <li>
              <Link
                to="/hash-generator"
                className={
                  location.pathname === "/hash-generator" ? "active" : ""
                }
              >
                ساخت هش
              </Link>
            </li>
            <li>
              <Link
                to="/visual-hash"
                className={location.pathname === "/visual-hash" ? "active" : ""}
              >
                هش بصری
              </Link>
            </li>
            <li>
              <Link
                to="/password-cracker"
                className={
                  location.pathname === "/password-cracker" ? "active" : ""
                }
              >
                شکستن رمز عبور
              </Link>
            </li>
            <li>
              <Link
                to="/hash-collision"
                className={
                  location.pathname === "/hash-collision" ? "active" : ""
                }
              >
                نمایش برخورد هش
              </Link>
            </li>
            <li>
              <Link
                to="/identicon-generator"
                className={
                  location.pathname === "/identicon-generator" ? "active" : ""
                }
              >
                تولید آواتار
              </Link>
            </li>
            <li>
              <Link
                to="/similar-image-finder"
                className={
                  location.pathname === "/similar-image-finder" ? "active" : ""
                }
              >
                پیدا کردن تصاویر مشابه
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
