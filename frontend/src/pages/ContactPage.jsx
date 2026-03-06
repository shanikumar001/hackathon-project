import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/useTranslation";
import { MessageSquare, Phone, Mail, Send, MapPin } from "lucide-react";

export default function ContactPage() {
    const { t } = useTranslation();

    const handleSendMessage = (e) => {
        e.preventDefault();
        alert("This is a demo contact form. In a production app, this would send an email or API request.");
    };

    return (
        <div className="pt-14 min-h-screen bg-background mt-20">
            <div className="container px-6 mx-auto">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16 justify-between">
                    {/* Contact Info */}
                    <div className="lg:w-1/3 space-y-12 pt-20">
                        <div className="space-y-4">
                            <h1 className="text-4xl font-display font-bold">{t("contact.title")}</h1>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                We're here to help you. Reach out to us for any queries about the platform, shipping, or payments.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {[
                                {
                                    icon: <MessageSquare className="w-5 h-5" />,
                                    label: t("contact.whatsapp"),
                                    val: "+91 98765 43210",
                                    color: "text-green-600 bg-green-50"
                                },
                                {
                                    icon: <Phone className="w-5 h-5" />,
                                    label: t("contact.phone"),
                                    val: "+91 12345 67890",
                                    color: "text-blue-600 bg-blue-50"
                                },
                                {
                                    icon: <Mail className="w-5 h-5" />,
                                    label: "Email",
                                    val: "support@localconnect.in",
                                    color: "text-primary bg-primary/10"
                                },
                                {
                                    icon: <MapPin className="w-5 h-5" />,
                                    label: "Office",
                                    val: "Shillong, Meghalaya",
                                    color: "text-farm-earth bg-farm-amber-pale"
                                }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                                    <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{item.label}</p>
                                        <p className="font-semibold">{item.val}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:w-2/4">
                        <div className="p-8 md:p-12 rounded-[2.5rem] bg-card border border-border shadow-xl">
                            <h2 className="text-2xl font-bold mb-8">{t("contact.getInTouch")}</h2>
                            <form onSubmit={handleSendMessage} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t("contact.name")}</label>
                                        <Input placeholder="Your Name" className="h-12 rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t("contact.email")}</label>
                                        <Input type="email" placeholder="Your Email" className="h-12 rounded-xl" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t("contact.subject")}</label>
                                    <Input placeholder="Subject" className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t("contact.message")}</label>
                                    <Textarea placeholder="Type your message here..." className="min-h-[150px] rounded-2xl p-4" />
                                </div>
                                <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-semibold gap-2">
                                    <Send className="w-5 h-5" />
                                    {t("contact.send")}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
