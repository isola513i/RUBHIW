"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "th" | "en";

const STORAGE_KEY = "rubhiw-language";
const DEFAULT_LANGUAGE: Language = "th";

type Translation = {
  header: {
    home: string;
    openSearch: string;
    shoppingBag: string;
    openMenu: string;
    closeMenu: string;
    searchPanel: string;
    searchPlaceholder: string;
    clearSearch: string;
    submitSearch: string;
    closeSearch: string;
    cancel: string;
    popularSearches: string;
    primaryMenu: string;
    languageLabel: string;
    memberCopy: string;
    joinUs: string;
    signIn: string;
    primaryLinks: string[];
    supportLinks: string[];
  };
  hero: Array<{
    id: string;
    eyebrow: string;
    title: string;
    cta: string;
    imageSrc: string;
    imageAlt: string;
  }>;
  heroSlideLabel: (index: number) => string;
  categories: {
    ariaLabel: string;
    labels: Record<string, string>;
  };
  products: {
    popularPicks: string;
    resultsCount: (count: number) => string;
    empty: string;
    emptyFiltered: string;
    resetFilters: string;
    fallbackDescription: string;
    detailsAria: string;
    closeDetails: string;
    moreActions: string;
    shareFailed: string;
    shareCopied: string;
    addedToast: string;
    viewCart: string;
    readMore: string;
    showLess: string;
    detailLabels: {
      category: string;
      brand: string;
      name: string;
      description: string;
      fullPrice: string;
      salePrice: string;
      status: string;
    };
    addStates: {
      adding: string;
      added: string;
      addToCart: string;
    };
    statusLabels: Record<string, string>;
  };
  filters: {
    category: string;
    allFilters: string;
    filtersTitle: string;
    sortBy: string;
    featured: string;
    bestDeal: string;
    priceHighLow: string;
    priceLowHigh: string;
    status: string;
    ready: string;
    preorder: string;
    outOfStock: string;
    priceSelect: string;
    priceRanges: string[];
    clear: string;
    apply: string;
    close: string;
  };
  cart: {
    eyebrow: string;
    title: string;
    clear: string;
    syncFailed: string;
    loading: string;
    decreaseQuantity: (name: string) => string;
    increaseQuantity: (name: string) => string;
    remove: (name: string) => string;
    emptyTitle: string;
    emptyDescription: string;
    browseProducts: string;
    subtotal: string;
    cargoEstimate: string;
    tbc: string;
    total: string;
    prepareCheckout: string;
    checkoutTitle: string;
    contactTitle: string;
    customerName: string;
    customerContact: string;
    shippingAddress: string;
    paymentTitle: string;
    paymentInstruction: string;
    promptPayMissing: string;
    qrAlt: string;
    uploadSlip: string;
    slipRequirement: string;
    slipInvalidType: string;
    slipTooLarge: string;
    slipSelected: (name: string) => string;
    submitOrder: string;
    orderSubmitFailed: string;
    driveUploadSetupRequired: string;
    orderSubmitted: string;
    reviewStatus: string;
    orderNumber: string;
    confirmationCopy: string;
    copyOrderNumber: string;
    orderNumberCopied: string;
    trackOrder: string;
  };
  placeholders: Record<
    string,
    {
      eyebrow: string;
      title: string;
      description: string;
    }
  >;
  backToHome: string;
};

