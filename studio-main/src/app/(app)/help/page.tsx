
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { LifeBuoy } from "lucide-react";

const faqs = [
    {
        question: "How do I list a food donation?",
        answer: "As a donor, navigate to the 'New Donation' page from the sidebar. Fill in the details about the food, including a description, quantity, and pickup deadline. You can also upload a photo. Once you submit, your listing will be visible to NGOs."
    },
    {
        question: "How do I claim a donation?",
        answer: "As an NGO, you can browse available donations on the 'Browse' page. When you find a suitable donation, click the 'Claim Donation' button on the item card. The donor will be notified, and you can coordinate pickup."
    },
    {
        question: "What happens if a food donation expires?",
        answer: "If a donation isn't claimed before its pickup deadline, its status will automatically change to 'Expired'. It will no longer be available for claiming to ensure food safety."
    },
    {
        question: "How does user verification work?",
        answer: "We verify NGOs and frequent donors to build trust on the platform. You can request verification through your profile page by providing any required documentation. Verified members will have a badge on their profile."
    },
    {
        question: "What is Smart Matching?",
        answer: "Smart Matching is an AI-powered feature that helps donors find the most suitable NGOs for their specific donation based on the NGO's needs, location, and the type of food being donated."
    }
]

export default function HelpPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
        <div className="mb-8 text-center">
            <div className="inline-block bg-primary/10 p-4 rounded-full mb-4">
                <LifeBuoy className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">Help & Support</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-2">
                Find answers to frequently asked questions below. If you need more help, please contact our support team.
            </p>
        </div>

        <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger className="text-lg font-semibold text-left">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-base text-muted-foreground">
                            {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    </div>
  );
}
