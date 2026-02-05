# Shopify Volume Discount App 🚀

A robust, production-ready Shopify App that allows merchants to create dynamic "Buy X, Get Y% Off" volume discounts. This project demonstrates advanced Shopify development concepts including Custom Functions, Admin UI extensions, and Theme App Extensions.

## 🌟 Key Features

*   **Dynamic Volume Discounts**: Merchants can configure "Buy [Quantity] items, get [Percentage]% off".
*   **Strict Per-Product Logic**: The quantity threshold is enforced per individual product line (e.g., must buy 3 of the *same* item), not just total cart count.
*   **Admin Configuration UI**: A custom embedded Admin page to manage rules, capable of selecting specific products or applying store-wide.
*   **Dynamic Renaming**: The Discount Title in Shopify Admin automatically updates to reflect current settings (e.g., "Volume Discount - Buy 5 Get 20% Off").
*   **Storefront Widget**: A "Volume Discount Banner" Theme App Extension that dynamically appears on eligible product pages to promote the offer.

## 🏗 Architecture

The app is built using the **Remix** template and consists of three synchronized components:

1.  **Admin UI (Remix/React)**:
    *   Manages configuration state using **Dual-Write Storage**:
        *   **Discount Metafields**: For the Checkout Function.
        *   **Shop Metafields**: For the Storefront Widget.
    *   Handles GraphQL mutations to rename discounts and save settings.
2.  **Discount Function (Shopify Functions/Javy)**:
    *   Executes high-performance logic at checkout.
    *   Validates cart lines against the configured quantity threshold.
3.  **Theme App Extension (Liquid/JS)**:
    *   Reads the global Shop Metafield to display the discount banner (`Buy 3, Get 10% Off!`) on product pages.

## 🛠 Tech Stack

*   **Framework**: Remix (Node.js)
*   **UI Library**: Shopify Polaris
*   **Backend**: Shopify Functions (JavaScript compiled to Wasm via Javy)
*   **Frontend**: Liquid & Vanilla JS (Theme App Extension)
*   **Database**: Prisma (SQLite for dev / generic session storage)

## 🚀 Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   Shopify CLI
*   A Shopify Development Store

### Steps

1.  **Clone & Install**
    ```bash
    git clone https://github.com/MrHarshSharma/shopify_discount_app.git
    cd shopify_discount_app
    npm install
    ```

2.  **Start Development Server**
    ```bash
    npm run dev
    ```
    Follow the prompts to link the app to your Shopify Partner account and Development Store.

3.  **Deploy to Shopify**
    To register the function and extension on Shopify:
    ```bash
    npm run deploy
    ```

## 📖 Usage Guide

1.  **Activate Discount**:
    *   Go to **Discounts** in Shopify Admin.
    *   Create a "Volume Discount" and click Activate.
2.  **Configure Rules**:
    *   Open the App in your Admin.
    *   Set **Min Quantity** (e.g., 5) and **Percentage** (e.g., 20).
    *   (Optional) Select specific products using the Picker.
    *   Click **Save**.
3.  **Add Widget to Store**:
    *   Go to **Online Store > Themes > Customize**.
    *   On a **Product Page**, click **Add Block** > **Volume Discount Banner**.
    *   Save the theme.

## 🧠 Technical Highlights & Challenges Overcome

*   **API 2025-04 Compatibility**: Updated mutations to use `discountClasses` (Array) instead of the deprecated `discountClass` string.
*   **Function Input Optimization**: Solved "undefined quantity" errors by explicitly requesting the `quantity` field in the GraphQL input query for the function.
*   **Strict Logic Implementation**: Refactored standard "Mix & Match" logic to enforce strict quantity checks per product line.
*   **Dynamic Renaming**: implemented `discountAutomaticAppUpdate` to keep the Admin Discount list clean and descriptive.

---
*Built with ❤️ by [Your Name]*
