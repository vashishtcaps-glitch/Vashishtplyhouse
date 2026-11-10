# Automated GST Billing Engine, Catalog Master & Multi-Copy Print System

A production-grade upgrade for **M/s Vashisht Ply House** transforming the POS billing system into an automated GST accounting and inventory engine with dynamic state-tax regime routing, line-item dual-pricing math (GST Inclusive vs. Exclusive), persistent Product Master catalog management, intelligent autocomplete suggestions, hybrid HSN selection, and statutory multi-copy A4 print generation.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed based on your workflow preferences:

- **Confirmed Decision 1 (Settings & Catalog Architecture)**: Access and manage the Product Master Catalog and Official Business/Bank Profile through a unified **Tabbed Modal** (`[Product Catalog Master]` and `[Business & Bank Profile]` tabs) accessible via the top-header gear icon.
- **Confirmed Decision 2 (Pricing Mode Default)**: Default all new blank item rows to **GST Inclusive** (`isTaxInclusive: true`), tailored for fast counter retail and MRP sales where the total customer price is entered directly.
- **Confirmed Decision 3 (Statutory Multi-Copy Print Default)**: The A4 print/PDF modal pre-selects **"Print Complete 3-Copy Set"** by default with strict CSS `@media print` page breaks:
  1. *Original for Recipient (Buyer Copy)*
  2. *Duplicate for Transporter (Vehicle Copy)*
  3. *Triplicate for Supplier (Office Copy)*
  Individual copy checkboxes are also provided for single-copy re-prints.

---

### 1. Overview & Core Concept

- **What It Delivers**: An industrial-strength counter billing and POS workstation for timber, plywood, hardware, and adhesives that eliminates manual tax calculation errors, enforces statutory Indian GST rules, and speeds up customer checkout through catalog autofill.
- **Target Audience / Persona**: Counter sales managers and billing operators at M/s Vashisht Ply House (Badehar Upperla, Una, Himachal Pradesh) handling rapid consumer sales, transport-bound inter-state dispatches, and contractor bulk orders.
- **Key Workflow**:
  1. Operator enters/selects Buyer Name and State. If Place of Supply is Himachal Pradesh (`02`), the engine automatically routes to **CGST + SGST (9% + 9%)**. If outside HP (`03 Punjab`, `04 Chandigarh`, `07 Delhi`, etc.), it automatically routes to **IGST (18%)** and displays a live tax regime indicator.
  2. In the Items table, typing in the Description field triggers an immediate, zero-latency dropdown with matching items from the local Master Catalog.
  3. Selecting a catalog item automatically sets HSN, Unit, Rate, and Pricing Mode (GST Incl. vs Excl.).
  4. The operator can toggle between **GST Inclusive** (retail MRP) and **GST Exclusive** (+ GST extra) at any line item with instantaneous back-calculation of base taxable rates and exact tax lines.
  5. Operator clicks `[ 🖨️ Generate & Print A4 Tax Invoice ]` to preview the Tally-standard A4 GST invoice and print all 3 statutory copies in one continuous, page-broken print run.

---

### 2. User Experience & Visual Design

#### A. Aesthetic Direction & Color Palette
- **Canvas & Tone**: Deep obsidian and dark slate backdrop (`#070b14` to `#0f172a`), refined fine-line borders (`border-white/[0.08]`), and high-contrast typography adhering to the Fintech/SaaS dashboard standard.
- **Accent Palette**:
  - Emerald (`#10b981`): Primary actions, grand totals, and confirmed status.
  - Amber (`#f59e0b`): Invoice numbering, monetary accents, and warning alerts.
  - Cyan (`#06b6d4`): Intra-state and Inter-state tax regime indicators.
  - Slate (`#64748b` to `#94a3b8`): Descriptive labels and structural outlines.
- **Typography & Numerical Discipline**:
  - Display & Headings: `Outfit` and `Plus Jakarta Sans`.
  - Financial Data & Quantities: Strict `font-mono tabular-nums` (`JetBrains Mono`) for decimal alignment across all tables, subtotals, tax rows, and A4 print cells.

#### B. Key Screen Modules & Enhancements

1. **Dynamic Tax Regime Badge**:
   - Prominently rendered in the Customer Details card adjacent to the Buyer State dropdown:
     - `Intra-State (HP 02) • CGST (9%) + SGST (9%)` with subtle emerald pill-less text styling.
     - `Inter-State (Code XX) • IGST (18%)` with subtle cyan text styling.
