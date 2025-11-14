import { PrismaClient, Role, ApplicationStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// --- Seed Data Definitions ---

const saltRounds = 10;
const defaultPassword = "Password123!"; // Base password for hashing

// User Data (Passwords will be hashed)
const userData = [
  {
    role: Role.ADMIN,
    email: "admin@test.com",
    username: "admin",
    password: "Admin123!", // Specific password
    fullName: "System Administrator",
  },
  {
    role: Role.RECRUITER,
    email: "recruiter@test.com",
    username: "recruiter",
    password: "Recruiter123!", // Specific password
    fullName: "Jane Smith",
    companyName: "Tech Corp",
    companyInfo:
      "Leading global technology company specializing in AI and cloud solutions.",
    phone: "555-0100",
  },
  {
    role: Role.CANDIDATE,
    email: "candidate@test.com",
    username: "candidate",
    password: "Candidate123!", // Specific password
    fullName: "John Doe",
    phone: "555-0101",
    resume: "https://example.com/john_doe_resume.pdf",
    skills: "JavaScript,React,Node.js,TypeScript,MongoDB,AWS",
    experience:
      "3 years of full-stack development. Extensive experience in modern web technologies and agile methodologies.",
    education: "BS Computer Science, University of Example",
  },
];

// --- Main Seeding Function ---

async function main() {
  console.log("🚀 Starting database seeding...");

  // 1. Idempotency: Delete existing data (order matters due to foreign keys)
  console.log("🧹 Deleting existing data...");
  try {
    await prisma.$transaction([
      prisma.application.deleteMany(),
      prisma.jobPosting.deleteMany(),
      prisma.user.deleteMany(),
    ]);
    console.log("✅ Existing data deleted successfully.");
  } catch (error) {
    console.error("❌ Error during data deletion:", error);
    process.exit(1);
  }

  // 2. Create Users
  console.log(`👤 Creating ${userData.length} users...`);
  const createdUsers = {};
  for (const user of userData) {
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    const createdUser = await prisma.user.create({
      data: {
        ...user,
        password: hashedPassword,
      },
    });
    createdUsers[user.role.toLowerCase()] = createdUser;
    console.log(`  -> Created ${user.role} user: ${createdUser.username}`);
  }

  const recruiterId = createdUsers.recruiter.id;
  const candidateId = createdUsers.candidate.id;

  // 3. Create Job Postings
  // 3. Create Job Postings
  console.log("📝 Creating 5 job postings...");
  const jobPostingsData = [
    {
      title: "Senior Full-Stack Developer",
      description:
        "Design, develop, and maintain large-scale web applications using the MERN stack.",
      requirements:
        "5+ years experience, expert in React and Node.js, proficiency in cloud services (AWS/Azure).",
      salary: "$120,000 - $150,000",
      location: "San Francisco, CA",
      industry: "Technology",
      jobType: "Full-time",
      recruiterId, 
    },
    {
      title: "Financial Analyst",
      description:
        "Analyze financial data, prepare reports, and provide strategic recommendations to management.",
      requirements:
        "Bachelor's in Finance, CPA or CFA preferred, 3+ years in corporate finance.",
      salary: "$80,000 - $100,000",
      location: "New York, NY",
      industry: "Finance",
      jobType: "Full-time",
      recruiterId, 
    },
    {
      title: "Part-Time Registered Nurse",
      description:
        "Provide quality patient care in a clinic setting on a flexible, part-time schedule.",
      requirements:
        "Active RN license, 1 year of clinical experience, excellent communication skills.",
      salary: "$35 - $45 per hour",
      location: "Austin, TX",
      industry: "Healthcare",
      jobType: "Part-time",
      recruiterId, 
    },
    {
      title: "Contract UI/UX Designer",
      description:
        "Six-month contract role to design and prototype a new mobile application interface.",
      requirements:
        "Expertise in Figma/Sketch, strong portfolio, experience with design systems.",
      salary: "$60 - $75 per hour",
      location: "Remote",
      industry: "Technology",
      jobType: "Contract",
      recruiterId, 
    },
    {
      title: "Marketing Coordinator",
      description:
        "Support the marketing team with content creation, social media management, and campaign tracking.",
      requirements:
        "Bachelor's in Marketing or related field, experience with marketing automation tools (HubSpot, Marketo).",
      salary: "$55,000 - $65,000",
      location: "Chicago, IL",
      industry: "Marketing",
      jobType: "Full-time",
      recruiterId, 
    },
  ];

  const createdJobs = [];
  for (const job of jobPostingsData) {
    const createdJob = await prisma.jobPosting.create({
      data: job,
    });
    createdJobs.push(createdJob);
    console.log(`  -> Created Job: ${createdJob.title}`);
  }

  // 4. Create Applications
  console.log("📤 Creating 3 applications...");

  const applicationsData = [
    {
      candidateId,
      jobPostingId: createdJobs[0].id, // Senior Full-Stack Developer
      status: ApplicationStatus.INTERVIEW,
      coverLetter:
        "I am highly experienced in the MERN stack and am eager to contribute my 3 years of full-stack expertise to your challenging projects. My skills directly align with your requirements.",
    },
    {
      candidateId,
      jobPostingId: createdJobs[2].id, // Part-Time Registered Nurse (Mismatch to showcase variety)
      status: ApplicationStatus.PENDING,
      coverLetter: null,
    },
    {
      candidateId,
      jobPostingId: createdJobs[4].id, // Marketing Coordinator
      status: ApplicationStatus.REVIEWED,
      coverLetter:
        "While my background is in development, I have a passion for marketing and excellent analytical skills which would be beneficial for the Coordinator role.",
    },
  ];

  for (const app of applicationsData) {
    const createdApp = await prisma.application.create({
      data: app,
    });
    console.log(
      `  -> Created Application (Job ID: ${createdApp.jobPostingId}, Status: ${createdApp.status})`
    );
  }

  console.log("🎉 Database seeding complete!");
}

// --- Execution and Error Handling ---

main()
  .catch((e) => {
    console.error("❌ An error occurred during the seeding process:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("🔒 Prisma Client disconnected.");
  });
