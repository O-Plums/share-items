export type HomeStepCopy = {
  step: string;
  title: string;
  body: string;
  imageSrc?: string;
  imageAlt?: string;
  kind: "image" | "share";
  /** Accent color : `brand` (rose, côté créateur) ou `voter` (bleu, côté votant). */
  tone?: "brand" | "voter";
};

export type HomeCopy = {
  eyebrow: string;
  headline: string;
  subhead: string;
  createList: string;
  hasLink: string;
  hasLinkDetail: string;
  useCasesTitle: string;
  useCases: string[];
  howTitle: string;
  howSubtitle: string;
  steps: HomeStepCopy[];
  shareMockTitle: string;
  shareMockHint: string;
  shareMockCopy: string;
  shareMockWhatsApp: string;
  shareSpotlightTitle: string;
  shareSpotlightBody: string;
  shareSpotlightPoints: string[];
  pathsTitle: string;
  pathOrganizerTitle: string;
  pathOrganizerBody: string;
  pathOrganizerCta: string;
  pathGuestTitle: string;
  pathGuestBody: string;
  pathGuestHint: string;
};
