import { PrismaClient, Prisma } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up database...");
  await prisma.moderationReport.deleteMany({});
  await prisma.savedProject.deleteMany({});
  await prisma.savedProfile.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.mentorshipSession.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.activityEvent.deleteMany({});
  await prisma.projectResource.deleteMany({});
  await prisma.milestone.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.projectApplication.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.connection.deleteMany({});
  await prisma.profileInterest.deleteMany({});
  await prisma.skillLearn.deleteMany({});
  await prisma.skillOffer.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("Database cleared.");

  // Precomputed bcrypt hash for "password123" to make seeding fast
  const passwordHash = await bcrypt.hash("password123", 10);

  const avatarPhotos = [
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80", // Male 1
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80", // Female 1
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80", // Male 2
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80", // Female 2
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80", // Male 3
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80", // Female 3
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80", // Male 4
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80", // Female 4
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80", // Male 5
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80", // Female 5
  ];

  // 1. Seed Users and Profiles with Indian Context
  const studentData = [
    {
      email: "aarav.mehta@iitb.ac.in",
      username: "aaravm",
      fullName: "Aarav Mehta",
      avatarUrl: avatarPhotos[0],
      college: "IIT Bombay",
      course: "Computer Science",
      gradYear: 2027,
      yearOfStudy: 2,
      cgpa: 9.4,
      hackathonWins: 3,
      state: "Maharashtra",
      city: "Mumbai",
      location: "Mumbai, Maharashtra",
      bio: "Ambitious developer focusing on full-stack web platforms and interactive user interfaces. Passionate about building products for India's builder economy.",
      githubUrl: "https://github.com/aaravmehta",
      linkedinUrl: "https://linkedin.com/in/aaravmehta",
      instagramUrl: "https://instagram.com/aaravmehta",
      twitterUrl: "https://x.com/aaravmehta",
      portfolioUrl: "https://aaravmehta.dev",
      availability: "ACTIVE",
      collabPreferences: "Looking to join React/Next.js hackathon teams as frontend lead.",
      offers: [
        { name: "React", level: "EXPERT" as const },
        { name: "TypeScript", level: "EXPERT" as const },
        { name: "Tailwind CSS", level: "EXPERT" as const },
        { name: "Figma", level: "INTERMEDIATE" as const }
      ],
      learns: [
        { name: "PostgreSQL", level: "BEGINNER" as const },
        { name: "Next.js Server Actions", level: "INTERMEDIATE" as const },
        { name: "Node.js", level: "INTERMEDIATE" as const }
      ],
      interests: ["Hackathons", "EdTech", "Design Systems", "Web Performance"]
    },
    {
      email: "shreya.i@pilani.bits-pilani.ac.in",
      username: "shreyai",
      fullName: "Shreya Iyer",
      avatarUrl: avatarPhotos[1],
      college: "BITS Pilani",
      course: "Data Science & AI",
      gradYear: 2026,
      yearOfStudy: 3,
      cgpa: 9.1,
      hackathonWins: 2,
      state: "Rajasthan",
      city: "Pilani",
      location: "Pilani, Rajasthan",
      bio: "AI researcher turned builder. Interested in applying ML models to agriculture, climate data, and personalized student learning paths.",
      githubUrl: "https://github.com/shreyai",
      linkedinUrl: "https://linkedin.com/in/shreyai",
      instagramUrl: "https://instagram.com/shreya_iyer",
      twitterUrl: "https://x.com/shreyai",
      portfolioUrl: "https://shreyai.ai",
      availability: "ACTIVE",
      collabPreferences: "Interested in helping teams integrate AI capabilities, embeddings, or complex analysis dashboards.",
      offers: [
        { name: "Python", level: "EXPERT" as const },
        { name: "Machine Learning", level: "EXPERT" as const },
        { name: "PyTorch", level: "EXPERT" as const },
        { name: "SQL", level: "INTERMEDIATE" as const }
      ],
      learns: [
        { name: "React", level: "BEGINNER" as const },
        { name: "FastAPI", level: "INTERMEDIATE" as const },
        { name: "Docker", level: "INTERMEDIATE" as const }
      ],
      interests: ["Climate Tech", "Generative AI", "Cognitive Science", "Algorithms"]
    },
    {
      email: "rohan.j@iiit.ac.in",
      username: "rohanj",
      fullName: "Rohan Joshi",
      avatarUrl: avatarPhotos[2],
      college: "IIIT Hyderabad",
      course: "Cognitive Science",
      gradYear: 2028,
      yearOfStudy: 1,
      cgpa: 8.8,
      hackathonWins: 1,
      state: "Telangana",
      city: "Hyderabad",
      location: "Hyderabad, Telangana",
      bio: "UX Designer and Researcher. Passionate about localizing interfaces, accessibility, and creating digital experiences that feel intuitive and clean.",
      githubUrl: "https://github.com/rohanjdesign",
      linkedinUrl: "https://linkedin.com/in/rohanj",
      instagramUrl: "https://instagram.com/rohanj_ux",
      portfolioUrl: "https://rohanj.design",
      availability: "WEEKENDS",
      collabPreferences: "Looking for back-end developers to partner on accessibility-oriented educational projects.",
      offers: [
        { name: "Figma", level: "EXPERT" as const },
        { name: "UI/UX Design", level: "EXPERT" as const },
        { name: "User Research", level: "EXPERT" as const },
        { name: "CSS Grid/Flexbox", level: "INTERMEDIATE" as const }
      ],
      learns: [
        { name: "Tailwind CSS", level: "INTERMEDIATE" as const },
        { name: "JavaScript", level: "BEGINNER" as const }
      ],
      interests: ["Accessibility", "Digital Ergonomics", "Product Strategy", "Art & Typography"]
    },
    {
      email: "ananya.s@dtu.ac.in",
      username: "ananyas",
      fullName: "Ananya Sharma",
      avatarUrl: avatarPhotos[3],
      college: "DTU Delhi",
      course: "Computer Science",
      gradYear: 2027,
      yearOfStudy: 2,
      cgpa: 9.3,
      hackathonWins: 4,
      state: "Delhi (NCT)",
      city: "New Delhi",
      location: "Delhi NCR",
      bio: "Mobile-first developer. Flutter enthusiast who loves compiling beautiful cross-platform applications and exploring micro-interactions.",
      githubUrl: "https://github.com/ananyas",
      linkedinUrl: "https://linkedin.com/in/ananyas",
      instagramUrl: "https://instagram.com/ananya_sharma",
      portfolioUrl: "https://ananya.dev",
      availability: "ACTIVE",
      collabPreferences: "Open to team projects requiring cross-platform mobile apps.",
      offers: [
        { name: "Flutter", level: "EXPERT" as const },
        { name: "Dart", level: "EXPERT" as const },
        { name: "Firebase", level: "EXPERT" as const },
        { name: "React Native", level: "BEGINNER" as const }
      ],
      learns: [
        { name: "TypeScript", level: "INTERMEDIATE" as const },
        { name: "System Design", level: "BEGINNER" as const }
      ],
      interests: ["Mobile UX", "Cross-Platform Tools", "Campus Utility", "Interactive Widgets"]
    },
    {
      email: "kabir.n@rvce.edu.in",
      username: "kabirn",
      fullName: "Kabir Nair",
      avatarUrl: avatarPhotos[4],
      college: "RVCE Bengaluru",
      course: "Software Engineering",
      gradYear: 2026,
      yearOfStudy: 3,
      cgpa: 8.9,
      hackathonWins: 2,
      state: "Karnataka",
      city: "Bengaluru",
      location: "Bengaluru, Karnataka",
      bio: "Back-end architect. Love optimizing SQL query plans, designing robust database schemas, and writing secure REST & GraphQL endpoints.",
      githubUrl: "https://github.com/kabirn-backend",
      linkedinUrl: "https://linkedin.com/in/kabirn-backend",
      twitterUrl: "https://x.com/kabirn_dev",
      portfolioUrl: "https://kabirn.io",
      availability: "BUSY",
      collabPreferences: "Happy to advise on database schema design, indexing, or API structures for student projects.",
      offers: [
        { name: "PostgreSQL", level: "EXPERT" as const },
        { name: "Node.js", level: "EXPERT" as const },
        { name: "Prisma ORM", level: "EXPERT" as const },
        { name: "Express", level: "EXPERT" as const }
      ],
      learns: [
        { name: "Docker", level: "INTERMEDIATE" as const },
        { name: "Redis", level: "INTERMEDIATE" as const },
        { name: "Go", level: "BEGINNER" as const }
      ],
      interests: ["Databases", "Distributed Systems", "Performance Tuning", "Caching Techniques"]
    },
    ...Array.from({ length: 21 }).map((_, i) => {
      const names = [
        "Aisha Rahman", "Devanshu Gupta", "Priya Sen", "Gautham Krishnan",
        "Sneha Reddy", "Aditya Verma", "Diya Das", "Vikram Malhotra",
        "Riya Kapoor", "Tarun Saxena", "Kriti Nair", "Rahul Bansal",
        "Neha Pillai", "Sanjay Nair", "Pooja Rao", "Amit Patel",
        "Karan Shah", "Meera Deshmukh", "Nikhil Sharma", "Tanvi Joshi", "Ishaan Roy"
      ];
      const colleges = [
        "IIT Bombay", "BITS Pilani", "IIT Delhi", "IIIT Hyderabad",
        "NIT Trichy", "COEP Pune", "RVCE Bengaluru", "VIT Vellore",
        "IIT Madras", "IIT Kharagpur"
      ];
      const courses = [
        "Computer Science", "Data Science & AI", "Electronics & Comm",
        "Software Engineering", "Mechanical Engineering", "Design & UX",
        "Business Analytics", "Biotech Engineering", "Product Management"
      ];
      const cities = [
        "Bengaluru, Karnataka", "Mumbai, Maharashtra", "Delhi NCR", "Hyderabad, Telangana",
        "Pune, Maharashtra", "Chennai, Tamil Nadu", "Kolkata, West Bengal", "Pilani, Rajasthan",
        "Goa", "Vellore, Tamil Nadu"
      ];
      const statesList = [
        "Karnataka", "Maharashtra", "Delhi (NCT)", "Telangana",
        "Maharashtra", "Tamil Nadu", "West Bengal", "Rajasthan",
        "Goa", "Tamil Nadu"
      ];
      const skillsPool = [
        "React", "TypeScript", "Python", "Node.js", "Figma", "UI/UX Design", "Docker", "SQL",
        "Machine Learning", "FastAPI", "Go", "Java", "C++", "Next.js", "Tailwind CSS"
      ];

      const name = names[i % names.length];
      const username = name.toLowerCase().replace(/[^a-z]/g, "") + i;
      const college = colleges[i % colleges.length];
      const course = courses[(i + 2) % courses.length];
      const city = cities[i % cities.length];
      const photo = avatarPhotos[(i + 5) % avatarPhotos.length];

      return {
        email: `${username}@college.edu.in`,
        username,
        fullName: name,
        avatarUrl: photo,
        college,
        course,
        gradYear: 2026 + (i % 3),
        yearOfStudy: 1 + (i % 4),
        cgpa: Number((8.1 + (i * 0.07) % 1.7).toFixed(1)),
        hackathonWins: i % 3,
        state: statesList[i % statesList.length],
        city: city.split(",")[0],
        location: city,
        bio: `Student at ${college} studying ${course}. Eager to collaborate on student builder initiatives.`,
        githubUrl: `https://github.com/${username}`,
        linkedinUrl: `https://linkedin.com/in/${username}`,
        instagramUrl: `https://instagram.com/${username}`,
        twitterUrl: `https://x.com/${username}`,
        portfolioUrl: `https://${username}.me`,
        availability: i % 2 === 0 ? "ACTIVE" as const : "WEEKENDS" as const,
        collabPreferences: "Open to joining new projects or sharing skills.",
        offers: [
          { name: skillsPool[i % skillsPool.length], level: "EXPERT" as const },
          { name: skillsPool[(i + 1) % skillsPool.length], level: "INTERMEDIATE" as const }
        ],
        learns: [
          { name: skillsPool[(i + 3) % skillsPool.length], level: "BEGINNER" as const },
          { name: skillsPool[(i + 4) % skillsPool.length], level: "INTERMEDIATE" as const }
        ],
        interests: ["Hackathons", "Tech Careers", "Product Design", "Collaboration"]
      };
    })
  ];

  console.log(`Creating ${studentData.length} students...`);
  type SeedUser = Prisma.UserGetPayload<{ include: { profile: true } }> & {
    profile: NonNullable<Prisma.UserGetPayload<{ include: { profile: true } }>["profile"]>;
  };
  const createdUsers: SeedUser[] = [];

  for (const item of studentData) {
    let role = "STUDENT";
    if (item.username === "aaravm") {
      role = "ADMIN";
    }

    const user = await prisma.user.create({
      data: {
        email: item.email,
        passwordHash,
        role,
        profile: {
          create: {
            username: item.username,
            fullName: item.fullName,
            avatarUrl: item.avatarUrl,
            college: item.college,
            course: item.course,
            gradYear: item.gradYear,
            yearOfStudy: item.yearOfStudy,
            cgpa: item.cgpa,
            hackathonWins: item.hackathonWins,
            state: item.state,
            city: item.city,
            location: item.location,
            bio: item.bio,
            githubUrl: item.githubUrl,
            linkedinUrl: item.linkedinUrl,
            instagramUrl: item.instagramUrl,
            twitterUrl: item.twitterUrl,
            portfolioUrl: item.portfolioUrl,
            availability: item.availability,
            collabPreferences: item.collabPreferences,
            offers: {
              create: item.offers.map((o) => ({
                skillName: o.name,
                level: o.level
              }))
            },
            learns: {
              create: item.learns.map((l) => ({
                skillName: l.name,
                level: l.level
              }))
            },
            interests: {
              create: item.interests.map((intName) => ({
                name: intName
              }))
            }
          }
        }
      },
      include: {
        profile: true
      }
    });
    createdUsers.push(user as SeedUser);
  }
  console.log("Students created.");

  // Helper arrays for lookups
  const alexUser = createdUsers.find((u) => u.profile.username === "aaravm")!;
  const sarahUser = createdUsers.find((u) => u.profile.username === "shreyai")!;
  const marcusUser = createdUsers.find((u) => u.profile.username === "rohanj")!;
  const emilyUser = createdUsers.find((u) => u.profile.username === "ananyas")!;
  const davidUser = createdUsers.find((u) => u.profile.username === "kabirn")!;

  // 2. Create connections
  console.log("Seeding connections...");
  await prisma.connection.createMany({
    data: [
      { senderId: alexUser.id, receiverId: sarahUser.id, status: "ACCEPTED" },
      { senderId: alexUser.id, receiverId: marcusUser.id, status: "ACCEPTED" },
      { senderId: alexUser.id, receiverId: emilyUser.id, status: "PENDING", message: "Hey Ananya! Saw your Flutter profile, let's connect." },
      { senderId: davidUser.id, receiverId: alexUser.id, status: "ACCEPTED" },
      { senderId: sarahUser.id, receiverId: marcusUser.id, status: "ACCEPTED" }
    ]
  });

  // 3. Create Projects (10 projects with Indian themes)
  console.log("Seeding projects...");
  const projectsData = [
    {
      ownerId: alexUser.id,
      title: "EcoTrack Bharat",
      description: "A web application that allows Indian college campuses to track and reduce carbon emissions by monitoring hostel transport, cafeteria meals, and localized waste management. Built for Indian context.",
      category: "Climate Tech",
      timeline: "3 Months",
      status: "RECRUITING",
      githubUrl: "https://github.com/aaravmehta/ecotrack-bharat",
      demoUrl: "https://ecotrack-bharat.vercel.app",
      bannerUrl: null,
      roles: ["Frontend Developer", "Back-end Engineer", "UX/UI Designer"],
      milestones: [
        { title: "Dashboard Wireframes", description: "Design responsive dashboards for student statistics", isCompleted: true },
        { title: "Database Architecture", description: "Define schema for tracking carbon events", isCompleted: true },
        { title: "API Development", description: "Build backend REST endpoints in Express/PostgreSQL", isCompleted: false },
        { title: "Vercel Deployment", description: "Configure production deployment pipelines", isCompleted: false }
      ],
      resources: [
        { title: "Figma Workspace", url: "https://figma.com/file/ecotrack-mock", type: "LINK" },
        { title: "API Specifications Docs", url: "https://postman.com/ecotrack", type: "DOC" }
      ]
    },
    {
      ownerId: emilyUser.id,
      title: "CampusSync Pilani",
      description: "A native Flutter-based mobile application resolving campus event clutter. Aggregates official club events, hostel mess announcements, study groups, and hackathons into a geographical-based calendar dashboard.",
      category: "Campus Life",
      timeline: "2 Months",
      status: "ACTIVE",
      githubUrl: "https://github.com/ananyas/campussynd-pilani",
      demoUrl: null,
      bannerUrl: null,
      roles: ["Flutter Developer", "Marketing Lead", "Firebase Engineer"],
      milestones: [
        { title: "Map Integration", description: "Integrate Mapbox/Google Maps API into mobile view", isCompleted: true },
        { title: "Firebase Authentication", description: "Implement university email OAuth sign-in flow", isCompleted: true },
        { title: "Beta Test Release", description: "Distribute TestFlight and APK to 50 active campus testers", isCompleted: false }
      ],
      resources: [
        { title: "Flutter Project Repository", url: "https://github.com/ananyas/campussynd-pilani", type: "REPO" }
      ]
    },
    {
      ownerId: marcusUser.id,
      title: "Kailash Sanskrit OCR",
      description: "An accessibility-centric web extension that scans and transcribes high-fidelity Sanskrit text manuscripts, generating synchronized English translations and interactive dictionaries.",
      category: "Accessibility",
      timeline: "4 Months",
      status: "RECRUITING",
      githubUrl: "https://github.com/rohanjdesign/kailash-ocr",
      demoUrl: "https://kailash-ocr.org",
      bannerUrl: null,
      roles: ["Python ML Engineer", "Browser Extension Architect", "Linguistic Consultant"],
      milestones: [
        { title: "OCR Pipeline Setup", description: "Deploy custom model on server and verify latency", isCompleted: false },
        { title: "Extension Overlay UI", description: "Design layout according to W3C standards", isCompleted: false }
      ],
      resources: [
        { title: "Manuscript API Guide", url: "https://kailash-ocr.org/docs", type: "LINK" }
      ]
    },
    {
      ownerId: sarahUser.id,
      title: "Gurukul Match",
      description: "An automated mentorship matching portal helping engineering freshmen find seniors. Utilizes Gale-Shapley matching algorithm customized for academic paths, skill targets, and shared campus interests.",
      category: "Education",
      timeline: "3 Months",
      status: "ACTIVE",
      githubUrl: "https://github.com/shreyai/gurukul-match",
      demoUrl: "https://gurukul-match.bits-pilani.ac.in",
      bannerUrl: null,
      roles: ["Python Data Scientist", "Next.js Web Developer"],
      milestones: [
        { title: "Match Engine Implementation", description: "Code custom Gale-Shapley algorithm in python", isCompleted: true },
        { title: "UI Integration", description: "Port match recommendations into Web app dashboard", isCompleted: false }
      ],
      resources: []
    },
    {
      ownerId: davidUser.id,
      title: "ChakraFlow",
      description: "A developer-first, localized Kanban and collaboration tool utilizing WebSockets to synchronize task updates instantly without heavy cloud DB round-trips. Great for hackathons and local sandbox testing.",
      category: "Web Development",
      timeline: "1 Month",
      status: "COMPLETED",
      githubUrl: "https://github.com/kabirn-backend/chakraflow",
      demoUrl: "https://chakraflow.io",
      bannerUrl: null,
      roles: [],
      milestones: [
        { title: "WebSocket Sync Implementation", description: "Establish Socket.io connection state syncing", isCompleted: true },
        { title: "Local Database Fallback", description: "Integrate SQLite local caching when connection fails", isCompleted: true }
      ],
      resources: []
    },
    ...Array.from({ length: 5 }).map((_, i) => {
      const creatorIdx = (i + 5) % createdUsers.length;
      const creator = createdUsers[creatorIdx];
      const titles = [
        "AuraMusic India", "HoloStudy AR", "CycleNet Pune", "MealShare Mumbai", "BharatCode Manager"
      ];
      const categories = [
        "Entertainment", "EdTech / AR", "Campus Utilities", "Social Impact", "Developer Tools"
      ];
      const descriptions = [
        "A real-time music collaborative workspace allowing Indian student artists to exchange audio stems, write lyrics synchronously, and schedule online jam sessions.",
        "An AR mobile application creating interactive 3D anatomy flashcards for biology and pre-med students on campus.",
        "A peer-to-peer bike-sharing coordinate tool helping university campuses coordinate bicycle access, locks, and geolocation tracking.",
        "A redistribution platform linking dining halls and local grocery stores with student food pantries, minimizing food waste.",
        "An all-in-one organizer tool for student hackers to check in, browse challenges, find team members, and upload project submissions."
      ];

      return {
        ownerId: creator.id,
        title: titles[i],
        description: descriptions[i],
        category: categories[i],
        timeline: "2 Months",
        status: "RECRUITING",
        githubUrl: `https://github.com/${creator.profile.username}/${titles[i].toLowerCase().replace(/[^a-z]/g, "")}`,
        demoUrl: null,
        bannerUrl: null,
        roles: ["Frontend Dev", "Backend Dev", "UI Designer"],
        milestones: [
          { title: "Initialize Repo", description: "Set up basic packages and repository structures", isCompleted: true },
          { title: "Deploy Mockups", description: "Design core interaction models", isCompleted: false }
        ],
        resources: []
      };
    })
  ];

  console.log("Writing projects and related relationships...");
  for (const projData of projectsData) {
    const project = await prisma.project.create({
      data: {
        ownerId: projData.ownerId,
        title: projData.title,
        description: projData.description,
        category: projData.category,
        timeline: projData.timeline,
        status: projData.status,
        githubUrl: projData.githubUrl,
        demoUrl: projData.demoUrl,
        bannerUrl: projData.bannerUrl,
        members: {
          create: [
            {
              userId: projData.ownerId,
              role: "LEAD"
            }
          ]
        },
        milestones: {
          create: projData.milestones.map((m) => ({
            title: m.title,
            description: m.description,
            isCompleted: m.isCompleted
          }))
        },
        resources: {
          create: projData.resources.map((r) => ({
            title: r.title,
            url: r.url,
            type: r.type
          }))
        }
      }
    });

    if (project.title === "EcoTrack Bharat") {
      await prisma.projectMember.create({
        data: { projectId: project.id, userId: sarahUser.id, role: "BACKEND" }
      });
      await prisma.projectMember.create({
        data: { projectId: project.id, userId: marcusUser.id, role: "DESIGNER" }
      });

      await prisma.projectApplication.create({
        data: {
          projectId: project.id,
          userId: emilyUser.id,
          roleApplied: "Frontend Developer",
          message: "Would love to write the UI components for EcoTrack! I have extensive React and Tailwind experience.",
          status: "PENDING"
        }
      });
      await prisma.projectApplication.create({
        data: {
          projectId: project.id,
          userId: createdUsers[7].id,
          roleApplied: "Back-end Engineer",
          message: "Experienced in Node.js and Postgres databases. I can optimize query layouts.",
          status: "REJECTED"
        }
      });

      await prisma.task.createMany({
        data: [
          { projectId: project.id, assigneeId: alexUser.id, title: "Draft Landing Page Layout", description: "Design responsive Tailwind layout grid for dashboard main landing screen", status: "IN_PROGRESS", priority: "HIGH" },
          { projectId: project.id, assigneeId: sarahUser.id, title: "Write User Analytics Route", description: "Create Prisma queries to group carbon savings over time and export as JSON", status: "TODO", priority: "MEDIUM" },
          { projectId: project.id, assigneeId: marcusUser.id, title: "Review accessibility contrast", description: "Check cobalt primary and deepslate contrast across all text elements to verify compliance", status: "REVIEW", priority: "HIGH" },
          { projectId: project.id, assigneeId: alexUser.id, title: "Setup Tailwind custom theme", description: "Inject design system values from Avenza UI specifications", status: "DONE", priority: "LOW" }
        ]
      });

      await prisma.activityEvent.createMany({
        data: [
          { projectId: project.id, actorId: alexUser.id, actionType: "MEMBER_JOIN", details: "Aarav Mehta initialized the workspace." },
          { projectId: project.id, actorId: marcusUser.id, actionType: "MEMBER_JOIN", details: "Rohan Joshi was added as Designer." },
          { projectId: project.id, actorId: alexUser.id, actionType: "TASK_COMPLETE", details: "Aarav Mehta completed task: Setup Tailwind custom theme." },
          { projectId: project.id, actorId: marcusUser.id, actionType: "TASK_CREATE", details: "Rohan Joshi created task: Review accessibility contrast." }
        ]
      });
    }

    if (project.title === "CampusSync Pilani") {
      await prisma.projectMember.create({
        data: { projectId: project.id, userId: davidUser.id, role: "BACKEND" }
      });
    }
  }
  console.log("Projects seeded.");

  // 4. Seed mentorship sessions
  console.log("Seeding sessions...");
  await prisma.mentorshipSession.createMany({
    data: [
      {
        requesterId: alexUser.id,
        mentorId: sarahUser.id,
        topic: "Machine learning integration in frontend analytics",
        skillsExchanged: "Offers React tips, learns ML model APIs",
        status: "ACCEPTED",
        scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3) // 3 days in future
      },
      {
        requesterId: marcusUser.id,
        mentorId: davidUser.id,
        topic: "Optimizing SQLite read cycles for Design extensions",
        skillsExchanged: "Offers Figma audits, learns SQLite Indexing",
        status: "REQUESTED",
        scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5) // 5 days in future
      },
      {
        requesterId: emilyUser.id,
        mentorId: alexUser.id,
        topic: "Flutter web compilation vs native React",
        skillsExchanged: "Offers Flutter layout reviews, learns Next.js structure",
        status: "COMPLETED",
        scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days in past
      }
    ]
  });

  // 5. Seed Direct Messages (between Aarav & Shreya, Aarav & Rohan)
  console.log("Seeding messages...");
  await prisma.message.createMany({
    data: [
      { senderId: alexUser.id, receiverId: sarahUser.id, content: "Hey Shreya! Excited to team up on the carbon footprint app.", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4) },
      { senderId: sarahUser.id, receiverId: alexUser.id, content: "Same here Aarav. I've drafted some basic ML aggregation scripts for mess logs.", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3) },
      { senderId: alexUser.id, receiverId: sarahUser.id, content: "Awesome. I'll construct the Prisma models to match that structure. Talk soon!", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), isRead: true },
      { senderId: marcusUser.id, receiverId: alexUser.id, content: "Hi Aarav, can you take a look at the Figma layouts for the dashboard?", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1), isRead: false }
    ]
  });

  // 6. Seed Notifications
  console.log("Seeding notifications...");
  await prisma.notification.createMany({
    data: [
      { userId: alexUser.id, title: "Connection Request", content: "Devanshu Gupta sent you a connection request.", type: "CONNECTION", link: "/connections" },
      { userId: alexUser.id, title: "New Project Application", content: "Ananya Sharma applied to join EcoTrack Bharat.", type: "APPLICATION", link: "/projects" },
      { userId: alexUser.id, title: "New Message", content: "Rohan Joshi sent you a message: 'Hi Aarav, can you take...'", type: "MESSAGE", link: "/messages" },
      { userId: sarahUser.id, title: "Session Confirmed", content: "Aarav Mehta accepted your session request.", type: "SESSION", link: "/sessions" }
    ]
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
