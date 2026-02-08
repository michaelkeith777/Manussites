import { AppLayout } from "@/components/AppLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Terms() {
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
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Terms of Service</h1>
                <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using CardKing1971 Customs ("the Service"), you agree to be bound by these Terms of Service ("Terms"). 
                  If you do not agree to these Terms, you may not access or use the Service. We reserve the right to modify these 
                  Terms at any time, and such modifications will be effective immediately upon posting. Your continued use of the 
                  Service following any modifications indicates your acceptance of the modified Terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">2. Description of Service</h2>
                <p className="text-muted-foreground leading-relaxed">
                  CardKing1971 Customs is an AI-powered trading card generation platform that allows users to create custom digital 
                  trading card artwork. The Service utilizes artificial intelligence technology to generate images based on 
                  user-provided prompts and parameters. The Service includes features such as image generation, gallery management, 
                  watermarking, and export functionality.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">3. User Accounts</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  To access certain features of the Service, you must create an account. You are responsible for maintaining 
                  the confidentiality of your account credentials and for all activities that occur under your account. You agree to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Provide accurate and complete information when creating your account</li>
                  <li>Update your account information to keep it accurate and current</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                  <li>Not share your account credentials with any third party</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">4. User Content and Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You retain ownership of any content you submit to the Service, including prompts and text inputs. However, 
                  by using the Service, you grant us a non-exclusive, worldwide, royalty-free license to use, store, and process 
                  your content solely for the purpose of providing the Service.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Images generated through the Service are provided for your personal and commercial use, subject to the following conditions:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>You may use generated images for personal projects, social media, and commercial purposes</li>
                  <li>You may not claim that AI-generated images are human-created artwork</li>
                  <li>You are responsible for ensuring your use of generated images does not infringe on third-party rights</li>
                  <li>Generated images depicting real individuals may be subject to additional legal restrictions</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">5. Prohibited Uses</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You agree not to use the Service to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Generate content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable</li>
                  <li>Create content that infringes on any intellectual property rights of others</li>
                  <li>Generate content depicting minors in inappropriate situations</li>
                  <li>Create deepfakes or misleading content intended to deceive others</li>
                  <li>Attempt to reverse engineer, decompile, or extract the AI models used by the Service</li>
                  <li>Use automated systems or bots to access the Service without authorization</li>
                  <li>Interfere with or disrupt the Service or servers connected to the Service</li>
                  <li>Violate any applicable laws or regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">6. Payment and Subscriptions</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Certain features of the Service may require payment or subscription. All fees are non-refundable unless 
                  otherwise specified. We reserve the right to modify pricing at any time, with notice provided to existing 
                  subscribers. Subscription renewals will be charged automatically unless cancelled before the renewal date.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">7. Disclaimers</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. 
                  WE DO NOT WARRANT THAT:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>The Service will meet your specific requirements</li>
                  <li>The Service will be uninterrupted, timely, secure, or error-free</li>
                  <li>The results obtained from using the Service will be accurate or reliable</li>
                  <li>Any errors in the Service will be corrected</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">8. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL CARDKING1971 CUSTOMS, ITS OFFICERS, DIRECTORS, EMPLOYEES, 
                  OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT 
                  NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE 
                  SERVICE, WHETHER BASED ON WARRANTY, CONTRACT, TORT, OR ANY OTHER LEGAL THEORY.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">9. Indemnification</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You agree to indemnify, defend, and hold harmless CardKing1971 Customs and its officers, directors, employees, and 
                  agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' 
                  fees, arising out of or in any way connected with your access to or use of the Service, your violation of these 
                  Terms, or your infringement of any intellectual property or other rights of any third party.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">10. Termination</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to suspend or terminate your access to the Service at any time, with or without cause, 
                  and with or without notice. Upon termination, your right to use the Service will immediately cease. All 
                  provisions of these Terms which by their nature should survive termination shall survive, including ownership 
                  provisions, warranty disclaimers, indemnity, and limitations of liability.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">11. Governing Law</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of the United States, without 
                  regard to its conflict of law provisions. Any disputes arising under or in connection with these Terms shall 
                  be subject to the exclusive jurisdiction of the courts located in the United States.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">12. Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these Terms at any time. We will notify users of any material changes by 
                  posting the updated Terms on this page and updating the "Last updated" date. Your continued use of the 
                  Service after any such changes constitutes your acceptance of the new Terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">13. Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about these Terms, please contact us through the Settings page in the application 
                  or reach out to our support team.
                </p>
              </section>

              {/* Footer */}
              <div className="pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  By using CardKing1971 Customs, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </ScrollArea>
    </AppLayout>
  );
}
