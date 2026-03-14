import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ChevronRight,
  Globe,
  Leaf,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "../hooks/useTranslation";
import { useAppStore } from "../stores/appStore";
import { auth, googleProvider, initializeNotifications } from "../firebase";
import { signInWithPopup, RecaptchaVerifier } from "firebase/auth";
import {
  firebaseLogin,
  updateProfile as updateProfileApi,
  signup,
  requestOTP,
  verifyOTP,
} from "../utils/api";

// ── Language options (same as AuthPage) ──────────────────────────────────────
const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिंदी" },
  { code: "khasi", label: "Khasi", native: "Khasi" },
  { code: "mizo", label: "Mizo", native: "Mizo" },
];

const enter = { x: 20, opacity: 0 };
const center = { x: 0, opacity: 1 };
const exit = { x: -20, opacity: 0 };

export default function SignupPage() {
  const { t } = useTranslation();
  const { setCurrentUser, setToken, setLanguage, setNotifications, language } =
    useAppStore();

  // States - adapted from AuthPage for signup flow
  const [step, setStep] = useState(1); // 1: role, 2: auth mode, 3: phone/email input, 4: OTP/profile
  const [role, setRole] = useState(""); // 'buyer' or 'farmer'
  const [authMode, setAuthMode] = useState("phone");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en");
  const otpRefs = useRef([]);

  const saveFcmToken = async () => {
    try {
      const fcmToken = await initializeNotifications();
      if (fcmToken) console.log("FCM token acquired:", fcmToken);
    } catch (error) {
      console.warn("Failed to get FCM token:", error);
    }
  };

  const validatePhone = () => {
    if (phone.length !== 10) {
      setPhoneError("Enter a valid 10-digit phone number");
      return false;
    }
    return true;
  };

  const handleOtpChange = (index, value) => {
    const val = value.replace(/\\D/g, "").slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    if (val && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  async function handleGoogleSignup() {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      // Note: Backend firebaseLogin may need role param, but reuse for now
      // For Google, use firebaseLogin instead as backend expects idToken
      const firebaseData = await firebaseLogin(idToken);
      if (firebaseData.success) {
        // Update role post-login via updateProfileApi
        await updateProfileApi({ role });
        setToken(firebaseData.token);
        setCurrentUser(firebaseData.user);
        await saveFcmToken();
        toast.success(`Welcome ${role === "farmer" ? "Farmer" : "Buyer"}!`);
        return; // Exit early
      }
    } catch (error) {
      console.error(error);
      toast.error("Google signup failed");
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePhoneSignup() {
    if (!validatePhone()) return;
    try {
      setIsLoading(true);
      const data = await requestOTP(phone);
      if (data.success) {
        toast.success("OTP sent to your phone");
        setStep(4); // Go to OTP/profile step
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOtp() {
    const code = otp.join("");
    if (code.length < 6) {
      setOtpError("Please enter the full 6-digit OTP");
      return;
    }
    try {
      setIsLoading(true);
      const data = await verifyOTP(phone, code);
      if (data.success) {
        // Update with role
        const profileData = {
          role,
          phone,
          accountType: role === "farmer" ? "seller" : "buyer",
        };
        const updateData = await updateProfileApi(profileData);
        setToken(updateData.token || data.token);
        setCurrentUser(updateData.user || data.user);
        await saveFcmToken();
        toast.success(`Welcome ${role === "farmer" ? "Farmer" : "Buyer"}!`);
      }
    } catch (error) {
      setOtpError(error.response?.data?.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEmailSignup() {
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }
    try {
      setIsLoading(true);
      const data = await signup({
        name: name || "User",
        email,
        password,
        phone: "0000000000",
        role,
      });
      if (data.success) {
        setToken(data.token);
        setCurrentUser(data.user);
        await saveFcmToken();
        toast.success(`Welcome ${role === "farmer" ? "Farmer" : "Buyer"}!`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleProfileComplete() {
    if (!name.trim() || !location.trim()) {
      setProfileError("Name and location are required");
      return;
    }
    setIsLoading(true);
    try {
      const profileData = {
        name: name.trim(),
        role,
        location: location.trim(),
        accountType: role === "farmer" ? "seller" : "buyer",
      };
      const data = await updateProfileApi(profileData);
      if (data.success) {
        setCurrentUser(data.user);
        toast.success(`Welcome ${role === "farmer" ? "Farmer" : "Buyer"}!`);
      }
    } catch (error) {
      toast.error("Failed to complete profile");
    } finally {
      setIsLoading(false);
    }
  }

  const stepVariants = { enter, center, exit };

  return (
    <div className="max-h-screen flex flex-col md:flex-row min-h-screen">
      {/* Left panel: hero - same as AuthPage */}
      <div className="hidden md:flex md:w-1/2 relative flex-col justify-between p-10 overflow-hidden">
        <img
          src="https://images.pexels.com/photos/29988777/pexels-photo-29988777.jpeg"
          alt="Farm landscape"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/60" />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-display font-bold text-xl tracking-tight">
            Local Connect
          </span>
        </div>
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-white/90 text-sm">
            <Sprout className="w-3.5 h-3.5 fill-farm-amber text-farm-amber" />
            <span>Sign up to connect farmers & buyers</span>
          </div>
          <div className="bg-green-600/40 w-[60%] pl-5 rounded-[20px]">
            <h1 className="font-display text-4xl font-bold text-white leading-tight">
              Join as
              <br />
              <span className="text-farm-amber">Buyer or Farmer</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-8 bg-background min-h-screen md:min-h-0">
        <div className="md:hidden flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Leaf className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl text-foreground tracking-tight">
            Local Connect
          </span>
        </div>

        <div className="w-full max-w-md">
          <div className="flex items-center gap-1.5 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Role Selection */}
            {step === 1 && (
              <motion.div
                key="role"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Create Account
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Choose your role to get started
                  </p>
                </div>
                <div className="space-y-4">
                  <motion.button
                    onClick={() => {
                      setRole("farmer");
                      setStep(2);
                    }}
                    className="group relative flex items-start gap-4 p-6 rounded-2xl border-2 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:border-green-300 hover:shadow-lg transition-all shadow-sm w-full"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center flex-shrink-0">
                      <Sprout className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-green-800">
                        Farmer Account
                      </h3>
                      <p className="mt-1 text-sm text-green-700 font-medium">
                        List your produce
                      </p>
                    </div>
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setRole("buyer");
                      setStep(2);
                    }}
                    className="group relative flex items-start gap-4 p-6 rounded-2xl border-2 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 hover:border-orange-300 hover:shadow-lg transition-all shadow-sm w-full"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-8 h-8 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-orange-800">
                        Buyer Account
                      </h3>
                      <p className="mt-1 text-sm text-orange-700 font-medium">
                        Buy from farmers
                      </p>
                    </div>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Auth Mode */}
            {step === 2 && (
              <motion.div
                key="authmode"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Sign up as {role === "farmer" ? "Farmer" : "Buyer"}
                  </h2>
                </div>
                <div className="flex gap-2 p-1 bg-muted rounded-xl">
                  <button
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${authMode === "phone" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                    onClick={() => setAuthMode("phone")}
                  >
                    Phone
                  </button>
                  <button
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${authMode === "email" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                    onClick={() => setAuthMode("email")}
                  >
                    Email
                  </button>
                </div>
                <Button
                  onClick={
                    authMode === "phone" ? handlePhoneSignup : handleEmailSignup
                  }
                  className="w-full"
                  disabled={isLoading || !role}
                >
                  {isLoading ? "Processing..." : "Continue"}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
                <Button
                  onClick={handleGoogleSignup}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border-2 hover:bg-muted"
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  Continue with Google
                </Button>
              </motion.div>
            )}

            {/* Step 3/4: Input & OTP/Profile - combined for simplicity */}
            {step === 4 && role && (
              <motion.div
                key="final"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <button
                  onClick={() => setStep(authMode === "email" ? 2 : 1)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
                {authMode === "phone" ? (
                  <>
                    <div>
                      <h2 className="font-display text-2xl font-bold text-foreground">
                        Enter OTP
                      </h2>
                      <p className="text-muted-foreground text-sm mt-1">
                        Sent to +91 {phone}
                      </p>
                    </div>
                    <div className="flex gap-3 justify-center">
                      {otp.map((_, i) => (
                        <input
                          key={i}
                          ref={(el) => (otpRefs.current[i] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={otp[i]}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className="w-11 h-12 text-center text-lg font-bold rounded-xl border-2 bg-card text-foreground transition-all focus:border-primary focus:bg-farm-green-pale outline-none"
                        />
                      ))}
                    </div>
                    {otpError && (
                      <p className="text-xs text-destructive text-center">
                        {otpError}
                      </p>
                    )}
                    <div className="bg-farm-amber-pale border border-farm-amber/30 rounded-xl p-3 text-center">
                      <p>
                        <span className="font-medium">Demo:</span> 123456
                      </p>
                    </div>
                    <Button
                      onClick={handleVerifyOtp}
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Verifying..." : "Verify & Complete"}
                    </Button>
                  </>
                ) : (
                  <>
                    <div>
                      <h2 className="font-display text-2xl font-bold text-foreground">
                        Email Signup
                      </h2>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={handleEmailSignup}
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Creating..." : "Create Account"}
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
