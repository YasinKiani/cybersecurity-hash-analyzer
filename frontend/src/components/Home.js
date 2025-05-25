import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  return (
    <div className="home">
      <div className="hero">
        <h1>به برنامه نمایش بصری هش خوش آمدید</h1>
        <p>کاوش در توابع هش، نمایش بصری و مفاهیم امنیتی</p>
      </div>

      <div className="features">
        <div className="feature-card">
          <h2>تولیدکننده هش</h2>
          <p>تولید هش با الگوریتم‌های MD5، SHA-1، SHA-256 و موارد دیگر</p>
          <Link to="/hash-generator" className="btn">
            امتحان کنید
          </Link>
        </div>

        <div className="feature-card">
          <h2>هش بصری</h2>
          <p>مشاهده نمایش‌های بصری مقادیر هش</p>
          <Link to="/visual-hash" className="btn">
            نمایش
          </Link>
        </div>

        <div className="feature-card">
          <h2>شکستن رمز عبور</h2>
          <p>شبیه‌سازی تکنیک‌های شکستن رمز عبور</p>
          <Link to="/password-cracker" className="btn">
            امتحان
          </Link>
        </div>
      </div>

      <div className="features features-row-2">
        <div className="feature-card">
          <h2>نمایش برخورد هش</h2>
          <p>درک و نمایش پدیده برخورد در توابع هش</p>
          <Link to="/hash-collision" className="btn">
            مشاهده
          </Link>
        </div>

        <div className="feature-card">
          <h2>تولید آواتار</h2>
          <p>ایجاد آواتارهای منحصربه‌فرد با استفاده از هش‌ها</p>
          <Link to="/identicon-generator" className="btn">
            ایجاد آواتار
          </Link>
        </div>

        <div className="feature-card">
          <h2>پیدا کردن تصاویر مشابه</h2>
          <p>استفاده از هش‌های ادراکی برای پیدا کردن تصاویر مشابه</p>
          <Link to="/similar-image-finder" className="btn">
            جستجو
          </Link>
        </div>
      </div>

      <div className="info-section">
        <h2>توابع هش چیستند؟</h2>
        <p>
          توابع هش الگوریتم‌های ریاضی هستند که داده‌ها با اندازه دلخواه را به
          مقادیر با اندازه ثابت تبدیل می‌کنند. آن‌ها برای یکپارچگی داده، ذخیره
          رمز عبور و امضاهای دیجیتال ضروری هستند.
        </p>

        <h3>الگوریتم‌های هش متداول:</h3>
        <ul>
          <li>
            <strong>MD5</strong> - سریع اما آسیب‌پذیر در برابر تصادم
          </li>
          <li>
            <strong>SHA-1</strong> - الگوریتم قدیمی‌تر با نقاط ضعف شناخته شده
          </li>
          <li>
            <strong>SHA-256</strong> - بخشی از خانواده SHA-2، امروزه به طور
            گسترده استفاده می‌شود
          </li>
          <li>
            <strong>SHA-512</strong> - امنیت بالاتر با خروجی ۵۱۲ بیتی
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Home;
