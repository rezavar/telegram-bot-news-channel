node-news-channel/
├── src/
│ ├── config/
│ │ └── config-local.js # فایل تنظیمات
│ │
│ ├── controllers/
│ │ ├── botController.js # کنترلر مدیریت ربات
│ │ ├── clientController.js # کنترلر مدیریت شماره موبایل
│ │ └── jobController.js # کنترلر مدیریت جاب
│ │ └── mainController.js # کنترلر اصلی برای ست کردن جاب و هندلر های ربات
│ │
│ ├── db/ # فایل های دیتابیس
│ │
│ ├── models/
│ │ └── adminList.js # مدل برای ذخیره‌سازی یوزر ها
│ │ └── chanelList.js # مدل برای ذخیره‌سازی لیست کانال ها
│ │ └── config.js # مدل برای ذخیره‌سازی شماره کاربر اصلی / گروه تایید خبر / کانال انتشار خبر
│ │ └── connection.js # مدل ارتبط با تلگرام
│ │ └── sessionModel.js # مدل برای ذخیره‌سازی سشن‌ها
│ │
│ ├── services/
│ │ ├── bot/
│ │ │ └── admin.js # اضافه و حدف یوزر با ربات
│ │ │ └── buttons.js # ساخت دکمه های ربات
│ │ │ └── channel.js # اضافه و حذف کانال
│ │ │ └── groupHandler.js # هندلر گروه برای تایید یا رد خبر
│ │ │ └── handler.js # هندلر ربات برای اضافه کردن یوزر و کانال
│ │ │
│ │ ├── channelService.js # توابع مورد نیاز کانال
│ │ ├── clientService.js # توابع مورد نیاز کلاینت
│ │ └── userService.js # توابع مورد نیاز یوزر
│ │
│ ├── tmp/ # ذخیره فایل های موقت
│ │
│ └── utils/
│ │ └── helpers.js # فایل‌های کمکی و ابزارها
│
│
├── news_channel.js # فایل ورود اصلی برنامه
├── package.json
└── README.md
