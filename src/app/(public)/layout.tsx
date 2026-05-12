import { Header, Footer } from "@/components/shared/Nav";
import { CookieBanner } from "@/components/shared/CookieBanner";
import Script from "next/script";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    "name": "MedAssist AI Clinic",
    "image": "https://medassist.pk/og-image.png",
    "@id": "https://medassist.pk",
    "url": "https://medassist.pk",
    "telephone": "1122",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Main Clinic Road",
      "addressLocality": "Lahore",
      "addressRegion": "Punjab",
      "postalCode": "54000",
      "addressCountry": "PK"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 31.5204,
      "longitude": 74.3587
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Script
        id="medical-clinic-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <div className="flex-1">
        {children}
      </div>
      <Footer />
      <CookieBanner />
    </div>
  );
}
