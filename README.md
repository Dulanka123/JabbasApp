# 🍽️ Jabba's Kitchen - Premium Restaurant Management App

A beautiful, modern restaurant management mobile application built with **React Native (Expo)** and **Firebase**.

## ✨ Core Features

### 🔐 **Authentication**
- Beautiful login/signup interface with gradient design
- Email & password authentication via Firebase
- Secure user sessions

### 📊 **Dashboard**
- Real-time statistics overview
  - Total menu items
  - Active orders
  - Revenue tracking
- Quick action buttons for easy navigation
- Recent menu items preview

### 🍔 **Menu Management**
- Add, edit, and delete menu items
- Category-based organization (Appetizers, Main Course, Desserts, Beverages)
- Search functionality
- Filter by category
- Price management
- Item descriptions

### 📋 **Order Management**
- Real-time order tracking
- Order status management:
  - ⏳ Pending
  - 👨‍🍳 Preparing
  - ✅ Ready
  - 📦 Delivered
- Filter orders by status
- Create new orders (for testing/demo)
- Order history

### ⚙️ **Settings & Profile**
- User profile display
- Restaurant settings
- App preferences
- Support & help section
- Logout functionality

---

## 🚀 **NEW! Tier 1 Professional Features**

### 🪑 **Table Management System**
- Visual table floor plan layout
- Real-time status tracking (Available, Occupied, Reserved)
- Customer name and reservation tracking
- Quick add/remove tables
- Table statistics dashboard
- Long-press to delete functionality

### 👨‍🍳 **Kitchen Display System (KDS)**
- Real-time order display for kitchen staff
- Live timer with elapsed time tracking
- Color-coded urgency indicators
- Priority management (High/Normal/Low)
- Auto-sorted by priority and time
- Filter by order status
- One-tap status progression

### 📦 **Inventory Management**
- Complete stock tracking system
- Low stock alerts with color coding
- Multiple unit support (kg, g, L, mL, pcs, dozen)
- Quick quantity adjustments
- Category organization
- Supplier management
- Cost tracking and total inventory value
- Stock level statistics

### 📈 **Advanced Analytics & Reports**
- Period selection (Today/Week/Month)
- Key metrics dashboard (Revenue, Orders, Avg Value)
- Revenue trend chart (Last 7 days)
- Best-selling items ranking
- Category performance breakdown
- Peak hour analysis
- Completion rate tracking

**📖 [Read Full Tier 1 Feature Documentation](./TIER1_FEATURES.md)**

---

## 🎊 **NEW! Tier 2 Customer Experience Features**

### 📱 **QR Code Digital Menu**
- Generate QR codes for all tables
- General menu QR code for marketing
- Share QR codes digitally
- Real-time menu synchronization
- Table-specific ordering links
- Contactless dining experience
- Reduce printing costs

### 👥 **Customer Management (CRM)**
- Complete customer database
- 4-tier loyalty system (Bronze/Silver/Gold/Platinum)
- Automatic tier upgrades based on spending
- Loyalty points tracking (1 point per Rs. 10)
- Order history per customer
- Birthday tracking for special offers
- Customer notes and preferences
- Email & phone management
- Real-time statistics dashboard

### 💳 **Multi-Payment & Billing System**
- Multiple payment methods (Cash/Card/UPI/Split)
- Split bill functionality
- Tip management
- Discount handling
- Automatic receipt generation
- Share receipts digitally
- Payment history tracking
- Real-time revenue analytics

**📖 [Read Full Tier 2 Feature Documentation](./TIER2_FEATURES.md)**

---

## 🌟 **NEW! Tier 3 Enterprise Features**

### 👥 **Staff Management System**
- Complete staff database with profiles
- 5 pre-defined roles (Owner/Manager/Chef/Waiter/Cashier)
- Granular permission system (8 different permissions)
- Shift management (Morning/Afternoon/Evening/Night/Flexible)
- Salary tracking and payroll management
- Staff status tracking (Active/Inactive/On-leave)
- Personal notes and special information
- Real-time statistics dashboard

### 📅 **Advanced Reservation System**
- Interactive monthly calendar view
- Date-specific booking system
- Guest count and table assignment
- Time slot management
- 4 reservation statuses (Confirmed/Pending/Cancelled/Completed)
- Special requests and dietary notes
- Customer contact management
- Visual booking indicators on calendar
- Today's reservations quick view
- Upcoming reservations tracking

**📖 [Read Full Tier 3 Feature Documentation](./TIER3_FEATURES.md)**

---


## 🎨 Design Features

- **Modern UI/UX** - Premium gradient designs
- **Smooth Animations** - Interactive touch feedback
- **Card-based Layout** - Clean, organized interface
- **Custom Color Palette** - Vibrant orange & golden themes
- **Responsive Design** - Works on all screen sizes
- **Dark Mode Ready** - Prepared for dark theme implementation

## 🛠️ Tech Stack

- **Framework:** React Native (Expo SDK 54)
- **Language:** TypeScript
- **Backend:** Firebase (Authentication + Firestore)
- **Routing:** Expo Router
- **UI:** Custom components with Linear Gradients
- **Icons:** Emoji-based design system

