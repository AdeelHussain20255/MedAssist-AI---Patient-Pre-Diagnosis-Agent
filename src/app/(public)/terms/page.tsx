import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | MedAssist AI",
  description: "Terms and conditions for using the MedAssist AI pre-screening tool.",
};

export default function TermsOfService() {
  return (
    <main className="max-w-4xl mx-auto py-16 px-6 prose prose-blue">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <p className="text-lg text-content-secondary mb-6">
        Last Updated: May 2024
      </p>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <p>
          By using MedAssist AI, you agree to these Terms of Service. If you do not agree, 
          do not use the service.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-red-600">2. NO MEDICAL ADVICE</h2>
        <p className="font-bold">
          MedAssist AI provides pre-screening and triage assistance using Artificial Intelligence. 
          It DOES NOT provide medical diagnosis, medical advice, or treatment recommendations. 
          The results are preliminary and must be reviewed by a qualified healthcare professional.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">3. Emergency Use</h2>
        <p>
          IF YOU ARE EXPERIENCING A MEDICAL EMERGENCY, CALL 1122 (PAKISTAN) OR YOUR LOCAL 
          EMERGENCY SERVICES IMMEDIATELY. DO NOT USE THIS TOOL FOR LIFE-THREATENING CONDITIONS.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">4. User Responsibilities</h2>
        <p>
          You are responsible for providing accurate information about your symptoms. 
          The accuracy of the triage result depends on the accuracy of your input.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, MedAssist AI and its creators shall not 
          be liable for any damages resulting from the use or inability to use the service, 
          or any reliance on the information provided by the AI assistant.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">6. Changes to Service</h2>
        <p>
          We reserve the right to modify or discontinue the service at any time without notice.
        </p>
      </section>
    </main>
  );
}
