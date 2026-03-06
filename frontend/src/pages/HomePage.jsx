import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import {
    ArrowRight,
    Sprout,
    ShoppingBag,
    Globe,
    ShieldCheck,
    Zap,
    CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
    const { t } = useTranslation();

    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    };

    const staggerContainer = {
        initial: {},
        whileInView: { transition: { staggerChildren: 0.1 } },
        viewport: { once: true }
    };

    return (
        <div className="flex flex-col w-full px-20">
            {/* Hero Section */}
            <section className="relative max-h-[80vh] flex items-center py-80 mt-[120px]">
                {/* <div className="absolute inset-0 z-0">
                    <motion.img
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.2 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        src=""
                        alt="Meghalaya Farm"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent"></div>
                </div> */}

                <div className="container relative z-10 px-6 mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="max-w-2xl space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
                            <Sprout className="w-3.5 h-3.5" />
                            <span>Northeast India's Digital Marketplace</span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-display font-bold text-foreground leading-[1.1]">
                            {t("home.heroTitle")}
                        </h1>

                        <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                            {t("home.heroSubtitle")}
                        </p>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <Button asChild size="lg" className="h-14 px-8 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all text-base font-semibold">
                                <Link to="/marketplace" className="flex items-center gap-2">
                                    {t("home.browseMarketplace")}
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-2xl border-2 hover:bg-muted text-base font-semibold">
                                <Link to="/dashboard">
                                    {t("home.startSelling")}
                                </Link>
                            </Button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="relative lg:block h-[80%]"
                    >
                        <div className="relative z-10 rounded-[50%] overflow-hidden shadow-xl border-4 border-white">
                            <img
                                src="https://images.pexels.com/photos/2880741/pexels-photo-2880741.jpeg"
                                alt="Fresh Produce"
                                className="h-full w-full aspect-[4/5] object-cover"
                            />
                        </div>
                        {/* <div className="absolute -top-6 -right-6 w-32 h-32 bg-farm-amber/20 rounded-full blur-3xl -z-10"></div>
                        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-10"></div> */}
                    </motion.div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-24 ">
                <div className="container px-6 mx-auto">
                    <motion.div
                        {...fadeInUp}
                        className="text-center max-w-2xl mx-auto mb-16 space-y-4"
                    >
                        <h2 className="text-3xl lg:text-4xl font-display font-bold">{t("home.howItWorks")}</h2>
                        <div className="w-20 h-1.5 bg-primary mx-auto rounded-full"></div>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="whileInView"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-3 gap-8 "
                    >
                        {[
                            {
                                icon: <Sprout className="w-8 h-8" />,
                                title: t("home.how1"),
                                color: "bg-farm-green-pale text-farm-green"
                            },
                            {
                                icon: <ShoppingBag className="w-8 h-8" />,
                                title: t("home.how2"),
                                color: "bg-farm-amber-pale text-farm-earth"
                            },
                            {
                                icon: <CheckCircle2 className="w-8 h-8" />,
                                title: t("home.how3"),
                                color: "bg-blue-50 text-blue-600"
                            }
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                variants={fadeInUp}
                                className="group p-8 rounded-[2rem] bg-background border border-border hover:border-primary/20 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                            >
                                <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-2">Step {i + 1}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {step.title}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24">
                <div className="container px-6 mx-auto">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <motion.div
                            {...fadeInUp}
                            className="lg:w-1/2 space-y-6"
                        >
                            <h2 className="text-4xl font-display font-bold leading-tight">
                                {t("home.featuresTitle")}
                            </h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Advanced tools designed for regional agriculture. We bridge the linguistic and digital divide.
                            </p>

                            <div className="space-y-4 pt-4">
                                {[
                                    { icon: <Globe />, text: t("home.feature1") },
                                    { icon: <Zap />, text: t("home.feature2") },
                                    { icon: <ShieldCheck />, text: t("home.feature3") }
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border/50">
                                        <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm">
                                            {feature.icon}
                                        </div>
                                        <span className="font-medium">{feature.text}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <div className="lg:w-1/2 grid grid-cols-2 gap-4">
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="pt-12 space-y-4"
                            >
                                <div className="aspect-square rounded-3xl overflow-hidden shadow-lg border border-border">
                                    <img src="https://images.pexels.com/photos/2382904/pexels-photo-2382904.jpeg" alt="Crop" className="w-full h-full object-cover" />
                                </div>
                                <div className="aspect-[4/3] rounded-3xl bg-primary flex flex-col justify-end p-6 text-primary-foreground italic">
                                    <p>"Technology is the new seed for our future harvests."</p>
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: -40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="space-y-4"
                            >
                                <div className="aspect-[3/4] rounded-3xl bg-farm-amber p-6 flex flex-col justify-between">
                                    <ShoppingBag className="w-12 h-12 text-farm-earth opacity-20" />
                                    <div className="space-y-1">
                                        <p className="text-3xl font-display font-bold text-farm-earth">100%</p>
                                        <p className="text-xs font-bold uppercase tracking-widest text-farm-earth/60">Direct Trade</p>
                                    </div>
                                </div>
                                <div className="aspect-square rounded-3xl overflow-hidden shadow-lg border border-border">
                                    <img src="https://images.pexels.com/photos/12922925/pexels-photo-12922925.jpeg" alt="Farmer" className="w-full h-full object-cover" />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            

            
        </div>
    );
}
