# 🚀 Getting Started with Jabba's Kitchen

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo Go app on your phone (optional)
- Android Studio or Xcode (for emulators, optional)

## Step-by-Step Setup

### 1️⃣ Install Dependencies
```bash
cd JabbasKitchen
npm install
```

### 2️⃣ Start the Development Server
```bash
npx expo start
```

### 3️⃣ Open the App
You have several options:

**Option A: Physical Device (Recommended for first time)**
1. Install "Expo Go" app from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in terminal
3. App will load on your phone

**Option B: Android Emulator**
1. Ensure Android Studio is installed
2. Start an Android emulator
3. Press `a` in the terminal

**Option C: iOS Simulator (Mac only)**
1. Ensure Xcode is installed
2. Press `i` in the terminal

**Option D: Web Browser**
1. Press `w` in the terminal
2. App opens in browser (limited functionality)

## 🔑 First Time Login

### Create Account
1. Open the app
2. Click "Sign Up" tab
3. Enter email: `admin@jabbaskitchen.com`
4. Enter password: `admin123`
5. Click "Create Account"
6. Switch to "Login" tab
7. Login with same credentials

### Test Account (If Already Created)
- Email: `admin@jabbaskitchen.com`
- Password: `admin123`

## 📱 App Navigation Flow

```
Login Screen
    ↓
Dashboard (Main Screen)
    ├→ Menu Management
    │   ├→ Add Menu Item
    │   └→ Edit/Delete Items
    ├→ Orders
    │   ├→ View All Orders
    │   ├→ Filter by Status
    │   └→ Add Test Order
    └→ Profile
        └→ Settings & Logout
```

## 🎯 Quick Actions

### Add Your First Menu Item
1. From Dashboard → Click "Add Item" card
2. Enter name: "Chicken Kottu"
3. Enter price: "1500"
4. Select category: "Main Course"
5. Add description (optional)
6. Click "Save Item"

### Create a Test Order
1. From Dashboard → Click "Orders" card
2. Click the + button (bottom right)
3. Enter customer name (optional)
4. Enter items: "2x Chicken Kottu, 1x Coca Cola"
5. Enter total: "3200"
6. Click "Create Order"

### Manage Order Status
1. Go to Orders screen
2. Find an order with "PENDING" status
3. Click "Start Preparing" → Changes to PREPARING
4. Click "Mark Ready" → Changes to READY
5. Click "Delivered" → Completes order

## 🔧 Troubleshooting

### "Cannot connect to Metro"
- Close all terminals
- Delete `node_modules` folder
- Run `npm install` again
- Start with `npx expo start -c` (clear cache)

### "Firebase error"
- Check `firebaseConfig.js` has correct credentials
- Ensure Firebase Authentication is enabled
- Ensure Firestore database is created

### "Module not found: expo-linear-gradient"
```bash
npm install expo-linear-gradient
```

### App won't load on Expo Go
- Ensure phone and computer are on same WiFi
- Try tunnel mode: `npx expo start --tunnel`

## 📊 App Features Walkthrough

### Dashboard
- View total menu items count
- See active orders count
- Track revenue (sum of menu prices)
- Quick access to all features

### Menu Management
- **Search**: Type in search bar to filter items
- **Categories**: Click category chips to filter
- **Actions**: 
  - ✏️ Edit: Modify item details
  - 🗑️ Delete: Remove item (with confirmation)
  - ➕ FAB: Add new item

### Orders System
- **Status Flow**: Pending → Preparing → Ready → Delivered
- **Filters**: View all orders or filter by status
- **Actions**: Update status or delete order

### Profile & Settings
- View user email
- Access app settings
- Restaurant configuration (coming soon)
- Logout securely

## 🎨 Customization

### Change App Colors
Edit `constants/Colors.ts`:
```typescript
primary: '#FF6B35',  // Change to your brand color
accent: '#F7B731',   // Change accent color
```

### Modify Categories
Edit `app/add-menu-item.tsx`:
```typescript
const CATEGORIES = ['Appetizers', 'Main Course', 'Desserts', 'Beverages'];
// Add your custom categories
```

## 🔥 Firebase Configuration

### Get Your Config
1. Go to Firebase Console
2. Click Project Settings (gear icon)
3. Scroll to "Your apps"
4. Copy configuration object
5. Paste in `firebaseConfig.js`

### Required Firebase Services
- ✅ Authentication (Email/Password)
- ✅ Cloud Firestore
- ✅ (Optional) Storage for images

## 📝 Development Tips

### Hot Reload
- Save any file to see changes instantly
- Shake device to open developer menu
- Press `r` in terminal to reload

### Debugging
- Shake device → "Debug Remote JS"
- Or use React DevTools
- Check terminal for errors

### Building for Production
```bash
# Android APK
eas build --platform android

# iOS IPA
eas build --platform ios
```

## 🆘 Need Help?

- Check terminal for error messages
- Look in browser console (if using web)
- Review Firebase console for data
- Check Expo documentation: https://docs.expo.dev

## 🎉 You're All Set!

Start managing your restaurant with this beautiful app!

**Happy Coding! 👨‍🍳**
