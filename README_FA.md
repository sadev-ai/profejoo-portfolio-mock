# Profejoo — نسخه عمومی برای نمونه‌کار

این ریپو یک **بازسازی عمومی و امن برای پورتفولیو** از پروژه Profejoo است؛ نه سورس اصلی ریپوی خصوصی و نه نسخه Production.

پروژه اصلی توسط یک **تیم ۶ نفره** توسعه داده شده و طبق توضیح صاحب نمونه‌کار، حدود **۸۰٪ فرانت‌اند** توسط او پیاده‌سازی شده است. برای اینکه این نسخه را بتوان در GitHub عمومی قرار داد، بک‌اند خصوصی، دیتابیس، سرویس‌های واقعی Search/AI، اطلاعات کاربران، Secretها و تنظیمات Production حذف شده‌اند.

## چه چیزهایی داخل این خروجی است؟

- `app/`: فرانت اصلی React + TypeScript + Vite با حالت Demo و API ماک.
- `landing/`: لندینگ Astro.
- `demo-static/`: پیش‌نمایش تعاملی بدون هیچ dependency؛ با یک HTTP server ساده اجرا می‌شود.
- `PORTFOLIO_BULLETS.md`: متن آماده برای رزومه و GitHub.

## فیچرهای فرانت‌اند

- احراز هویت: Login، Signup، OTP، Forgot/Reset Password و Protected Routes.
- Dashboard و کارت‌های Overview/Stats/Notifications.
- جست‌وجوی استاد و دانشگاه با فیلتر، Sort، Pagination و Metadata فیلترها.
- صفحه جزئیات استاد شامل آمار، Research Tags، Biography، Highlights، Links و مقالات.
- پروفایل آکادمیک ساختاریافته: اطلاعات پایه، تحصیلات، سابقه کاری/RA/TA، مقاله، پروژه، Talk، Honor، Credential، Skill، Link، Language، Interest و Extra.
- Resume Maker: لیست رزومه‌ها، Card/Table View، Create، Rename، Duplicate، Delete، Completeness، ساخت از Profile، ساخت از صفر، Edit، Autosave-oriented flow، Template/Design و Export/Print/LaTeX.
- Email & SOP Workspace با Tiptap و ذخیره Draft در LocalStorage.
- Notifications با Read/Unread و Mark as Read.
- FAQ/Chatbot با قراردادهای Guest و Session-based.
- Subscription UI و تعدادی مسیر کمکی/Placeholder.

## حالت Demo چطور کار می‌کند؟

Service Layer اصلی فرانت حفظ شده، اما درخواست‌های Axios در حالت Demo به `src/mocks/mockAdapter.ts` می‌روند. داده‌ها Synthetic هستند و تغییرات در `localStorage` مرورگر ذخیره می‌شوند.

پس مسیر فرانت همچنان واقعی و قابل نمایش است:

```text
UI -> Context/Hooks -> Service Layer -> Axios -> Mock Adapter -> LocalStorage
```

در نتیجه برای اجرا به بک‌اند خصوصی، PostgreSQL، Redis، Elasticsearch یا API Key نیاز نیست.

## اجرای سریع بدون نصب پکیج

```bash
cd demo-static
python -m http.server 8000
```

بعد `http://localhost:8000` را باز کنید.

## اجرای فرانت React

Node.js 20+:

```bash
cd app
npm ci
npm run dev
```

اطلاعات Demo از قبل در فرم Login قرار گرفته است:

```text
Email:    demo@profejoo.dev
Password: demo1234
```

## اجرای Landing

```bash
cd landing
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env
pnpm dev
```

## اجرای Docker

```bash
docker compose up --build
```

- App: `http://localhost:8080`
- Landing: `http://localhost:8081`

## تغییراتی که برای نسخه Public انجام شده

- بک‌اند از خروجی عمومی حذف شده.
- سرویس‌های خصوصی با Mock Data جایگزین شده‌اند.
- Login دمویی و داده‌های Synthetic اضافه شده‌اند.
- Google OAuth در Demo Mode غیرفعال شده است.
- مشکل Case-Sensitive Importها برای Linux/CI اصلاح شده است.
- لینک‌های Landing قابل تنظیم شده‌اند.
- فایل‌های CI داخلی و یادداشت‌های Refactor خصوصی حذف شده‌اند.
- فایل‌های فونت از خروجی عمومی حذف شده و System Font استفاده می‌شود.
- یک Preview مستقل و بدون Dependency اضافه شده است.

## نکته برای GitHub و رزومه

بهترین معرفی این پروژه:

> **Public portfolio reconstruction of a private team project**

یعنی صریح گفته شود پروژه اصلی تیمی و Private بوده و این ریپو نسخه بازسازی‌شده برای نمایش توانایی‌های فرانت‌اند است. این مدل هم حرفه‌ای‌تر است و هم باعث نمی‌شود ادعا شود کل محصول یا بک‌اند توسط یک نفر نوشته شده است.

قبل از Public کردن، حتماً مطمئن شوید انتشار Brand، Asset و بخش‌هایی که توسط سایر اعضای تیم نوشته شده‌اند با توافق تیم/مالک پروژه سازگار است.