2. **Items & Billing Table (Refined Flat Grid)**:
   - Columns: `#` | `Description (with Autocomplete)` | `HSN (Hybrid Datalist)` | `Qty` | `Unit` | `Rate Mode (Incl/Excl)` | `Rate (₹)` | `GST %` | `Total (₹)` | `Action`.
   - **Autocomplete Dropdown**: Appears directly below the active item input when typing, displaying item name, HSN, unit, and default rate. Keyboard accessible and click-to-select.
   - **Hybrid HSN Selector**: Clean text input with standard datalist presets (`4412`, `8302`, `3506`, `7317`, `7318`, `4823`, `3920`, `996511`, `44092990`) allowing instant preset selection or arbitrary custom code typing.
   - **Dual Pricing Toggle**: Compact segmented pill button inside each row (`[Incl] [Excl]`).
   - **Dynamic Unit Helper**: Interactive calculator popover for `SQFT` units calculating sheets $\times$ sheet area (e.g. $6 \times 32 = 192$ sq.ft).
3. **Tabbed Settings & Catalog Master Modal**:
   - Tab 1: **Product Catalog Master**:
     - Live searchable table of all catalog products.
     - Add New Product / Edit / Delete modal drawer.
     - Pre-populated with 23 default Vashisht Ply House products across Fasteners (7317/7318), Hardware (8302), Plywood & Timber (4412/4408/4409), Adhesives (3506), Laminates (4823/3919/3920), and Freight (996511).
     - Reset to Factory Defaults button.
   - Tab 2: **Business & Bank Profile**:
     - Editable Firm Name, Proprietor, GSTIN, Address, Contact Phones, and official bank details (`Himachal Pradesh Gramin Bank`, A/C `88672100000390`, IFSC `PUNB0HPGB04`).
4. **Statutory Multi-Copy Print Modal**:
   - Copy Selector Bar:
     - Checkbox: `[x] Print Complete 3-Copy Set`
     - Checkbox: `[ ] Original for Recipient (Buyer)`
     - Checkbox: `[ ] Duplicate for Transporter (Vehicle)`
     - Checkbox: `[ ] Triplicate for Supplier (Office)`
   - Preview switcher tabs to inspect each generated sheet before printing.
   - Print engine renders each checked copy separated by `<div className="page-break" />`.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Client-Side Catalog Storage (`localStorage` + IndexedDB)**:
  - *Chosen Approach*: Store the Master Catalog and user additions in browser `localStorage` under key `vph_product_catalog_v1`, backed by default constants so the application always works offline and immediately on fresh devices.
  - *Why*: High-speed, zero-latency autocomplete while counter typing; no network delay or external server dependencies.
  - *Alternatives Considered*: Remote server SQLite/PostgreSQL (overkill for an offline-first retail counter POS, adds failure modes if internet drops).
- **Decision 2: Mathematical Precision & Round-Off**:
  - *Chosen Approach*: All intermediate line-item calculations round to 2 decimal places using standard financial round-half-up. The invoice grand total rounds to the nearest whole rupee (`Math.round`), and the discrepancy is attributed to an explicit `Round Off` line item (`(+) ₹0.24` or `(-) ₹0.35`) matching statutory Tally standards.
  - *Why*: Prevents fractional rupee disputes in cash and UPI counter settlements.
- **Decision 3: Multi-Copy Print Architecture via CSS Paged Media**:
  - *Chosen Approach*: Render multiple `<InvoicePrintA4 copyTitle="..." />` components inside the printable DOM tree separated by `.page-break { page-break-after: always !important; }`.
  - *Why*: Native `window.print()` outputs all selected copies in a single clean PDF or printer job without requiring canvas conversion or heavy PDF libraries.

---

### 4. Technical Architecture & Data Strategy

#### System & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App.tsx (Root Workspace)                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           │                        │                        │
           ▼                        ▼                        ▼
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│  Top Header & Nav    │ │  InvoiceEditor.tsx   │ │ SettingsCatalogModal │
│  - Invoice # & Date  │ │  - Customer Details  │ │  - Tab 1: Catalog    │
│  - Tax Regime Badge  │ │  - Transport Section │ │    CRUD Table        │
│  - Settings Trigger  │ │  - Items Table +     │ │  - Tab 2: Profile &  │
│  - Archive / Reset   │ │    Autocomplete      │ │    Bank Details      │
└──────────────────────┘ │  - Grand Totals Bar  │ └──────────┬───────────┘
                         └──────────┬───────────┘            │
                                    │                        ▼
                                    ▼               ┌──────────────────┐
                         ┌──────────────────────┐   │   localStorage   │
                         │ InvoicePrintModal    │◄──┤   Catalog Store  │
                         │ - Copy Selector      │   └──────────────────┘
                         │ - Zoom & PDF Action  │
                         │ - Multi-Copy A4 View │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ InvoicePrintA4.tsx   │
                         │ - Copy 1: Original   │
                         │ - [Page Break]       │
                         │ - Copy 2: Duplicate  │
                         │ - [Page Break]       │
                         │ - Copy 3: Triplicate │
                         └──────────────────────┘
