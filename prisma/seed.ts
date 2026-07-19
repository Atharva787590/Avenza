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

  // 1. Seed Users and Profiles
  const studentData = [
    {
      email: "alex.chen@stanford.edu",
      username: "alexchen",
      fullName: "Alex Chen",
      college: "Stanford University",
      course: "Computer Science",
      gradYear: 2027,
      location: "Palo Alto, CA",
      bio: "Ambitious developer focusing on full-stack web platforms and interactive user interfaces. Love building products that solve real campus problems.",
      githubUrl: "https://github.com/alexchen",
      linkedinUrl: "https://linkedin.com/in/alexchen",
      portfolioUrl: "https://alexchen.dev",
      availability: "ACTIVE",
      collabPreferences: "Looking to join React/Next.js hackathon teams as frontend lead.",
      offers: [
        { name: "React", level: "EXPERT" },
        { name: "TypeScript", level: "EXPERT" },
        { name: "Tailwind CSS", level: "EXPERT" },
        { name: "Figma", level: "INTERMEDIATE" }
      ],
      learns: [
        { name: "PostgreSQL", level: "BEGINNER" },
        { name: "Next.js Server Actions", level: "INTERMEDIATE" },
        { name: "Node.js", level: "INTERMEDIATE" }
      ],
      interests: ["Hackathons", "EdTech", "Design Systems", "Web Performance"]
    },
    {
      email: "sarah.m@mit.edu",
      username: "sarahm",
      fullName: "Sarah Miller",
      college: "MIT",
      course: "Data Science & AI",
      gradYear: 2026,
      location: "Cambridge, MA",
      bio: "AI researcher turned builder. Interested in applying ML models to education, climate data, and personalized recommendations.",
      githubUrl: "https://github.com/sarahm",
      linkedinUrl: "https://linkedin.com/in/sarahm",
      portfolioUrl: "https://sarahm.ai",
      availability: "ACTIVE",
      collabPreferences: "Interested in helping teams integrate AI capabilities, embeddings, or complex analysis dashboards.",
      offers: [
        { name: "Python", level: "EXPERT" },
        { name: "Machine Learning", level: "EXPERT" },
        { name: "PyTorch", level: "EXPERT" },
        { name: "SQL", level: "INTERMEDIATE" }
      ],
      learns: [
        { name: "React", level: "BEGINNER" },
        { name: "FastAPI", level: "INTERMEDIATE" },
        { name: "Docker", level: "INTERMEDIATE" }
      ],
      interests: ["Climate Tech", "Generative AI", "Cognitive Science", "Algorithms"]
    },
    {
      email: "marcus.k@berkeley.edu",
      username: "marcusk",
      fullName: "Marcus Kaelen",
      college: "UC Berkeley",
      course: "Cognitive Science",
      gradYear: 2028,
      location: "Berkeley, CA",
      bio: "UX Designer and Researcher. Passionate about accessibility, inclusive design frameworks, and creating interfaces that feel intuitive and editorial.",
      githubUrl: "https://github.com/marcusdesign",
      linkedinUrl: "https://linkedin.com/in/marcusk",
      portfolioUrl: "https://marcus.design",
      availability: "WEEKENDS",
      collabPreferences: "Looking for back-end developers to partner on accessibility-oriented educational projects.",
      offers: [
        { name: "Figma", level: "EXPERT" },
        { name: "UI/UX Design", level: "EXPERT" },
        { name: "User Research", level: "EXPERT" },
        { name: "CSS Grid/Flexbox", level: "INTERMEDIATE" }
      ],
      learns: [
        { name: "Tailwind CSS", level: "INTERMEDIATE" },
        { name: "JavaScript", level: "BEGINNER" }
      ],
      interests: ["Accessibility", "Digital Ergonomics", "Product Strategy", "Art & Typography"]
    },
    {
      email: "emily.w@gatech.edu",
      username: "emilyw",
      fullName: "Emily Wong",
      college: "Georgia Tech",
      course: "Computer Science",
      gradYear: 2027,
      location: "Atlanta, GA",
      bio: "Mobile-first developer. Flutter enthusiast who loves compiling beautiful cross-platform applications and exploring micro-interactions.",
      githubUrl: "https://github.com/emilyw",
      linkedinUrl: "https://linkedin.com/in/emilyw",
      portfolioUrl: "https://emily.dev",
      availability: "ACTIVE",
      collabPreferences: "Open to team projects requiring cross-platform mobile apps.",
      offers: [
        { name: "Flutter", level: "EXPERT" },
        { name: "Dart", level: "EXPERT" },
        { name: "Firebase", level: "EXPERT" },
        { name: "React Native", level: "BEGINNER" }
      ],
      learns: [
        { name: "TypeScript", level: "INTERMEDIATE" },
        { name: "System Design", level: "BEGINNER" }
      ],
      interests: ["Mobile UX", "Cross-Platform Tools", "Campus Utility", "Interactive Widgets"]
    },
    {
      email: "david.kim@cmu.edu",
      username: "davidkim",
      fullName: "David Kim",
      college: "Carnegie Mellon University",
      course: "Software Engineering",
      gradYear: 2026,
      location: "Pittsburgh, PA",
      bio: "Back-end architect. Love optimizing SQL query plans, designing robust database schemas, and writing secure REST & GraphQL endpoints.",
      githubUrl: "https://github.com/davidkim-backend",
      linkedinUrl: "https://linkedin.com/in/davidkim-backend",
      portfolioUrl: "https://davidkim.io",
      availability: "BUSY",
      collabPreferences: "Happy to advise on database schema design, indexing, or API structures for student projects.",
      offers: [
        { name: "PostgreSQL", level: "EXPERT" },
        { name: "Node.js", level: "EXPERT" },
        { name: "Prisma ORM", level: "EXPERT" },
        { name: "Express", level: "EXPERT" }
      ],
      learns: [
        { name: "Docker", level: "INTERMEDIATE" },
        { name: "Redis", level: "INTERMEDIATE" },
        { name: "Go", level: "BEGINNER" }
      ],
      interests: ["Databases", "Distributed Systems", "Performance Tuning", "Caching Techniques"]
    },
    // Add 20 more users to hit the 25+ profile requirement
    ...Array.from({ length: 21 }).map((_, i) => {
      const names = [
        "Aisha Rahman", "Liam O'Connor", "Sofia Rodriguez", "Ethan Jackson",
        "Chloe Patel", "Noah Zhang", "Isabella Rossi", "Lucas Silva",
        "Olivia Dubois", "Mason Tanaka", "Ava Nkosi", "Logan Wright",
        "Mia Hernandez", "Benjamin Carter", "Charlotte Kim", "Daniel Miller",
        "Amara Okafor", "James Taylor", "Grace Van Der Berg", "Oliver Hansen", "Zoe Jenkins"
      ];
      const colleges = [
        "Stanford University", "MIT", "UC Berkeley", "Georgia Tech",
        "Carnegie Mellon University", "University of Michigan", "UT Austin",
        "Cornell University", "University of Washington", "NYU"
      ];
      const courses = [
        "Computer Science", "Data Science & AI", "Cognitive Science",
        "Software Engineering", "Electrical Engineering", "Interactive Media Design",
        "Business Analytics", "Climate Engineering", "Product Management"
      ];
      const cities = [
        "Palo Alto, CA", "Cambridge, MA", "Berkeley, CA", "Atlanta, GA",
        "Pittsburgh, PA", "Ann Arbor, MI", "Austin, TX", "Ithaca, NY",
        "Seattle, WA", "New York, NY"
      ];
      const skillsPool = [
        "React", "TypeScript", "Tailwind CSS", "Figma", "Python",
        "Machine Learning", "PyTorch", "SQL", "PostgreSQL", "Node.js",
        "Prisma ORM", "Flutter", "Dart", "Firebase", "Go", "Docker", "Svelte",
        "Vue.js", "C++", "Java", "Docker", "GraphQL", "Tailwind"
      ];

      const name = names[i % names.length];
      const username = name.toLowerCase().replace(/[^a-z]/g, "");
      const college = colleges[i % colleges.length];
      const course = courses[i % courses.length];
      const location = cities[i % cities.length];
      const gradYear = 2026 + (i % 3);

      return {
        email: `${username}@${college.toLowerCase().split(" ")[0].replace(/[^a-z]/g, "")}.edu`,
        username,
        fullName: name,
        college,
        course,
        gradYear,
        location,
        bio: `Hi, I'm ${name}! I study ${course} at ${college}. I'm passionate about technology, collaboration, and building awesome student projects.`,
        githubUrl: `https://github.com/${username}`,
        linkedinUrl: `https://linkedin.com/in/${username}`,
        portfolioUrl: `https://${username}.me`,
        availability: i % 3 === 0 ? "ACTIVE" : i % 3 === 1 ? "WEEKENDS" : "BUSY",
        collabPreferences: "Looking to collaborate with motivated peers on campus products.",
        offers: [
          { name: skillsPool[i % skillsPool.length], level: "EXPERT" },
          { name: skillsPool[(i + 1) % skillsPool.length], level: "INTERMEDIATE" }
        ],
        learns: [
          { name: skillsPool[(i + 3) % skillsPool.length], level: "BEGINNER" },
          { name: skillsPool[(i + 4) % skillsPool.length], level: "INTERMEDIATE" }
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
    // Add one admin role for testing
    let role = "STUDENT";
    if (item.username === "alexchen") {
      role = "ADMIN";
    } else if (item.username === "sarahm") {
      role = "MODERATOR";
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
            college: item.college,
            course: item.course,
            gradYear: item.gradYear,
            location: item.location,
            bio: item.bio,
            githubUrl: item.githubUrl,
            linkedinUrl: item.linkedinUrl,
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

  // Helper arrays
  const alexUser = createdUsers.find((u) => u.profile.username === "alexchen")!;
  const sarahUser = createdUsers.find((u) => u.profile.username === "sarahm")!;
  const marcusUser = createdUsers.find((u) => u.profile.username === "marcusk")!;
  const emilyUser = createdUsers.find((u) => u.profile.username === "emilyw")!;
  const davidUser = createdUsers.find((u) => u.profile.username === "davidkim")!;

  // 2. Create connections
  console.log("Seeding connections...");
  await prisma.connection.createMany({
    data: [
      { senderId: alexUser.id, receiverId: sarahUser.id, status: "ACCEPTED" },
      { senderId: alexUser.id, receiverId: marcusUser.id, status: "ACCEPTED" },
      { senderId: alexUser.id, receiverId: emilyUser.id, status: "PENDING", message: "Hey Emily, let's team up for the HackMIT next weekend!" },
      { senderId: davidUser.id, receiverId: alexUser.id, status: "ACCEPTED" },
      { senderId: sarahUser.id, receiverId: marcusUser.id, status: "ACCEPTED" },
      { senderId: emilyUser.id, receiverId: davidUser.id, status: "PENDING", message: "Hi David, I saw your database optimization post. Let's exchange skills!" },
      { senderId: createdUsers[5].id, receiverId: alexUser.id, status: "PENDING", message: "Would love to connect and talk React component rendering optimizations." }
    ]
  });

  // 3. Create Projects (10 projects)
  console.log("Seeding projects...");
  const projectsData = [
    {
      ownerId: alexUser.id,
      title: "EcoTrack",
      description: "A web application that allows students to track and reduce their carbon footprint by monitoring daily campus transport, meals, and recycling habits. Offers clean data visualization dashboards, campus competitions, and sharing utilities.",
      category: "Climate Tech",
      timeline: "3 Months (Fall Hackathon Series)",
      status: "RECRUITING",
      githubUrl: "https://github.com/alexchen/ecotrack",
      demoUrl: "https://ecotrack.vercel.app",
      bannerUrl: "/banners/ecotrack.jpg",
      roles: ["Frontend Developer", "Back-end Engineer", "UX/UI Designer"],
      milestones: [
        { title: "Dashboard Mockups", description: "Design Figma mockups for core statistics charts", isCompleted: true },
        { title: "Database Architecture", description: "Define SQL schemas for tracking events and users", isCompleted: true },
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
      title: "CampusSync",
      description: "A native Flutter-based mobile application resolving campus event clutter. Aggregates official club events, informal student meetups, study sessions, and hackathons into a highly visual, geographical-based calendar dashboard.",
      category: "Campus Life",
      timeline: "2 Months",
      status: "ACTIVE",
      githubUrl: "https://github.com/emilyw/campussynd",
      demoUrl: null,
      bannerUrl: null,
      roles: ["Flutter Developer", "Marketing Lead", "Firebase Engineer"],
      milestones: [
        { title: "Map Integration", description: "Integrate Mapbox/Google Maps API into mobile view", isCompleted: true },
        { title: "Firebase Authentication", description: "Implement university email OAuth sign-in flow", isCompleted: true },
        { title: "Beta Test Release", description: "Distribute TestFlight and APK to 50 active campus testers", isCompleted: false }
      ],
      resources: [
        { title: "Flutter Project Repository", url: "https://github.com/emilyw/campussynd", type: "REPO" }
      ]
    },
    {
      ownerId: marcusUser.id,
      title: "AccessClass",
      description: "An accessibility-centric extension that generates high-fidelity transcripts, synchronized summaries, and interactive definitions for video lectures. Engineered using custom whisper models optimized for technical speech.",
      category: "Accessibility",
      timeline: "4 Months",
      status: "RECRUITING",
      githubUrl: "https://github.com/marcusdesign/accessclass",
      demoUrl: "https://accessclass.org",
      bannerUrl: null,
      roles: ["Python ML Engineer", "Browser Extension Architect", "Accessibility Consultant"],
      milestones: [
        { title: "Whisper Pipeline Setup", description: "Deploy Whisper model on server and verify latency", isCompleted: false },
        { title: "Extension Styling", description: "Design screen overlay layouts for accessibility standard WCAG AAA", isCompleted: false }
      ],
      resources: [
        { title: "WCAG AAA Checklist Guide", url: "https://w3.org/WAI/standards-guidelines/wcag/", type: "LINK" }
      ]
    },
    {
      ownerId: sarahUser.id,
      title: "PeerMentors",
      description: "An automated pairing portal helping freshmen discover upperclassmen mentors. Utilizes Gale-Shapley matching algorithm customized for academic paths, skill targets, and shared campus interests.",
      category: "Education",
      timeline: "3 Months",
      status: "ACTIVE",
      githubUrl: "https://github.com/sarahm/peermentors",
      demoUrl: "https://peermentors.mit.edu",
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
      title: "TaskFlow Core",
      description: "A developer-first, localized Kanban and collaboration tool utilizing WebSockets to synchronize task updates instantly without heavy cloud DB round-trips. Great for hackathons and local sandbox testing.",
      category: "Web Development",
      timeline: "1 Month",
      status: "COMPLETED",
      githubUrl: "https://github.com/davidkim-backend/taskflow-core",
      demoUrl: "https://taskflow.io",
      bannerUrl: null,
      roles: [],
      milestones: [
        { title: "WebSocket Sync Implementation", description: "Establish Socket.io connection state syncing", isCompleted: true },
        { title: "Local Database Fallback", description: "Integrate SQLite local caching when connection fails", isCompleted: true }
      ],
      resources: []
    },
    // Adding 5 more projects to hit the 10 project requirement
    ...Array.from({ length: 5 }).map((_, i) => {
      const creatorIdx = (i + 5) % createdUsers.length;
      const creator = createdUsers[creatorIdx];
      const titles = [
        "AuraMusic", "HoloStudy", "CycleNet", "MealShare", "ByteCode Hackathon Manager"
      ];
      const categories = [
        "Entertainment", "EdTech / AR", "Campus Utilities", "Social Impact", "Developer Tools"
      ];
      const descriptions = [
        "A real-time music collaborative workspace allowing student artists to exchange audio stems, write lyrics synchronously, and schedule online jam sessions.",
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

    // Seed some other members for the project
    if (project.title === "EcoTrack") {
      // Add Sarah and David
      await prisma.projectMember.create({
        data: { projectId: project.id, userId: sarahUser.id, role: "BACKEND" }
      });
      await prisma.projectMember.create({
        data: { projectId: project.id, userId: marcusUser.id, role: "DESIGNER" }
      });

      // Add project applications
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

      // Seed Tasks for EcoTrack workspace
      await prisma.task.createMany({
        data: [
          { projectId: project.id, assigneeId: alexUser.id, title: "Draft Landing Page Layout", description: "Design responsive Tailwind layout grid for dashboard main landing screen", status: "IN_PROGRESS", priority: "HIGH" },
          { projectId: project.id, assigneeId: sarahUser.id, title: "Write User Analytics Route", description: "Create Prisma queries to group carbon savings over time and export as JSON", status: "TODO", priority: "MEDIUM" },
          { projectId: project.id, assigneeId: marcusUser.id, title: "Review WCAG contrast ratios", description: "Check cobalt primary and deepslate contrast across all text elements to verify compliance", status: "REVIEW", priority: "HIGH" },
          { projectId: project.id, assigneeId: alexUser.id, title: "Setup Tailwind custom theme", description: "Inject design system values from Avenza UI specifications", status: "DONE", priority: "LOW" }
        ]
      });

      // Seed Activity Events
      await prisma.activityEvent.createMany({
        data: [
          { projectId: project.id, actorId: alexUser.id, actionType: "MEMBER_JOIN", details: "Alex Chen initialized the workspace." },
          { projectId: project.id, actorId: marcusUser.id, actionType: "MEMBER_JOIN", details: "Marcus Kaelen was added as Designer." },
          { projectId: project.id, actorId: alexUser.id, actionType: "TASK_COMPLETE", details: "Alex Chen completed task: Setup Tailwind custom theme." },
          { projectId: project.id, actorId: marcusUser.id, actionType: "TASK_CREATE", details: "Marcus Kaelen created task: Review WCAG contrast ratios." }
        ]
      });
    }

    if (project.title === "CampusSync") {
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

  // 5. Seed Direct Messages (between Alex & Sarah, Alex & Marcus)
  console.log("Seeding messages...");
  await prisma.message.createMany({
    data: [
      { senderId: alexUser.id, receiverId: sarahUser.id, content: "Hey Sarah! Excited to team up on the carbon footprint app.", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4) },
      { senderId: sarahUser.id, receiverId: alexUser.id, content: "Same here Alex. I've drafted some basic ML aggregation scripts for transport logs.", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3) },
      { senderId: alexUser.id, receiverId: sarahUser.id, content: "Awesome. I'll construct the Prisma models to match that structure. Talk soon!", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), isRead: true },
      { senderId: marcusUser.id, receiverId: alexUser.id, content: "Hi Alex, can you take a look at the Figma layouts for the dashboard?", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1), isRead: false }
    ]
  });

  // 6. Seed Notifications
  console.log("Seeding notifications...");
  await prisma.notification.createMany({
    data: [
      { userId: alexUser.id, title: "Connection Request", content: "Liam O'Connor sent you a connection request.", type: "CONNECTION", link: "/connections" },
      { userId: alexUser.id, title: "New Project Application", content: "Emily Wong applied to join EcoTrack.", type: "APPLICATION", link: "/projects" },
      { userId: alexUser.id, title: "New Message", content: "Marcus Kaelen sent you a message: 'Hi Alex, can you take...'", type: "MESSAGE", link: "/messages" },
      { userId: sarahUser.id, title: "Session Confirmed", content: "Alex Chen accepted your session request.", type: "SESSION", link: "/sessions" }
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
