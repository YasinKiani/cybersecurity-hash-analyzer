import React from "react";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>پروژه نمایش بصری هش</h3>
          <p>یک ابزار آموزشی برای درک توابع هش، نمایش بصری و امنیت رمز عبور.</p>
        </div>

        <div className="footer-section">
          <h3>طراحی و توسعه توسط</h3>
          <p>یاسین کیانی</p>
        </div>

        <div className="footer-section">
          <h3>تکنولوژی‌ها</h3>
          <ul>
            <li>React</li>
            <li>Node.js</li>
            <li>Express</li>
            <li>Crypto</li>
          </ul>
        </div>
      </div>

      <div className="copyright">
        &copy; {new Date().getFullYear()} یاسین کیانی | پروژه نمایش بصری هش
      </div>
    </footer>
  );
};

export default Footer;