```

#### Core Data Schema Updates

1. **`CatalogProduct` Interface (`src/types/invoice.ts`)**:
   ```typescript
   export interface CatalogProduct {
     id: string;
     name: string;
     hsn: string;
     unit: UnitType;
     rate: number;
     isTaxInclusive: boolean;
     taxRate: number;
     category?: string;
   }
   ```
2. **`InvoiceItem` Enhancements**:
   - Ensure `isTaxInclusive`, `rateInclusive`, `rate`, and `unit` seamlessly interact.
   - Supported units: `'SQFT' | 'PCS' | 'PKT' | 'KG' | 'LTR' | 'DRUM' | 'SET' | 'TRIP' | 'OTH'`.
3. **`calculateItemRow` & `calculateInvoiceTotals`**:
   - Dynamically checks `buyerStateCode === firmProfile.stateCode` (`02` for HP).
   - If Intra-State: `cgstRate = taxRate / 2`, `sgstRate = taxRate / 2`, `igstRate = 0`.
   - If Inter-State: `cgstRate = 0`, `sgstRate = 0`, `igstRate = taxRate`.
   - Exact mathematical formula for inclusive rate base taxable extraction:
     $$\text{rate} = \frac{\text{rateInclusive}}{1 + \text{taxRate} / 100}$$

---

### 5. Implementation Steps (Execution Order)

1. **Step 1: Types & Calculation Engine (`src/types/invoice.ts`, `src/utils/calculations.ts`)**:
   - Define `CatalogProduct` and expand `UnitType` to include `PKT`, `KG`, `LTR`, `DRUM`, `SET`, `TRIP`, `OTH`.
   - Update firm profile with complete Badehar Upperla address and phone numbers.
   - Refine `calculateItemRow` and `calculateInvoiceTotals` to enforce exact dual-pricing math and dynamic tax regime splitting.
2. **Step 2: Product Catalog Storage & Default Seed Inventory (`src/utils/storage.ts`)**:
   - Implement `getCatalogProducts()`, `saveCatalogProduct()`, `deleteCatalogProduct()`, and `resetCatalogToDefaults()`.
   - Seed all 23 default products across fasteners, hardware, plywood, adhesives, laminates, and freight charges.
3. **Step 3: Tabbed Settings & Catalog Master Modal (`src/components/SettingsModal.tsx`)**:
   - Build dual-tab interface (`Product Catalog Master` and `Business & Bank Profile`).
   - Include item search, add product form, inline edit, delete, and reset actions.
4. **Step 4: Invoice Editor Enhancements (`src/components/InvoiceEditor.tsx`)**:
   - Add dynamic Tax Regime Badge to Customer Card (`Intra-State HP 02` vs `Inter-State`).
   - Implement line-item autocomplete popup for item description matching catalog products.
   - Add hybrid HSN input with `<datalist>`.
   - Add inline `[Incl] / [Excl]` toggle button for each item row with live rate transformation.
   - Add dynamic Sheet-to-Sq.Ft calculator helper.
5. **Step 5: Statutory Multi-Copy A4 Print Engine (`src/components/InvoicePrintA4.tsx`, `src/components/InvoicePrintModal.tsx`, `src/index.css`)**:
   - Add `copyTitle?: string` prop to `InvoicePrintA4`.
   - In `InvoicePrintModal.tsx`, implement copy selector (`Print Complete 3-Copy Set`, `Original`, `Duplicate`, `Triplicate`).
   - In `src/index.css`, enforce strict `.page-break { page-break-after: always !important; }` rules for multi-copy printing.
6. **Step 6: Verification & Quality Assurance**:
   - Run `lint_applet` (`tsc --noEmit`) and `compile_applet`.
   - Verify calculation correctness across Intra-state and Inter-state scenarios, inclusive/exclusive conversions, and multi-copy print rendering.