## 📦 Installation

1. **Clone the repository**
   ```bash
   cd JabbasKitchen
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Update `firebaseConfig.js` with your Firebase credentials
   - Enable Email/Password authentication in Firebase Console
   - Create Firestore database

4. **Start the app**
   ```bash
   npx expo start
   ```

5. **Run on device/emulator**
   - Scan QR code with Expo Go app (iOS/Android)
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Press `w` for web

## 📱 App Structure

```
JabbasKitchen/
├── app/
│   ├── _layout.tsx          # Root navigation layout
│   ├── index.tsx            # Login/Signup screen
│   ├── dashboard.tsx        # Main dashboard with 11 quick actions
│   ├── menu.tsx             # Menu list & management
│   ├── add-menu-item.tsx    # Add new menu item
│   ├── orders.tsx           # Orders management
│   ├── add-order.tsx        # Create new order
│   ├── tables.tsx           # 🆕 Table management system
│   ├── kitchen.tsx          # 🆕 Kitchen display system
│   ├── inventory.tsx        # 🆕 Inventory tracking
│   ├── analytics.tsx        # 🆕 Analytics & reports
│   ├── qr-menu.tsx          # 🌟 QR code digital menu
│   ├── customers.tsx        # 🌟 CRM & loyalty system
│   ├── payments.tsx         # 🌟 Payment & billing
│   ├── staff.tsx            # ⭐ Staff management
│   ├── reservations.tsx     # ⭐ Reservation system
│   └── profile.tsx          # User profile & settings
├── components/              # Reusable components
├── constants/
│   ├── Colors.ts           # Color palette
│   └── Styles.ts           # Global styles
├── firebaseConfig.js       # Firebase configuration
├── TIER1_FEATURES.md       # 🆕 Tier 1 features documentation
├── TIER2_FEATURES.md       # 🌟 Tier 2 features documentation
├── TIER3_FEATURES.md       # ⭐ Tier 3 features documentation
└── package.json
```

## 🔥 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** → Email/Password
4. Create **Firestore Database**
5. Add collections:
   - `menu` - For menu items
   - `orders` - For orders
   - `tables` - 🆕 For table management
   - `inventory` - 🆕 For stock tracking
   - `customers` - 🌟 For CRM & loyalty
   - `payments` - 🌟 For payment records
   - `staff` - ⭐ For staff management
   - `reservations` - ⭐ For bookings
6. Copy your config to `firebaseConfig.js`

## 🚀 Quick Start Guide

### First Time Setup
1. Install dependencies: `npm install`
2. Start Expo: `npx expo start`
3. Open app on Expo Go
4. Create an account (Sign Up)
5. Login with your credentials

### Using the App
1. **Dashboard** - View statistics and quick actions
2. **Menu** - Manage your restaurant menu
3. **Orders** - Track and manage customer orders
4. **Profile** - Configure settings and logout

## 📸 Screenshots

The app features:
- 🎨 Beautiful gradient login screen
- 📊 Stats dashboard with colorful cards
- 🍔 Menu management with search & filters
- 📋 Order tracking with status updates
- ⚙️ Comprehensive settings page

## 🌟 Key Highlights

- **Premium Design** - Modern, professional UI that stands out
- **Real-time Updates** - Live data sync with Firestore
- **Easy Navigation** - Intuitive user flow
- **Fully Functional** - Complete CRUD operations
- **Production Ready** - Built with best practices

## 📝 Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npm run lint` - Check code quality

## 🔮 Future Enhancements

### ✅ Completed (Tier 1 - Operations)
- [x] Table management - 🆕 **LIVE!**
- [x] Revenue analytics & reports - 🆕 **LIVE!**
- [x] Inventory management - 🆕 **LIVE!**
- [x] Kitchen Display System - 🆕 **LIVE!**


### ✅ Completed (Tier 2 - Customer Experience)
- [x] QR code digital menu - 🌟 **LIVE!**
- [x] Customer management (CRM) - 🌟 **LIVE!**
- [x] Multi-payment options & split bills - 🌟 **LIVE!**
- [x] Receipt generation - 🌟 **LIVE!**
- [x] Loyalty points system - 🌟 **LIVE!**

### ✅ Completed (Tier 3 - Enterprise Features)
- [x] Staff management with roles - ⭐ **LIVE!**
- [x] Reservation system with calendar - ⭐ **LIVE!**

### Tier 4 - Future Enhancements
- [ ] Push notifications for orders and alerts  
- [ ] Multi-restaurant support
- [ ] Dark mode toggle
- [ ] Multiple language support
- [ ] Payment gateway integration
- [ ] Image upload for menu items


## 🤝 Contributing

Feel free to contribute to this project! Open issues or submit pull requests.

## 📄 License

This project is open source and available for educational purposes.

## 👨‍💻 Developer

Built with ❤️ for Jabba's Kitchen Restaurant

---

**Enjoy managing your restaurant with style! 🎉**
