import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/VisualHash.css";
import { API_BASE_URL } from "../config";

const VisualHash = () => {
  const [hashValue, setHashValue] = useState("");
  const [visualData, setVisualData] = useState(null);
  const [identiconData, setIdenticonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("example");

  // State for embedded avatars
  const [githubSvg, setGithubSvg] = useState("");
  const [gravatarSvg, setGravatarSvg] = useState("");
  const [dicebearSvg, setDicebearSvg] = useState("");

  // Helper functions for SVG generation
  const generateSimpleHash = (text) => {
    let hash = 0;
    if (text.length === 0) return hash;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };

  const createGitHubStyleAvatar = (hash, hue) => {
    const grid = [];
    const gridSize = 5;

    // Create a 5x5 grid with mirror symmetry
    for (let i = 0; i < gridSize; i++) {
      const row = [];
      for (let j = 0; j < Math.ceil(gridSize / 2); j++) {
        const isOn = parseInt(hash.toString()[i * 3 + j] || "0") % 2 === 1;
        row.push(isOn);
      }

      // Apply symmetry
      for (let j = Math.floor(gridSize / 2) - 1; j >= 0; j--) {
        row.push(row[j]);
      }

      grid.push(row);
    }

    // Create SVG
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ${gridSize} ${gridSize}">`;
    svg += `<rect width="${gridSize}" height="${gridSize}" fill="transparent"/>`;

    const color = `hsl(${hue}, 70%, 50%)`;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (grid[i][j]) {
          svg += `<rect x="${j}" y="${i}" width="1" height="1" fill="${color}" />`;
        }
      }
    }

    svg += "</svg>";
    return svg;
  };

  const createGravatarStyleAvatar = (hash, hue) => {
    const color = `hsl(${hue}, 70%, 50%)`;
    const bgColor = `hsl(${hue}, 30%, 90%)`;

    // Create a circular avatar with geometric shapes
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100">`;
    svg += `<circle cx="50" cy="50" r="50" fill="${bgColor}"/>`;

    // Add various shapes based on the hash
    const hashStr = hash.toString();
    const shapeCount = (parseInt(hashStr.substring(0, 2) || "0") % 5) + 3;

    for (let i = 0; i < shapeCount; i++) {
      const x =
        20 + (parseInt(hashStr.substring(i * 2, i * 2 + 2) || "0") % 60);
      const y =
        20 + (parseInt(hashStr.substring(i * 2 + 2, i * 2 + 4) || "0") % 60);
      const shapeSize =
        10 + (parseInt(hashStr.substring(i * 2 + 4, i * 2 + 6) || "0") % 30);

      const shapeType =
        parseInt(hashStr.substring(i * 3, i * 3 + 1) || "0") % 4;

      switch (shapeType) {
        case 0:
          svg += `<circle cx="${x}" cy="${y}" r="${
            shapeSize / 2
          }" fill="${color}" opacity="0.7"/>`;
          break;
        case 1:
          svg += `<rect x="${x - shapeSize / 2}" y="${
            y - shapeSize / 2
          }" width="${shapeSize}" height="${shapeSize}" fill="${color}" opacity="0.7"/>`;
          break;
        case 2:
          svg += `<polygon points="${x},${y - shapeSize / 2} ${
            x + shapeSize / 2
          },${y + shapeSize / 2} ${x - shapeSize / 2},${
            y + shapeSize / 2
          }" fill="${color}" opacity="0.7"/>`;
          break;
        case 3:
          svg += `<ellipse cx="${x}" cy="${y}" rx="${shapeSize / 2}" ry="${
            shapeSize / 3
          }" fill="${color}" opacity="0.7"/>`;
          break;
        default:
        // Do nothing
      }
    }

    svg += "</svg>";
    return svg;
  };

  const createDicebearStyleAvatar = (hash, hue) => {
    const color = `hsl(${hue}, 70%, 50%)`;
    const bgColor = `hsl(${hue}, 20%, 95%)`;

    // Create a 4x4 grid for a pixel avatar
    const grid = [];
    const gridSize = 4;
    const hashStr = hash.toString();

    // Create a grid with mirror symmetry
    for (let i = 0; i < gridSize; i++) {
      const row = [];
      for (let j = 0; j < Math.ceil(gridSize / 2); j++) {
        const isOn = parseInt(hashStr[i * 3 + j] || "0") % 2 === 1;
        row.push(isOn);
      }

      // Apply symmetry
      for (
        let j = Math.ceil(gridSize / 2) - 1 - (gridSize % 2 === 0 ? 1 : 0);
        j >= 0;
        j--
      ) {
        row.push(row[j]);
      }

      grid.push(row);
    }

    // Create SVG
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ${gridSize} ${gridSize}">`;
    svg += `<rect width="${gridSize}" height="${gridSize}" fill="${bgColor}"/>`;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (grid[i][j]) {
          svg += `<rect x="${j}" y="${i}" width="1" height="1" fill="${color}" />`;
        }
      }
    }

    svg += "</svg>";
    return svg;
  };

  // Update SVG avatars when input text changes
  useEffect(() => {
    const hash = generateSimpleHash(inputText);
    const colorHue = parseInt(hash.toString().substring(0, 3)) % 360;

    setGithubSvg(createGitHubStyleAvatar(hash, colorHue));
    setGravatarSvg(createGravatarStyleAvatar(hash, colorHue));
    setDicebearSvg(createDicebearStyleAvatar(hash, colorHue));
  }, [inputText]);

  const visualizeHash = async () => {
    if (!hashValue.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/hash/visual`, {
        hash: hashValue,
      });

      setVisualData(response.data.data);

      // Simulate the backend identicon generation
      const hash = hashValue;
      const size = 5;
      const grid = Array(size)
        .fill()
        .map(() => Array(size).fill(false));

      // Use first 15 characters of hash
      for (let i = 0; i < Math.min(hash.length, 15); i++) {
        const value = parseInt(hash.charAt(i), 16) % 2 === 1;
        const row = Math.floor(i / 3);
        const col = i % 3;

        if (row < size && col < Math.ceil(size / 2)) {
          grid[row][col] = value;
          grid[row][size - col - 1] = value;
        }
      }

      const bgcolor = "#" + hash.substring(0, 6);

      setIdenticonData({
        grid,
        size,
        bgcolor,
        hash,
      });
    } catch (error) {
      console.error("خطا در نمایش بصری هش:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate a hash if none is provided
  useEffect(() => {
    if (!hashValue) {
      setHashValue("5f4dcc3b5aa765d61d8327deb882cf99"); // Default hash (MD5 of "password")
    }
  }, [hashValue]);

  return (
    <div className="visual-hash">
      <h2>هش بصری</h2>
      <p>نمایش چگونگی نمایش بصری مقادیر هش</p>

      <div className="input-section">
        <div className="form-group">
          <label htmlFor="hashValue">یک مقدار هش وارد کنید:</label>
          <input
            type="text"
            id="hashValue"
            value={hashValue}
            onChange={(e) => setHashValue(e.target.value)}
            placeholder="هش MD5، SHA-1 یا SHA-256 را وارد کنید..."
          />
        </div>
        <button onClick={visualizeHash} disabled={loading} className="btn">
          {loading ? "در حال نمایش..." : "نمایش بصری هش"}
        </button>
      </div>

      {visualData && (
        <div className="visualizations">
          <div className="visualization-card">
            <h3>نمایش شبکه رنگی</h3>
            <div
              className="color-grid"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${visualData.gridSize}, 1fr)`,
              }}
            >
              {visualData.colors.map((color, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: color,
                    width: "20px",
                    height: "20px",
                  }}
                ></div>
              ))}
            </div>
            <p>هر سلول از ۶ کاراکتر هگزادسیمال هش مشتق می‌شود</p>
          </div>

          {identiconData && (
            <div className="visualization-card">
              <h3>نمایش آیکون شناسایی</h3>
              <div
                className="identicon"
                style={{ backgroundColor: identiconData.bgcolor + "22" }}
              >
                <div
                  className="identicon-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${identiconData.size}, 1fr)`,
                  }}
                >
                  {identiconData.grid.map((row, i) =>
                    row.map((cell, j) => (
                      <div
                        key={`${i}-${j}`}
                        style={{
                          backgroundColor: cell
                            ? identiconData.bgcolor
                            : "transparent",
                          width: "30px",
                          height: "30px",
                        }}
                      ></div>
                    ))
                  )}
                </div>
              </div>
              <p>الگویی متقارن که از بیت‌های هش تولید می‌شود</p>
            </div>
          )}
        </div>
      )}

      <div className="info-section">
        <h3>درباره هش‌های بصری</h3>
        <p>
          نمایش‌های بصری هش به انسان‌ها کمک می‌کند تا مقادیر هش متفاوت را تشخیص
          دهند و از هم متمایز کنند. این الگوهای بصری می‌توانند تشخیص تغییرات
          داده را آسان‌تر کنند، زیرا حتی یک تغییر کوچک در ورودی منجر به هش
          کاملاً متفاوتی (و در نتیجه الگوی بصری متفاوت) می‌شود.
        </p>
        <p>کاربردهای رایج شامل:</p>
        <ul>
          <li>آیکون‌های شناسایی سبک گیت‌هاب برای پروفایل‌های کاربران</li>
          <li>تأیید بصری کلیدهای رمزنگاری</li>
          <li>بررسی سریع یکپارچگی فایل‌های دانلود شده</li>
          <li>ابزارهای آموزشی برای درک توابع هش</li>
        </ul>
      </div>

      <div className="identicon-examples">
        <h3>نمونه‌های مختلف آواتارهای مبتنی بر هش</h3>
        <div className="examples-container">
          <div className="example-item">
            <div className="example-image">
              <img
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23f0f0f0'/%3E%3Cg transform='translate(16,16)'%3E%3Crect x='0' y='0' width='10' height='10' fill='%23333'/%3E%3Crect x='10' y='0' width='10' height='10' fill='%23333'/%3E%3Crect x='30' y='0' width='10' height='10' fill='%23333'/%3E%3Crect x='40' y='0' width='10' height='10' fill='%23333'/%3E%3Crect x='0' y='10' width='10' height='10' fill='%23333'/%3E%3Crect x='40' y='10' width='10' height='10' fill='%23333'/%3E%3Crect x='10' y='20' width='10' height='10' fill='%23333'/%3E%3Crect x='30' y='20' width='10' height='10' fill='%23333'/%3E%3Crect x='0' y='30' width='10' height='10' fill='%23333'/%3E%3Crect x='40' y='30' width='10' height='10' fill='%23333'/%3E%3Crect x='0' y='40' width='10' height='10' fill='%23333'/%3E%3Crect x='10' y='40' width='10' height='10' fill='%23333'/%3E%3Crect x='30' y='40' width='10' height='10' fill='%23333'/%3E%3Crect x='40' y='40' width='10' height='10' fill='%23333'/%3E%3C/g%3E%3C/svg%3E"
                alt="نمونه آواتار گیت‌هاب"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' fill='%23ddd'/%3E%3Ctext x='12' y='16' font-size='10' fill='%23333' text-anchor='middle'%3EGH%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
            <div className="example-info">
              <h4>گیت‌هاب (GitHub)</h4>
              <p>آواتارهای پیش‌فرض گیت‌هاب با الگوریتم اختصاصی ساخته می‌شوند</p>
            </div>
          </div>

          {/* نمونه گراواتار با تصویر جایگزین داخلی */}
          <div className="example-item">
            <div className="example-image">
              <img
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%239b59b6' fill-opacity='0.2'/%3E%3Cg transform='scale(0.5) translate(40, 40)'%3E%3Ccircle cx='40' cy='40' r='40' fill='%239b59b6' fill-opacity='0.7'/%3E%3Cpath d='M30,25 L50,25 L40,55 Z' fill='white'/%3E%3Ccircle cx='30' cy='35' r='5' fill='white'/%3E%3Ccircle cx='50' cy='35' r='5' fill='white'/%3E%3C/g%3E%3C/svg%3E"
                alt="نمونه آواتار گراواتار"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%239b59b6' fill-opacity='0.2'/%3E%3Cg transform='scale(0.5) translate(40, 40)'%3E%3Ccircle cx='40' cy='40' r='40' fill='%239b59b6' fill-opacity='0.7'/%3E%3Cpath d='M30,25 L50,25 L40,55 Z' fill='white'/%3E%3Ccircle cx='30' cy='35' r='5' fill='white'/%3E%3Ccircle cx='50' cy='35' r='5' fill='white'/%3E%3C/g%3E%3C/svg%3E`;
                }}
              />
            </div>
            <div className="example-info">
              <h4>گراواتار (Gravatar)</h4>
              <p>سیستم جهانی آواتار که توسط سرویس Automattic ارائه می‌شود</p>
            </div>
          </div>

          {/* نمونه دایس‌بیر با تصویر جایگزین داخلی */}
          <div className="example-item">
            <div className="example-image">
              <img
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%232ecc71' fill-opacity='0.2'/%3E%3Cg transform='scale(0.8) translate(10, 10)'%3E%3Crect x='10' y='10' width='15' height='15' fill='%232ecc71'/%3E%3Crect x='55' y='10' width='15' height='15' fill='%232ecc71'/%3E%3Crect x='25' y='25' width='15' height='15' fill='%232ecc71'/%3E%3Crect x='40' y='25' width='15' height='15' fill='%232ecc71'/%3E%3Crect x='10' y='40' width='15' height='15' fill='%232ecc71'/%3E%3Crect x='55' y='40' width='15' height='15' fill='%232ecc71'/%3E%3Crect x='25' y='55' width='15' height='15' fill='%232ecc71'/%3E%3Crect x='40' y='55' width='15' height='15' fill='%232ecc71'/%3E%3C/g%3E%3C/svg%3E"
                alt="نمونه آواتار دایس‌بیر"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%232ecc71' fill-opacity='0.2'/%3E%3Cg transform='scale(0.8) translate(10, 10)'%3E%3Crect x='10' y='10' width='15' height='15' fill='%232ecc71'/%3E%3Crect x='55' y='10' width='15' height='15' fill='%232ecc71'/%3E%3Crect x='25' y='25' width='15' height='15' fill='%232ecc71'/%3E%3Crect x='40' y='25' width='15' height='15' fill='%232ecc71'/%3E%3Crect x='10' y='40' width='15' height='15' fill='%232ecc71'/%3E%3Crect x='55' y='40' width='15' height='15' fill='%232ecc71'/%3E%3Crect x='25' y='55' width='15' height='15' fill='%232ecc71'/%3E%3Crect x='40' y='55' width='15' height='15' fill='%232ecc71'/%3E%3C/g%3E%3C/svg%3E`;
                }}
              />
            </div>
            <div className="example-info">
              <h4>دایس‌بیر (DiceBear)</h4>
              <p>کتابخانه متن‌باز برای تولید آواتارهای سازگار با SVG</p>
            </div>
          </div>
        </div>

        {/* بخش نمایش آنلاین و تعاملی */}
        <div className="online-avatars-section">
          <h4>سرویس‌های آنلاین آواتار</h4>
          <p>
            در اینجا نمونه‌هایی از سرویس‌های آنلاین آواتار مبتنی بر هش نمایش
            داده می‌شود:
          </p>

          <div className="online-avatar-grid">
            <div className="online-avatar-item">
              <div className="online-avatar-image">
                <img
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23333'/%3E%3Cpath d='M50,25 C37.85,25 28,34.85 28,47 C28,56.55 34.15,64.75 42.8,67.85 C43.75,68.05 44.1,67.45 44.1,66.95 C44.1,66.5 44.1,64.95 44.1,62.95 C38,64.15 36.95,58.85 36.95,58.85 C36.15,55.85 34.85,54.75 34.85,54.75 C33.25,53.55 35,53.55 35,53.55 C36.85,53.7 37.85,56 37.85,56 C39.5,59.85 42.35,58.85 44.15,58.35 C44.35,56.85 44.95,55.85 45.5,55.35 C40.5,54.85 35.35,52.85 35.35,44.35 C35.35,41.65 36.05,39.5 37.9,37.8 C37.65,37.3 36.95,35.15 38.15,32.15 C38.15,32.15 40.15,31.65 44.15,34.5 C45.95,34.05 47.95,33.85 49.95,33.85 C51.95,33.85 53.95,34.05 55.75,34.5 C59.75,31.65 61.75,32.15 61.75,32.15 C62.95,35.15 62.25,37.3 62,37.8 C63.85,39.5 64.55,41.65 64.55,44.35 C64.55,52.85 59.4,54.85 54.4,55.35 C55.1,55.95 55.75,57.15 55.75,59.05 C55.75,61.95 55.75,66.35 55.75,66.95 C55.75,67.45 56.1,68.05 57.05,67.85 C65.7,64.8 71.85,56.55 71.85,47 C71.85,34.85 62,25 49.85,25 z' fill='white'/%3E%3C/svg%3E"
                  alt="لوگوی گیت‌هاب"
                />
              </div>
              <h5>گیت‌هاب (GitHub)</h5>
            </div>

            <div className="online-avatar-item">
              <div className="online-avatar-image">
                <img
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%233C5A99'/%3E%3Ctext x='50' y='65' font-size='60' text-anchor='middle' fill='white' font-family='Arial, sans-serif' font-weight='bold'%3EG%3C/text%3E%3C/svg%3E"
                  alt="لوگوی گراواتار"
                />
              </div>
              <h5>گراواتار (Gravatar)</h5>
            </div>

            <div className="online-avatar-item">
              <div className="online-avatar-image">
                <img
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%232ecc71'/%3E%3Cg transform='translate(15,15)'%3E%3Crect x='5' y='5' width='15' height='15' fill='white'/%3E%3Crect x='50' y='5' width='15' height='15' fill='white'/%3E%3Crect x='20' y='25' width='15' height='15' fill='white'/%3E%3Crect x='35' y='25' width='15' height='15' fill='white'/%3E%3Crect x='5' y='45' width='15' height='15' fill='white'/%3E%3Crect x='50' y='45' width='15' height='15' fill='white'/%3E%3Crect x='20' y='65' width='15' height='15' fill='white'/%3E%3Crect x='35' y='65' width='15' height='15' fill='white'/%3E%3C/g%3E%3C/svg%3E"
                  alt="لوگوی دایس‌بیر"
                />
              </div>
              <h5>دایس‌بیر (DiceBear)</h5>
            </div>
          </div>
        </div>

        {/* بخش تولید آواتارها با کد SVG داخلی - FIXED VERSION */}
        <div className="embedded-examples">
          <h4>نمونه‌های تعاملی داخلی</h4>
          <p>با تغییر متن، آواتارهای هش متفاوتی را مشاهده کنید:</p>

          <div className="embedded-container">
            <div className="input-container">
              <input
                type="text"
                className="embedded-input"
                placeholder="متن یا ایمیل خود را وارد کنید..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value || "example")}
              />
            </div>

            <div className="avatars-container">
              <div className="avatar-demo">
                <div
                  className="embedded-avatar github-style"
                  dangerouslySetInnerHTML={{ __html: githubSvg }}
                />
                <span>گیت‌هاب</span>
              </div>

              <div className="avatar-demo">
                <div
                  className="embedded-avatar gravatar-style"
                  dangerouslySetInnerHTML={{ __html: gravatarSvg }}
                />
                <span>گراواتار</span>
              </div>

              <div className="avatar-demo">
                <div
                  className="embedded-avatar dicebear-style"
                  dangerouslySetInnerHTML={{ __html: dicebearSvg }}
                />
                <span>دایس‌بیر</span>
              </div>
            </div>
          </div>
        </div>

        <div className="example-description">
          <p>
            هر یک از این سرویس‌ها روش‌های متفاوتی برای تبدیل هش به تصویر دارند.
            برخی از آن‌ها از الگوریتم‌های پیچیده‌تر و برخی از روش‌های ساده‌تر
            استفاده می‌کنند، اما همه آن‌ها هدف مشترکی دارند: تولید تصاویر
            منحصربه‌فرد و قابل بازتولید برای شناسه‌های مختلف.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VisualHash;
