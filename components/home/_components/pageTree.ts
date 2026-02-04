// components/home/_components/pageTree.ts
// NOTE: We are intentionally keeping the SAME export names + structure.
// Only the "meaning" / comments are being rebranded to storefront concepts.
// Component file names will be swapped later (we'll keep imports stable for now).

import HomePage from "@/components/home/Landing";                // Storefront Landing
import AboutUsPage from "@/components/home/AboutUs";            // Brand Story / About
import BoardPage from "@/components/home/BoardofDirectors";     // (Placeholder: Brand / Policies / Info)
import Title9Page from "@/components/home/Title9Information";   // (Placeholder: Store Policies)
import Careers from "@/components/home/About/Careers";          // (Placeholder: Contact / Help hub)
import JobsPage from "@/components/home/Jobs";                  // (Placeholder: Help / FAQ)
import ProgramsAndServices from "@/components/home/ProgramsandServices/programsndseevices"; // SHOP hub
import Transportation from "@/components/home/services/Transportation"; // Collection page placeholder
import EarlyChildhood from "@/components/home/services/EarlyChildhood"; // Collection page placeholder
import SupportedLiving from "@/components/home/services/SupportedLiving"; // Collection page placeholder
import Artists from "@/components/home/services/Artists";       // Collection page placeholder
import AutismDayCamp from "@/components/home/LearnAndConnect/AutismDayCamp"; // Collection page placeholder
import Employment from "@/components/home/services/Employment"; // Collection page placeholder
import BusinessServices from "@/components/home/BusinessServices/main"; // Special Page placeholder (New Releases)
import CMSPage from "@/components/home/BusinessServices/cms";   // Special Page placeholder (Restocks)
import Pickup from "@/components/home/BusinessServices/pickup"; // Cowkids hub placeholder
import CARF from "@/components/home/services/CARF";             // Cowboy Valentine page placeholder
import ThriftStore from "@/components/home/services/ThriftStore"; // Occasions hub placeholder
import Shredding from "@/components/home/BusinessServices/Shredding"; // Gift Card page placeholder
import GetInvolved from "@/components/home/GetInvolved/main";   // Best Sellers page placeholder
import DonateNow from "@/components/home/GetInvolved/donatenow"; // Currency / Region selector placeholder
import LearnConnect from "@/components/home/LearnAndConnect/main"; // Account/Sign-in placeholder
import TermsPage from "@/components/home/TermsPage";
import PrivacyPolicy from "@/components/home/PrivacyPolicy";

export interface PageConfig {
  Component: React.FC<any>;
  backKey?: string;
  backLabel?: string;
  anchorId?: string;
}

/**
 * Storefront Page Map (single source of truth)
 * - "home" = storefront landing
 * - "shop" = shop hub (category browser)
 * - leaf nodes = collection pages (placeholder components for now)
 * - special pages = New Releases, Restocks, Gift Card, Best Sellers, etc.
 *
 * IMPORTANT:
 * We keep the same export names and object shape so routing keeps working.
 */
