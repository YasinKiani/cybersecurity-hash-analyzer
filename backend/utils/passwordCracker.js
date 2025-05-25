/**
 * سیستم پیشرفته شکستن رمز عبور
 * طراحی شده توسط: یاسین کیانی
 * این کد فقط برای اهداف آموزشی است
 */

const crypto = require("crypto");

// لیست گسترده رمزهای عبور رایج
const commonPasswords = [
  // رمزهای عبور فارسی رایج
  "123456",
  "123456789",
  "12345",
  "1234567",
  "1234567890",
  "ایران",
  "تهران",
  "مشهد",
  "اصفهان",
  "شیراز",
  "تبریز",
  "محمد",
  "علی",
  "حسین",
  "رضا",
  "مهدی",
  "امیر",
  "احمد",
  "iran",
  "tehran",
  "doset",
  "dooset",
  "asheghetam",
  "salam",
  "salamati",
  "khoda",
  "khodafez",
  "bahar",
  "sabz",
  "zard",
  "sefid",
  "siah",
  "ghermez",
  "abi",

  // رمزهای عبور انگلیسی رایج
  "password",
  "123456",
  "12345678",
  "qwerty",
  "abc123",
  "password1",
  "1234",
  "12345",
  "1234567",
  "123123",
  "admin",
  "welcome",
  "monkey",
  "login",
  "princess",
  "qwertyuiop",
  "solo",
  "121212",
  "dragon",
  "baseball",
  "football",
  "basketball",
  "soccer",
  "superman",
  "1qaz2wsx",
  "sunshine",
  "iloveyou",
  "starwars",
  "batman",
  "trustno1",

  // اسامی و کلمات رایج فارسی
  "محمدرضا",
  "علیرضا",
  "امیرحسین",
  "حسن",
  "حسین",
  "فاطمه",
  "زهرا",
  "مریم",
  "سارا",
  "نرگس",
  "نازنین",
  "آرش",
  "آرمین",
  "آریا",
  "نیما",
  "سینا",
  "سهراب",
  "سهیل",
  "سجاد",
  "سعید",
  "سامان",
  "ایران",
  "تهران",
  "مشهد",
  "تبریز",
  "اصفهان",
  "شیراز",
  "رشت",

  // ترکیبات رایج
  "12345678910",
  "123abc",
  "1234abcd",
  "abcd1234",
  "1122334455",
  "123321",
  "654321",
  "321",
  "111111",
  "222222",
  "333333",
  "444444",
  "555555",
];

// ساخت ترکیبات اضافی
const generateCommonVariations = () => {
  const variations = [];
  const years = [];
  const currentYear = new Date().getFullYear();

  // سال‌های رایج
  for (let y = 1350; y <= 1402; y++) {
    years.push(y.toString());
  }
  for (let y = 1970; y <= currentYear; y++) {
    years.push(y.toString());
  }

  // ترکیبات اسامی با اعداد
  const commonNames = [
    "ali",
    "reza",
    "mohammad",
    "amir",
    "ahmad",
    "mehdi",
    "hossein",
    "علی",
    "رضا",
    "محمد",
    "امیر",
    "احمد",
    "مهدی",
    "حسین",
  ];

  commonNames.forEach((name) => {
    years.forEach((year) => {
      variations.push(`${name}${year}`);
      variations.push(`${year}${name}`);
    });

    // ترکیبات رایج
    for (let i = 0; i <= 123; i++) {
      variations.push(`${name}${i}`);
    }
  });

  return variations;
};

// افزودن ترکیبات اضافی به لیست رمزها
const allPasswords = [...commonPasswords, ...generateCommonVariations()];

// شکستن با استفاده از حمله فرهنگ لغت
const dictionaryAttack = (hash, algorithm) => {
  const start = Date.now();
  let attempts = 0;
  let found = false;
  let password = null;
  let passwordsChecked = [];

  for (const word of allPasswords) {
    attempts++;
    const testHash = crypto.createHash(algorithm).update(word).digest("hex");

    if (passwordsChecked.length < 5) {
      passwordsChecked.push(word);
    } else {
      passwordsChecked.shift();
      passwordsChecked.push(word);
    }

    if (testHash === hash) {
      found = true;
      password = word;
      break;
    }

    // چک کردن برخی تغییرات رایج
    const variations = [
      word + "1",
      word + "123",
      word + "!",
      word + "@",
      word + "#",
      word + new Date().getFullYear(),
      word.charAt(0).toUpperCase() + word.slice(1),
    ];

    for (const variation of variations) {
      attempts++;
      const testHash = crypto
        .createHash(algorithm)
        .update(variation)
        .digest("hex");

      if (testHash === hash) {
        found = true;
        password = variation;
        break;
      }
    }

    if (found) break;
  }

  const timeTaken = Date.now() - start;

  return {
    success: found,
    password,
    attempts,
    timeTaken,
    passwordsChecked,
    method: "dictionary",
    methodLabel: "حمله فرهنگ لغت",
  };
};

