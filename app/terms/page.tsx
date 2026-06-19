import { LegalPage } from "@/components/legal/legal-page";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms"
      intro="KindDo is a place for real help, not payments, donations, crowdfunding, spam, or manipulation."
      sections={[
        {
          title: "Use KindDo for action",
          body: [
            "You may publish dreams, offer help, chat with a dream author, and share gratitude stories.",
            "You may not use KindDo to collect money, sell services deceptively, impersonate others, or pressure people."
          ]
        },
        {
          title: "Content rules",
          body: [
            "Do not post illegal, hateful, sexual, violent, exploitative, fraudulent, or unsafe content.",
            "Do not upload content you do not have the right to share."
          ]
        },
        {
          title: "Moderation",
          body: [
            "KindDo may remove content or restrict access when content appears unsafe, abusive, fraudulent, or outside the purpose of the platform.",
            "Reports help moderation, but they do not guarantee immediate action."
          ]
        }
      ]}
    />
  );
}
