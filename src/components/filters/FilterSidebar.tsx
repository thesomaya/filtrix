import { useState } from "react";
import FilterSection from "./FilterSection";
import CheckboxFilter from "./CheckboxFilter";
import RadioFilter from "./RadioFilter";
import RangeFilter from "./RangeFilter";
import ToggleFilter from "./ToggleFilter";
import "./FilterSidebar.css";

const CERTIFICATIONS = [
  "CE",
  "FCC",
  "RoHS",
  "Emark",
  "Anatel",
  "Atex",
  "IC",
  "WEEE",
  "EAC",
  "TDRA",
  "IP",
  "PTCRB",
  "CITC",
  "UKCA",
];

const FIRMWARE_UPDATE_OPTIONS = ["Automatic", "Scheduled", "Manual"];
const CASING_MATERIAL = ["Plastic", "Metal"];
const CELLULAR_TECHNOLOGY = ["2G", "3G", "4G", "5G"];

export default function FilterSidebar() {
  // 1. Storage
  const [memorySize, setMemorySize] = useState<[number, number]>([0, 32000]);
  const [dataCompression, setDataCompression] = useState(false);
  const [externalMemorySlot, setExternalMemorySlot] = useState(false);

  // 2. Warranty and Support
  const [warranty, setWarranty] = useState<[number, number]>([0, 36]);
  const [documentPortal, setDocumentPortal] = useState(false);

  // 3. Certification
  const [certifications, setCertifications] = useState<string[]>([]);

  // 4. Device Management
  const [firmwareUpdate, setFirmwareUpdate] = useState<string | null>(null);

  // 6. Physical
  const [weight, setWeight] = useState<[number, number]>([0, 2000]);
  const [casingMaterial, setCasingMaterial] = useState<string[]>([]);

  // 8. Electrical
  const [solarPowered, setSolarPowered] = useState(false);

  // 9. Connectivity
  const [cellularTech, setCellularTech] = useState<string[]>([]);
  const [wifi, setWifi] = useState(false);

  return (
    <aside className="filter-sidebar">
      <div className="filter-sidebar__header">
        <h2 className="filter-sidebar__title">Filters</h2>
      </div>

      <FilterSection title="Storage Specifications">
        <div>
          <p className="filter-sidebar__label">Internal Memory Size (MB)</p>
          <RangeFilter
            min={0}
            max={32000}
            unit=" MB"
            value={memorySize}
            onChange={setMemorySize}
          />
        </div>
        <ToggleFilter
          label="Data Compression"
          checked={dataCompression}
          onChange={setDataCompression}
        />
        <ToggleFilter
          label="External Memory Slot"
          checked={externalMemorySlot}
          onChange={setExternalMemorySlot}
        />
      </FilterSection>

      <FilterSection title="Warranty and Support">
        <div>
          <p className="filter-sidebar__label">Warranty (months, min.)</p>
          <RangeFilter
            min={0}
            max={36}
            unit=" mo"
            value={warranty}
            onChange={setWarranty}
          />
        </div>
        <ToggleFilter
          label="Document Portal"
          checked={documentPortal}
          onChange={setDocumentPortal}
        />
      </FilterSection>

      <FilterSection title="Certification and Compliance">
        <CheckboxFilter
          options={CERTIFICATIONS}
          selected={certifications}
          onChange={setCertifications}
        />
      </FilterSection>

      <FilterSection title="Device Management">
        <div>
          <p className="filter-sidebar__label">Firmware Update Options</p>
          <RadioFilter
            name="firmware-update"
            options={FIRMWARE_UPDATE_OPTIONS}
            selected={firmwareUpdate}
            onChange={setFirmwareUpdate}
          />
        </div>
      </FilterSection>

      <FilterSection title="Physical Specification">
        <div>
          <p className="filter-sidebar__label">Weight (g)</p>
          <RangeFilter
            min={0}
            max={2000}
            unit=" g"
            value={weight}
            onChange={setWeight}
          />
        </div>
        <div>
          <p className="filter-sidebar__label">Casing Material</p>
          <CheckboxFilter
            options={CASING_MATERIAL}
            selected={casingMaterial}
            onChange={setCasingMaterial}
          />
        </div>
      </FilterSection>

      <FilterSection title="Electrical Specification">
        <ToggleFilter
          label="Solar Powered"
          checked={solarPowered}
          onChange={setSolarPowered}
        />
      </FilterSection>

      <FilterSection title="Connectivity Specification">
        <div>
          <p className="filter-sidebar__label">Cellular Technology</p>
          <CheckboxFilter
            options={CELLULAR_TECHNOLOGY}
            selected={cellularTech}
            onChange={setCellularTech}
          />
        </div>
        <ToggleFilter label="WiFi" checked={wifi} onChange={setWifi} />
      </FilterSection>
    </aside>
  );
}