// شکستن با استفاده از حمله الگو
const patternAttack = (hash, algorithm) => {
  const start = Date.now();
  let attempts = 0;
  let found = false;
  let password = null;
  let passwordsChecked = [];

  // الگوهای رایج در رمزهای عبور
  const patterns = [];

  // الگوهای تاریخی
  const currentYear = new Date().getFullYear();

  // سال‌های شمسی رایج
  for (let year = 1350; year <= 1402; year++) {
    patterns.push(year.toString());
  }

  // سال‌های میلادی رایج
  for (let year = 1970; year <= currentYear; year++) {
    patterns.push(year.toString());
  }

  // الگوهای کیبرد
  patterns.push("qwerty", "asdfgh", "123qwe", "zxcvbn", "qazwsx");
  patterns.push("qwertyuiop", "asdfghjkl", "zxcvbnm");

  // الگوهای عددی رایج
  for (let i = 0; i < 10000; i++) {
    patterns.push(i.toString().padStart(4, "0"));
  }

  // الگوهای تاریخ تولد
  for (let year = 1350; year <= 1402; year++) {
    for (let month = 1; month <= 12; month++) {
      for (let day = 1; day <= 31; day++) {
        if (
          (month <= 6 && day <= 31) ||
          (month > 6 && day <= 30) ||
          (month === 12 && day <= 29)
        ) {
          patterns.push(
            `${year}${month.toString().padStart(2, "0")}${day
              .toString()
              .padStart(2, "0")}`
          );
          patterns.push(
            `${day.toString().padStart(2, "0")}${month
              .toString()
              .padStart(2, "0")}${year}`
          );
        }
      }
    }
  }

  // الگوهای کد ملی (فقط برای آموزش)
  for (let i = 0; i < 1000; i++) {
    patterns.push(`123456${i.toString().padStart(4, "0")}`);
  }

  for (const pattern of patterns) {
    attempts++;
    const testHash = crypto.createHash(algorithm).update(pattern).digest("hex");

    if (passwordsChecked.length < 5) {
      passwordsChecked.push(pattern);
    } else {
      passwordsChecked.shift();
      passwordsChecked.push(pattern);
    }

    if (testHash === hash) {
      found = true;
      password = pattern;
      break;
    }
  }

  const timeTaken = Date.now() - start;

  return {
    success: found,
    password,
    attempts,
    timeTaken,
    passwordsChecked,
    method: "pattern",
    methodLabel: "حمله الگو",
  };
};

// شکستن با استفاده از حمله جامع (فقط نمایشی برای پسوردهای کوتاه)
const bruteForceAttack = (hash, algorithm) => {
  const start = Date.now();
  let attempts = 0;
  let found = false;
  let password = null;
  let passwordsChecked = [];

  // کاراکترهای مجاز
  const charsets = {
    digits: "0123456789",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    persian: "ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی",
  };

  // ترکیب کاراکترها برای حمله جامع
  const chars = charsets.digits + charsets.lowercase;

  // تست رمزهای عبور یک کاراکتری
  for (let i = 0; i < chars.length; i++) {
    const testPassword = chars[i];
    attempts++;
    const testHash = crypto
      .createHash(algorithm)
      .update(testPassword)
      .digest("hex");

    if (passwordsChecked.length < 5) {
      passwordsChecked.push(testPassword);
    } else {
      passwordsChecked.shift();
      passwordsChecked.push(testPassword);
    }

    if (testHash === hash) {
      found = true;
      password = testPassword;
      break;
    }
  }

  // تست رمزهای عبور دو کاراکتری
  if (!found) {
    for (let i = 0; i < chars.length; i++) {
      for (let j = 0; j < chars.length; j++) {
        const testPassword = chars[i] + chars[j];
        attempts++;
        const testHash = crypto
          .createHash(algorithm)
          .update(testPassword)
          .digest("hex");

        if (passwordsChecked.length < 5) {
          passwordsChecked.push(testPassword);
        } else {
          passwordsChecked.shift();
          passwordsChecked.push(testPassword);
        }

        if (testHash === hash) {
          found = true;
          password = testPassword;
          break;
        }
      }
      if (found) break;
    }
  }

  // تست رمزهای عبور سه کاراکتری (محدود به ۵۰۰ ترکیب برای عملکرد بهتر)
  if (!found) {
    let count = 0;
    const maxCombinations = 500;

    outerLoop: for (let i = 0; i < chars.length; i++) {
      for (let j = 0; j < chars.length; j++) {
        for (let k = 0; k < chars.length; k++) {
          if (count >= maxCombinations) break outerLoop;

          const testPassword = chars[i] + chars[j] + chars[k];
          attempts++;
          count++;

          const testHash = crypto
            .createHash(algorithm)
            .update(testPassword)
            .digest("hex");

          if (passwordsChecked.length < 5) {
            passwordsChecked.push(testPassword);
          } else {
            passwordsChecked.shift();
            passwordsChecked.push(testPassword);
          }

          if (testHash === hash) {
            found = true;
            password = testPassword;
            break outerLoop;
          }
        }
      }
    }
  }

  const timeTaken = Date.now() - start;

  return {
    success: found,
    password,
    attempts,
    timeTaken,
    passwordsChecked,
    method: "bruteforce",
    methodLabel: "حمله جامع",
  };
};

