// components/home/_components/pageTree.ts
// NOTE: Keep SAME export names + structure.
// We’re stripping this down to only components that exist right now.

import HomePage from "@/components/home/Landing";
import AboutUsPage from "@/components/home/AboutUs";
import TermsPage from "@/components/home/TermsPage";
import PrivacyPolicy from "@/components/home/PrivacyPolicy";

export interface PageConfig {
  Component: React.FC<any>;
  backKey?: string;
  backLabel?: string;
  anchorId?: string;
}

export const pageTree: Record<string, PageConfig> = {
  // ✅ Landing
  home: { Component: HomePage, anchorId: "home" },

  // ✅ Keep keys for routing/nav stability, but point everything to existing pages
  shop: {
    Component: HomePage,
    backKey: "home",
    backLabel: "Back to Home",
    anchorId: "shop",
  },

  "new-releases": {
    Component: HomePage,
    backKey: "home",
    backLabel: "Back to Home",
    anchorId: "new-releases",
  },
  restocks: {
    Component: HomePage,
    backKey: "home",
    backLabel: "Back to Home",
    anchorId: "restocks",
  },
  cowkids: {
    Component: HomePage,
    backKey: "home",
    backLabel: "Back to Home",
    anchorId: "cowkids",
  },
  "cowboy-valentine": {
    Component: HomePage,
    backKey: "home",
    backLabel: "Back to Home",
    anchorId: "cowboy-valentine",
  },
  occasions: {
    Component: HomePage,
    backKey: "home",
    backLabel: "Back to Home",
    anchorId: "occasions",
  },
  "gift-card": {
    Component: HomePage,
    backKey: "home",
    backLabel: "Back to Home",
    anchorId: "gift-card",
  },
  "best-sellers": {
    Component: HomePage,
    backKey: "home",
    backLabel: "Back to Home",
    anchorId: "best-sellers",
  },
  region: {
    Component: HomePage,
    backKey: "home",
    backLabel: "Back to Home",
    anchorId: "region",
  },
  account: {
    Component: HomePage,
    backKey: "home",
    backLabel: "Back to Home",
    anchorId: "account",
  },

  // ✅ Brand/info
  about: {
    Component: AboutUsPage,
    backKey: "home",
    backLabel: "Back to Home",
    anchorId: "about",
  },

  // ✅ Legal
  terms: {
    Component: TermsPage,
    backKey: "home",
    backLabel: "Back to Home",
    anchorId: "terms",
  },
  privacy: {
    Component: PrivacyPolicy,
    backKey: "home",
    backLabel: "Back to Home",
    anchorId: "privacy",
  },

  // ✅ Keep all existing route keys, map to HomePage for now
  "desert-girl-exclusives": {
    Component: HomePage,
    backKey: "shop",
    backLabel: "Back to Shop",
    anchorId: "desert-girl-exclusives",
  },
  "dg-graphics-adults": {
    Component: HomePage,
    backKey: "desert-girl-exclusives",
    backLabel: "Back to Exclusives",
    anchorId: "dg-graphics-adults",
  },
  "dg-graphics-minis": {
    Component: HomePage,
    backKey: "desert-girl-exclusives",
    backLabel: "Back to Exclusives",
    anchorId: "dg-graphics-minis",
  },
  "dg-clothing": {
    Component: HomePage,
    backKey: "desert-girl-exclusives",
    backLabel: "Back to Exclusives",
    anchorId: "dg-clothing",
  },

  tops: {
    Component: HomePage,
    backKey: "shop",
    backLabel: "Back to Shop",
    anchorId: "tops",
  },
  "graphic-tees": {
    Component: HomePage,
    backKey: "tops",
    backLabel: "Back to Tops",
    anchorId: "graphic-tees",
  },
  "dg-graphic-tees": {
    Component: HomePage,
    backKey: "tops",
    backLabel: "Back to Tops",
    anchorId: "dg-graphic-tees",
  },
  "tops-blouses": {
    Component: HomePage,
    backKey: "tops",
    backLabel: "Back to Tops",
    anchorId: "tops-blouses",
  },
  "tanks-mesh": {
    Component: HomePage,
    backKey: "tops",
    backLabel: "Back to Tops",
    anchorId: "tanks-mesh",
  },
  outerwear: {
    Component: HomePage,
    backKey: "tops",
    backLabel: "Back to Tops",
    anchorId: "outerwear",
  },

  bottoms: {
    Component: HomePage,
    backKey: "shop",
    backLabel: "Back to Shop",
    anchorId: "bottoms",
  },
  denim: {
    Component: HomePage,
    backKey: "bottoms",
    backLabel: "Back to Bottoms & Sets",
    anchorId: "denim",
  },
  dresses: {
    Component: HomePage,
    backKey: "bottoms",
    backLabel: "Back to Bottoms & Sets",
    anchorId: "dresses",
  },
  shorts: {
    Component: HomePage,
    backKey: "bottoms",
    backLabel: "Back to Bottoms & Sets",
    anchorId: "shorts",
  },
  lounge: {
    Component: HomePage,
    backKey: "bottoms",
    backLabel: "Back to Bottoms & Sets",
    anchorId: "lounge",
  },

  accessories: {
    Component: HomePage,
    backKey: "shop",
    backLabel: "Back to Shop",
    anchorId: "accessories",
  },
  "authentic-jewelry": {
    Component: HomePage,
    backKey: "accessories",
    backLabel: "Back to Jewelry & Accessories",
    anchorId: "authentic-jewelry",
  },
  necklaces: {
    Component: HomePage,
    backKey: "accessories",
    backLabel: "Back to Jewelry & Accessories",
    anchorId: "necklaces",
  },
  bracelets: {
    Component: HomePage,
    backKey: "accessories",
    backLabel: "Back to Jewelry & Accessories",
    anchorId: "bracelets",
  },
  bags: {
    Component: HomePage,
    backKey: "accessories",
    backLabel: "Back to Jewelry & Accessories",
    anchorId: "bags",
  },
  backpacks: {
    Component: HomePage,
    backKey: "accessories",
    backLabel: "Back to Jewelry & Accessories",
    anchorId: "backpacks",
  },
  headwear: {
    Component: HomePage,
    backKey: "accessories",
    backLabel: "Back to Jewelry & Accessories",
    anchorId: "headwear",
  },
  "trucker-caps": {
    Component: HomePage,
    backKey: "headwear",
    backLabel: "Back to Headwear",
    anchorId: "trucker-caps",
  },
  belts: {
    Component: HomePage,
    backKey: "accessories",
    backLabel: "Back to Jewelry & Accessories",
    anchorId: "belts",
  },
  buckles: {
    Component: HomePage,
    backKey: "accessories",
    backLabel: "Back to Jewelry & Accessories",
    anchorId: "buckles",
  },
  scarves: {
    Component: HomePage,
    backKey: "accessories",
    backLabel: "Back to Jewelry & Accessories",
    anchorId: "scarves",
  },

  extras: {
    Component: HomePage,
    backKey: "shop",
    backLabel: "Back to Shop",
    anchorId: "extras",
  },
  bralettes: {
    Component: HomePage,
    backKey: "extras",
    backLabel: "Back to The Extras",
    anchorId: "bralettes",
  },
  swim: {
    Component: HomePage,
    backKey: "extras",
    backLabel: "Back to The Extras",
    anchorId: "swim",
  },
  footwear: {
    Component: HomePage,
    backKey: "extras",
    backLabel: "Back to The Extras",
    anchorId: "footwear",
  },
  drinkware: {
    Component: HomePage,
    backKey: "extras",
    backLabel: "Back to The Extras",
    anchorId: "drinkware",
  },
  "home-decor": {
    Component: HomePage,
    backKey: "extras",
    backLabel: "Back to The Extras",
    anchorId: "home-decor",
  },
  supplies: {
    Component: HomePage,
    backKey: "extras",
    backLabel: "Back to The Extras",
    anchorId: "supplies",
  },

  sale: {
    Component: HomePage,
    backKey: "shop",
    backLabel: "Back to Shop",
    anchorId: "sale",
  },
  "mystery-bags": {
    Component: HomePage,
    backKey: "sale",
    backLabel: "Back to Deals / Sales",
    anchorId: "mystery-bags",
  },
  "deals-women": {
    Component: HomePage,
    backKey: "sale",
    backLabel: "Back to Deals / Sales",
    anchorId: "deals-women",
  },
  "deals-cowkids": {
    Component: HomePage,
    backKey: "sale",
    backLabel: "Back to Deals / Sales",
    anchorId: "deals-cowkids",
  },
  "deals-footwear": {
    Component: HomePage,
    backKey: "sale",
    backLabel: "Back to Deals / Sales",
    anchorId: "deals-footwear",
  },
  "deals-july": {
    Component: HomePage,
    backKey: "sale",
    backLabel: "Back to Deals / Sales",
    anchorId: "deals-july",
  },
  "sale-samples": {
    Component: HomePage,
    backKey: "sale",
    backLabel: "Back to Deals / Sales",
    anchorId: "sale-samples",
  },
  "sale-christmas": {
    Component: HomePage,
    backKey: "sale",
    backLabel: "Back to Deals / Sales",
    anchorId: "sale-christmas",
  },
  "sale-sweater": {
    Component: HomePage,
    backKey: "sale",
    backLabel: "Back to Deals / Sales",
    anchorId: "sale-sweater",
  },

  "kids-graphics": {
    Component: HomePage,
    backKey: "cowkids",
    backLabel: "Back to Cowkids",
    anchorId: "kids-graphics",
  },
  "mini-darlins": {
    Component: HomePage,
    backKey: "cowkids",
    backLabel: "Back to Cowkids",
    anchorId: "mini-darlins",
  },
  "mini-buckarros": {
    Component: HomePage,
    backKey: "cowkids",
    backLabel: "Back to Cowkids",
    anchorId: "mini-buckarros",
  },
  "kids-swim": {
    Component: HomePage,
    backKey: "cowkids",
    backLabel: "Back to Cowkids",
    anchorId: "kids-swim",
  },
  "kids-home-accessories": {
    Component: HomePage,
    backKey: "cowkids",
    backLabel: "Back to Cowkids",
    anchorId: "kids-home-accessories",
  },

  galentine: {
    Component: HomePage,
    backKey: "occasions",
    backLabel: "Back to Shop Occasions",
    anchorId: "galentine",
  },
  "date-night": {
    Component: HomePage,
    backKey: "occasions",
    backLabel: "Back to Shop Occasions",
    anchorId: "date-night",
  },
  "denim-edit": {
    Component: HomePage,
    backKey: "occasions",
    backLabel: "Back to Shop Occasions",
    anchorId: "denim-edit",
  },
  "spring-transition": {
    Component: HomePage,
    backKey: "occasions",
    backLabel: "Back to Shop Occasions",
    anchorId: "spring-transition",
  },
  "luck-of-the-cowboy": {
    Component: HomePage,
    backKey: "occasions",
    backLabel: "Back to Shop Occasions",
    anchorId: "luck-of-the-cowboy",
  },
};

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

  "kids-graphics": "kids-graphics",
  "mini-darlins": "mini-darlins",
  "mini-buckarros": "mini-buckarros",
  "kids-swim": "kids-swim",
  "kids-home-accessories": "kids-home-accessories",

  galentine: "galentine",
  "date-night": "date-night",
  "denim-edit": "denim-edit",
  "spring-transition": "spring-transition",
  "luck-of-the-cowboy": "luck-of-the-cowboy",

  terms: "terms",
  privacy: "privacy",
  about: "about",
};
