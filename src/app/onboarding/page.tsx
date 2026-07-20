"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { completeOnboardingAction } from "@/lib/actions/onboarding";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Plus,
  X,
  GraduationCap,
  User,
  Sparkles,
  Link as LinkIcon,
  Trophy,
  MapPin,
} from "lucide-react";

// ─── Indian data ──────────────────────────────────────────────────────────────

const INDIAN_COLLEGES = [
  "IIT Bombay", "IIT Delhi", "IIT Madras", "IIT Kanpur", "IIT Kharagpur",
  "IIT Roorkee", "IIT Guwahati", "IIT Hyderabad", "IIT BHU", "IIT Indore",
  "BITS Pilani", "BITS Goa", "BITS Hyderabad",
  "NIT Trichy", "NIT Warangal", "NIT Surathkal", "NIT Calicut", "NIT Rourkela",
  "IIIT Hyderabad", "IIIT Delhi", "IIIT Bangalore",
  "VIT Vellore", "SRM Chennai", "Manipal Institute of Technology",
  "DTU Delhi", "NSIT Delhi", "COEP Pune", "DJ Sanghvi Mumbai",
  "Jadavpur University", "Anna University", "Amity University",
  "Christ University", "Symbiosis Institute of Technology",
  "Thapar Institute of Engineering", "PSG College of Technology",
  "BMS College of Engineering", "RV College of Engineering",
  "PES University", "Ramaiah Institute of Technology",
  "DAIICT", "LNMIIT Jaipur", "Nirma University",
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Chandigarh (UT)", "Delhi (NCT)", "Jammu & Kashmir (UT)",
  "Ladakh (UT)", "Puducherry (UT)",
];