// شکستن با استفاده از حمله ترکیبی
const hybridAttack = (hash, algorithm) => {
  const start = Date.now();
  let attempts = 0;
  let found = false;
  let password = null;
  let passwordsChecked = [];

  // انتخاب کلمات پایه از لیست رمزهای عبور رایج
  const baseWords = commonPasswords.slice(0, 50);

  // افزودن پسوندهای رایج به کلمات پایه
  for (const word of baseWords) {
    // اعداد رایج
    for (let i = 0; i <= 123; i++) {
      const testPassword = word + i;
      attempts++;
      const testHash = crypto
        .createHash(algorithm)
        .update(testPassword)
        .digest("hex");

      if (passwordsChecked.length < 5) {
        passwordsChecked.push(testPassword);
      } else {
        passwordsChecked.shift();
        passwordsChecked.push(testPassword);
      }

      if (testHash === hash) {
        found = true;
        password = testPassword;
        break;
      }
    }

    if (found) break;

    // کاراکترهای خاص رایج
    const specialChars = ["!", "@", "#", "$", "%", "&", "*", "?"];
    for (const char of specialChars) {
      const variations = [
        word + char,
        char + word,
        word + char + "1",
        word + char + "123",
      ];

      for (const testPassword of variations) {
        attempts++;
        const testHash = crypto
          .createHash(algorithm)
          .update(testPassword)
          .digest("hex");

        if (passwordsChecked.length < 5) {
          passwordsChecked.push(testPassword);
        } else {
          passwordsChecked.shift();
          passwordsChecked.push(testPassword);
        }

        if (testHash === hash) {
          found = true;
          password = testPassword;
          break;
        }
      }

      if (found) break;
    }

    if (found) break;

    // سال‌های رایج
    const years = [
      "1400",
      "1401",
      "1402",
      "1399",
      "1398",
      "1397",
      "1396",
      "2022",
      "2023",
      "2021",
      "2020",
      "2019",
      "2018",
    ];

    for (const year of years) {
      const variations = [word + year, year + word];

      for (const testPassword of variations) {
        attempts++;
        const testHash = crypto
          .createHash(algorithm)
          .update(testPassword)
          .digest("hex");

        if (passwordsChecked.length < 5) {
          passwordsChecked.push(testPassword);
        } else {
          passwordsChecked.shift();
          passwordsChecked.push(testPassword);
        }

        if (testHash === hash) {
          found = true;
          password = testPassword;
          break;
        }
      }

      if (found) break;
    }

    if (found) break;
  }

  const timeTaken = Date.now() - start;

  return {
    success: found,
    password,
    attempts,
    timeTaken,
    passwordsChecked,
    method: "hybrid",
    methodLabel: "حمله ترکیبی",
  };
};

