// Member 3 - Seed Script: Create the 5 default communities in MongoDB
// Run once: node scripts/seedCommunities.js
require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const Community = require("../models/Community");
const connectDB = require("../config/db");

const COMMUNITIES = [
  {
    name: "Graphic Design",
    description:
      "A community for student graphic designers — UI/UX, branding, illustration, motion graphics, and more.",
    icon: "🎨",
  },
  {
    name: "Full Stack Web Development",
    description:
      "For student full-stack developers building apps with React, Node.js, MongoDB, Django, and beyond.",
    icon: "💻",
  },
  {
    name: "Cyber Security",
    description:
      "A space for student cybersecurity enthusiasts — ethical hacking, penetration testing, CTFs, and security research.",
    icon: "🔒",
  },
  {
    name: "Data Science",
    description:
      "For student data scientists and analysts working with Python, ML, AI, data visualization, and analytics.",
    icon: "📊",
  },
  {
    name: "Business Analysis",
    description:
      "A community for student business analysts focused on requirements, process modeling, strategy, and consulting.",
    icon: "📈",
  },
];

const seed = async () => {
  await connectDB();

  for (const community of COMMUNITIES) {
    const exists = await Community.findOne({ name: community.name });
    if (!exists) {
      await Community.create(community);
      console.log(`Created community: ${community.icon} ${community.name}`);
    } else {
      console.log(`Already exists: ${community.name}`);
    }
  }

  console.log("\nCommunity seeding complete.");
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});
