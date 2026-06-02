export const productColors = ["#F3D8CF", "#C9D7C8", "#F6E3A9", "#D6C8E3", "#E9CFC5"];

const brandChipClasses = [
  "bg-[#EEF6E9] text-[#517848] border-[#DCECD5]",
  "bg-[#FCEDEC] text-[#A64A43] border-[#F4D8D5]",
  "bg-[#EEF5F7] text-[#4F7480] border-[#D8E9EE]",
  "bg-[#F8F0E4] text-[#8A643F] border-[#EBDDC9]",
  "bg-[#F4EEF8] text-[#755983] border-[#E5D9EB]",
];

export const getBrandChipClasses = (brand: string) => {
  const hash = brand.split("").reduce((total, character) => total + character.charCodeAt(0), 0);
  return brandChipClasses[hash % brandChipClasses.length];
};

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value);

export const getStatusClasses = (status: string) => {
  switch (status.trim().toLowerCase()) {
    case "in stock":
      return "bg-[var(--status-stock-bg)] text-[var(--status-stock-text)]";
    case "pre-order":
    case "preorder":
      return "bg-[var(--status-preorder-bg)] text-[var(--status-preorder-text)]";
    case "out of stock":
      return "bg-[var(--status-oos-bg)] text-[var(--status-oos-text)]";
    case "hidden":
      return "bg-[var(--status-hidden-bg)] text-[var(--status-hidden-text)]";
    default:
      return "bg-beige/55 text-ink";
  }
};
