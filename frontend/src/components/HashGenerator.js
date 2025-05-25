import React, { useState } from "react";
import axios from "axios";
import "../styles/HashGenerator.css";
import { API_BASE_URL } from "../config";

const HashGenerator = () => {
  const [inputText, setInputText] = useState("");
  const [algorithm, setAlgorithm] = useState("md5");
  const [hashResult, setHashResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const algorithms = ["md5", "sha1", "sha256", "sha512"];

  const generateHash = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/hash/generate`,
        {
          text: inputText,
          algorithm,
        },
        { timeout: 10000 }
      );

      if (response.data && response.data.data) {
        setHashResult(response.data.data);
      } else {
        throw new Error("فرمت پاسخ سرور نامعتبر است");
      }
    } catch (err) {
      console.error("خطا در تولید هش:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "خطا در اتصال به سرور. لطفاً بررسی کنید که سرور بک‌اند در حال اجرا باشد."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (hashResult?.hash) {
      navigator.clipboard.writeText(hashResult.hash);
      alert("هش در کلیپ‌بورد ذخیره شد!");
    }
  };

  return (
    <div className="hash-generator">
      <h2>تولیدکننده هش</h2>
      <p>تولید مقادیر هش با استفاده از الگوریتم‌های مختلف</p>

      <form onSubmit={generateHash}>
        <div className="form-group">
          <label htmlFor="inputText">متن مورد نظر برای تولید هش:</label>
          <textarea
            id="inputText"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            required
            placeholder="متن خود را وارد کنید..."
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="algorithm">انتخاب الگوریتم هش:</label>
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

        <button type="submit" disabled={loading} className="btn">
          {loading ? "در حال تولید..." : "تولید هش"}
        </button>
      </form>

      {error && (
        <div className="error">
          <p>{error}</p>
          <p>
            نکته: مطمئن شوید سرور بک‌اند روی پورت 5005 در حال اجراست یا پورت را
            در فایل config.js به‌روزرسانی کنید
          </p>
        </div>
      )}

      {hashResult && (
        <div className="result">
          <h3>نتیجه هش:</h3>
          <div className="hash-box">
            <p>{hashResult.hash}</p>
            <button onClick={copyToClipboard} className="copy-btn">
              کپی
            </button>
          </div>
          <div className="result-details">
            <p>
              <strong>الگوریتم:</strong> {hashResult.algorithm.toUpperCase()}
            </p>
            <p>
              <strong>طول:</strong> {hashResult.hash.length} کاراکتر
            </p>
          </div>
        </div>
      )}

      <div className="info-box">
        <h3>درباره {algorithm.toUpperCase()}</h3>
        {algorithm === "md5" && (
          <p>
            MD5 یک مقدار هش ۱۲۸ بیتی (۱۶ بایت) تولید می‌کند. این الگوریتم توسط
            رونالد ریوست در سال ۱۹۹۱ طراحی شد و به دلیل آسیب‌پذیری در برابر
            تصادم، دیگر برای اهداف رمزنگاری امن محسوب نمی‌شود.
          </p>
        )}
        {algorithm === "sha1" && (
          <p>
            SHA-1 یک مقدار هش ۱۶۰ بیتی (۲۰ بایت) تولید می‌کند. این الگوریتم توسط
            NSA توسعه یافته است، اما به دلیل آسیب‌پذیری‌های تئوری، دیگر برای
            کاربردهای امنیتی توصیه نمی‌شود.
          </p>
        )}
        {algorithm === "sha256" && (
          <p>
            SHA-256 بخشی از خانواده SHA-2 است که هش ۲۵۶ بیتی (۳۲ بایت) تولید
            می‌کند. این الگوریتم به طور گسترده در برنامه‌های امنیتی و ارزهای
            رمزنگاری مانند بیت‌کوین استفاده می‌شود.
          </p>
        )}
        {algorithm === "sha512" && (
          <p>
            SHA-512 یک مقدار هش ۵۱۲ بیتی (۶۴ بایت) تولید می‌کند که امنیت بیشتری
            نسبت به SHA-256 ارائه می‌دهد. این الگوریتم در برنامه‌هایی که نیاز به
            امنیت بالا دارند استفاده می‌شود.
          </p>
        )}
      </div>
    </div>
  );
};

export default HashGenerator;
