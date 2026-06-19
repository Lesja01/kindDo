import { LegalPage } from "@/components/legal/legal-page";

export default function SafetyPage() {
  return (
    <LegalPage
      title="Safety"
      intro="KindDo is built around help between people. Keep kindness practical, transparent, and safe."
      sections={[
        {
          title: "No money flow",
          body: [
            "KindDo does not support donations, payments, crowdfunding, or in-app money transfers.",
            "If someone asks you for money, financial data, or suspicious external payments, do not continue and report it."
          ]
        },
        {
          title: "Protect yourself",
          body: [
            "Do not share passwords, identity documents, bank details, exact private addresses, or other sensitive information.",
            "Use chat to clarify expectations before choosing or becoming a helper."
          ]
        },
        {
          title: "Report concerns",
          body: [
            "Use the report button on dreams, stories, and profiles when something feels unsafe, fraudulent, or inappropriate.",
            "If there is immediate danger, contact local emergency services."
          ]
        }
      ]}
    />
  );
}
