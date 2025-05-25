import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/HashCollisionDemo.css";
import { API_BASE_URL } from "../config";

const HashCollisionDemo = () => {
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [algorithm, setAlgorithm] = useState("md5");
  const [hash1, setHash1] = useState("");
  const [hash2, setHash2] = useState("");
  const [isCollision, setIsCollision] = useState(false);
  const [isBruteForcing, setIsBruteForcing] = useState(false);
  const [bruteForceProgress, setBruteForceProgress] = useState(0);
  const [foundCollisions, setFoundCollisions] = useState([]);
  const [knownCollisions, setKnownCollisions] = useState([]);

  const algorithms = [
    {
      value: "md5",
      label: "MD5",
      description:
        "الگوریتمی سریع اما با امنیت پایین‌تر، دارای برخوردهای شناخته شده",
    },
    {
      value: "sha1",
      label: "SHA-1",
      description:
        "امنیت بهتر از MD5، اما همچنان دارای نقاط ضعف و برخوردهای نظری",
    },
    {
      value: "sha256",
      label: "SHA-256",
      description: "الگوریتمی امن با مقاومت بیشتر در برابر برخورد",
    },
  ];

  // نمایش برخوردهای شناخته شده برای هر الگوریتم
  useEffect(() => {
    // در دنیای واقعی، این داده‌ها باید از سرور دریافت شوند
    const collisions = {
      md5: [
        {
          input1:
            "d131dd02c5e6eec4693d9a0698aff95c2fcab58712467eab4004583eb8fb7f8955ad340609f4b30283e488832571415a085125e8f7cdc99fd91dbdf280373c5b960b1dd1dc417b9ce4d897f45a6555d535739ac7f0ebfd0c3029f166d109b18f75277f79d33b1f45a66d61e1a46be3a",
          input2:
            "d131dd02c5e6eec4693d9a0698aff95c2fcab50712467eab4004583eb8fb7f8955ad340609f4b30283e4888325f1415a085125e8f7cdc99fd91dbd7280373c5b960b1dd1dc417b9ce4d897f45a6555d535739a47f0ebfd0c3029f166d109818f75277f79d33b1f45a66d61e1a46be3a",
          hash: "79054025255fb1a26e4bc422aef54eb4",
          description: "برخورد مشهور واست و آکاموتو (۲۰۰۴)",
        },
        {
          input1:
            "4dc968ff0ee35c209572d4777b721587d36fa7b21bdc56b74a3dc0783e7b9518afbfa200a8284bf36e8e4b55b35f427593d849676da0d1555d8360fb5f07fea2",
          input2:
            "4dc968ff0ee35c209572d4777b721587d36fa7b21bdc56b74a3dc0783e7b9518afbfa202a8284bf36e8e4b55b35f427593d849676da0d1d55d8360fb5f07fea2",
          hash: "afd7a9c9c72cb123bea5d92d434c9262",
          description: "برخورد رمزنگاری با الگوریتم MD5",
        },
      ],
      sha1: [
        {
          input1: "PDF-1",
          input2: "PDF-2",
          hash: "38762cf7f55934b34d179ae6a4c80cadccbb7f0a",
          description:
            "برخورد SHA-1 که توسط گوگل در سال ۲۰۱۷ کشف شد (نمونه‌ای ساده‌سازی شده)",
        },
      ],
      sha256: [],
    };

    setKnownCollisions(collisions[algorithm] || []);
  }, [algorithm]);

  // محاسبه هش برای ورودی‌ها
  useEffect(() => {
    const calculateHash = async () => {
      if (!input1 && !input2) return;

      try {
        if (input1) {
          const response1 = await axios.post(
            `${API_BASE_URL}/api/hash/generate`,
            {
              text: input1,
              algorithm,
            }
          );
          setHash1(response1.data.data.hash);
        }

        if (input2) {
          const response2 = await axios.post(
            `${API_BASE_URL}/api/hash/generate`,
            {
              text: input2,
              algorithm,
            }
          );
          setHash2(response2.data.data.hash);
        }

        if (input1 && input2) {
          // بررسی برخورد
          const collision = hash1 === hash2 && input1 !== input2;
          setIsCollision(collision);

          if (collision) {
            // افزودن به لیست برخوردها
            const newCollision = { input1, input2, hash: hash1 };
            setFoundCollisions((prev) => {
              // بررسی تکراری نبودن
              if (
                !prev.some(
                  (c) =>
                    c.hash === hash1 &&
                    c.input1 === input1 &&
                    c.input2 === input2
                )
              ) {
                return [...prev, newCollision];
              }
              return prev;
            });
          }
        }
      } catch (error) {
        console.error("خطا در محاسبه هش:", error);
      }
    };

    calculateHash();
  }, [input1, input2, algorithm]);

  // شبیه‌سازی جستجوی برخورد با روش نیروی بی‌رحمانه
  const simulateBruteForce = () => {
    setIsBruteForcing(true);
    setBruteForceProgress(0);

    // تعداد تلاش‌های شبیه‌سازی شده
    const totalAttempts = 100;
    let currentAttempt = 0;

    // تایمر برای شبیه‌سازی جستجو
    const simulationInterval = setInterval(() => {
      currentAttempt++;
      setBruteForceProgress(Math.floor((currentAttempt / totalAttempts) * 100));

      // پایان شبیه‌سازی
      if (currentAttempt >= totalAttempts) {
        clearInterval(simulationInterval);
        setIsBruteForcing(false);

        // نمایش یک برخورد شبیه‌سازی شده
        if (algorithm === "md5" || algorithm === "sha1") {
          const simulatedCollision = {
            input1: `string1_${Math.random().toString(36).substring(7)}`,
            input2: `string2_${Math.random().toString(36).substring(7)}`,
            hash:
              algorithm === "md5"
                ? `${Math.random().toString(16).substring(2, 10)}${Math.random()
                    .toString(16)
                    .substring(2, 10)}${Math.random()
                    .toString(16)
                    .substring(2, 10)}${Math.random()
                    .toString(16)
                    .substring(2, 10)}`
                : `${Math.random().toString(16).substring(2, 10)}${Math.random()
                    .toString(16)
                    .substring(2, 10)}${Math.random()
                    .toString(16)
                    .substring(2, 10)}${Math.random()
                    .toString(16)
                    .substring(2, 10)}${Math.random()
                    .toString(16)
                    .substring(2, 10)}`,
            description: "برخورد شبیه‌سازی شده",
          };

          setFoundCollisions((prev) => [...prev, simulatedCollision]);
        } else {
          alert(
            "برای الگوریتم‌های امن‌تر مانند SHA-256، یافتن برخورد بسیار دشوار است و نیاز به محاسبات بسیار زیادی دارد."
          );
        }
      }
    }, 100);
  };

  return (
    <div className="hash-collision-demo">
      <h2>نمایش برخورد هش</h2>
      <p>شبیه‌سازی و نمایش پدیده برخورد در توابع هش</p>

      <div className="collision-definition">
        <h3>برخورد هش چیست؟</h3>
        <p>
          <strong>برخورد هش (Hash Collision)</strong> زمانی رخ می‌دهد که دو
          ورودی متفاوت پس از عبور از تابع هش، مقدار یکسانی تولید کنند. این پدیده
          به دلیل اصل کبوتری اجتناب‌ناپذیر است، زیرا تابع هش فضای ورودی نامحدود
          را به فضای خروجی محدود نگاشت می‌کند.
        </p>
        <div className="collision-diagram">
          <div className="input input-1">ورودی A</div>
          <div className="input input-2">ورودی B</div>
          <div className="arrow arrow-1">↓</div>
          <div className="arrow arrow-2">↓</div>
          <div className="hash-function">تابع هش</div>
          <div className="arrow arrow-3">↓</div>
          <div className="output">هش یکسان!</div>
        </div>
      </div>

      <div className="experiment-section">
        <h3>آزمایش برخورد</h3>

        <div className="algorithm-selector">
          <label htmlFor="algorithm">انتخاب الگوریتم هش:</label>
          <select
            id="algorithm"
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
          >
            {algorithms.map((algo) => (
              <option key={algo.value} value={algo.value}>
                {algo.label}
              </option>
            ))}
          </select>
          <p className="algorithm-description">
            {algorithms.find((a) => a.value === algorithm)?.description}
          </p>
        </div>

        <div className="collision-test">
          <div className="input-container">
            <div className="input-group">
              <label htmlFor="input1">ورودی اول:</label>
              <input
                type="text"
                id="input1"
                value={input1}
                onChange={(e) => setInput1(e.target.value)}
                placeholder="متن اول را وارد کنید..."
              />
              {hash1 && (
                <div className="hash-result">
                  <strong>هش:</strong> <code>{hash1}</code>
                </div>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="input2">ورودی دوم:</label>
              <input
                type="text"
                id="input2"
                value={input2}
                onChange={(e) => setInput2(e.target.value)}
                placeholder="متن دوم را وارد کنید..."
              />
              {hash2 && (
                <div className="hash-result">
                  <strong>هش:</strong> <code>{hash2}</code>
                </div>
              )}
            </div>
          </div>

          <div className="collision-result">
            {input1 && input2 && (
              <div
                className={`result ${
                  isCollision ? "collision" : "no-collision"
                }`}
              >
                {isCollision ? (
                  <>
                    <span className="result-icon">⚠️</span>
                    <p>
                      برخورد هش پیدا شد! دو ورودی متفاوت هش یکسانی تولید کردند.
                    </p>
                  </>
                ) : (
                  <>
                    <span className="result-icon">✅</span>
                    <p>هیچ برخوردی پیدا نشد. هش‌های تولیدشده متفاوت هستند.</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="brute-force-section">
          <h3>شبیه‌سازی جستجوی برخورد</h3>
          <p>
            جستجوی برخورد با روش نیروی بی‌رحمانه نیاز به محاسبات زیادی دارد. این
            شبیه‌سازی نشان می‌دهد که چگونه می‌توان به دنبال برخوردها گشت.
          </p>

          <button
            className="btn brute-force-btn"
            onClick={simulateBruteForce}
            disabled={isBruteForcing}
          >
            {isBruteForcing
              ? "در حال جستجو..."
              : "شروع شبیه‌سازی جستجوی برخورد"}
          </button>

          {isBruteForcing && (
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${bruteForceProgress}%` }}
                ></div>
              </div>
              <p>{bruteForceProgress}% تکمیل شده</p>
            </div>
          )}
        </div>
      </div>

      <div className="collisions-section">
        <div className="known-collisions">
          <h3>برخوردهای شناخته شده</h3>
          {knownCollisions.length > 0 ? (
            <div className="collision-list">
              {knownCollisions.map((collision, index) => (
                <div className="collision-item" key={index}>
                  <div className="collision-info">
                    <h4>{`برخورد ${index + 1}`}</h4>
                    <p>{collision.description}</p>
                    <p>
                      <strong>هش یکسان:</strong> <code>{collision.hash}</code>
                    </p>
                  </div>
                  <button
                    className="btn use-collision-btn"
                    onClick={() => {
                      setInput1(collision.input1);
                      setInput2(collision.input2);
                    }}
                  >
                    استفاده از این برخورد
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>
              برای این الگوریتم هش، برخورد شناخته شده و عملی در سیستم ثبت نشده
              است.
            </p>
          )}
        </div>

        <div className="found-collisions">
          <h3>برخوردهای پیدا شده</h3>
          {foundCollisions.length > 0 ? (
            <div className="collision-list">
              {foundCollisions.map((collision, index) => (
                <div className="collision-item" key={index}>
                  <h4>{`برخورد ${index + 1}`}</h4>
                  <p>
                    <strong>ورودی 1:</strong>{" "}
                    <code>{collision.input1.substring(0, 20)}...</code>
                  </p>
                  <p>
                    <strong>ورودی 2:</strong>{" "}
                    <code>{collision.input2.substring(0, 20)}...</code>
                  </p>
                  <p>
                    <strong>هش یکسان:</strong> <code>{collision.hash}</code>
                  </p>
                  {collision.description && <p>{collision.description}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p>
              هنوز هیچ برخوردی پیدا نشده است. با آزمایش ورودی‌های مختلف یا
              شبیه‌سازی جستجو، برخوردها را پیدا کنید.
            </p>
          )}
        </div>
      </div>

      <div className="info-box">
        <h3>اهمیت برخوردهای هش</h3>
        <p>
          برخوردهای هش از نظر امنیتی بسیار مهم هستند. الگوریتم‌های هش امن باید
          در برابر انواع حملات برخورد مقاوم باشند:
        </p>
        <ul>
          <li>
            <strong>حمله برخورد:</strong> پیدا کردن دو ورودی دلخواه که هش یکسانی
            تولید کنند
          </li>
          <li>
            <strong>حمله پیش‌تصویر دوم:</strong> با داشتن یک ورودی، پیدا کردن
            ورودی دیگری که هش یکسانی تولید کند
          </li>
          <li>
            <strong>حمله روز تولد:</strong> بر اساس مسئله ریاضی روز تولد، که
            احتمال پیدا کردن برخورد را بیشتر از حد انتظار می‌کند
          </li>
        </ul>
        <p>
          اگر الگوریتم هشی مانند MD5 دارای برخوردهای قابل یافتن باشد، از آن
          نباید برای کاربردهای امنیتی استفاده شود. امروزه برای امنیت بیشتر، از
          الگوریتم‌های SHA-256 یا SHA-3 استفاده می‌شود.
        </p>
      </div>
    </div>
  );
};

export default HashCollisionDemo;
