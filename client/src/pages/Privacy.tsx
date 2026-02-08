import { AppLayout } from "@/components/AppLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Privacy() {
  const lastUpdated = "January 13, 2026";

  return (
    <AppLayout>
      <ScrollArea className="h-[calc(100vh-4rem)] md:h-screen">
        <div className="container max-w-4xl py-12 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Back Button */}
            <Button variant="ghost" size="sm" asChild className="mb-6">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Privacy Policy</h1>
                <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  CardKing1971 Customs ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
                  explains how we collect, use, disclose, and safeguard your information when you use our AI-powered 
                  trading card generation service ("the Service"). Please read this Privacy Policy carefully. By using 
                  the Service, you consent to the data practices described in this policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">2. Information We Collect</h2>
                
                <h3 className="text-lg font-medium mb-3 text-foreground/90">2.1 Information You Provide</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We collect information you voluntarily provide when using our Service, including:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
                  <li><strong>Account Information:</strong> Name, email address, and authentication credentials when you create an account</li>
                  <li><strong>User Content:</strong> Text prompts, preferences, and settings you provide when generating trading cards</li>
                  <li><strong>Communication Data:</strong> Information you provide when contacting our support team</li>
                </ul>

                <h3 className="text-lg font-medium mb-3 text-foreground/90">2.2 Information Collected Automatically</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  When you access our Service, we automatically collect certain information, including:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
                  <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the Service</li>
                  <li><strong>Log Data:</strong> IP address, access times, referring URLs</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">3. How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use the information we collect for the following purposes:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>To provide, maintain, and improve our Service</li>
                  <li>To process your requests and generate trading card artwork</li>
                  <li>To personalize your experience and remember your preferences</li>
                  <li>To communicate with you about updates, features, and support</li>
                  <li>To analyze usage patterns and optimize our Service</li>
                  <li>To detect, prevent, and address technical issues and security threats</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">4. AI Processing and Generated Content</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Our Service uses artificial intelligence to generate trading card artwork. When you submit prompts:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Your prompts are processed by our AI systems to generate images</li>
                  <li>Generated images are stored in your account gallery</li>
                  <li>We may use anonymized, aggregated data to improve our AI models</li>
                  <li>We do not use your personal prompts to train AI models without explicit consent</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">5. Cookies and Tracking Technologies</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use cookies and similar tracking technologies to enhance your experience:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li><strong>Essential Cookies:</strong> Required for the Service to function properly, including authentication</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our Service</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  You can control cookies through your browser settings. However, disabling certain cookies may limit 
                  your ability to use some features of our Service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">6. Third-Party Services</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We may share your information with third-party service providers who assist us in operating our Service:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li><strong>AI Service Providers:</strong> To process image generation requests</li>
                  <li><strong>Cloud Storage Providers:</strong> To store your generated images securely</li>
                  <li><strong>Authentication Providers:</strong> To manage user accounts and sign-in</li>
                  <li><strong>Analytics Providers:</strong> To analyze Service usage and performance</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  These third parties are contractually obligated to protect your information and use it only for 
                  the purposes we specify.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">7. Data Retention</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We retain your personal information for as long as your account is active or as needed to provide 
                  you with our Service. Generated images remain in your gallery until you delete them or close your 
                  account. We may retain certain information as required by law or for legitimate business purposes, 
                  such as resolving disputes and enforcing our agreements.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">8. Your Rights and Choices</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Depending on your location, you may have certain rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                  <li><strong>Opt-out:</strong> Opt out of certain data processing activities</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  To exercise these rights, please contact us through the Settings page or our support channels.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">9. Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal information 
                  against unauthorized access, alteration, disclosure, or destruction. These measures include encryption, 
                  secure servers, and access controls. However, no method of transmission over the Internet or electronic 
                  storage is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">10. Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our Service is not intended for children under the age of 13. We do not knowingly collect personal 
                  information from children under 13. If you are a parent or guardian and believe your child has 
                  provided us with personal information, please contact us immediately. If we discover that we have 
                  collected personal information from a child under 13, we will take steps to delete that information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">11. International Data Transfers</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your information may be transferred to and processed in countries other than your country of residence. 
                  These countries may have different data protection laws. When we transfer your information internationally, 
                  we take appropriate safeguards to ensure your information remains protected in accordance with this 
                  Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">12. California Privacy Rights</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you are a California resident, you have additional rights under the California Consumer Privacy Act 
                  (CCPA), including the right to know what personal information we collect, the right to delete your 
                  personal information, and the right to opt out of the sale of your personal information. We do not 
                  sell your personal information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">13. European Privacy Rights</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you are located in the European Economic Area (EEA), you have rights under the General Data Protection 
                  Regulation (GDPR), including the right to access, rectify, erase, restrict processing, data portability, 
                  and object to processing. You also have the right to lodge a complaint with a supervisory authority.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">14. Changes to This Privacy Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the 
                  new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this 
                  Privacy Policy periodically for any changes. Your continued use of the Service after any modifications 
                  indicates your acceptance of the updated Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">15. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about this Privacy Policy or our data practices, please contact us through 
                  the Settings page in the application or reach out to our support team. We will respond to your inquiry 
                  as soon as reasonably possible.
                </p>
              </section>

              {/* Footer */}
              <div className="pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  By using CardKing1971 Customs, you acknowledge that you have read and understood this Privacy Policy and 
                  agree to the collection and use of your information as described herein.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </ScrollArea>
    </AppLayout>
  );
}
