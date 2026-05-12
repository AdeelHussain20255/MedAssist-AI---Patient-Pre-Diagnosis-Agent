import Link from "next/link";
import { useTranslations } from "next-intl";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex-1 bg-surface-secondary flex items-center justify-center p-6 min-h-[70vh]">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative">
          <div className="text-9xl font-black text-gray-100 select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search size={80} className="text-brand-600 opacity-20" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900">Page Not Found</h1>
          <p className="text-content-secondary">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/">
            <Button variant="primary" className="w-full sm:w-auto flex items-center gap-2">
              <Home size={18} />
              Back Home
            </Button>
          </Link>
          <Link href="/chat">
            <Button variant="outline" className="w-full sm:w-auto">
              Start Triage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
