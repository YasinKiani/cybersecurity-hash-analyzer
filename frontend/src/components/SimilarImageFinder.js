import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../styles/SimilarImageFinder.css";
import { API_BASE_URL } from "../config";

const SimilarImageFinder = () => {
  const [baseImage, setBaseImage] = useState(null);
  const [compareImages, setCompareImages] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hashType, setHashType] = useState("phash"); // phash, dhash, etc.
  const [threshold, setThreshold] = useState(85); // similarity threshold (%)
  const baseImageRef = useRef();
  const compareImagesRef = useRef();

  // روش‌های مختلف هش تصویر
  const hashMethods = [
    {
      value: "phash",
      label: "هش ادراکی (Perceptual Hash)",
      description: "مقاوم در برابر تغییرات اندازه و فشرده‌سازی",
    },
    {
      value: "dhash",
      label: "هش تفاضلی (Difference Hash)",
      description: "تشخیص تغییرات در مرزهای تصویر",
    },
    {
      value: "ahash",
      label: "هش متوسط (Average Hash)",
      description: "ساده و سریع، اما دقت کمتر",
    },
  ];

  // انتخاب تصویر پایه
  const handleBaseImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        setBaseImage({
          file: file,
          preview: e.target.result,
          name: file.name,
          size: (file.size / 1024).toFixed(2), // KB
          type: file.type,
        });
      };

      reader.readAsDataURL(file);
    }
  };

  // انتخاب تصاویر مقایسه
  const handleCompareImagesChange = (e) => {
    if (e.target.files) {
      const imagesArray = Array.from(e.target.files).map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              file: file,
              preview: e.target.result,
              name: file.name,
              size: (file.size / 1024).toFixed(2), // KB
              type: file.type,
              hash: null, // هش هنوز محاسبه نشده
              similarity: null, // شباهت هنوز محاسبه نشده
            });
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(imagesArray).then((images) => {
        setCompareImages(images);
      });
    }
  };

  // محاسبه هش تصاویر (شبیه‌سازی شده)
  const calculateImageHashes = async () => {
    if (!baseImage || compareImages.length === 0) {
      alert("لطفاً تصویر پایه و حداقل یک تصویر برای مقایسه انتخاب کنید");
      return;
    }

    setLoading(true);

    // در یک پروژه واقعی، ما این هش‌ها را با API از سمت سرور محاسبه می‌کنیم
    // اما اینجا برای نمایش، ما آن را شبیه‌سازی می‌کنیم

    try {
      setTimeout(() => {
        // شبیه‌سازی هش تصویر پایه
        const baseImageHashSimulated = simulateImageHash(
          baseImage.preview,
          hashType
        );

        // شبیه‌سازی هش و شباهت برای هر تصویر مقایسه
        const comparedResults = compareImages.map((img) => {
          // تولید هش شبیه‌سازی شده
          const imgHash = simulateImageHash(img.preview, hashType);

          // محاسبه شباهت بین هش‌ها
          const similarity = calculateSimilarity(
            baseImageHashSimulated,
            imgHash
          );

          return {
            ...img,
            hash: imgHash,
            baseHash: baseImageHashSimulated,
            similarity: similarity,
          };
        });

        // مرتب‌سازی نتایج بر اساس شباهت از بیشترین به کمترین
        const sortedResults = [...comparedResults].sort(
          (a, b) => b.similarity - a.similarity
        );

        setResults(sortedResults);
        setLoading(false);
      }, 1500); // شبیه‌سازی تاخیر محاسبات
    } catch (error) {
      console.error("خطا در محاسبه هش تصاویر:", error);
      setLoading(false);
      alert("خطا در پردازش تصاویر. لطفاً دوباره تلاش کنید.");
    }
  };

  // شبیه‌سازی تولید هش تصویر
  const simulateImageHash = (imgSrc, hashMethod) => {
    // در پروژه واقعی، این با الگوریتم‌های واقعی هش تصویر محاسبه می‌شود
    // برای نمایش، هش تصادفی تولید می‌کنیم

    // استفاده از imgSrc به عنوان هش - به صورت شبه تصادفی
    const base = imgSrc.length % 100; // یک عدد نسبتاً ثابت برای هر تصویر

    // تولید یک رشته هگزادسیمال 16 کاراکتری بر اساس نوع هش
    let hash = "";
    for (let i = 0; i < 16; i++) {
      const modifier =
        hashMethod === "phash" ? 7 : hashMethod === "dhash" ? 11 : 13;
      hash += ((base + i * modifier) % 16).toString(16);
    }

    return hash;
  };

  // محاسبه شباهت بین دو هش (فاصله همینگ معکوس شده)
  const calculateSimilarity = (hash1, hash2) => {
    // محاسبه فاصله همینگ (تعداد بیت‌های متفاوت)
    let hammingDistance = 0;

    for (let i = 0; i < Math.min(hash1.length, hash2.length); i++) {
      const binary1 = parseInt(hash1[i], 16).toString(2).padStart(4, "0");
      const binary2 = parseInt(hash2[i], 16).toString(2).padStart(4, "0");

      for (let j = 0; j < 4; j++) {
        if (binary1[j] !== binary2[j]) {
          hammingDistance++;
        }
      }
    }

    // تبدیل فاصله به درصد شباهت
    const totalBits = Math.min(hash1.length, hash2.length) * 4;
    const similarity = 100 - (hammingDistance / totalBits) * 100;

    // اضافه کردن مقداری تصادفی بودن برای واقعی‌تر بودن نتایج نمایشی
    return Math.min(100, Math.max(0, similarity + (Math.random() * 10 - 5)));
  };

  // پاک کردن فرم
  const clearForm = () => {
    setBaseImage(null);
    setCompareImages([]);
    setResults([]);

    if (baseImageRef.current) baseImageRef.current.value = "";
    if (compareImagesRef.current) compareImagesRef.current.value = "";
  };

  return (
    <div className="similar-image-finder">
      <h2>پیدا کردن تصاویر مشابه</h2>
      <p>با استفاده از الگوریتم‌های هش تصویر، تصاویر مشابه را پیدا کنید</p>

      <div className="configuration-section">
        <div className="method-selector">
          <label htmlFor="hash-method">انتخاب روش هش تصویر:</label>
          <select
            id="hash-method"
            value={hashType}
            onChange={(e) => setHashType(e.target.value)}
          >
            {hashMethods.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
          <p className="method-description">
            {hashMethods.find((m) => m.value === hashType)?.description}
          </p>
        </div>

        <div className="threshold-selector">
          <label htmlFor="threshold">آستانه شباهت: {threshold}%</label>
          <input
            type="range"
            id="threshold"
            min="50"
            max="100"
            value={threshold}
            onChange={(e) => setThreshold(parseInt(e.target.value))}
          />
          <p className="threshold-description">
            تصاویر با شباهت بالاتر از آستانه به عنوان "مشابه" در نظر گرفته
            می‌شوند
          </p>
        </div>
      </div>

      <div className="image-input-section">
        <div className="base-image-section">
          <h3>تصویر پایه</h3>
          <div className="image-input">
            <input
              type="file"
              onChange={handleBaseImageChange}
              accept="image/*"
              ref={baseImageRef}
            />
            {baseImage && (
              <div className="image-preview">
                <img src={baseImage.preview} alt="تصویر پایه" />
                <div className="image-info">
                  <p>
                    <strong>نام:</strong> {baseImage.name}
                  </p>
                  <p>
                    <strong>حجم:</strong> {baseImage.size} KB
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="compare-image-section">
          <h3>تصاویر برای مقایسه</h3>
          <div className="image-input">
            <input
              type="file"
              onChange={handleCompareImagesChange}
              accept="image/*"
              multiple
              ref={compareImagesRef}
            />
            <div className="image-count">
              {compareImages.length > 0 && (
                <p>{compareImages.length} تصویر انتخاب شده</p>
              )}
            </div>
            <div className="compare-image-previews">
              {compareImages.slice(0, 4).map((img, index) => (
                <div className="compare-image-preview" key={index}>
                  <img src={img.preview} alt={`تصویر ${index + 1}`} />
                </div>
              ))}
              {compareImages.length > 4 && (
                <div className="more-images">+{compareImages.length - 4}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button
          className="btn process-btn"
          onClick={calculateImageHashes}
          disabled={loading || !baseImage || compareImages.length === 0}
        >
          {loading ? "در حال پردازش..." : "محاسبه شباهت تصاویر"}
        </button>
        <button
          className="btn clear-btn"
          onClick={clearForm}
          disabled={loading}
        >
          پاک کردن
        </button>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>در حال پردازش تصاویر و محاسبه هش...</p>
        </div>
      )}

      {results.length > 0 && !loading && (
        <div className="results-section">
          <h3>نتایج شباهت تصاویر</h3>
          <div className="result-info">
            <p>
              مقایسه تصاویر با تصویر پایه <strong>{baseImage.name}</strong> با
              استفاده از روش{" "}
              <strong>
                {hashMethods.find((m) => m.value === hashType)?.label}
              </strong>
            </p>
          </div>

          <div className="results-container">
            {results.map((result, index) => (
              <div
                className={`result-item ${
                  result.similarity >= threshold ? "similar" : "not-similar"
                }`}
                key={index}
              >
                <div className="result-image">
                  <img src={result.preview} alt={`نتیجه ${index + 1}`} />
                </div>
                <div className="result-details">
                  <h4>{result.name}</h4>
                  <div className="similarity-meter">
                    <div
                      className="similarity-bar"
                      style={{
                        width: `${result.similarity}%`,
                        backgroundColor:
                          result.similarity >= threshold
                            ? "#4caf50"
                            : "#ff9800",
                      }}
                    ></div>
                    <span className="similarity-value">
                      {result.similarity.toFixed(2)}%
                    </span>
                  </div>
                  <p className="similarity-label">
                    {result.similarity >= threshold
                      ? "تصویر مشابه یافت شد"
                      : "تصویر مشابه نیست"}
                  </p>
                  <div className="hash-details">
                    <p>
                      <strong>هش تصویر:</strong> <code>{result.hash}</code>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="info-box">
        <h3>درباره هش‌های تصویر و تشخیص شباهت</h3>
        <p>
          <strong>هش‌های ادراکی</strong> روش‌هایی هستند که برای مقایسه شباهت
          بصری تصاویر استفاده می‌شوند. برخلاف هش‌های رمزنگاری مانند MD5 یا SHA
          که برای تغییرات کوچک حساس هستند، هش‌های ادراکی تلاش می‌کنند تا تصاویر
          مشابه، هش‌های مشابهی ایجاد کنند.
        </p>

        <div className="hash-types">
          <div className="hash-type">
            <h4>هش ادراکی (pHash)</h4>
            <p>
              با کاهش اندازه تصویر، تبدیل به تصویر خاکستری، اعمال تبدیل کسینوس
              گسسته (DCT) و استخراج فرکانس‌های مهم کار می‌کند. مقاوم در برابر
              تغییرات اندازه، چرخش جزئی و فشرده‌سازی است.
            </p>
          </div>

          <div className="hash-type">
            <h4>هش تفاضلی (dHash)</h4>
            <p>
              تغییرات بین پیکسل‌های مجاور را مقایسه می‌کند. اگر پیکسل سمت راست
              روشن‌تر باشد، 1 و در غیر این صورت 0 ثبت می‌شود. برای تشخیص لبه‌ها
              و ساختار تصاویر مناسب است.
            </p>
          </div>

          <div className="hash-type">
            <h4>هش متوسط (aHash)</h4>
            <p>
              ساده‌ترین روش که تصویر را به مقیاس خاکستری تبدیل می‌کند، اندازه را
              کاهش می‌دهد و هر پیکسل را با میانگین مقایسه می‌کند. سریع اما دقت
              کمتری دارد.
            </p>
          </div>
        </div>

        <h4>کاربردهای تشخیص تصاویر مشابه:</h4>
        <ul>
          <li>
            <strong>جستجوی معکوس تصویر:</strong> پیدا کردن نسخه‌های مشابه یا
            تکراری از یک تصویر در پایگاه داده
          </li>
          <li>
            <strong>تشخیص محتوای تکراری:</strong> شناسایی و حذف تصاویر تکراری در
            مجموعه‌های بزرگ
          </li>
          <li>
            <strong>حفاظت از کپی‌رایت:</strong> شناسایی استفاده غیرمجاز از
            تصاویر
          </li>
          <li>
            <strong>فیلترینگ محتوا:</strong> بررسی محتوای نامناسب با مقایسه با
            پایگاه داده تصاویر شناخته شده
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SimilarImageFinder;