// شکستن با استفاده از جدول رنگین‌کمان
const rainbowTableAttack = (hash, algorithm) => {
  const start = Date.now();
  let attempts = 0;
  let found = false;
  let password = null;
  let passwordsChecked = [];

  // ساخت جدول رنگین‌کمان از رمزهای عبور رایج
  const rainbowTable = {};

  // افزودن رمزهای عبور رایج به جدول
  for (const word of allPasswords) {
    const testHash = crypto.createHash(algorithm).update(word).digest("hex");
    rainbowTable[testHash] = word;
    attempts++;

    if (passwordsChecked.length < 5) {
      passwordsChecked.push(word);
    } else {
      passwordsChecked.shift();
      passwordsChecked.push(word);
    }
  }

  // افزودن ترکیبات ساده به جدول
  const commonSuffixes = ["1", "123", "!", "@"];
  for (const word of commonPasswords.slice(0, 30)) {
    for (const suffix of commonSuffixes) {
      const testPassword = word + suffix;
      const testHash = crypto
        .createHash(algorithm)
        .update(testPassword)
        .digest("hex");
      rainbowTable[testHash] = testPassword;
      attempts++;

      if (passwordsChecked.length < 5) {
        passwordsChecked.push(testPassword);
      } else {
        passwordsChecked.shift();
        passwordsChecked.push(testPassword);
      }
    }
  }

  // جستجو در جدول
  if (rainbowTable[hash]) {
    found = true;
    password = rainbowTable[hash];
  }

  const timeTaken = Date.now() - start;

  return {
    success: found,
    password,
    attempts,
    timeTaken,
    passwordsChecked,
    method: "rainbow",
    methodLabel: "جدول رنگین‌کمان",
  };
};

// شکستن رمز عبور با استفاده از الگوریتم مناسب
exports.crackPassword = (hash, algorithm, method) => {
  console.log(`شروع شکستن رمز عبور با الگوریتم ${algorithm} و روش ${method}`);

  // انتخاب روش شکستن مناسب
  switch (method) {
    case "dictionary":
      return dictionaryAttack(hash, algorithm);
    case "bruteforce":
      return bruteForceAttack(hash, algorithm);
    case "pattern":
      return patternAttack(hash, algorithm);
    case "hybrid":
      return hybridAttack(hash, algorithm);
    case "rainbow":
      return rainbowTableAttack(hash, algorithm);
    default:
      // اگر روش نامشخص بود، از چند روش متفاوت استفاده می‌کنیم
      const dictionaryResult = dictionaryAttack(hash, algorithm);
      if (dictionaryResult.success) return dictionaryResult;

      const patternResult = patternAttack(hash, algorithm);
      if (patternResult.success) return patternResult;

      return hybridAttack(hash, algorithm);
  }
};

// محاسبه تخمین زمان برای شکستن رمز عبور بر اساس پیچیدگی
exports.getTimeEstimate = (algorithm, passwordComplexity) => {
  const hashesPerSecond = {
    md5: 10000000000,
    sha1: 5000000000,
    sha256: 1000000000,
    sha512: 500000000,
  };

  const possibleCombinations = {
    low: Math.pow(10, 6), // 10^6: فقط اعداد، 6 کاراکتر
    medium: Math.pow(36, 8), // 36^8: حروف کوچک + اعداد، 8 کاراکتر
    high: Math.pow(62, 10), // 62^10: حروف بزرگ و کوچک + اعداد، 10 کاراکتر
    "very-high": Math.pow(72, 12), // 72^12: همه کاراکترها، 12 کاراکتر
  };

  const speed = hashesPerSecond[algorithm] || 1000000000;
  const combinations = possibleCombinations[passwordComplexity] || 1000000;

  // میانگین: نیاز به بررسی نیمی از ترکیبات
  const seconds = combinations / (2 * speed);

  return {
    seconds: seconds,
    minutes: seconds / 60,
    hours: seconds / 3600,
    days: seconds / 86400,
    years: seconds / (86400 * 365),
  };
};

// تولید یک رمز عبور نمونه با پیچیدگی مشخص
exports.generateSamplePassword = (complexity) => {
  const charsets = {
    digits: "0123456789",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    special: "!@#$%^&*()-_=+[]{}|;:,.<>/?",
    persian: "ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی",
  };

  // انتخاب مجموعه کاراکترها و طول رمز عبور بر اساس پیچیدگی
  let charset = "";
  let length = 4;

  switch (complexity) {
    case "low":
      charset = charsets.digits;
      length = 4;
      break;
    case "medium":
      charset = charsets.digits + charsets.lowercase;
      length = 6;
      break;
    case "high":
      charset = charsets.digits + charsets.lowercase + charsets.uppercase;
      length = 8;
      break;
    case "very-high":
      charset =
        charsets.digits +
        charsets.lowercase +
        charsets.uppercase +
        charsets.special;
      length = 10;
      break;
    case "persian":
      charset = charsets.persian + charsets.digits;
      length = 6;
      break;
    default:
      charset = charsets.digits + charsets.lowercase;
      length = 6;
  }

  // ساخت رمز عبور تصادفی
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  return password;
};
