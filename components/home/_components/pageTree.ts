// components/home/_components/pageTree.ts
import HomePage from "@/components/home/Landing";
import AboutUsPage from "@/components/home/AboutUs";
import BoardPage from "@/components/home/BoardofDirectors";
import Title9Page from "@/components/home/Title9Information";
import Careers from "@/components/home/About/Careers";
import JobsPage from "@/components/home/Jobs";
import ProgramsAndServices from "@/components/home/ProgramsandServices/programsndseevices";
import Transportation from "@/components/home/services/Transportation";
import EarlyChildhood from "@/components/home/services/EarlyChildhood";
import SupportedLiving from "@/components/home/services/SupportedLiving";
import Artists from "@/components/home/services/Artists";
import AutismDayCamp from "@/components/home/LearnAndConnect/AutismDayCamp";
import Employment from "@/components/home/services/Employment";
import BusinessServices from "@/components/home/BusinessServices/main";
import CMSPage from "@/components/home/BusinessServices/cms";
import Pickup from "@/components/home/BusinessServices/pickup";
import CARF from "@/components/home/services/CARF";
import ThriftStore from "@/components/home/services/ThriftStore";
import Shredding from "@/components/home/BusinessServices/Shredding";
import GetInvolved from "@/components/home/GetInvolved/main";
import DonateNow from "@/components/home/GetInvolved/donatenow";
import LearnConnect from "@/components/home/LearnAndConnect/main";
import TermsPage from "@/components/home/TermsPage";
import PrivacyPolicy from "@/components/home/PrivacyPolicy";

export interface PageConfig {
  Component: React.FC<any>;
  backKey?: string;
  backLabel?: string;
  anchorId?: string;
}

/**
 * A map of page keys to their component and navigation metadata.
 * Adding new pages only requires updating this file.
 */
export const pageTree: Record<string, PageConfig> = {
  home: { Component: HomePage },
  about: { Component: AboutUsPage, backKey: "home", backLabel: "Back to Home", anchorId: "about" },
  board: { Component: BoardPage, backKey: "about", backLabel: "Back to About Us", anchorId: "board" },
  title9: { Component: Title9Page, backKey: "about", backLabel: "Back to About Us", anchorId: "title9" },
  careers: { Component: Careers, backKey: "about", backLabel: "Back to About Us", anchorId: "careers" },
  jobs: { Component: JobsPage, backKey: "careers", backLabel: "Back to Careers", anchorId: "jobs" },
  programs: { Component: ProgramsAndServices, backKey: "home", backLabel: "Back to Home", anchorId: "programs" },
  transportation: { Component: Transportation, backKey: "programs", backLabel: "Back to Programs", anchorId: "transportation" },
  "early-childhood": { Component: EarlyChildhood, backKey: "programs", backLabel: "Back to Programs", anchorId: "early-childhood" },
  "supported-living": { Component: SupportedLiving, backKey: "programs", backLabel: "Back to Programs", anchorId: "supported-living" },
  artists: { Component: Artists, backKey: "programs", backLabel: "Back to Programs", anchorId: "artists" },
  autismdaycamp: { Component: AutismDayCamp, backKey: "programs", backLabel: "Back to Programs", anchorId: "autismdaycamp" },
  employment: { Component: Employment, backKey: "programs", backLabel: "Back to Programs", anchorId: "employment" },
  services: { Component: BusinessServices, backKey: "home", backLabel: "Back to Home", anchorId: "services" },
  commercial: { Component: CMSPage, backKey: "services", backLabel: "Back to Services", anchorId: "cms" },
  pickup: { Component: Pickup, backKey: "services", backLabel: "Back to Services", anchorId: "pickup" },
  carf: { Component: CARF, backKey: "services", backLabel: "Back to Services", anchorId: "carf" },
  thriftstore: { Component: ThriftStore, backKey: "services", backLabel: "Back to Services", anchorId: "thriftstore" },
  shredding: { Component: Shredding, backKey: "services", backLabel: "Back to Services", anchorId: "shredding" },
  involved: { Component: GetInvolved, backKey: "home", backLabel: "Back to Home", anchorId: "get-involved" },
  donate: { Component: DonateNow, backKey: "get-involved", backLabel: "Back to Get Involved", anchorId: "donate" },
  learn: { Component: LearnConnect, backKey: "home", backLabel: "Back to Home", anchorId: "learn" },
  terms: { Component: TermsPage, backKey: "home", backLabel: "Back to Home", anchorId: "terms" },
  privacy: { Component: PrivacyPolicy, backKey: "home", backLabel: "Back to Home", anchorId: "privacy" },
};

// Map hashes → canonical section IDs
export const sectionId: Record<string, string> = {
  home: "home",
  about: "about",
  programs: "programs",
  business: "business",
  involved: "involved",
  learn: "learn",
  board: "board",
  title9: "title9",
  jobs: "jobs",
  careers: "careers",
  autismdaycamp: "autismdaycamp",
  transportation: "transportation",
  earlychildhood: "earlychildhood",
  supportedliving: "supportedliving",
  artists: "artists",
  employment: "employment",
  carf: "carf",
  thriftstore: "thriftstore",
  shredding: "shredding",
  terms: "terms",
  privacy: "privacy",
};