export const pageTree: Record<string, PageConfig> = {
  // ✅ Storefront Landing
  home: { Component: HomePage },

  // ✅ Shop hub (category browser)
  // (Currently mapped to ProgramsAndServices component until we swap files)
  shop: {
    Component: ProgramsAndServices,
    backKey: "home",
    backLabel: "Back to Home",
    anchorId: "shop",
  },

  // ✅ Top-level special pages from your nav
  "new-releases": {
    Component: BusinessServices,
    backKey: "home",
    backLabel: "Back to Home",
    anchorId: "new-releases",
  },
  restocks: {
    Component: CMSPage,
    backKey: "home",
    backLabel: "Back to Home",
    anchorId: "restocks",
  },

  // ✅ Cowkids (hub page)
  cowkids: {
    Component: Pickup,
    backKey: "home",
    backLabel: "Back to Home",
    anchorId: "cowkids",
  },

  // ✅ Cowboy Valentine (single page)
  "cowboy-valentine": {
    Component: CARF,
    backKey: "home",
    backLabel: "Back to Home",
    anchorId: "cowboy-valentine",
  },

  // ✅ Shop Occasions (hub page)
  occasions: {
    Component: ThriftStore,
    backKey: "home",
    backLabel: "Back to Home",
    anchorId: "occasions",
  },

  // ✅ Gift Card page
  "gift-card": {
    Component: Shredding,
    backKey: "home",
    backLabel: "Back to Home",
    anchorId: "gift-card",
  },

  // ✅ Best Sellers page
  "best-sellers": {
    Component: GetInvolved,
    backKey: "home",
    backLabel: "Back to Home",
    anchorId: "best-sellers",
  },

  // ✅ Country/Region (currency selector placeholder)
  region: {
    Component: DonateNow,
    backKey: "home",
    backLabel: "Back to Home",
    anchorId: "region",
  },

  // ✅ Account / Sign-in hub placeholder (optional)
  account: {
    Component: LearnConnect,
    backKey: "home",
    backLabel: "Back to Home",
    anchorId: "account",
  },

  // ✅ Brand/info pages (we’ll rename later; kept for structure)
  about: {
    Component: AboutUsPage,
    backKey: "home",
    backLabel: "Back to Home",
    anchorId: "about",
  },

  // ✅ Legal pages stay as-is
  terms: { Component: TermsPage, backKey: "home", backLabel: "Back to Home", anchorId: "terms" },
  privacy: { Component: PrivacyPolicy, backKey: "home", backLabel: "Back to Home", anchorId: "privacy" },

  // ------------------------------------------------------------------
  // ✅ SHOP: Category/collection pages (placeholders using existing components)
  // These will become real collection pages later.
  // ------------------------------------------------------------------

  // Shop → Desert Girl Exclusives
  "desert-girl-exclusives": {
    Component: Transportation,
    backKey: "shop",
    backLabel: "Back to Shop",
    anchorId: "desert-girl-exclusives",
  },
  "dg-graphics-adults": {
    Component: EarlyChildhood,
    backKey: "desert-girl-exclusives",
    backLabel: "Back to Exclusives",
    anchorId: "dg-graphics-adults",
  },
  "dg-graphics-minis": {
    Component: SupportedLiving,
    backKey: "desert-girl-exclusives",
    backLabel: "Back to Exclusives",
    anchorId: "dg-graphics-minis",
  },
  "dg-clothing": {
    Component: Artists,
    backKey: "desert-girl-exclusives",
    backLabel: "Back to Exclusives",
    anchorId: "dg-clothing",
  },

  // Shop → Tops
  tops: {
    Component: AutismDayCamp,
    backKey: "shop",
    backLabel: "Back to Shop",
    anchorId: "tops",
  },
  "graphic-tees": {
    Component: Employment,
    backKey: "tops",
    backLabel: "Back to Tops",
    anchorId: "graphic-tees",
  },
  "dg-graphic-tees": {
    Component: JobsPage,
    backKey: "tops",
    backLabel: "Back to Tops",
    anchorId: "dg-graphic-tees",
  },
  "tops-blouses": {
    Component: BoardPage,
    backKey: "tops",
    backLabel: "Back to Tops",
    anchorId: "tops-blouses",
  },
  "tanks-mesh": {
    Component: Title9Page,
    backKey: "tops",
    backLabel: "Back to Tops",
    anchorId: "tanks-mesh",
  },
  outerwear: {
    Component: Careers,
    backKey: "tops",
    backLabel: "Back to Tops",
    anchorId: "outerwear",
  },

  // Shop → Bottoms & Sets
  bottoms: {
    Component: ProgramsAndServices,
    backKey: "shop",
    backLabel: "Back to Shop",
    anchorId: "bottoms",
  },
  denim: {
    Component: Transportation,
    backKey: "bottoms",
    backLabel: "Back to Bottoms & Sets",
    anchorId: "denim",
  },
  dresses: {
    Component: EarlyChildhood,
    backKey: "bottoms",
    backLabel: "Back to Bottoms & Sets",
    anchorId: "dresses",
  },
  shorts: {
    Component: SupportedLiving,
    backKey: "bottoms",
    backLabel: "Back to Bottoms & Sets",
    anchorId: "shorts",
  },
  lounge: {
    Component: Artists,
    backKey: "bottoms",
    backLabel: "Back to Bottoms & Sets",
    anchorId: "lounge",
  },

  // Shop → Jewelry & Accessories
  accessories: {
    Component: BusinessServices,
    backKey: "shop",
    backLabel: "Back to Shop",
    anchorId: "accessories",
  },
  "authentic-jewelry": {
    Component: CMSPage,
    backKey: "accessories",
    backLabel: "Back to Jewelry & Accessories",
    anchorId: "authentic-jewelry",
  },
  necklaces: {
    Component: Pickup,
    backKey: "accessories",
    backLabel: "Back to Jewelry & Accessories",
    anchorId: "necklaces",
  },
  bracelets: {
    Component: CARF,
    backKey: "accessories",
    backLabel: "Back to Jewelry & Accessories",
    anchorId: "bracelets",
  },
  bags: {
    Component: ThriftStore,
    backKey: "accessories",
    backLabel: "Back to Jewelry & Accessories",
    anchorId: "bags",
  },
  backpacks: {
    Component: Shredding,
    backKey: "accessories",
    backLabel: "Back to Jewelry & Accessories",
    anchorId: "backpacks",
  },
  headwear: {
    Component: GetInvolved,
    backKey: "accessories",
    backLabel: "Back to Jewelry & Accessories",
    anchorId: "headwear",
  },
  "trucker-caps": {
    Component: DonateNow,
    backKey: "headwear",
    backLabel: "Back to Headwear",
    anchorId: "trucker-caps",
  },
  belts: {
    Component: LearnConnect,
    backKey: "accessories",
    backLabel: "Back to Jewelry & Accessories",
    anchorId: "belts",
  },
  buckles: {
    Component: AboutUsPage,
    backKey: "accessories",
    backLabel: "Back to Jewelry & Accessories",
    anchorId: "buckles",
  },
  scarves: {
    Component: TermsPage,
    backKey: "accessories",
    backLabel: "Back to Jewelry & Accessories",
    anchorId: "scarves",
  },

  // Shop → The Extras
  extras: {
    Component: PrivacyPolicy,
    backKey: "shop",
    backLabel: "Back to Shop",
    anchorId: "extras",
  },
  bralettes: {
    Component: BoardPage,
    backKey: "extras",
    backLabel: "Back to The Extras",
    anchorId: "bralettes",
  },
  swim: {
    Component: Title9Page,
    backKey: "extras",
    backLabel: "Back to The Extras",
    anchorId: "swim",
  },
  footwear: {
    Component: Careers,
    backKey: "extras",
    backLabel: "Back to The Extras",
    anchorId: "footwear",
  },
  drinkware: {
    Component: JobsPage,
    backKey: "extras",
    backLabel: "Back to The Extras",
    anchorId: "drinkware",
  },
  "home-decor": {
    Component: Employment,
    backKey: "extras",
    backLabel: "Back to The Extras",
    anchorId: "home-decor",
  },
  supplies: {
    Component: AutismDayCamp,
    backKey: "extras",
    backLabel: "Back to The Extras",
    anchorId: "supplies",
  },

  // Shop → Deals / Sales
  sale: {
    Component: Shredding,
    backKey: "shop",
    backLabel: "Back to Shop",
    anchorId: "sale",
  },
  "mystery-bags": {
    Component: GetInvolved,
    backKey: "sale",
    backLabel: "Back to Deals / Sales",
    anchorId: "mystery-bags",
  },
  "deals-women": {
    Component: DonateNow,
    backKey: "sale",
    backLabel: "Back to Deals / Sales",
    anchorId: "deals-women",
  },
  "deals-cowkids": {
    Component: LearnConnect,
    backKey: "sale",
    backLabel: "Back to Deals / Sales",
    anchorId: "deals-cowkids",
  },
  "deals-footwear": {
    Component: AboutUsPage,
    backKey: "sale",
    backLabel: "Back to Deals / Sales",
    anchorId: "deals-footwear",
  },
  "deals-july": {
    Component: TermsPage,
    backKey: "sale",
    backLabel: "Back to Deals / Sales",
    anchorId: "deals-july",
  },
  "sale-samples": {
    Component: PrivacyPolicy,
    backKey: "sale",
    backLabel: "Back to Deals / Sales",
    anchorId: "sale-samples",
  },
  "sale-christmas": {
    Component: BoardPage,
    backKey: "sale",
    backLabel: "Back to Deals / Sales",
    anchorId: "sale-christmas",
  },
  "sale-sweater": {
    Component: Title9Page,
    backKey: "sale",
    backLabel: "Back to Deals / Sales",
    anchorId: "sale-sweater",
  },

  // ------------------------------------------------------------------
  // ✅ COWKIDS subpages (placeholders)
  // ------------------------------------------------------------------
  "kids-graphics": {
    Component: Transportation,
    backKey: "cowkids",
    backLabel: "Back to Cowkids",
    anchorId: "kids-graphics",
  },
  "mini-darlins": {
    Component: EarlyChildhood,
    backKey: "cowkids",
    backLabel: "Back to Cowkids",
    anchorId: "mini-darlins",
  },
  "mini-buckarros": {
    Component: SupportedLiving,
    backKey: "cowkids",
    backLabel: "Back to Cowkids",
    anchorId: "mini-buckarros",
  },
  "kids-swim": {
    Component: Artists,
    backKey: "cowkids",
    backLabel: "Back to Cowkids",
    anchorId: "kids-swim",
  },
  "kids-home-accessories": {
    Component: AutismDayCamp,
    backKey: "cowkids",
    backLabel: "Back to Cowkids",
    anchorId: "kids-home-accessories",
  },

  // ------------------------------------------------------------------
  // ✅ OCCASIONS subpages (placeholders)
  // ------------------------------------------------------------------
  galentine: {
    Component: Employment,
    backKey: "occasions",
    backLabel: "Back to Shop Occasions",
    anchorId: "galentine",
  },
  "date-night": {
    Component: BusinessServices,
    backKey: "occasions",
    backLabel: "Back to Shop Occasions",
    anchorId: "date-night",
  },
  denim-edit: {
    Component: CMSPage,
    backKey: "occasions",
    backLabel: "Back to Shop Occasions",
    anchorId: "denim-edit",
  },
  "spring-transition": {
    Component: Pickup,
    backKey: "occasions",
    backLabel: "Back to Shop Occasions",
    anchorId: "spring-transition",
  },
  "luck-of-the-cowboy": {
    Component: CARF,
    backKey: "occasions",
    backLabel: "Back to Shop Occasions",
    anchorId: "luck-of-the-cowboy",
  },
};

