import { LegalPage } from "@/components/legal/legal-page";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      intro="KindDo stores only the information needed to help people publish dreams, communicate, and share gratitude stories."
      sections={[
        {
          title: "What we collect",
          body: [
            "Profile information such as name, avatar, bio, age, location, and social links.",
            "Dreams, photos, videos, gratitude stories, chat messages, and reports you submit."
          ]
        },
        {
          title: "How it is used",
          body: [
            "Public dreams and stories are shown to other users so they can understand the dream and offer help.",
            "Private dreams are intended to be visible only to their author.",
            "Reports are used for moderation and safety review."
          ]
        },
        {
          title: "Your responsibility",
          body: [
            "Do not publish sensitive personal data, documents, passwords, financial details, or private addresses.",
            "Use chat thoughtfully and report unsafe content or behavior."
          ]
        }
      ]}
    />
  );
}