const translations: Record<Language, Translation> = {
  th: {
    header: {
      home: "หน้าแรก RUBHIW",
      openSearch: "เปิดการค้นหา",
      shoppingBag: "ถุงช้อปปิ้ง",
      openMenu: "เปิดเมนู",
      closeMenu: "ปิดเมนู",
      searchPanel: "แผงค้นหา",
      searchPlaceholder: "ค้นหา",
      clearSearch: "ล้างคำค้นหา",
      submitSearch: "ค้นหา",
      closeSearch: "ปิดการค้นหา",
      cancel: "ยกเลิก",
      popularSearches: "ค้นหายอดนิยม",
      primaryMenu: "เมนูหลัก",
      languageLabel: "ภาษา",
      memberCopy: "หลังส่งคำสั่งซื้อแล้ว ใช้เลขคำสั่งซื้อพร้อมเบอร์โทรหรือ LINE เพื่อติดตามสถานะตรวจสลิปและเลขพัสดุ",
      joinUs: "ติดตามคำสั่งซื้อ",
      signIn: "ดูถุงสินค้า",
      primaryLinks: ["ทั้งหมด", "สกินแคร์", "เมคอัพ", "ขนม", "พรีออเดอร์"],
      supportLinks: ["ติดตามคำสั่งซื้อ", "สถานะขนส่ง", "ถุงพรีออเดอร์"],
    },
    hero: [
      {
        id: "cargo-drop",
        eyebrow: "รอบขนส่งใหม่",
        title: "พรีออเดอร์สกินแคร์ เมคอัพ และขนมเกาหลี",
        cta: "เลือกซื้อเลย",
        imageSrc: "/image/hero01.png",
        imageAlt: "ภาพฮีโร่สกินแคร์เกาหลี RUBHIW",
      },
      {
        id: "fresh-arrival",
        eyebrow: "สินค้าเข้าใหม่",
        title: "คัดสรรสกินแคร์เกาหลีสำหรับรูทีนทุกวัน",
        cta: "เลือกซื้อเลย",
        imageSrc: "/image/hero.jpg",
        imageAlt: "คอลเลกชันบิวตี้เกาหลี RUBHIW",
      },
    ],
    heroSlideLabel: (index) => `ไปยังสไลด์ฮีโร่ที่ ${index}`,
    categories: {
      ariaLabel: "หมวดหมู่สินค้า",
      labels: {
        All: "ทั้งหมด",
        Skincare: "สกินแคร์",
        Makeup: "เมคอัพ",
        Snacks: "ขนม",
      },
    },
    products: {
      popularPicks: "สินค้ายอดนิยม",
      resultsCount: (count) => `${count} รายการ`,
      empty: "ยังไม่มีสินค้าในตอนนี้",
      emptyFiltered: "ไม่พบสินค้าที่ตรงกับตัวกรอง",
      resetFilters: "ล้างตัวกรอง",
      fallbackDescription: "รายละเอียดสินค้าจะอัปเดตเร็ว ๆ นี้",
      detailsAria: "รายละเอียดสินค้า",
      closeDetails: "ปิดรายละเอียดสินค้า",
      moreActions: "ตัวเลือกสินค้าเพิ่มเติม",
      shareFailed: "ไม่สามารถแชร์สินค้าได้",
      shareCopied: "คัดลอกลิงก์สินค้าแล้ว",
      addedToast: "เพิ่มสินค้าเข้าถุงแล้ว",
      viewCart: "ดูถุง",
      readMore: "อ่านเพิ่มเติม",
      showLess: "ย่อ",
      detailLabels: {
        category: "หมวดหมู่",
        brand: "แบรนด์",
        name: "ชื่อสินค้า",
        description: "สรรพคุณ",
        fullPrice: "ราคาเต็ม",
        salePrice: "ราคาลด",
        status: "สถานะ",
      },
      addStates: {
        adding: "กำลังเพิ่ม",
        added: "เพิ่มแล้ว",
        addToCart: "เพิ่มลงถุง",
      },
      statusLabels: {
        "in stock": "พร้อมขาย",
        preorder: "พรีออเดอร์",
        "pre-order": "พรีออเดอร์",
        "out of stock": "สินค้าหมด",
        hidden: "ซ่อนสินค้า",
      },
    },
    filters: {
      category: "หมวดหมู่",
      allFilters: "ตัวกรอง",
      filtersTitle: "ตัวกรอง",
      sortBy: "เรียงตาม",
      featured: "สินค้าแนะนำ",
      bestDeal: "ดีลดีที่สุด",
      priceHighLow: "ราคา: สูง-ต่ำ",
      priceLowHigh: "ราคา: ต่ำ-สูง",
      status: "สถานะสินค้า",
      ready: "พร้อมขาย",
      preorder: "พรีออเดอร์",
      outOfStock: "สินค้าหมด",
      priceSelect: "ช่วงราคา",
      priceRanges: ["ต่ำกว่า ฿300", "฿300 - ฿600", "สูงกว่า ฿600"],
      clear: "ล้าง",
      apply: "ใช้",
      close: "ปิด",
    },
    cart: {
      eyebrow: "ถุงช้อปปิ้ง",
      title: "ถุงพรีออเดอร์ของคุณ",
      clear: "ล้างถุง",
      syncFailed: "ไม่สามารถรีเฟรชถุงสินค้าได้ กรุณาลองอีกครั้ง",
      loading: "กำลังรีเฟรชถุงสินค้า...",
      decreaseQuantity: (name) => `ลดจำนวน ${name}`,
      increaseQuantity: (name) => `เพิ่มจำนวน ${name}`,
      remove: (name) => `นำ ${name} ออกจากถุง`,
      emptyTitle: "ถุงของคุณยังว่างอยู่",
      emptyDescription: "เพิ่มสินค้าพรีออเดอร์จากแคตตาล็อก แล้วสินค้าจะแสดงที่นี่",
      browseProducts: "เลือกดูสินค้า",
      subtotal: "ยอดสินค้า",
      cargoEstimate: "ค่าขนส่งโดยประมาณ",
      tbc: "รอแจ้ง",
      total: "รวม",
      prepareCheckout: "ส่งคำสั่งซื้อ",
      checkoutTitle: "ชำระเงิน",
      contactTitle: "ข้อมูลจัดส่ง",
      customerName: "ชื่อผู้รับ",
      customerContact: "เบอร์โทรหรือ LINE",
      shippingAddress: "ที่อยู่จัดส่ง",
      paymentTitle: "PromptPay",
      paymentInstruction: "สแกน QR เพื่อชำระเงิน แล้วแนบสลิปให้ร้านตรวจสอบ",
      promptPayMissing: "ยังไม่ได้ตั้งค่า NEXT_PUBLIC_PROMPTPAY_ID จึงยังสร้าง QR รับเงินจริงไม่ได้",
      qrAlt: "QR PromptPay สำหรับชำระเงิน",
      uploadSlip: "แนบสลิป",
      slipRequirement: "รองรับไฟล์รูปภาพเท่านั้น ขนาดไม่เกิน 5MB ร้านจะตรวจยอดและเวลาชำระเงินจากสลิป",
      slipInvalidType: "กรุณาแนบไฟล์รูปภาพของสลิป",
      slipTooLarge: "ไฟล์สลิปต้องไม่เกิน 5MB",
      slipSelected: (name) => `แนบแล้ว: ${name}`,
      submitOrder: "ส่งสลิปให้ร้านตรวจ",
      orderSubmitFailed: "ไม่สามารถส่งคำสั่งซื้อได้ กรุณาลองอีกครั้ง",
      driveUploadSetupRequired: "ยังส่งคำสั่งซื้อไม่ได้ เพราะ Google Drive ของร้านยังไม่พร้อมรับสลิป",
      orderSubmitted: "ส่งคำสั่งซื้อแล้ว",
      reviewStatus: "รอตรวจสลิป",
      orderNumber: "เลขคำสั่งซื้อ",
      confirmationCopy: "ร้านได้รับคำสั่งซื้อแล้ว เก็บเลขนี้ไว้เพื่อติดตามสถานะตรวจสลิปและเลขพัสดุ",
      copyOrderNumber: "คัดลอกเลขคำสั่งซื้อ",
      orderNumberCopied: "คัดลอกเลขคำสั่งซื้อแล้ว",
      trackOrder: "ติดตามคำสั่งซื้อ",
    },
    placeholders: {
      products: {
        eyebrow: "แคตตาล็อก",
        title: "หน้ารวมสินค้ากำลังจะมา",
        description: "หน้านี้จะขยายจากหน้าแรกให้เลือกดูสินค้า จัดเรียง และกรองหมวดหมู่ได้ครบขึ้น",
      },
      search: {
        eyebrow: "ค้นหา",
        title: "ระบบค้นหากำลังเตรียมพร้อม",
        description: "หน้านี้จะรองรับการค้นหาสินค้า กรองแบรนด์ และค้นพบสินค้าพรีออเดอร์",
      },
      track: {
        eyebrow: "ติดตามสินค้า",
        title: "หน้าติดตามกำลังตั้งค่า",
        description: "หน้านี้จะแสดงสถานะขนส่ง ช่วงเวลาถึงโดยประมาณ และสถานะคำสั่งซื้อ",
      },
      profile: {
        eyebrow: "โปรไฟล์",
        title: "โปรไฟล์สมาชิกกำลังจะมา",
        description: "หน้านี้จะเชื่อมต่อการเข้าสู่ระบบ คำสั่งซื้อ สินค้าที่บันทึกไว้ และอัปเดตการจัดส่ง",
      },
    },
    backToHome: "กลับหน้าแรก",
  },
  en: {
    header: {
      home: "RUBHIW home",
      openSearch: "Open search",
      shoppingBag: "Shopping bag",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      searchPanel: "Search panel",
      searchPlaceholder: "Search",
      clearSearch: "Clear search",
      submitSearch: "Search",
      closeSearch: "Close search",
      cancel: "Cancel",
      popularSearches: "Popular searches",
      primaryMenu: "Primary menu",
      languageLabel: "Language",
      memberCopy: "After submitting an order, use your order number with the phone or LINE contact to check slip review and tracking updates.",
      joinUs: "Track order",
      signIn: "View bag",
      primaryLinks: ["All", "Skincare", "Makeup", "Snacks", "Pre-order"],
      supportLinks: ["Track order", "Shipping status", "Preorder bag"],
    },
    hero: [
      {
        id: "cargo-drop",
        eyebrow: "New cargo round",
        title: "Pre-order Korean care, makeup, and snacks.",
        cta: "Shop now",
        imageSrc: "/image/hero01.png",
        imageAlt: "RUBHIW Korean skincare hero",
      },
      {
        id: "fresh-arrival",
        eyebrow: "Fresh arrival",
        title: "Discover curated Korean skincare for daily routines.",
        cta: "Shop now",
        imageSrc: "/image/hero.jpg",
        imageAlt: "RUBHIW Korean beauty collection",
      },
    ],
    heroSlideLabel: (index) => `Go to hero slide ${index}`,
    categories: {
      ariaLabel: "Product categories",
      labels: {
        All: "All",
        Skincare: "Skincare",
        Makeup: "Makeup",
        Snacks: "Snacks",
      },
    },
    products: {
      popularPicks: "Popular Picks",
      resultsCount: (count) => `${count} item${count === 1 ? "" : "s"}`,
      empty: "No products available right now.",
      emptyFiltered: "No products match these filters.",
      resetFilters: "Reset filters",
      fallbackDescription: "Product details will be updated soon.",
      detailsAria: "Product details",
      closeDetails: "Close product details",
      moreActions: "More product actions",
      shareFailed: "Could not share this product",
      shareCopied: "Product link copied",
      addedToast: "Item added to cart",
      viewCart: "View Cart",
      readMore: "Read more",
      showLess: "Show less",
      detailLabels: {
        category: "Category",
        brand: "Brand",
        name: "Product name",
        description: "Description",
        fullPrice: "Full price",
        salePrice: "Sale price",
        status: "Status",
      },
      addStates: {
        adding: "Adding",
        added: "Added!",
        addToCart: "Add to Cart",
      },
      statusLabels: {
        "in stock": "In stock",
        preorder: "Pre-order",
        "pre-order": "Pre-order",
        "out of stock": "Out of stock",
        hidden: "Hidden",
      },
    },
    filters: {
      category: "Category",
      allFilters: "Filters",
      filtersTitle: "Filters",
      sortBy: "Sort by",
      featured: "Featured",
      bestDeal: "Best deal",
      priceHighLow: "Price: High-Low",
      priceLowHigh: "Price: Low-High",
      status: "Product status",
      ready: "Ready to sell",
      preorder: "Pre-order",
      outOfStock: "Out of stock",
      priceSelect: "Price range",
      priceRanges: ["Under ฿300", "฿300 - ฿600", "Over ฿600"],
      clear: "Clear",
      apply: "Apply",
      close: "Close",
    },
    cart: {
      eyebrow: "Shopping Bag",
      title: "Your preorder bag",
      clear: "Clear",
      syncFailed: "Could not refresh your bag. Please try again.",
      loading: "Refreshing your bag...",
      decreaseQuantity: (name) => `Decrease ${name} quantity`,
      increaseQuantity: (name) => `Increase ${name} quantity`,
      remove: (name) => `Remove ${name}`,
      emptyTitle: "Your bag is empty.",
      emptyDescription: "Add preorder items from the catalog and they will appear here.",
      browseProducts: "Browse products",
      subtotal: "Subtotal",
      cargoEstimate: "Cargo estimate",
      tbc: "TBC",
      total: "Total",
      prepareCheckout: "Submit order",
      checkoutTitle: "Payment",
      contactTitle: "Delivery details",
      customerName: "Recipient name",
      customerContact: "Phone or LINE",
      shippingAddress: "Shipping address",
      paymentTitle: "PromptPay",
      paymentInstruction: "Scan the QR to pay, then upload your slip for shop review.",
      promptPayMissing: "NEXT_PUBLIC_PROMPTPAY_ID is not configured, so a real payment QR cannot be generated yet.",
      qrAlt: "PromptPay QR for payment",
      uploadSlip: "Upload slip",
      slipRequirement: "Image files only, up to 5MB. The shop will review the amount and payment time from the slip.",
      slipInvalidType: "Please upload an image file of the payment slip.",
      slipTooLarge: "Slip file must be 5MB or smaller.",
      slipSelected: (name) => `Attached: ${name}`,
      submitOrder: "Submit slip for review",
      orderSubmitFailed: "Could not submit your order. Please try again.",
      driveUploadSetupRequired: "Order submission is not ready because the shop's Google Drive cannot receive slips yet.",
      orderSubmitted: "Order submitted",
      reviewStatus: "Slip pending review",
      orderNumber: "Order number",
      confirmationCopy: "The shop received your order. Keep this number to track slip review and shipment updates.",
      copyOrderNumber: "Copy order number",
      orderNumberCopied: "Order number copied",
      trackOrder: "Track order",
    },
    placeholders: {
      products: {
        eyebrow: "Catalog",
        title: "Full catalog view comes next.",
        description: "This screen will expand the mobile homepage into full browsing, sorting, and category filtering.",
      },
      search: {
        eyebrow: "Search",
        title: "Search is being prepared.",
        description: "This screen will handle product lookup, brand filtering, and preorder discovery.",
      },
      track: {
        eyebrow: "Tracking",
        title: "Tracking view is being set up.",
        description: "This screen will show cargo milestones, estimated arrival windows, and order status.",
      },
      profile: {
        eyebrow: "Profile",
        title: "Member profile is on the way.",
        description: "This screen will connect to NextAuth.js for sign-in, orders, saved items, and shipping updates.",
      },
    },
    backToHome: "Back to home",
  },
};

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translation;
  categoryLabel: (category: string) => string;
  statusLabel: (status: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const isLanguage = (value: string | null): value is Language => value === "th" || value === "en";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem(STORAGE_KEY);

    if (isLanguage(storedLanguage)) {
      setLanguageState(storedLanguage);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const value = useMemo<I18nContextValue>(() => {
    const t = translations[language];

    return {
      language,
      setLanguage: setLanguageState,
      t,
      categoryLabel: (category) => t.categories.labels[category] ?? category,
      statusLabel: (status) => t.products.statusLabels[status.trim().toLowerCase()] ?? status,
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within LanguageProvider");
  }

  return context;
}
