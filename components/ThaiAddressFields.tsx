"use client";

import { useMemo } from "react";
import { getAllData } from "thai-data";

export type ThaiAddressValue = {
  district: string;
  postalCode: string;
  province: string;
  subdistrict: string;
};

type ThaiAddressFieldsProps = {
  labels: {
    district: string;
    postalCode: string;
    province: string;
    subdistrict: string;
  };
  onChange: (value: ThaiAddressValue) => void;
  value: ThaiAddressValue;
};

type AddressOption = {
  district: string;
  districtId: string;
  postalCode: string;
  province: string;
  provinceId: string;
  subdistrict: string;
};

const addressDatasource: AddressOption[] = getAllData().flatMap((zipCodeData) => {
  if (!Array.isArray(zipCodeData.subDistrictList) || !Array.isArray(zipCodeData.districtList) || !Array.isArray(zipCodeData.provinceList)) {
    return [];
  }

  return zipCodeData.subDistrictList.flatMap((subdistrict) => {
    const district = zipCodeData.districtList.find((districtItem) => districtItem.districtId === subdistrict.districtId);
    const province = zipCodeData.provinceList.find((provinceItem) => provinceItem.provinceId === subdistrict.provinceId);

    if (!district || !province) {
      return [];
    }

    return [
      {
        district: district.districtName,
        districtId: district.districtId,
        postalCode: zipCodeData.zipCode,
        province: province.provinceName,
        provinceId: province.provinceId,
        subdistrict: subdistrict.subDistrictName,
      },
    ];
  });
});

const uniqueSorted = (values: string[]) => Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b, "th"));

const selectClasses =
  "min-h-12 w-full appearance-none rounded-2xl border border-beige/60 bg-cream px-4 pr-10 text-[15px] font-medium text-ink outline-none transition-colors duration-200 ease-[var(--ease-out-ui)] invalid:text-muted focus:border-ink/55";

export const emptyThaiAddressValue = (): ThaiAddressValue => ({
  district: "",
  postalCode: "",
  province: "",
  subdistrict: "",
});

export function ThaiAddressFields({ labels, onChange, value }: ThaiAddressFieldsProps) {
  const provinceOptions = useMemo(() => uniqueSorted(addressDatasource.map((item) => item.province)), []);
  const districtOptions = useMemo(
    () => uniqueSorted(addressDatasource.filter((item) => item.province === value.province).map((item) => item.district)),
    [value.province],
  );
  const subdistrictOptions = useMemo(
    () =>
      uniqueSorted(
        addressDatasource
          .filter((item) => item.province === value.province && item.district === value.district)
          .map((item) => item.subdistrict),
      ),
    [value.district, value.province],
  );
  const postalCodeOptions = useMemo(
    () =>
      uniqueSorted(
        addressDatasource
          .filter((item) => item.province === value.province && item.district === value.district && item.subdistrict === value.subdistrict)
          .map((item) => item.postalCode),
      ),
    [value.district, value.province, value.subdistrict],
  );

  const updateProvince = (province: string) => {
    onChange({ district: "", postalCode: "", province, subdistrict: "" });
  };

  const updateDistrict = (district: string) => {
    onChange({ ...value, district, postalCode: "", subdistrict: "" });
  };

  const updateSubdistrict = (subdistrict: string) => {
    const matchingPostalCodes = uniqueSorted(
      addressDatasource
        .filter((item) => item.province === value.province && item.district === value.district && item.subdistrict === subdistrict)
        .map((item) => item.postalCode),
    );

    onChange({ ...value, postalCode: matchingPostalCodes.length === 1 ? matchingPostalCodes[0] : "", subdistrict });
  };

  return (
    <div className="mt-3 space-y-3">
      <div className="relative">
        <select className={selectClasses} required value={value.province} onChange={(event) => updateProvince(event.target.value)}>
          <option value="">{labels.province}</option>
          {provinceOptions.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-r border-muted" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <select className={selectClasses} disabled={!value.province} required value={value.district} onChange={(event) => updateDistrict(event.target.value)}>
            <option value="">{labels.district}</option>
            {districtOptions.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-r border-muted" />
        </div>

        <div className="relative">
          <select className={selectClasses} disabled={!value.district} required value={value.subdistrict} onChange={(event) => updateSubdistrict(event.target.value)}>
            <option value="">{labels.subdistrict}</option>
            {subdistrictOptions.map((subdistrict) => (
              <option key={subdistrict} value={subdistrict}>
                {subdistrict}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-r border-muted" />
        </div>
      </div>

      <div className="relative">
        <select className={selectClasses} disabled={!value.subdistrict} required value={value.postalCode} onChange={(event) => onChange({ ...value, postalCode: event.target.value })}>
          <option value="">{labels.postalCode}</option>
          {postalCodeOptions.map((postalCode) => (
            <option key={postalCode} value={postalCode}>
              {postalCode}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-r border-muted" />
      </div>
    </div>
  );
}
