import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Privacy = () => (
  <div className="min-h-screen bg-background pb-12">
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
        <Link to="/" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-foreground">Privacy Policy</h1>
      </div>
    </header>

    <main className="mx-auto max-w-lg space-y-6 px-4 pt-6 text-sm text-foreground/80 leading-relaxed">
      <p className="text-muted-foreground text-xs">Last updated: April 11, 2026</p>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-foreground">Overview</h2>
        <p>
          Who Paid? is a simple expense-splitting tool that runs entirely on your device. We do not collect, store, or transmit any personal data.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-foreground">Data Collection</h2>
        <p>This app does <strong>not</strong> collect any data. Specifically:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>No personal information is collected</li>
          <li>No usage analytics or tracking</li>
          <li>No cookies</li>
          <li>No third-party services or SDKs</li>
          <li>No account creation or login</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-foreground">Data Storage</h2>
        <p>
          All expense data you enter stays on your device in temporary memory. It is cleared when you close the app or tap Reset. Nothing is sent to any server.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-foreground">Third-Party Services</h2>
        <p>This app does not use any third-party services, advertising networks, or analytics platforms.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-foreground">Children's Privacy</h2>
        <p>This app does not collect data from anyone, including children under 13.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-foreground">Contact</h2>
        <p>If you have questions about this privacy policy, please contact us through the app's Google Play Store listing.</p>
      </section>
    </main>
  </div>
);

export default Privacy;
