import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | MedAssist AI",
  description: "Learn how we handle and protect your health data at MedAssist AI.",
};

export default function PrivacyPolicy() {
  return (
    <main className="max-w-4xl mx-auto py-16 px-6 prose prose-blue">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-lg text-content-secondary mb-6">
        Last Updated: May 2024
      </p>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
        <p>
          At MedAssist AI, we collect information necessary to provide symptom pre-screening services. 
          This includes symptoms, basic health history (if provided), and appointment details. 
          We do not collect government-issued IDs or financial information.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Data</h2>
        <p>
          Your data is used strictly for:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li>Assessing the urgency of your medical symptoms (triage)</li>
          <li>Facilitating appointment booking with your clinic</li>
          <li>Sending appointment confirmations and reminders</li>
          <li>Improving our AI pre-screening accuracy (anonymized data only)</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">3. Data Security</h2>
        <p>
          We employ industry-standard security measures, including encryption in transit (TLS 1.3) 
          and encryption at rest. All patient data is treated as Protected Health Information (PHI) 
          and is handled in accordance with the principles of PDPA Pakistan and HIPAA best practices.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">4. Sharing of Information</h2>
        <p>
          We only share your information with the medical clinic you are booking with. 
          We do not sell your personal or health information to third parties. 
          AI processing is handled by Google Gemini API via secure server-side connections.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
        <p>
          You have the right to request access to, correction of, or deletion of your personal data. 
          If you wish to exercise these rights, please contact the clinic directly.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">6. Emergency Disclaimer</h2>
        <p className="font-bold text-red-600">
          MedAssist AI is NOT a diagnostic tool. In case of emergency, always call 1122 immediately.
        </p>
      </section>
    </main>
  );
}
