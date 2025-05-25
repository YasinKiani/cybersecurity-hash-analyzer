import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/IdenticonGenerator.css";
import { API_BASE_URL } from "../config";

const IdenticonGenerator = () => {
  const [input, setInput] = useState("yasinkiani@example.com");
  const [hash, setHash] = useState("");
  const [algorithm, setAlgorithm] = useState("md5");
  const [size, setSize] = useState(5);
  const [identiconScale, setIdenticonScale] = useState(10);
  const [mainColor, setMainColor] = useState("#3498db");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [identiconGrid, setIdenticonGrid] = useState([]);
  const canvasRef = useRef(null);

  // الگوریتم‌های هش
  const algorithms = ["md5", "sha1", "sha256"];

  // اندازه‌های آواتار
  const sizes = [
    { value: 3, label: "کوچک (3×3)" },
    { value: 5, label: "متوسط (5×5)" },
    { value: 7, label: "بزرگ (7×7)" },
    { value: 9, label: "خیلی بزرگ (9×9)" },
  ];

  // تولید هش برای ورودی
  useEffect(() => {
    const generateHash = async () => {
      if (!input) return;

      try {
        const response = await axios.post(`${API_BASE_URL}/api/hash/generate`, {
          text: input,
          algorithm,
        });

        setHash(response.data.data.hash);
      } catch (error) {
        console.error("خطا در تولید هش:", error);
      }
    };

    generateHash();
  }, [input, algorithm]);

  // تولید شبکه آواتار بر اساس هش
  useEffect(() => {
    if (!hash) return;

    // ایجاد شبکه با اندازه مشخص شده
    const grid = Array(size)
      .fill()
      .map(() => Array(size).fill(false));

    // محاسبه تعداد ستون‌های نیاز به پر شدن (نصف شبکه به دلیل تقارن)
    const columnsToFill = Math.ceil(size / 2);

    // مقدار هر سلول بر اساس کاراکترهای هش تعیین می‌شود
    for (let i = 0; i < size * columnsToFill; i++) {
      if (i >= hash.length) break;

      // تبدیل کاراکتر هگز به عدد و بررسی زوج یا فرد بودن
      const value = parseInt(hash.charAt(i % hash.length), 16) % 2 === 1;
      const row = Math.floor(i / columnsToFill);
      const col = i % columnsToFill;

      if (row < size && col < columnsToFill) {
        grid[row][col] = value;

        // اعمال تقارن - مقدار مشابه در سمت راست
        if (col < Math.floor(size / 2)) {
          grid[row][size - col - 1] = value;
        }
      }
    }

    setIdenticonGrid(grid);
  }, [hash, size]);

  // رسم آواتار در کانوس برای ذخیره
  useEffect(() => {
    if (!identiconGrid.length || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const cellSize = identiconScale;
    const totalSize = size * cellSize;

    // تنظیم اندازه کانوس
    canvas.width = totalSize;
    canvas.height = totalSize;

    // رسم پس‌زمینه
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, totalSize, totalSize);

    // رسم شبکه
    identiconGrid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell) {
          ctx.fillStyle = mainColor;
          ctx.fillRect(
            colIndex * cellSize,
            rowIndex * cellSize,
            cellSize,
            cellSize
          );
        }
      });
    });
  }, [identiconGrid, mainColor, backgroundColor, identiconScale, size]);

  // دریافت هش تصادفی
  const generateRandomInput = () => {
    const randomString =
      Math.random().toString(36).substring(2, 10) +
      Math.random().toString(36).substring(2, 10);
    setInput(randomString);
  };

  // ذخیره آواتار به صورت تصویر
  const saveIdenticon = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const image = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = image;
    link.download = `identicon-${input.substring(0, 10)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="identicon-generator">
      <h2>تولید آواتار بر اساس هش</h2>
      <p>ایجاد آواتار یکتا و بصری با استفاده از الگوریتم‌های هش</p>

      <div className="identicon-container">
        <div className="input-section">
          <div className="form-group">
            <label htmlFor="input">متن یا ایمیل:</label>
            <input
              type="text"
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="متن یا ایمیل خود را وارد کنید..."
            />
            <button
              className="btn random-btn"
              onClick={generateRandomInput}
              title="تولید متن تصادفی"
            >
              تصادفی
            </button>
          </div>

          <div className="options-container">
            <div className="form-group">
              <label htmlFor="algorithm">الگوریتم هش:</label>
              <select
                id="algorithm"
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
              >
                {algorithms.map((algo) => (
                  <option key={algo} value={algo}>
                    {algo.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="size">اندازه شبکه:</label>
              <select
                id="size"
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
              >
                {sizes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="scale">مقیاس (برای ذخیره):</label>
              <input
                type="range"
                id="scale"
                min="5"
                max="30"
                value={identiconScale}
                onChange={(e) => setIdenticonScale(parseInt(e.target.value))}
              />
              <span className="scale-value">{identiconScale}px</span>
            </div>

            <div className="color-options">
              <div className="form-group">
                <label htmlFor="mainColor">رنگ اصلی:</label>
                <input
                  type="color"
                  id="mainColor"
                  value={mainColor}
                  onChange={(e) => setMainColor(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="backgroundColor">رنگ پس‌زمینه:</label>
                <input
                  type="color"
                  id="backgroundColor"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                />
              </div>
            </div>
          </div>

          {hash && (
            <div className="hash-display">
              <p>
                <strong>هش {algorithm.toUpperCase()}:</strong>
              </p>
              <code>{hash}</code>
            </div>
          )}

          <button className="btn save-btn" onClick={saveIdenticon}>
            ذخیره آواتار
          </button>

          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>

        <div className="preview-section">
          <h3>پیش‌نمایش آواتار</h3>
          <div
            className="identicon-preview"
            style={{
              backgroundColor: backgroundColor,
              padding: size > 5 ? "10px" : "15px",
            }}
          >
            {identiconGrid.length > 0 && (
              <div
                className="identicon-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${size}, 1fr)`,
                  gap: Math.max(1, Math.floor(40 / size)) + "px",
                }}
              >
                {identiconGrid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={
                        cell ? "identicon-cell filled" : "identicon-cell empty"
                      }
                      style={{
                        width: `${Math.max(3, Math.floor(200 / size))}px`,
                        height: `${Math.max(3, Math.floor(200 / size))}px`,
                        backgroundColor: cell ? mainColor : "transparent",
                      }}
                    ></div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="examples">
            <h4>مثال‌های دیگر:</h4>
            <div className="example-identicons">
              <div className="example-identicon">
                <div
                  className="example-preview"
                  style={{ backgroundColor: "#e74c3c22" }}
                >
                  <img
                    src="https://github.com/github.png"
                    alt="GitHub Identicon Example"
                  />
                </div>
                <span>گیت‌هاب</span>
              </div>
              <div className="example-identicon">
                <div
                  className="example-preview"
                  style={{ backgroundColor: "#9b59b622" }}
                >
                  <img
                    src="https://secure.gravatar.com/avatar/00000000000000000000000000000000?d=identicon"
                    alt="Gravatar Identicon Example"
                  />
                </div>
                <span>گراواتار</span>
              </div>
              <div className="example-identicon">
                <div
                  className="example-preview"
                  style={{ backgroundColor: "#2ecc7122" }}
                >
                  <img
                    src="https://avatars.dicebear.com/api/identicon/example.svg"
                    alt="Dicebear Identicon Example"
                  />
                </div>
                <span>دایس‌بیر</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="how-it-works">
        <h3>آواتارهای مبتنی بر هش چگونه کار می‌کنند؟</h3>
        <div className="process-steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>ایجاد هش</h4>
              <p>
                ابتدا متن ورودی (مانند آدرس ایمیل) با یک الگوریتم هش (مثل MD5)
                هش می‌شود تا یک رشته منحصربه‌فرد به دست آید.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>تبدیل به شبکه</h4>
              <p>
                هش تولید شده به یک شبکه دوبعدی از پیکسل‌های روشن و خاموش تبدیل
                می‌شود. معمولاً از هر کاراکتر هش برای تعیین روشن یا خاموش بودن
                پیکسل استفاده می‌شود.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>اعمال تقارن</h4>
              <p>
                برای ایجاد شکلی زیباتر، تقارن افقی اعمال می‌شود تا آواتار نهایی
                منظم‌تر به نظر برسد.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>انتخاب رنگ</h4>
              <p>
                اغلب از هش برای انتخاب رنگ نیز استفاده می‌شود تا آواتار
                منحصربه‌فرد باشد. برای یک ورودی یکسان، همیشه آواتار یکسانی تولید
                می‌شود.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="info-box">
        <h3>کاربردهای آواتارهای مبتنی بر هش</h3>
        <ul>
          <li>
            <strong>شناسایی بصری کاربران:</strong> به کاربران کمک می‌کند تا حساب
            خود را سریعاً شناسایی کنند
          </li>
          <li>
            <strong>نمایش پیش‌فرض:</strong> برای کاربرانی که عکس پروفایل آپلود
            نکرده‌اند
          </li>
          <li>
            <strong>نمایش نام‌های مستعار:</strong> در پلتفرم‌های بلاکچین برای
            نمایش بصری آدرس‌ها
          </li>
          <li>
            <strong>تأیید یکپارچگی:</strong> برای تأیید بصری هش‌های کلیدهای
            عمومی
          </li>
        </ul>
        <p>
          <strong>نکته: </strong>
          از این آواتارها می‌توان برای تشخیص سریع تغییرات در داده استفاده کرد.
          حتی یک تغییر کوچک در متن ورودی منجر به تولید آواتاری کاملاً متفاوت
          می‌شود.
        </p>
      </div>
    </div>
  );
};

export default IdenticonGenerator;
