"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { completeOnboardingAction } from "@/lib/actions/onboarding";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Plus, X, GraduationCap, User, Sparkles, Link as LinkIcon } from "lucide-react";

interface SkillItem {
  skillName: string;
  level: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);

  // Form State
  const [fullName, setFullName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [location, setLocation] = React.useState("");

  const [college, setCollege] = React.useState("");
  const [course, setCourse] = React.useState("");
  const [gradYear, setGradYear] = React.useState(2028);
  const [availability, setAvailability] = React.useState("ACTIVE");
  const [collabPreferences, setCollabPreferences] = React.useState("");

  const [currentOfferSkill, setCurrentOfferSkill] = React.useState("");
  const [currentOfferLevel, setCurrentOfferLevel] = React.useState("INTERMEDIATE");
  const [skillsOffer, setSkillsOffer] = React.useState<SkillItem[]>([]);

  const [currentLearnSkill, setCurrentLearnSkill] = React.useState("");
  const [currentLearnLevel, setCurrentLearnLevel] = React.useState("BEGINNER");
  const [skillsLearn, setSkillsLearn] = React.useState<SkillItem[]>([]);

  const [currentInterest, setCurrentInterest] = React.useState("");
  const [interests, setInterests] = React.useState<string[]>([]);

  const [githubUrl, setGithubUrl] = React.useState("");
  const [linkedinUrl, setLinkedinUrl] = React.useState("");
  const [portfolioUrl, setPortfolioUrl] = React.useState("");

  const nextStep = () => {
    // Basic validation
    if (step === 1) {
      if (!fullName.trim() || !username.trim() || !bio.trim() || !location.trim()) {
        toast({ title: "Required Fields Missing", description: "Please fill out all fields on this step.", type: "error" });
        return;
      }
      if (bio.trim().length < 10) {
        toast({ title: "Bio Too Short", description: "Please write at least 10 characters for your bio.", type: "error" });
        return;
      }
    }
    if (step === 2) {
      if (!college.trim() || !course.trim() || !collabPreferences.trim()) {
        toast({ title: "Required Fields Missing", description: "Please fill out college, major, and collaboration preferences.", type: "error" });
        return;
      }
    }
    if (step === 3) {
      if (skillsOffer.length === 0) {
        toast({ title: "Skills Required", description: "Please add at least one skill you can offer.", type: "error" });
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const addOfferSkill = () => {
    if (!currentOfferSkill.trim()) return;
    if (skillsOffer.some((s) => s.skillName.toLowerCase() === currentOfferSkill.trim().toLowerCase())) {
      toast({ title: "Duplicate Skill", description: "This skill is already added.", type: "info" });
      return;
    }
    setSkillsOffer([...skillsOffer, { skillName: currentOfferSkill.trim(), level: currentOfferLevel }]);
    setCurrentOfferSkill("");
  };

  const removeOfferSkill = (index: number) => {
    setSkillsOffer(skillsOffer.filter((_, i) => i !== index));
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

  const removeLearnSkill = (index: number) => {
    setSkillsLearn(skillsLearn.filter((_, i) => i !== index));
  };

  const addInterest = () => {
    if (!currentInterest.trim()) return;
    if (interests.some((i) => i.toLowerCase() === currentInterest.trim().toLowerCase())) {
      return;
    }
    setInterests([...interests, currentInterest.trim()]);
    setCurrentInterest("");
  };

  const removeInterest = (index: number) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const payload = {
      fullName,
      username,
      college,
      course,
      gradYear: Number(gradYear),
      location,
      bio,
      availability,
      collabPreferences,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      skillsOffer,
      skillsLearn,
      interests,
    };

    const result = await completeOnboardingAction(JSON.stringify(payload));

    if (result.success) {
      toast({ title: "Onboarding Complete!", description: result.message, type: "success" });
      router.push("/dashboard");
      router.refresh();
    } else {
      toast({ title: "Submission Failed", description: result.error, type: "error" });
      setLoading(false);
    }
  };

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
            <span className="text-sm font-semibold text-white">Step {step} of 4</span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  i <= step ? "bg-cobalt" : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div>
                <User className="h-8 w-8 text-mint mb-2" />
                <h2 className="text-xl font-bold text-white">Personal Profile</h2>
                <p className="text-xs text-muted-foreground mt-1">Let peers know who you are and where you&apos;re building from.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Full Name</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Alex Chen" required />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Username</label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="aaravm" required />
                <p className="text-xs text-muted-foreground">Unique identifier used for your profile link.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Location</label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Bengaluru, Karnataka" required />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Professional Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about your background, builder achievements, or what you are excited about..."
                  className="flex min-h-[100px] w-full rounded-lg border border-border bg-deepslate px-3 py-2 text-sm text-cloud ring-offset-ink placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none"
                  required
                />
              </div>

              <Button onClick={nextStep} className="w-full font-semibold">
                Continue to College Details
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div>
                <GraduationCap className="h-8 w-8 text-mint mb-2" />
                <h2 className="text-xl font-bold text-white">University & Academics</h2>
                <p className="text-xs text-muted-foreground mt-1">Connect with students at your own campus or nearby universities.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">University/College</label>
                <Input value={college} onChange={(e) => setCollege(e.target.value)} placeholder="BITS Pilani" required />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Course/Major</label>
                <Input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="Computer Science" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Graduation Year</label>
                  <Select value={gradYear} onChange={(e) => setGradYear(Number(e.target.value))}>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <option key={i} value={2025 + i}>
                        {2025 + i}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Availability</label>
                  <Select value={availability} onChange={(e) => setAvailability(e.target.value)}>
                    <option value="ACTIVE">Active (Full-time)</option>
                    <option value="WEEKENDS">Weekends Only</option>
                    <option value="BUSY">Busy (Advisory Only)</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Collaboration Goals</label>
                <textarea
                  value={collabPreferences}
                  onChange={(e) => setCollabPreferences(e.target.value)}
                  placeholder="Describe your co-founder goals or ideal project team co-members..."
                  className="flex min-h-[90px] w-full rounded-lg border border-border bg-deepslate px-3 py-2 text-sm text-cloud ring-offset-ink placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none"
                  required
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={prevStep} variant="secondary" className="flex-1 font-semibold">
                  Back
                </Button>
                <Button onClick={nextStep} className="flex-1 font-semibold">
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div>
                <Sparkles className="h-8 w-8 text-mint mb-2" />
                <h2 className="text-xl font-bold text-white">Skills & Interests</h2>
                <p className="text-xs text-muted-foreground mt-1">Trading complementary skills is the core of the Avenza peer engine.</p>
              </div>

              {/* Skills Offer Section */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Skills I Offer (Min 1)</label>
                <div className="flex gap-2">
                  <Input
                    value={currentOfferSkill}
                    onChange={(e) => setCurrentOfferSkill(e.target.value)}
                    placeholder="React, Figma, Python"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addOfferSkill())}
                  />
                  <Select value={currentOfferLevel} onChange={(e) => setCurrentOfferLevel(e.target.value)} className="w-[140px]">
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="EXPERT">Expert</option>
                  </Select>
                  <Button onClick={addOfferSkill} variant="secondary" size="icon">
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {skillsOffer.map((s, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cobalt/15 text-indigo-300 border border-cobalt/30">
                      {s.skillName} ({s.level.toLowerCase()})
                      <button onClick={() => removeOfferSkill(idx)} className="hover:text-white ml-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills Learn Section */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Skills I Want to Learn</label>
                <div className="flex gap-2">
                  <Input
                    value={currentLearnSkill}
                    onChange={(e) => setCurrentLearnSkill(e.target.value)}
                    placeholder="Rust, Docker, UI/UX"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLearnSkill())}
                  />
                  <Select value={currentLearnLevel} onChange={(e) => setCurrentLearnLevel(e.target.value)} className="w-[140px]">
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="EXPERT">Expert</option>
                  </Select>
                  <Button onClick={addLearnSkill} variant="secondary" size="icon">
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {skillsLearn.map((s, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-mint/10 text-mint border border-mint/20">
                      {s.skillName} ({s.level.toLowerCase()})
                      <button onClick={() => removeLearnSkill(idx)} className="hover:text-white ml-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Interest Tags */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Interests & Topics</label>
                <div className="flex gap-2">
                  <Input
                    value={currentInterest}
                    onChange={(e) => setCurrentInterest(e.target.value)}
                    placeholder="EdTech, AI, Hackathons, Web3"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                  />
                  <Button onClick={addInterest} variant="secondary" size="icon">
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {interests.map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-deepslate text-cloud border border-border">
                      #{tag}
                      <button onClick={() => removeInterest(idx)} className="hover:text-white ml-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={prevStep} variant="secondary" className="flex-1 font-semibold">
                  Back
                </Button>
                <Button onClick={nextStep} className="flex-1 font-semibold">
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div>
                <LinkIcon className="h-8 w-8 text-mint mb-2" />
                <h2 className="text-xl font-bold text-white">Social & Portfolio Links</h2>
                <p className="text-xs text-muted-foreground mt-1">Provide external links so peers can verify your background.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">GitHub URL</label>
                <Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/username" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">LinkedIn URL</label>
                <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/username" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-cloud uppercase tracking-wider block">Portfolio URL</label>
                <Input value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://username.dev" />
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={prevStep} variant="secondary" className="flex-1 font-semibold" disabled={loading}>
                  Back
                </Button>
                <Button onClick={handleSubmit} className="flex-1 font-semibold" disabled={loading}>
                  {loading ? "Saving Profile..." : "Complete Profile"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