/**
 * Hash → canonical page keys
 * These should match nav keys + your router behavior.
 * (Kept export name same; updated values to storefront keys.)
 */
export const sectionId: Record<string, string> = {
  home: "home",
  shop: "shop",

  "new-releases": "new-releases",
  restocks: "restocks",
  cowkids: "cowkids",
  "cowboy-valentine": "cowboy-valentine",
  occasions: "occasions",
  "gift-card": "gift-card",
  "best-sellers": "best-sellers",
  region: "region",
  account: "account",

  // Shop groups
  "desert-girl-exclusives": "desert-girl-exclusives",
  "dg-graphics-adults": "dg-graphics-adults",
  "dg-graphics-minis": "dg-graphics-minis",
  "dg-clothing": "dg-clothing",

  tops: "tops",
  "graphic-tees": "graphic-tees",
  "dg-graphic-tees": "dg-graphic-tees",
  "tops-blouses": "tops-blouses",
  "tanks-mesh": "tanks-mesh",
  outerwear: "outerwear",

  bottoms: "bottoms",
  denim: "denim",
  dresses: "dresses",
  shorts: "shorts",
  lounge: "lounge",

  accessories: "accessories",
  "authentic-jewelry": "authentic-jewelry",
  necklaces: "necklaces",
  bracelets: "bracelets",
  bags: "bags",
  backpacks: "backpacks",
  headwear: "headwear",
  "trucker-caps": "trucker-caps",
  belts: "belts",
  buckles: "buckles",
  scarves: "scarves",

  extras: "extras",
  bralettes: "bralettes",
  swim: "swim",
  footwear: "footwear",
  drinkware: "drinkware",
  "home-decor": "home-decor",
  supplies: "supplies",

  sale: "sale",
  "mystery-bags": "mystery-bags",
  "deals-women": "deals-women",
  "deals-cowkids": "deals-cowkids",
  "deals-footwear": "deals-footwear",
  "deals-july": "deals-july",
  "sale-samples": "sale-samples",
  "sale-christmas": "sale-christmas",
  "sale-sweater": "sale-sweater",

  // Cowkids subpages
  "kids-graphics": "kids-graphics",
  "mini-darlins": "mini-darlins",
  "mini-buckarros": "mini-buckarros",
  "kids-swim": "kids-swim",
  "kids-home-accessories": "kids-home-accessories",

  // Occasions subpages
  galentine: "galentine",
  "date-night": "date-night",
  "denim-edit": "denim-edit",
  "spring-transition": "spring-transition",
  "luck-of-the-cowboy": "luck-of-the-cowboy",

  // Legal
  terms: "terms",
  privacy: "privacy",

  // Brand/info (kept)
  about: "about",
};