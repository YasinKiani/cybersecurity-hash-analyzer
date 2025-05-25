import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/PasswordCracker.css";
import { API_BASE_URL } from "../config";

const PasswordCracker = () => {
  const [hashValue, setHashValue] = useState("");
  const [algorithm, setAlgorithm] = useState("md5");
  const [method, setMethod] = useState("dictionary");
  const [crackResult, setCrackResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [crackingProgress, setCrackingProgress] = useState(0);
  const progressInterval = useRef(null);
  const [error, setError] = useState(null);
  const [passwordToHash, setPasswordToHash] = useState("");
  const [generatedHash, setGeneratedHash] = useState("");
  const [timeEstimates, setTimeEstimates] = useState(null);
  const [samplePasswords, setSamplePasswords] = useState({});
  const [loadingSamples, setLoadingSamples] = useState({
    low: true,
    medium: true,
    high: true,
    "very-high": true,
    persian: true,
  });
  const [statusMessage, setStatusMessage] = useState("");

  const algorithms = ["md5", "sha1", "sha256", "sha512"];
  const methods = [
    { value: "dictionary", label: "حمله فرهنگ لغت (Dictionary Attack)" },
    { value: "bruteforce", label: "حمله جامع (Brute Force)" },
    { value: "pattern", label: "حمله الگو (Pattern-based)" },
    { value: "hybrid", label: "حمله ترکیبی (Hybrid)" },
    { value: "rainbow", label: "جداول رنگین‌کمان (Rainbow Tables)" },
  ];

  const complexities = [
    { value: "low", label: "ساده (فقط اعداد)", example: "1234" },
    { value: "medium", label: "متوسط (حروف کوچک و اعداد)", example: "abc123" },
    {
      value: "high",
      label: "پیچیده (حروف بزرگ، کوچک و اعداد)",
      example: "Abc123Def",
    },
    {
      value: "very-high",
      label: "بسیار پیچیده (همه کاراکترها)",
      example: "P@s$w0rd!123",
    },
    {
      value: "persian",
      label: "فارسی (حروف فارسی و اعداد)",
      example: "ایران123",
    },
  ];

  // بررسی زمان تخمینی شکستن رمزهای عبور
  useEffect(() => {
    const fetchTimeEstimates = async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/hash/time-estimates`,
          {
            algorithm,
          }
        );

        if (response.data && response.data.data) {
          setTimeEstimates(response.data.data);
        }
      } catch (err) {
        console.error("خطا در دریافت زمان تخمینی:", err);
      }
    };

    fetchTimeEstimates();
  }, [algorithm]);

  // تولید رمزهای عبور نمونه
  const generateSamplePassword = async (complexity) => {
    try {
      setLoadingSamples((prev) => ({ ...prev, [complexity]: true }));

      const response = await axios.post(
        `${API_BASE_URL}/api/hash/sample-password`,
        {
          complexity,
        }
      );

      if (response.data && response.data.data) {
        setSamplePasswords((prev) => ({
          ...prev,
          [complexity]: response.data.data,
        }));
      }
    } catch (err) {
      console.error("خطا در تولید رمز عبور نمونه:", err);
    } finally {
      setLoadingSamples((prev) => ({ ...prev, [complexity]: false }));
    }
  };

  // تولید همه رمزهای عبور نمونه
  useEffect(() => {
    complexities.forEach((complexity) => {
      generateSamplePassword(complexity.value);
    });
  }, []);

  // شکستن رمز عبور
  const crackPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCrackResult(null);
    setCrackingProgress(0);
    setStatusMessage("در حال شروع عملیات شکستن رمز...");

    // شبیه‌سازی نمایش پیشرفت
    progressInterval.current = setInterval(() => {
      setCrackingProgress((prev) => {
        if (prev >= 95) return 95;
        const increment = Math.random() * 5 + 1;
        const newProgress = prev + increment;

        // پیام‌های وضعیت بر اساس میزان پیشرفت
        if (newProgress > 20 && newProgress <= 40) {
          setStatusMessage("در حال بررسی رمزهای عبور رایج...");
        } else if (newProgress > 40 && newProgress <= 60) {
          setStatusMessage("در حال تست ترکیبات مختلف...");
        } else if (newProgress > 60 && newProgress <= 80) {
          setStatusMessage("در حال بررسی الگوهای رایج...");
        } else if (newProgress > 80) {
          setStatusMessage("تکمیل عملیات...");
        }

        return newProgress;
      });
    }, 300);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/hash/crack`, {
        hash: hashValue,
        algorithm,
        method,
      });

      if (response.data && response.data.data) {
        setCrackResult(response.data.data);
        setCrackingProgress(100);
        setStatusMessage("عملیات با موفقیت انجام شد!");
      } else {
        throw new Error("فرمت پاسخ سرور نامعتبر است");
      }
    } catch (err) {
      setError("خطا در شبیه‌سازی شکستن رمز عبور. لطفاً دوباره تلاش کنید.");
      console.error(err);
    } finally {
      setLoading(false);
      clearInterval(progressInterval.current);
    }
  };

  // تولید هش برای رمز عبور
  const generateHashForCracking = async () => {
    if (!passwordToHash) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/api/hash/generate`, {
        text: passwordToHash,
        algorithm,
      });

      if (response.data && response.data.data) {
        setGeneratedHash(response.data.data.hash);
        setHashValue(response.data.data.hash);
      }
    } catch (err) {
      console.error("خطا در تولید هش:", err);
    }
  };

  // فرمت زمان به صورت خوانا
  const formatTime = (seconds) => {
    if (seconds < 0.001) {
      return "آنی";
    } else if (seconds < 1) {
      return `${(seconds * 1000).toFixed(2)} میلی‌ثانیه`;
    } else if (seconds < 60) {
      return `${seconds.toFixed(2)} ثانیه`;
    } else if (seconds < 3600) {
      return `${(seconds / 60).toFixed(2)} دقیقه`;
    } else if (seconds < 86400) {
      return `${(seconds / 3600).toFixed(2)} ساعت`;
    } else if (seconds < 31536000) {
      return `${(seconds / 86400).toFixed(2)} روز`;
    } else {
      return `${(seconds / 31536000).toFixed(2)} سال`;
    }
  };

  return (
    <div className="password-cracker">
      <h2>
        شکستن رمزعبور (Password Cracker)
        <span className="subtitle">پیشرفته</span>
      </h2>
      <p>شبیه‌سازی پیشرفته برای نمایش آسیب‌پذیری رمزهای عبور ضعیف</p>

      <div className="disclaimer">
        <strong>توجه:</strong> این ابزار فقط برای اهداف آموزشی طراحی شده و
        مفاهیم پایه امنیت رمز عبور را نمایش می‌دهد.
      </div>

      <div className="sample-passwords-section">
        <h3>نمونه رمزهای عبور برای آزمایش</h3>
        <p>
          برای آزمایش سرعت شکستن رمزهای مختلف، یکی از نمونه‌ها را انتخاب کنید:
        </p>

        <div className="sample-passwords">
          {complexities.map((complexity) => (
            <div className="sample-password-card" key={complexity.value}>
              <h4>{complexity.label}</h4>
              {loadingSamples[complexity.value] ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                </div>
              ) : samplePasswords[complexity.value] ? (
                <>
                  <p className="sample-password-value">
                    <strong>رمز عبور:</strong>{" "}
                    {samplePasswords[complexity.value].password}
                  </p>
                  <p className="sample-hash-value">
                    <strong>هش {algorithm}:</strong>
                    <span className="hash-text">
                      {samplePasswords[complexity.value].hash}
                    </span>
                  </p>
                  <button
                    onClick={() => {
                      if (!samplePasswords[complexity.value]) return;
                      setHashValue(samplePasswords[complexity.value].hash);
                      setPasswordToHash(
                        samplePasswords[complexity.value].password
                      );
                      setGeneratedHash(samplePasswords[complexity.value].hash);
                    }}
                    className="btn btn-small"
                  >
                    استفاده از این نمونه
                  </button>
                </>
              ) : (
                <div className="error-message">خطا در بارگذاری</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="hash-generator-section">
        <h3>ساخت هش برای شکستن</h3>
        <div className="form-inline">
          <input
            type="text"
            placeholder="رمز عبور خود را وارد کنید..."
            value={passwordToHash}
            onChange={(e) => setPasswordToHash(e.target.value)}
          />
          <button onClick={generateHashForCracking} className="btn btn-small">
            ساخت هش
          </button>
        </div>
        {generatedHash && (
          <div className="generated-hash">
            <p>
              <strong>هش {algorithm.toUpperCase()}:</strong> {generatedHash}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(generatedHash)}
              className="btn-link"
            >
              کپی کردن
            </button>
          </div>
        )}
      </div>

      <form onSubmit={crackPassword} className="crack-form">
        <h3>شکستن هش رمز عبور</h3>

        <div className="form-group">
          <label htmlFor="hashValue">هش رمز عبور برای شکستن:</label>
          <input
            type="text"
            id="hashValue"
            value={hashValue}
            onChange={(e) => setHashValue(e.target.value)}
            required
            placeholder="هش رمز عبور را وارد کنید..."
          />
        </div>

        <div className="form-row">
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
            <label htmlFor="method">روش شکستن:</label>
            <select
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              {methods.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn">
          {loading ? "در حال شکستن..." : "شروع شکستن رمز عبور"}
        </button>
      </form>

      {loading && (
        <div className="cracking-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${crackingProgress}%` }}
            ></div>
          </div>
          <p className="progress-text">
            {statusMessage} ({crackingProgress.toFixed(0)}%)
          </p>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {crackResult && (
        <div
          className={`result ${crackResult.success ? "success" : "failure"}`}
        >
          <h3>
            {crackResult.success
              ? "رمز عبور کشف شد! 🎉"
              : "شکستن ناموفق بود 😕"}
          </h3>

          {crackResult.success && (
            <div className="password-found">
              <p>
                رمز عبور: <strong>{crackResult.password}</strong>
              </p>
            </div>
          )}

          <div className="result-details">
            <div className="detail-item">
              <span className="detail-label">تعداد تلاش‌ها:</span>
              <span className="detail-value">
                {crackResult.attempts.toLocaleString()}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">زمان صرف شده:</span>
              <span className="detail-value">
                {(crackResult.timeTaken / 1000).toFixed(2)} ثانیه
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">روش استفاده شده:</span>
              <span className="detail-value">
                {crackResult.methodLabel ||
                  methods.find((m) => m.value === crackResult.method)?.label ||
                  crackResult.method}
              </span>
            </div>
          </div>

          {crackResult.passwordsChecked &&
            crackResult.passwordsChecked.length > 0 && (
              <div className="passwords-checked">
                <h4>نمونه‌ای از رمزهای عبور بررسی شده:</h4>
                <ul>
                  {crackResult.passwordsChecked.map((pwd, index) => (
                    <li key={index}>{pwd}</li>
                  ))}
                </ul>
              </div>
            )}

          {!crackResult.success && (
            <div className="suggestion">
              <h4>پیشنهادات:</h4>
              <ul>
                <li>روش شکستن دیگری را امتحان کنید</li>
                <li>ممکن است این رمز عبور در پایگاه داده ما موجود نباشد</li>
                <li>
                  اگر رمز عبور پیچیده است، شکستن آن ممکن است زمان بیشتری نیاز
                  داشته باشد
                </li>
              </ul>
            </div>
          )}
        </div>
      )}

      {timeEstimates && (
        <div className="time-estimates">
          <h3>
            تخمین زمان شکستن رمز عبور با الگوریتم {algorithm.toUpperCase()}
          </h3>
          <p>
            این تخمین‌ها بر اساس سخت‌افزار متوسط و با فرض نیمی از فضای جستجو
            محاسبه شده‌اند
          </p>

          <table className="estimates-table">
            <thead>
              <tr>
                <th>پیچیدگی</th>
                <th>نمونه</th>
                <th>زمان تقریبی</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>پایین (فقط اعداد)</td>
                <td>1234</td>
                <td>
                  {timeEstimates?.low
                    ? formatTime(timeEstimates.low.seconds)
                    : "در حال محاسبه..."}
                </td>
              </tr>
              <tr>
                <td>متوسط (حروف کوچک و اعداد)</td>
                <td>abc123</td>
                <td>
                  {timeEstimates?.medium
                    ? formatTime(timeEstimates.medium.seconds)
                    : "در حال محاسبه..."}
                </td>
              </tr>
              <tr>
                <td>بالا (حروف بزرگ، کوچک و اعداد)</td>
                <td>Abc123Def</td>
                <td>
                  {timeEstimates?.high
                    ? formatTime(timeEstimates.high.seconds)
                    : "در حال محاسبه..."}
                </td>
              </tr>
              <tr>
                <td>خیلی بالا (همه کاراکترها)</td>
                <td>P@s$w0rd!123</td>
                <td>
                  {timeEstimates?.["very-high"]
                    ? formatTime(timeEstimates["very-high"].seconds)
                    : "در حال محاسبه..."}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="info-box">
        <h3>روش‌های شکستن رمز عبور</h3>
        <div className="info-content">
          <div className="info-column">
            <h4>حمله فرهنگ لغت (Dictionary Attack)</h4>
            <p>
              این روش با استفاده از لیست کلمات رایج و متداول، رمزهای عبوری که از
              این کلمات استفاده می‌کنند را پیدا می‌کند. بسیار مؤثر علیه رمزهای
              عبور ضعیف و قابل حدس است.
            </p>
          </div>
          <div className="info-column">
            <h4>حمله جامع (Brute Force)</h4>
            <p>
              در این روش، تمام ترکیب‌های ممکن از کاراکترها به صورت منظم آزمایش
              می‌شوند. زمان‌بر است اما نهایتاً هر رمزی را می‌تواند بشکند.
            </p>
          </div>
        </div>

        <div className="info-content">
          <div className="info-column">
            <h4>حمله الگو (Pattern Attack)</h4>
            <p>
              این روش بر اساس الگوهای رایج انتخاب رمز عبور مانند تاریخ‌ها،
              الگوهای صفحه کلید یا دنباله‌های خاص عمل می‌کند.
            </p>
          </div>
          <div className="info-column">
            <h4>جداول رنگین‌کمان (Rainbow Tables)</h4>
            <p>
              استفاده از جداول از پیش‌محاسبه‌شده که هش‌های رمزهای عبور رایج را
              ذخیره می‌کند و امکان جستجوی سریع را فراهم می‌سازد.
            </p>
          </div>
        </div>

        <div className="password-security">
          <h4>نکات امنیتی رمز عبور</h4>
          <ul>
            <li>
              از رمزهای عبور طولانی و پیچیده با ترکیبی از حروف، اعداد و علائم
              استفاده کنید
            </li>
            <li>هرگز رمزهای عبور را در سایت‌های مختلف تکرار نکنید</li>
            <li>از نرم‌افزار مدیریت رمز عبور استفاده کنید</li>
            <li>احراز هویت دو عاملی را در صورت امکان فعال کنید</li>
            <li>رمزهای عبور خود را به طور منظم تغییر دهید</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PasswordCracker;
