"use client";

import { ThailandAddressTypeahead } from "react-thailand-address-typeahead";

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

export const emptyThaiAddressValue = (): ThaiAddressValue => ({
  district: "",
  postalCode: "",
  province: "",
  subdistrict: "",
});

export function ThaiAddressFields({ labels, onChange, value }: ThaiAddressFieldsProps) {
  return (
    <ThailandAddressTypeahead value={value} onValueChange={onChange}>
      <div className="relative mt-3 space-y-3">
        <ThailandAddressTypeahead.ProvinceInput className="min-h-12 w-full rounded-2xl border border-beige/60 bg-cream px-4 text-[15px] font-medium text-ink outline-none placeholder:text-muted" placeholder={labels.province} />
        <div className="grid grid-cols-2 gap-3">
          <ThailandAddressTypeahead.DistrictInput className="min-h-12 w-full rounded-2xl border border-beige/60 bg-cream px-4 text-[15px] font-medium text-ink outline-none placeholder:text-muted" placeholder={labels.district} />
          <ThailandAddressTypeahead.SubdistrictInput className="min-h-12 w-full rounded-2xl border border-beige/60 bg-cream px-4 text-[15px] font-medium text-ink outline-none placeholder:text-muted" placeholder={labels.subdistrict} />
        </div>
        <ThailandAddressTypeahead.PostalCodeInput className="min-h-12 w-full rounded-2xl border border-beige/60 bg-cream px-4 text-[15px] font-medium text-ink outline-none placeholder:text-muted" inputMode="numeric" placeholder={labels.postalCode} />
        <ThailandAddressTypeahead.CustomSuggestion>
          {(suggestions, shouldVisible, onSuggestionSelected) =>
            shouldVisible && suggestions.length > 0 ? (
              <ul className="absolute left-0 right-0 top-14 z-20 max-h-56 overflow-y-auto rounded-2xl border border-beige/70 bg-[#FDFBF7] p-1 shadow-[0_16px_38px_rgba(74,67,59,0.14)]">
                {suggestions.slice(0, 8).map((suggestion) => (
                  <li key={`${suggestion.province}-${suggestion.district}-${suggestion.subdistrict}-${suggestion.postalCode}`}>
                    <button
                      type="button"
                      className="w-full rounded-xl px-3 py-2 text-left text-[14px] font-medium leading-5 text-ink active:bg-stone-100"
                      onClick={() => onSuggestionSelected(suggestion)}
                    >
                      {suggestion.subdistrict} / {suggestion.district} / {suggestion.province} {suggestion.postalCode}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null
          }
        </ThailandAddressTypeahead.CustomSuggestion>
      </div>
    </ThailandAddressTypeahead>
  );
}