const INTEREST_SUGGESTIONS = [
  "Smart India Hackathon", "Competitive Programming", "Open Source",
  "Machine Learning", "Web Development", "App Development",
  "Cybersecurity", "Blockchain", "Robotics", "IoT", "AR/VR",
  "EdTech", "FinTech", "HealthTech", "AgriTech", "ClimaTech",
  "Startup", "Research", "Design", "GATE Prep", "Placement Prep",
  "IIT Techfest", "Mood Indigo", "Hackerearth", "CodeChef",
  "LeetCode", "Codeforces", "GSoC", "MLH Hackathon",
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface SkillItem {
  skillName: string;
  level: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = React.useState(1);
  const TOTAL_STEPS = 5;
  const [loading, setLoading] = React.useState(false);

  // Step 1 — Personal
  const [fullName, setFullName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [dateOfBirth, setDateOfBirth] = React.useState("");

  // Step 2 — Academic / Location
  const [college, setCollege] = React.useState("");
  const [course, setCourse] = React.useState("");
  const [gradYear, setGradYear] = React.useState(2027);
  const [yearOfStudy, setYearOfStudy] = React.useState<number>(2);
  const [cgpa, setCgpa] = React.useState("");
  const [state, setState] = React.useState("");
  const [city, setCity] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [availability, setAvailability] = React.useState("ACTIVE");
  const [collabPreferences, setCollabPreferences] = React.useState("");

  // Step 3 — Achievements
  const [hackathonWins, setHackathonWins] = React.useState(0);
  const [currentAchievement, setCurrentAchievement] = React.useState("");
  const [achievements, setAchievements] = React.useState<string[]>([]);

  // Step 4 — Skills & Interests
  const [currentOfferSkill, setCurrentOfferSkill] = React.useState("");
  const [currentOfferLevel, setCurrentOfferLevel] = React.useState("INTERMEDIATE");
  const [skillsOffer, setSkillsOffer] = React.useState<SkillItem[]>([]);

  const [currentLearnSkill, setCurrentLearnSkill] = React.useState("");
  const [currentLearnLevel, setCurrentLearnLevel] = React.useState("BEGINNER");
  const [skillsLearn, setSkillsLearn] = React.useState<SkillItem[]>([]);

  const [currentInterest, setCurrentInterest] = React.useState("");
  const [interests, setInterests] = React.useState<string[]>([]);

  // Step 5 — Social Links
  const [githubUrl, setGithubUrl] = React.useState("");
  const [linkedinUrl, setLinkedinUrl] = React.useState("");
  const [portfolioUrl, setPortfolioUrl] = React.useState("");
  const [instagramUrl, setInstagramUrl] = React.useState("");
  const [twitterUrl, setTwitterUrl] = React.useState("");

  // ── Sync city+state → location
  React.useEffect(() => {
    if (city && state) setLocation(`${city}, ${state}`);
    else if (state) setLocation(state);
    else if (city) setLocation(city);
  }, [city, state]);

  // ── Step navigation
  const nextStep = () => {
    if (step === 1) {
      if (!fullName.trim() || !username.trim() || !bio.trim()) {
        toast({ title: "Required Fields Missing", description: "Please fill Full Name, Username, and Bio.", type: "error" });
        return;
      }
      if (bio.trim().length < 10) {
        toast({ title: "Bio Too Short", description: "Please write at least 10 characters.", type: "error" });
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
        toast({ title: "Invalid Username", description: "Only letters, numbers and underscores allowed.", type: "error" });
        return;
      }
    }
    if (step === 2) {
      if (!college.trim() || !course.trim() || !state.trim() || !collabPreferences.trim()) {
        toast({ title: "Required Fields Missing", description: "Please fill College, Course, State, and Collaboration Goals.", type: "error" });
        return;
      }
    }
    if (step === 4) {
      if (skillsOffer.length === 0) {
        toast({ title: "Skills Required", description: "Please add at least one skill you can offer.", type: "error" });
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // ── Skill helpers
  const addOfferSkill = () => {
    if (!currentOfferSkill.trim()) return;
    if (skillsOffer.some((s) => s.skillName.toLowerCase() === currentOfferSkill.trim().toLowerCase())) {
      toast({ title: "Duplicate Skill", description: "This skill is already added.", type: "info" });
      return;
    }
    setSkillsOffer([...skillsOffer, { skillName: currentOfferSkill.trim(), level: currentOfferLevel }]);
    setCurrentOfferSkill("");
  };

  const addLearnSkill = () => {
    if (!currentLearnSkill.trim()) return;
    if (skillsLearn.some((s) => s.skillName.toLowerCase() === currentLearnSkill.trim().toLowerCase())) {
      toast({ title: "Duplicate Skill", description: "This skill is already added.", type: "info" });
      return;
    }
    setSkillsLearn([...skillsLearn, { skillName: currentLearnSkill.trim(), level: currentLearnLevel }]);
    setCurrentLearnSkill("");
  };

  const addInterest = (tag?: string) => {
    const val = (tag || currentInterest).trim();
    if (!val) return;
    if (interests.some((i) => i.toLowerCase() === val.toLowerCase())) return;
    setInterests([...interests, val]);
    if (!tag) setCurrentInterest("");
  };

  const addAchievement = () => {
    if (!currentAchievement.trim()) return;
    setAchievements([...achievements, currentAchievement.trim()]);
    setCurrentAchievement("");
  };

  // ── Submit
  const handleSubmit = async () => {
    setLoading(true);
    const payload = {
      fullName, username, college, course,
      gradYear: Number(gradYear),
      yearOfStudy: Number(yearOfStudy),
      cgpa: cgpa ? Number(cgpa) : null,
      location: location || `${city}, ${state}` || state,
      state, city,
      bio, phone, gender, dateOfBirth,
      hackathonWins: Number(hackathonWins),
      achievements,
      availability, collabPreferences,
      githubUrl, linkedinUrl, portfolioUrl, instagramUrl, twitterUrl,
      skillsOffer, skillsLearn, interests,
    };

    const result = await completeOnboardingAction(JSON.stringify(payload));

    if (result.success) {
      toast({ title: "🎉 Profile Created!", description: result.message, type: "success" });
      router.push("/dashboard");
    } else {
      toast({ title: "Submission Failed", description: result.error, type: "error" });
      setLoading(false);
    }
  };

  // ── Reusable textarea style
  const textareaClass = "flex min-h-[90px] w-full rounded-lg border border-border bg-deepslate px-3 py-2 text-sm text-cloud ring-offset-ink placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none";

  return (
    <div className="flex-1 bg-ink flex flex-col justify-center py-16 px-6 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cobalt/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-xl w-full mx-auto bg-deepslate border border-border rounded-2xl shadow-xl shadow-ink/65 relative z-10 p-8">
        {/* Step Indicator */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-cobalt flex items-center justify-center font-bold text-white text-sm">
              {step}
            </div>
            <span className="text-sm font-semibold text-white">
              Step {step} of {TOTAL_STEPS}
            </span>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full transition-colors ${i + 1 <= step ? "bg-cobalt" : "bg-border"}`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 1: Personal ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-5">
              <div>
                <User className="h-8 w-8 text-mint mb-2" />
                <h2 className="text-xl font-bold text-white">Personal Profile</h2>
                <p className="text-xs text-muted-foreground mt-1">Tell the Avenza community who you are.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Full Name *</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Aarav Mehta" />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Username *</label>
                  <Input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} placeholder="aaravm_iitb" />
                  <p className="text-xs text-muted-foreground">Your unique handle — e.g. @aaravm_iitb</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Gender</label>
                  <Select value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="">Prefer not to say</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Date of Birth</label>
                  <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Phone (optional)</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" type="tel" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Bio *</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="B.Tech CSE @IIT Bombay | Full-stack dev | Open source contributor | Looking for hackathon partners 🚀"
                  className={textareaClass}
                />
                <p className="text-xs text-muted-foreground text-right">{bio.length}/500</p>
              </div>

              <Button onClick={nextStep} className="w-full font-semibold">Continue →</Button>
            </motion.div>
          )}

          {/* ── Step 2: Academic / Location ── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-5">
              <div>
                <GraduationCap className="h-8 w-8 text-mint mb-2" />
                <h2 className="text-xl font-bold text-white">Academic Details</h2>
                <p className="text-xs text-muted-foreground mt-1">Connect with peers from your campus and nearby colleges.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">College / University *</label>
                <Input
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="IIT Bombay"
                  list="college-list"
                />
                <datalist id="college-list">
                  {INDIAN_COLLEGES.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Course / Branch *</label>
                  <Input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="Computer Science" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Year of Study</label>
                  <Select value={yearOfStudy} onChange={(e) => setYearOfStudy(Number(e.target.value))}>
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                    <option value={5}>5th Year (Dual)</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Grad Year</label>
                  <Select value={gradYear} onChange={(e) => setGradYear(Number(e.target.value))}>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <option key={i} value={2025 + i}>{2025 + i}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">CGPA (optional)</label>
                  <Input value={cgpa} onChange={(e) => setCgpa(e.target.value)} placeholder="8.5" type="number" min={0} max={10} step={0.01} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">State *</label>
                  <Select value={state} onChange={(e) => setState(e.target.value)}>
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">City</label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Mumbai" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Availability</label>
                <Select value={availability} onChange={(e) => setAvailability(e.target.value)}>
                  <option value="ACTIVE">Active (Full-time)</option>
                  <option value="WEEKENDS">Weekends Only</option>
                  <option value="BUSY">Busy (Advisory Only)</option>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Collaboration Goals *</label>
                <textarea
                  value={collabPreferences}
                  onChange={(e) => setCollabPreferences(e.target.value)}
                  placeholder="Looking for a hackathon team for SIH 2025. I can handle backend (Node.js). Need a designer and ML engineer..."
                  className={textareaClass}
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={prevStep} variant="secondary" className="flex-1 font-semibold">← Back</Button>
                <Button onClick={nextStep} className="flex-1 font-semibold">Continue →</Button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Achievements ── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-5">
              <div>
                <Trophy className="h-8 w-8 text-amber mb-2" />
                <h2 className="text-xl font-bold text-white">Achievements & Wins</h2>
                <p className="text-xs text-muted-foreground mt-1">Showcase your hackathon victories and standout accomplishments.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Hackathon Wins</label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setHackathonWins(Math.max(0, hackathonWins - 1))}
                    className="h-10 w-10 rounded-lg border border-border bg-ink flex items-center justify-center text-white hover:bg-cobalt/20 transition-colors text-lg font-bold"
                  >
                    −
                  </button>
                  <span className="text-2xl font-extrabold text-white w-12 text-center">{hackathonWins}</span>
                  <button
                    type="button"
                    onClick={() => setHackathonWins(hackathonWins + 1)}
                    className="h-10 w-10 rounded-lg border border-border bg-ink flex items-center justify-center text-white hover:bg-cobalt/20 transition-colors text-lg font-bold"
                  >
                    +
                  </button>
                  <span className="text-xs text-muted-foreground">hackathon(s) won</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Achievements & Awards</label>
                <div className="flex gap-2">
                  <Input
                    value={currentAchievement}
                    onChange={(e) => setCurrentAchievement(e.target.value)}
                    placeholder="SIH 2024 Winner, Google Summer of Code 2024..."
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAchievement())}
                  />
                  <Button onClick={addAchievement} variant="secondary" size="icon">
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {achievements.map((ach, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber/10 text-amber border border-amber/20">
                      🏆 {ach}
                      <button onClick={() => setAchievements(achievements.filter((_, i) => i !== idx))} className="hover:text-white ml-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={prevStep} variant="secondary" className="flex-1 font-semibold">← Back</Button>
                <Button onClick={nextStep} className="flex-1 font-semibold">Continue →</Button>
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Skills & Interests ── */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-5">
              <div>
                <Sparkles className="h-8 w-8 text-mint mb-2" />
                <h2 className="text-xl font-bold text-white">Skills & Interests</h2>
                <p className="text-xs text-muted-foreground mt-1">The skill exchange engine is the core of Avenza.</p>
              </div>

              {/* Skills Offer */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Skills I Offer (min 1) *</label>
                <div className="flex gap-2">
                  <Input
                    value={currentOfferSkill}
                    onChange={(e) => setCurrentOfferSkill(e.target.value)}
                    placeholder="React, Figma, Python..."
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addOfferSkill())}
                  />
                  <Select value={currentOfferLevel} onChange={(e) => setCurrentOfferLevel(e.target.value)} className="w-[130px]">
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="EXPERT">Expert</option>
                  </Select>
                  <Button onClick={addOfferSkill} variant="secondary" size="icon"><Plus className="h-5 w-5" /></Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skillsOffer.map((s, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cobalt/15 text-indigo-300 border border-cobalt/30">
                      {s.skillName} · {s.level.toLowerCase()}
                      <button onClick={() => setSkillsOffer(skillsOffer.filter((_, i) => i !== idx))} className="hover:text-white ml-0.5"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills Learn */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Skills I Want to Learn</label>
                <div className="flex gap-2">
                  <Input
                    value={currentLearnSkill}
                    onChange={(e) => setCurrentLearnSkill(e.target.value)}
                    placeholder="Rust, Docker, UI/UX..."
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLearnSkill())}
                  />
                  <Select value={currentLearnLevel} onChange={(e) => setCurrentLearnLevel(e.target.value)} className="w-[130px]">
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="EXPERT">Expert</option>
                  </Select>
                  <Button onClick={addLearnSkill} variant="secondary" size="icon"><Plus className="h-5 w-5" /></Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skillsLearn.map((s, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-mint/10 text-mint border border-mint/20">
                      {s.skillName} · {s.level.toLowerCase()}
                      <button onClick={() => setSkillsLearn(skillsLearn.filter((_, i) => i !== idx))} className="hover:text-white ml-0.5"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Interests & Topics</label>
                <div className="flex gap-2">
                  <Input
                    value={currentInterest}
                    onChange={(e) => setCurrentInterest(e.target.value)}
                    placeholder="SIH, Open Source, ML, Startup..."
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                  />
                  <Button onClick={() => addInterest()} variant="secondary" size="icon"><Plus className="h-5 w-5" /></Button>
                </div>
                {/* Quick-add suggestion pills */}
                <div className="flex flex-wrap gap-1.5">
                  {INTEREST_SUGGESTIONS.filter((s) => !interests.includes(s)).slice(0, 12).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addInterest(tag)}
                      className="px-2 py-0.5 rounded-full text-[11px] border border-border text-muted-foreground hover:border-cobalt hover:text-white transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {interests.map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-deepslate text-cloud border border-border">
                      #{tag}
                      <button onClick={() => setInterests(interests.filter((_, i) => i !== idx))} className="hover:text-white ml-0.5"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={prevStep} variant="secondary" className="flex-1 font-semibold">← Back</Button>
                <Button onClick={nextStep} className="flex-1 font-semibold">Continue →</Button>
              </div>
            </motion.div>
          )}

          {/* ── Step 5: Social / Portfolio Links ── */}
          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-5">
              <div>
                <LinkIcon className="h-8 w-8 text-mint mb-2" />
                <h2 className="text-xl font-bold text-white">Social & Portfolio</h2>
                <p className="text-xs text-muted-foreground mt-1">All optional — but they help peers verify your background.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">GitHub</label>
                  <Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/username" type="url" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">LinkedIn</label>
                  <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/username" type="url" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Instagram</label>
                  <Input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/username" type="url" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Twitter / X</label>
                  <Input value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} placeholder="https://x.com/username" type="url" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Portfolio / Website</label>
                  <Input value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://yourname.dev" type="url" />
                </div>
              </div>

              {/* Final summary before submit */}
              <div className="p-4 rounded-xl bg-cobalt/10 border border-cobalt/20 space-y-1 text-xs text-muted-foreground">
                <p className="text-white font-semibold text-sm mb-2">✅ Ready to join Avenza!</p>
                <p><span className="text-cloud">Name:</span> {fullName} (@{username})</p>
                <p><span className="text-cloud">College:</span> {college} · {course} · Year {yearOfStudy}</p>
                <p><MapPin className="h-3 w-3 inline mr-1" />{city}{city && state ? ", " : ""}{state}</p>
                <p><span className="text-cloud">Skills:</span> {skillsOffer.map((s) => s.skillName).join(", ") || "—"}</p>
                {hackathonWins > 0 && <p>🏆 {hackathonWins} hackathon win{hackathonWins > 1 ? "s" : ""}</p>}
              </div>

              <div className="flex gap-4">
                <Button onClick={prevStep} variant="secondary" className="flex-1 font-semibold" disabled={loading}>← Back</Button>
                <Button onClick={handleSubmit} className="flex-1 font-semibold" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving…
                    </span>
                  ) : "🚀 Complete Profile"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
