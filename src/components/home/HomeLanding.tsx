import { getTranslations } from "next-intl/server";
import { HomeLandingClient } from "@/components/home/HomeLandingClient";
import type { HomeCopy } from "@/components/home/types";
import { SITE_NAME } from "@/lib/site";

export async function HomeLanding() {
  const t = await getTranslations("home");

  const copy: HomeCopy = {
    eyebrow: t("eyebrow"),
    headline: t("headline"),
    subhead: t("subhead"),
    createList: t("createList"),
    hasLink: t("hasLink"),
    hasLinkDetail: t("hasLinkDetail"),
    useCasesTitle: t("useCasesTitle"),
    useCases: [t("useCaseMove"), t("useCaseClear"), t("useCaseEstate")],
    howTitle: t("howTitle"),
    howSubtitle: t("howSubtitle"),
    steps: [
      {
        step: "1",
        title: t("step1Title"),
        body: t("step1Body"),
        imageSrc: "/promo/creators/new_list.jpg",
        imageAlt: t("imgAltNewList"),
        kind: "image",
      },
      {
        step: "2",
        title: t("step2Title"),
        body: t("step2Body"),
        imageSrc: "/promo/creators/add_first_item.jpg",
        imageAlt: t("imgAltPhoto"),
        kind: "image",
      },
      {
        step: "3",
        title: t("step3Title"),
        body: t("step3Body"),
        imageSrc: "/promo/creators/share_link.jpg",
        imageAlt: t("imgAltShare"),
        kind: "image",
      },
      {
        step: "4",
        title: t("step4Title"),
        body: t("step4Body"),
        imageSrc: "/promo/voters/tinder_example.jpg",
        imageAlt: t("imgAltVote"),
        kind: "image",
        tone: "voter",
      },
      {
        step: "5",
        title: t("step5Title"),
        body: t("step5Body"),
        imageSrc: "/promo/creators/attribute_results_to_a_match.jpg",
        imageAlt: t("imgAltMatch"),
        kind: "image",
      },
    ],
    shareMockTitle: t("shareMockTitle"),
    shareMockHint: t("shareMockHint"),
    shareMockCopy: t("shareMockCopy"),
    shareMockWhatsApp: t("shareMockWhatsApp"),
    shareSpotlightTitle: t("shareSpotlightTitle"),
    shareSpotlightBody: t("shareSpotlightBody"),
    shareSpotlightPoints: [
      t("shareSpotlightPoint1"),
      t("shareSpotlightPoint2"),
      t("shareSpotlightPoint3"),
    ],
    pathsTitle: t("pathsTitle", { name: SITE_NAME }),
    pathOrganizerTitle: t("pathOrganizerTitle"),
    pathOrganizerBody: t("pathOrganizerBody"),
    pathOrganizerCta: t("pathOrganizerCta"),
    pathGuestTitle: t("pathGuestTitle"),
    pathGuestBody: t("pathGuestBody"),
    pathGuestHint: t("pathGuestHint"),
  };

  return <HomeLandingClient copy={copy} />;
}
