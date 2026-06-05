const metroProvinces = new Set(["กรุงเทพมหานคร", "นนทบุรี", "ปทุมธานี", "สมุทรปราการ"]);
const islandSurchargeProvinces = new Set(["ภูเก็ต", "กระบี่", "ตรัง", "สุราษฎร์ธานี", "ตราด", "ชลบุรี", "ระยอง"]);

export type ShippingEstimate = {
  fee: number;
  note: string;
};

export function estimateThailandPostShippingFee(itemCount: number, province: string, postalCode: string): ShippingEstimate {
  const normalizedProvince = province.trim();

  if (!normalizedProvince) {
    return {
      fee: 0,
      note: "เลือกจังหวัดเพื่อคำนวณค่าจัดส่งประมาณการ",
    };
  }

  const baseFee = metroProvinces.has(normalizedProvince) ? 45 : 55;
  const quantityFee = Math.max(0, itemCount - 1) * 10;
  const surcharge = islandSurchargeProvinces.has(normalizedProvince) ? 15 : 0;
  const fee = baseFee + quantityFee + surcharge;
  const postalNote = postalCode.trim() ? ` ปลายทาง ${postalCode.trim()}` : "";

  return {
    fee,
    note: `ประมาณการตามจังหวัด${postalNote} ร้านจะยืนยันค่าส่งจริงหลังตรวจสลิป`,
  };
}
