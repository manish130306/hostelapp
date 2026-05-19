import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-in-production";
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD || "admin123", 10);
const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, "..", "dist");

app.use(cors());
app.use(express.json({ limit: "8mb" }));

const hostelSeed = [
  { code: "BH", name: "Boys Hostel", category: "Student Hostel", gender: "Male", roomCount: 93, capacityPerRoom: 3, roomPrefix: "BH", plan: "student" },
  { code: "GH", name: "Girls Hostel", category: "Student Hostel", gender: "Female", roomCount: 93, capacityPerRoom: 3, roomPrefix: "GH", plan: "student" },
  { code: "RRM", name: "Resident Quarters Male (RRM)", category: "Resident Quarters Male", gender: "Male", roomCount: 40, capacityPerRoom: 3, roomPrefix: "RRM", plan: "resident" },
  { code: "RRF", name: "Resident Quarters Female (RRF)", category: "Resident Quarters Female", gender: "Female", roomCount: 40, capacityPerRoom: 3, roomPrefix: "RRF", plan: "resident" }
];

const floorPlans = {
  student: [
    ["First Floor", 1, 17],
    ["Second Floor", 18, 36],
    ["Third Floor", 37, 55],
    ["Fourth Floor", 56, 74],
    ["Fifth Floor", 75, 93]
  ],
  resident: [
    ["First Floor", 1, 16],
    ["Second Floor", 17, 32],
    ["Third Floor", 33, 40]
  ]
};

function floorFor(hostel, roomNumber) {
  const plan = floorPlans[hostel.plan] || floorPlans.student;
  return plan.find(([, start, end]) => roomNumber >= start && roomNumber <= end)?.[0] || "Floor";
}

function makeRooms(hostels = hostelSeed) {
  return hostels.flatMap((hostel) => Array.from({ length: hostel.roomCount }, (_, index) => {
    const serial = String(index + 1).padStart(3, "0");
    return {
      id: `${hostel.code}-${serial}`,
      hostelCode: hostel.code,
      hostelName: hostel.name,
      category: hostel.category,
      gender: hostel.gender,
      floor: floorFor(hostel, index + 1),
      roomNumber: `${hostel.roomPrefix}-${index + 1}`,
      capacity: hostel.capacityPerRoom
    };
  }));
}

const sampleStudents = [
  { id: "NM001", rollNumber: "NM001", name: "John Mathew", courseYear: "1st Year MBBS", gender: "Male", hostelName: "Boys Hostel", roomNumber: "BH-1", joiningDate: "2026-01-10", contact: "9876543210", parentName: "Mathew J", parentContact: "9876500001", status: "active" },
  { id: "NM002", rollNumber: "NM002", name: "Priya S", courseYear: "2nd Year MBBS", gender: "Female", hostelName: "Girls Hostel", roomNumber: "GH-1", joiningDate: "2026-01-12", contact: "9876543211", parentName: "Sundar S", parentContact: "9876500002", status: "active" },
  { id: "NM003", rollNumber: "NM003", name: "Rahul K", courseYear: "Resident", gender: "Male", hostelName: "Resident Quarters Male (RRM)", roomNumber: "RRM-1", joiningDate: "2026-02-05", contact: "9876543212", parentName: "Kannan R", parentContact: "9876500003", status: "active" },
  { id: "NM004", rollNumber: "NM004", name: "Asha Devi", courseYear: "Final Year MBBS", gender: "Female", hostelName: "Girls Hostel", roomNumber: "GH-1", joiningDate: "2025-08-18", contact: "9876543213", parentName: "Devi M", parentContact: "9876500004", status: "active" },
  { id: "NM005", rollNumber: "NM005", name: "Vikram R", courseYear: "Resident", gender: "Male", hostelName: "Resident Quarters Male (RRM)", roomNumber: "RRM-1", joiningDate: "2025-11-20", contact: "9876543214", parentName: "Ramesh V", parentContact: "9876500005", status: "active" },
  { id: "NM006", rollNumber: "NM006", name: "Meena P", courseYear: "3rd Year MBBS", gender: "Female", hostelName: "Girls Hostel", roomNumber: "GH-2", joiningDate: "2025-07-04", contact: "9876543215", parentName: "Pandian P", parentContact: "9876500006", status: "vacated", vacatingDate: "2026-04-20", vacatingReason: "Clinical posting transfer" }
];

const hostelsSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  name: String,
  category: String,
  gender: String,
  roomCount: Number,
  capacityPerRoom: Number,
  roomPrefix: String,
  plan: String
}, { timestamps: true });

const roomSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  hostelCode: String,
  hostelName: String,
  category: String,
  gender: String,
  floor: String,
  roomNumber: { type: String, unique: true },
  capacity: Number
}, { timestamps: true });

const studentSchema = new mongoose.Schema({
  rollNumber: { type: String, unique: true },
  name: String,
  courseYear: String,
  gender: String,
  hostelName: String,
  roomNumber: String,
  joiningDate: String,
  contact: String,
  parentName: String,
  parentContact: String,
  photo: String,
  verificationId: String,
  status: { type: String, enum: ["active", "vacated"], default: "active" },
  vacatingDate: String,
  vacatingReason: String
}, { timestamps: true });

const historySchema = new mongoose.Schema({
  rollNumber: String,
  studentName: String,
  roomNumber: String,
  hostelName: String,
  type: { type: String, enum: ["admission", "vacation"] },
  date: String,
  reason: String
}, { timestamps: true });

const adminSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, default: "admin" }
}, { timestamps: true });

const auditSchema = new mongoose.Schema({
  action: String,
  actor: String,
  time: String,
  metadata: Object
}, { timestamps: true });

const quartersResidentSchema = new mongoose.Schema({
  quartersNo: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  designation: String,
  department: String,
  phoneNo: { type: String, maxlength: 10 },
  ifhrmsNo: String,
  refNoAndDate: String,
  occupyDate: String,
  ebNo: { type: String, unique: true },
  quartersType: { type: String, enum: ['A', 'C', 'D'], required: true }
}, { timestamps: true });

const quartersSpecialDetailsSchema = new mongoose.Schema({
  quartersNo: { type: String, unique: true },
  specialNotes: String,
  maintenanceIssues: String,
  familyMembersCount: Number,
  vehicleNumber: String,
  aadhaarNumber: String,
  emergencyContactName: String,
  emergencyContactPhone: String,
  residentStatus: { type: String, enum: ['Active', 'Vacated', 'Transferred', 'On Leave'], default: 'Active' }
}, { timestamps: true });

const Models = {
  Hostel: mongoose.model("Hostel", hostelsSchema),
  Room: mongoose.model("Room", roomSchema),
  Student: mongoose.model("Student", studentSchema),
  History: mongoose.model("AdmissionVacation", historySchema),
  AdminUser: mongoose.model("AdminUser", adminSchema),
  AuditLog: mongoose.model("AuditLog", auditSchema),
  QuartersResident: mongoose.model("QuartersResident", quartersResidentSchema),
  QuartersSpecialDetail: mongoose.model("QuartersSpecialDetail", quartersSpecialDetailsSchema)
};

const memory = {
  hostels: hostelSeed,
  rooms: makeRooms(hostelSeed),
  students: sampleStudents,
  history: [
    ...sampleStudents.filter((student) => student.status === "active").map((student) => ({ id: `${student.rollNumber}-admission`, type: "admission", rollNumber: student.rollNumber, studentName: student.name, roomNumber: student.roomNumber, hostelName: student.hostelName, date: student.joiningDate })),
    { id: "NM006-vacation", type: "vacation", rollNumber: "NM006", studentName: "Meena P", roomNumber: "GH-2", hostelName: "Girls Hostel", date: "2026-04-20", reason: "Clinical posting transfer" }
  ],
  quartersResidents: [],
  quartersSpecialDetails: [],
  auditLogs: [{ id: 1, action: "System seeded with separated hostel and quarters infrastructure", actor: "System", time: new Date().toISOString() }]
};

let mongoReady = false;

async function connectMongo() {
  if (!process.env.MONGODB_URI) return;
  await mongoose.connect(process.env.MONGODB_URI);
  mongoReady = true;
  await seedMongo();
}

async function seedMongo() {
  const hostelsCount = await Models.Hostel.countDocuments();
  if (hostelsCount !== hostelSeed.length) {
    await Models.Hostel.deleteMany({});
    await Models.Hostel.insertMany(hostelSeed);
  }
  const roomsCount = await Models.Room.countDocuments();
  if (roomsCount !== makeRooms(hostelSeed).length) {
    await Models.Room.deleteMany({});
    await Models.Room.insertMany(makeRooms(hostelSeed));
  }
  const studentCount = await Models.Student.countDocuments();
  if (!studentCount) await Models.Student.insertMany(sampleStudents.map((student) => ({ ...student, verificationId: verifyPayload(student) })));
  const adminCount = await Models.AdminUser.countDocuments();
  if (!adminCount) await Models.AdminUser.create({ username: ADMIN_USER, passwordHash: ADMIN_PASSWORD_HASH, role: "admin" });

  // Initialize quarters data with exact values from the SQL
  const quartersCount = await Models.QuartersResident.countDocuments();
  if (quartersCount === 0) {
    // Insert the exact data from the SQL file
    await Models.QuartersResident.insertMany([
      // C Type Quarters (C1 to C18)
      { quartersNo: "C1", name: "Dr.V. Balaji", designation: "Doctor", department: "Medicine", quartersType: "C" },
      { quartersNo: "C2", name: "Dr.V. Slimbarasan", designation: "Doctor", department: "Medicine", quartersType: "C" },
      { quartersNo: "C3", name: "Dr.S.K. Jayaswarya", designation: "Doctor", department: "Medicine", quartersType: "C" },
      { quartersNo: "C4", name: "Dr.A. Marudhavanan", designation: "Doctor", department: "Medicine", quartersType: "C" },
      { quartersNo: "C5", name: "Dr.S. Balasubramanian", designation: "Doctor", department: "Medicine", quartersType: "C" },
      { quartersNo: "C6", name: "Dr.T. Karthikeyan", designation: "Doctor", department: "Medicine", quartersType: "C" },
      { quartersNo: "C7", name: "Dr.A.Mary Arul priya", designation: "Doctor", department: "Medicine", quartersType: "C" },
      { quartersNo: "C8", name: "Dr.A.Daivik", designation: "Doctor", department: "Medicine", quartersType: "C" },
      { quartersNo: "C9", name: "Dr.P.Gomathi", designation: "Doctor", department: "Medicine", quartersType: "C" },
      { quartersNo: "C10", name: "Dr.M.Srimuthalage", designation: "Doctor", department: "Medicine", quartersType: "C" },
      { quartersNo: "C11", name: "Dr.K.Shankar", designation: "Doctor", department: "Medicine", quartersType: "C" },
      { quartersNo: "C12", name: "Dr.S.Jeyakumar", designation: "Doctor", department: "Medicine", quartersType: "C" },
      { quartersNo: "C13", name: "Dr.P. Tamilarsi", designation: "Doctor", department: "Medicine", quartersType: "C" },
      { quartersNo: "C14", name: "Dr.M. Sathish", designation: "Doctor", department: "Medicine", quartersType: "C" },
      { quartersNo: "C15", name: "Dr.L.Mohanapriya", designation: "Doctor", department: "Medicine", quartersType: "C" },
      { quartersNo: "C16", name: "Dr.S. Mukilan", designation: "Doctor", department: "Medicine", quartersType: "C" },
      { quartersNo: "C17", name: "Dr.S. Vigneshwari", designation: "Doctor", department: "Medicine", quartersType: "C" },
      { quartersNo: "C18", name: "Dr.A.Gayatri", designation: "Doctor", department: "Medicine", quartersType: "C" },

      // A Type Quarters (A1 to A36) - With exact data from SQL
      { quartersNo: "A1", name: "P.R.ARVIND", designation: "Junior Assistant", department: "College", phoneNo: "8056123012", ifhrmsNo: "19031159364", refNoAndDate: "012/P&D/2022 &14.02.2022", occupyDate: "2022-02-15", ebNo: "203-006-919", quartersType: "A" },
      { quartersNo: "A2", name: "M.DEEPA", designation: "Assitant", department: "College", phoneNo: "9629133444", ifhrmsNo: "19030866491", refNoAndDate: "012/P&D/2022 &31.01.2022", occupyDate: null, ebNo: "203-006-920", quartersType: "A" },
      { quartersNo: "A3", name: "B.MENAKA", designation: "Assitant", department: "College", phoneNo: "8675572755", ifhrmsNo: "19030537473", refNoAndDate: "012/P&D/2022 &01.02.2022", occupyDate: "2022-02-01", ebNo: "203-006-921", quartersType: "A" },
      { quartersNo: "A4", name: "S.SHANKAR", designation: "Junior Assistant", department: "Hospital", phoneNo: "9965148617", ifhrmsNo: null, refNoAndDate: "3980/P&D-3/2023 & 01.11.2023", occupyDate: "2023-12-01", ebNo: "203-006-922", quartersType: "A" },
      { quartersNo: "A5", name: "A.THIYARAJAN", designation: "Plaster Technician", department: "Hospital", phoneNo: "9487486642", ifhrmsNo: null, refNoAndDate: "2956/P&D/2023 &06.01.2025", occupyDate: null, ebNo: "203-006-923", quartersType: "A" },
      { quartersNo: "A6", name: "M.BALAMURGAN", designation: "Magnetic Resonance Tomography", department: "Hospital", phoneNo: "8428324363", ifhrmsNo: null, refNoAndDate: "1402/P&D4/2023 & 28.04.2023", occupyDate: "2023-05-01", ebNo: "203-006-924", quartersType: "A" },
      { quartersNo: "A7", name: "M.KUMAR", designation: "Dark Room Assistant", department: "Hospital", phoneNo: "9976463732", ifhrmsNo: null, refNoAndDate: "2126/P&D-5/2023 & 04.12.2023", occupyDate: "2023-12-04", ebNo: "203-006-925", quartersType: "A" },
      { quartersNo: "A8", name: "M.MUTHU KRISHAN", designation: "Junior Assistant", department: "Hospital", phoneNo: "6379114265", ifhrmsNo: null, refNoAndDate: "3508/P&D3/2025 &24.09.2025", occupyDate: "2025-09-24", ebNo: "203-006-926", quartersType: "A" },
      { quartersNo: "A9", name: "M.SETTU", designation: "Assitant", department: "College", phoneNo: "8110802547", ifhrmsNo: "19030928352", refNoAndDate: "012/P&D/2022 &17.01.2022", occupyDate: "2022-01-17", ebNo: "203-006-927", quartersType: "A" },
      { quartersNo: "A10", name: "M.MUTHAMIZH", designation: "Junior Assistant", department: "College", phoneNo: "9092939360", ifhrmsNo: "19031164787", refNoAndDate: "012/P&D/2022 &17.01.2022", occupyDate: "2022-01-17", ebNo: "203-006-928", quartersType: "A" },
      { quartersNo: "A11", name: "P.BOOBALAN", designation: "Hospital Worker", department: "Hospital", phoneNo: "9944860339", ifhrmsNo: null, refNoAndDate: "012/P&D/2022 &31.01.2022", occupyDate: "2022-02-01", ebNo: "203-006-929", quartersType: "A" },
      { quartersNo: "A12", name: "G.SURESH", designation: "Junior Assistant", department: "College", phoneNo: "9789663966", ifhrmsNo: "19031164700", refNoAndDate: "012/P&D/2022 &31.01.2022", occupyDate: null, ebNo: "203-006-930", quartersType: "A" },
      { quartersNo: "A13", name: "S.KALA", designation: "Junior Assistant", department: "College", phoneNo: "9486136535", ifhrmsNo: "19030503197", refNoAndDate: "13103/P&D/2022 &17.06.2022", occupyDate: "2022-06-14", ebNo: "203-006-931", quartersType: "A" },
      { quartersNo: "A14", name: "P.SAKUNTHALA", designation: "Junior Assistant", department: "College", phoneNo: "6374436290", ifhrmsNo: "19030503071", refNoAndDate: "13104/P&D/2022 &14.06.2022", occupyDate: "2022-06-14", ebNo: "203-006-932", quartersType: "A" },
      { quartersNo: "A15", name: "A.GEETHA", designation: "Steno Typist", department: "College", phoneNo: "8825471804", ifhrmsNo: "19030532255", refNoAndDate: "012/P&D/2022 &31.01.2022", occupyDate: "2022-02-01", ebNo: "203-006-933", quartersType: "A" },
      { quartersNo: "A16", name: "D.SATHIS KUMAR", designation: "Junior Assistant", department: "Hospital", phoneNo: "7530018833", ifhrmsNo: null, refNoAndDate: "012/P&D/2022 &31.01.2022", occupyDate: "2022-02-01", ebNo: "203-006-934", quartersType: "A" },
      { quartersNo: "A17", name: "R.A,LASKSHMI DEVI", designation: "Junior Assistant", department: "College", phoneNo: "9025791513", ifhrmsNo: "19031248269", refNoAndDate: "3685/P&D3/2025 &30.10.2025", occupyDate: "2025-11-01", ebNo: "203-006-935", quartersType: "A" },
      { quartersNo: "A18", name: "R.PALANIAMMAL", designation: "Record Clerk", department: "College", phoneNo: "9042479295", ifhrmsNo: "19030732300", refNoAndDate: "924/P&D/2/2023 & 16.03.2023", occupyDate: "2023-03-16", ebNo: "203-006-936", quartersType: "A" },
      { quartersNo: "A19", name: "S.SAMUNDESWARI", designation: "Junior Assistant", department: "College", phoneNo: "8675536090", ifhrmsNo: "19030506434", refNoAndDate: "1320/P&D/2022 &30.06.2022", occupyDate: "2022-07-01", ebNo: "203-006-937", quartersType: "A" },
      { quartersNo: "A20", name: "K.REVATHI", designation: "Record Clerk", department: "College", phoneNo: "9865250520", ifhrmsNo: "19031062703", refNoAndDate: "864/P&D2/2023 729.03.2023", occupyDate: "2023-04-01", ebNo: "203-006-938", quartersType: "A" },
      { quartersNo: "A21", name: "M.RADHAMANI", designation: "", department: "", phoneNo: "", ifhrmsNo: "", refNoAndDate: "", occupyDate: null, ebNo: "", quartersType: "A" },
      { quartersNo: "A22", name: "A.ARUNSHANKAR", designation: "", department: "", phoneNo: "", ifhrmsNo: "", refNoAndDate: "", occupyDate: null, ebNo: "", quartersType: "A" },
      { quartersNo: "A23", name: "P.ANANDHAN", designation: "", department: "", phoneNo: "", ifhrmsNo: "", refNoAndDate: "", occupyDate: null, ebNo: "", quartersType: "A" },
      { quartersNo: "A24", name: "S.KOKILA", designation: "", department: "", phoneNo: "", ifhrmsNo: "", refNoAndDate: "", occupyDate: null, ebNo: "", quartersType: "A" },
      { quartersNo: "A25", name: "N.PACHAMUTHU", designation: "", department: "", phoneNo: "", ifhrmsNo: "", refNoAndDate: "", occupyDate: null, ebNo: "", quartersType: "A" },
      { quartersNo: "A26", name: "S.GUGANATHAN", designation: "", department: "", phoneNo: "", ifhrmsNo: "", refNoAndDate: "", occupyDate: null, ebNo: "", quartersType: "A" },
      { quartersNo: "A27", name: "S.UMAMAHESWARI", designation: "", department: "", phoneNo: "", ifhrmsNo: "", refNoAndDate: "", occupyDate: null, ebNo: "", quartersType: "A" },
      { quartersNo: "A28", name: "S.STELLARUBI", designation: "", department: "", phoneNo: "", ifhrmsNo: "", refNoAndDate: "", occupyDate: null, ebNo: "", quartersType: "A" },
      { quartersNo: "A29", name: "S.SUBHA", designation: "", department: "", phoneNo: "", ifhrmsNo: "", refNoAndDate: "", occupyDate: null, ebNo: "", quartersType: "A" },
      { quartersNo: "A30", name: "S.RAMESH", designation: "", department: "", phoneNo: "", ifhrmsNo: "", refNoAndDate: "", occupyDate: null, ebNo: "", quartersType: "A" },
      { quartersNo: "A31", name: "S.SOMALATHA", designation: "", department: "", phoneNo: "", ifhrmsNo: "", refNoAndDate: "", occupyDate: null, ebNo: "", quartersType: "A" },
      { quartersNo: "A32", name: "M.KALAIVANI", designation: "", department: "", phoneNo: "", ifhrmsNo: "", refNoAndDate: "", occupyDate: null, ebNo: "", quartersType: "A" },
      { quartersNo: "A33", name: "R.PUSPAM", designation: "", department: "", phoneNo: "", ifhrmsNo: "", refNoAndDate: "", occupyDate: null, ebNo: "", quartersType: "A" },
      { quartersNo: "A34", name: "R.SEVI", designation: "", department: "", phoneNo: "", ifhrmsNo: "", refNoAndDate: "", occupyDate: null, ebNo: "", quartersType: "A" },
      { quartersNo: "A35", name: "M.PUSPHASHERILI", designation: "", department: "", phoneNo: "", ifhrmsNo: "", refNoAndDate: "", occupyDate: null, ebNo: "", quartersType: "A" },
      { quartersNo: "A36", name: "S.VASANTHA", designation: "", department: "", phoneNo: "", ifhrmsNo: "", refNoAndDate: "", occupyDate: null, ebNo: "", quartersType: "A" },

      // D Type Quarters (D1 to D8) - With exact data from SQL
      { quartersNo: "D1", name: "Dr.M. Dhanasekaran", designation: "Associate Professor", department: "Pharmacology", phoneNo: "9840612986", ifhrmsNo: "19030460640", refNoAndDate: "012/P&D/2022 & 17.01.2022", occupyDate: "2022-01-17", ebNo: "203-006-909", quartersType: "D" },
      { quartersNo: "D2", name: "Dr.R. Gunasekaran", designation: "Medical Superintendent", department: "Emergency Medicine", phoneNo: "9488573642", ifhrmsNo: "19030575560", refNoAndDate: "306/P&D/2022 &15.02.2022", occupyDate: "2022-02-15", ebNo: "203-006-910", quartersType: "D" },
      { quartersNo: "D3", name: "Dr.S.Dhanalakshmi", designation: "Associate Professor", department: "Community Medicine", phoneNo: "9003058296", ifhrmsNo: "19030498864", refNoAndDate: "1198/P&D-1/2025 & 01.04.2025", occupyDate: "2025-03-01", ebNo: "203-006-911", quartersType: "D" },
      { quartersNo: "D4", name: "Dr.P.Arul", designation: "Associate Professor", department: "General Medicine", phoneNo: "6380139951", ifhrmsNo: "19030402373", refNoAndDate: "5032/P&D/2024 &26.10.2024", occupyDate: "2024-11-01", ebNo: "203-006-912", quartersType: "D" },
      { quartersNo: "D5", name: "Dr.P. Saravanan", designation: "Professor", department: "Pharmacology", phoneNo: "8838561198", ifhrmsNo: "19030512930", refNoAndDate: "959/P&D/4/2023 &29.03.2023", occupyDate: "2023-04-01", ebNo: "203-006-913", quartersType: "D" },
      { quartersNo: "D6", name: "Dr.A.Leena Devi", designation: "Professor", department: "Biochemistry", phoneNo: "8525052300", ifhrmsNo: "19030730961", refNoAndDate: "5096/P&D/2024 &21.11.2024", occupyDate: "2024-12-01", ebNo: "203-006-914", quartersType: "D" },
      { quartersNo: "D7", name: "Dr.M.Sumathi", designation: "Professor", department: "Pathology", phoneNo: "9843060785", ifhrmsNo: "19020701305", refNoAndDate: "1134/P&D-5/2024 &05.03.2024", occupyDate: "2024-03-04", ebNo: "203-006-915", quartersType: "D" },
      { quartersNo: "D8", name: "Dr.M.Duraimurgan", designation: "Professor", department: "Community Medicine", phoneNo: "9894133089", ifhrmsNo: "19030417948", refNoAndDate: "5121/P&D/2024 &21.11.2024", occupyDate: "2024-12-01", ebNo: "203-006-916", quartersType: "D" }
    ]);
  }

  await logAudit("MongoDB seed verified", "System");
}

function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Missing token" });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

function verifyPayload(student) {
  return `NMC-HOSTEL:${student.rollNumber}:${student.roomNumber}:${student.status || "active"}`;
}

async function logAudit(action, actor = "admin", metadata = {}) {
  const row = { id: Date.now(), action, actor, time: new Date().toISOString(), metadata };
  if (mongoReady) await Models.AuditLog.create(row);
  else memory.auditLogs.unshift(row);
}

async function loadState() {
  if (!mongoReady) return memory;
  const [hostels, rooms, students, history, auditLogs, quartersResidents, quartersSpecialDetails] = await Promise.all([
    Models.Hostel.find().lean(),
    Models.Room.find().lean(),
    Models.Student.find().lean(),
    Models.History.find().sort({ createdAt: -1 }).lean(),
    Models.AuditLog.find().sort({ createdAt: -1 }).limit(100).lean(),
    Models.QuartersResident.find().lean(),
    Models.QuartersSpecialDetail.find().lean()
  ]);
  return { hostels, rooms, students, history, auditLogs, quartersResidents, quartersSpecialDetails };
}

function enrichRooms(rooms, students) {
  return rooms.map((room) => {
    const occupants = students.filter((student) => student.status === "active" && student.roomNumber === room.roomNumber);
    return { ...room, occupied: occupants.length, vacancy: Math.max(Number(room.capacity) - occupants.length, 0), students: occupants };
  });
}

function dashboardSnapshot(hostels, rooms, students, history) {
  const enriched = enrichRooms(rooms, students);
  const active = students.filter((student) => student.status === "active");
  const vacated = students.filter((student) => student.status === "vacated");
  const month = new Date().toISOString().slice(0, 7);
  const totalCapacity = rooms.reduce((sum, room) => sum + Number(room.capacity || 0), 0);
  const occupiedRooms = enriched.filter((room) => room.occupied > 0).length;
  const vacantRooms = enriched.filter((room) => room.occupied === 0).length;
  return {
    totalStudents: active.length,
    totalOccupiedRooms: occupiedRooms,
    totalVacantRooms: vacantRooms,
    totalHostels: hostels.length,
    totalQuarters: 0,
    newAdmissions: history.filter((item) => item.type === "admission" && String(item.date).startsWith(month)).length,
    vacatedStudents: vacated.length,
    totalRooms: rooms.length,
    totalCapacity,
    occupancyPercentage: totalCapacity ? Math.round((active.length / totalCapacity) * 100) : 0
  };
}

async function findAvailableRoom({ hostelName, gender, preferredRoom }) {
  const state = await loadState();
  const enriched = enrichRooms(state.rooms, state.students);
  if (preferredRoom) {
    const room = enriched.find((item) => item.roomNumber === preferredRoom);
    if (!room) throw new Error("Selected room does not exist");
    if (room.vacancy <= 0) throw new Error(`Room ${preferredRoom} is full`);
    return room;
  }
  const room = enriched.find((item) => item.vacancy > 0 && (!hostelName || item.hostelName === hostelName) && (item.gender === "All" || !gender || item.gender === gender));
  if (!room) throw new Error("No vacant room is available for the selected hostel/gender");
  return room;
}

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  let valid = username === ADMIN_USER && await bcrypt.compare(password || "", ADMIN_PASSWORD_HASH);
  if (mongoReady) {
    const admin = await Models.AdminUser.findOne({ username }).lean();
    valid = !!admin && await bcrypt.compare(password || "", admin.passwordHash);
  }
  if (!valid) return res.status(401).json({ message: "Invalid admin credentials" });
  const token = jwt.sign({ username, role: "admin" }, JWT_SECRET, { expiresIn: "8h" });
  await logAudit("Admin login", username);
  res.json({ token, admin: { username, role: "admin" } });
});

app.get("/api/bootstrap", authenticate, async (_req, res) => {
  const state = await loadState();
  res.json({
    ...state,
    rooms: enrichRooms(state.rooms, state.students),
    dashboard: dashboardSnapshot(state.hostels, state.rooms, state.students, state.history)
  });
});

app.get("/api/hostels", authenticate, async (_req, res) => {
  const state = await loadState();
  res.json(state.hostels);
});

app.get("/api/rooms", authenticate, async (_req, res) => {
  const state = await loadState();
  res.json(enrichRooms(state.rooms, state.students));
});

app.post("/api/rooms", authenticate, async (req, res) => {
  const payload = { ...req.body, id: req.body.id || `${req.body.hostelCode || "MAN"}-${req.body.roomNumber}` };
  if (mongoReady) await Models.Room.create(payload);
  else memory.rooms.push(payload);
  await logAudit(`Room ${payload.roomNumber} added`, req.admin.username, payload);
  res.status(201).json(payload);
});

app.get("/api/students", authenticate, async (_req, res) => {
  const state = await loadState();
  res.json(state.students);
});

app.get("/api/quarters", authenticate, async (_req, res) => {
  const state = await loadState();
  res.json(state.quartersResidents);
});

app.post("/api/quarters", authenticate, async (req, res) => {
  const payload = { ...req.body };
  if (mongoReady) await Models.QuartersResident.create(payload);
  else memory.quartersResidents.push(payload);
  await logAudit(`Quarters resident ${payload.quartersNo} added`, req.admin.username, payload);
  res.status(201).json(payload);
});

app.put("/api/quarters/:quartersNo", authenticate, async (req, res) => {
  const { quartersNo } = req.params;
  const payload = { ...req.body };
  if (mongoReady) {
    const updated = await Models.QuartersResident.findOneAndUpdate({ quartersNo }, payload, { new: true }).lean();
    if (!updated) return res.status(404).json({ message: "Quarters not found" });
    await logAudit(`Quarters resident ${quartersNo} updated`, req.admin.username, payload);
    res.json(updated);
  } else {
    const index = memory.quartersResidents.findIndex(item => item.quartersNo === quartersNo);
    if (index === -1) return res.status(404).json({ message: "Quarters not found" });
    memory.quartersResidents[index] = { ...memory.quartersResidents[index], ...payload };
    await logAudit(`Quarters resident ${quartersNo} updated`, req.admin.username, payload);
    res.json(memory.quartersResidents[index]);
  }
});

app.delete("/api/quarters/:quartersNo", authenticate, async (req, res) => {
  const { quartersNo } = req.params;
  if (mongoReady) {
    const deleted = await Models.QuartersResident.findOneAndDelete({ quartersNo });
    if (!deleted) return res.status(404).json({ message: "Quarters not found" });
    await logAudit(`Quarters resident ${quartersNo} deleted`, req.admin.username, { quartersNo });
    res.json({ deleted: true });
  } else {
    const index = memory.quartersResidents.findIndex(item => item.quartersNo === quartersNo);
    if (index === -1) return res.status(404).json({ message: "Quarters not found" );
    const deleted = memory.quartersResidents.splice(index, 1)[0];
    await logAudit(`Quarters resident ${quartersNo} deleted`, req.admin.username, { quartersNo });
    res.json({ deleted: true });
  }
});

app.get("/api/quarters/special-details", authenticate, async (_req, res) => {
  const state = await loadState();
  res.json(state.quartersSpecialDetails);
});

app.post("/api/quarters/special-details", authenticate, async (req, res) => {
  const payload = { ...req.body };
  if (mongoReady) await Models.QuartersSpecialDetail.create(payload);
  else memory.quartersSpecialDetails.push(payload);
  await logAudit(`Quarters special details for ${payload.quartersNo} added`, req.admin.username, payload);
  res.status(201).json(payload);
});

app.put("/api/quarters/special-details/:quartersNo", authenticate, async (req, res) => {
  const { quartersNo } = req.params;
  const payload = { ...req.body };
  if (mongoReady) {
    const updated = await Models.QuartersSpecialDetail.findOneAndUpdate({ quartersNo }, payload, { new: true }).lean();
    if (!updated) return res.status(404).json({ message: "Quarters special details not found" );
    await logAudit(`Quarters special details for ${quartersNo} updated`, req.admin.username, payload);
    res.json(updated);
  } else {
    const index = memory.quartersSpecialDetails.findIndex(item => item.quartersNo === quartersNo);
    if (index === -1) return res.status(404).json({ message: "Quarters special details not found" );
    memory.quartersSpecialDetails[index] = { ...memory.quartersSpecialDetails[index], ...payload };
    await logAudit(`Quarters special details for ${quartersNo} updated`, req.admin.username, payload);
    res.json(memory.quartersSpecialDetails[index]);
  }
});

app.delete("/api/quarters/special-details/:quartersNo", authenticate, async (req, res) => {
  const { quartersNo } = req.params;
  if (mongoReady) {
    const deleted = await Models.QuartersSpecialDetail.findOneAndDelete({ quartersNo });
    if (!deleted) return res.status(404).json({ message: "Quarters special details not found" );
    await logAudit(`Quarters special details for ${quartersNo} deleted`, req.admin.username, { quartersNo });
    res.json({ deleted: true });
  } else {
    const index = memory.quartersSpecialDetails.findIndex(item => item.quartersNo === quartersNo);
    if (index === -1) return res.status(404).json({ message: "Quarters special details not found" );
    const deleted = memory.quartersSpecialDetails.splice(index, 1)[0];
    await logAudit(`Quarters special details for ${quartersNo} deleted`, req.admin.username, { quartersNo });
    res.json({ deleted: true });
  }
});

app.get("/api/students", authenticate, async (_req, res) => {
  const state = await loadState();
  res.json(state.students);
});

app.get("/api/quarters", authenticate, async (_req, res) => {
  const state = await loadState();
  res.json(state.quartersResidents);
});

app.post("/api/students", authenticate, async (req, res) => {
  const body = req.body;
  const room = await findAvailableRoom({ hostelName: body.hostelName, gender: body.gender, preferredRoom: body.roomNumber });
  const student = {
    rollNumber: body.rollNumber,
    name: body.name,
    courseYear: body.courseYear,
    gender: body.gender,
    hostelName: room.hostelName,
    roomNumber: room.roomNumber,
    joiningDate: body.joiningDate,
    contact: body.contact,
    parentName: body.parentName,
    parentContact: body.parentContact,
    status: "active"
  };
  student.verificationId = verifyPayload(student);
  const history = { type: "admission", rollNumber: student.rollNumber, studentName: student.name, roomNumber: student.roomNumber, hostelName: student.hostelName, date: student.joiningDate };
  if (mongoReady) {
    await Models.Student.create(student);
    await Models.History.create(history);
  } else {
    if (memory.students.some((item) => item.rollNumber === student.rollNumber)) return res.status(409).json({ message: "Roll number already exists" });
    memory.students.unshift({ id: student.rollNumber, ...student });
    memory.history.unshift({ id: `${student.rollNumber}-admission`, ...history });
  }
  await logAudit(`New admission recorded for ${student.rollNumber}`, req.admin.username, student);
  res.status(201).json(student);
});

app.post("/api/students/:rollNumber/vacate", authenticate, async (req, res) => {
  const { rollNumber } = req.params;
  const { vacatingDate, vacatingReason } = req.body;
  let student;
  if (mongoReady) {
    student = await Models.Student.findOneAndUpdate({ rollNumber }, { status: "vacated", vacatingDate, vacatingReason }, { new: true }).lean();
    if (student) await Models.History.create({ type: "vacation", rollNumber, studentName: student.name, roomNumber: student.roomNumber, hostelName: student.hostelName, date: vacatingDate, reason: vacatingReason });
  } else {
    memory.students = memory.students.map((item) => {
      if (item.rollNumber !== rollNumber) return item;
      student = { ...item, status: "vacated", vacatingDate, vacatingReason };
      return student;
    });
    if (student) memory.history.unshift({ id: `${rollNumber}-vacation`, type: "vacation", rollNumber, studentName: student.name, roomNumber: student.roomNumber, hostelName: student.hostelName, date: vacatingDate, reason: vacatingReason });
  }
  if (!student) return res.status(404).json({ message: "Student not found" );
  await logAudit(`Student ${rollNumber} vacated room ${student.roomNumber}`, req.admin.username, { vacatingDate, vacatingReason });
  res.json(student);
});

app.get("/api/reports/:type", authenticate, async (req, res) => {
  const state = await loadState();
  const rooms = enrichRooms(state.rooms, state.students);
  const reports = {
    occupiedRooms: rooms.filter((room) => room.occupied > 0),
    vacantRooms: rooms.filter((room) => room.vacancy > 0),
    studentList: state.students,
    hostelWise: state.hostels.map((hostel) => {
      const hostelRooms = rooms.filter((room) => room.hostelName === hostel.name);
      const capacity = hostelRooms.reduce((sum, room) => sum + room.capacity, 0);
      const occupied = hostelRooms.reduce((sum, room) => sum + room.occupied, 0);
      return { hostelName: hostel.name, category: hostel.category, rooms: hostelRooms.length, capacity, occupied, vacantBeds: capacity - occupied };
    }),
    monthlyAdmissions: state.history.filter((item) => item.type === "admission"),
    monthlyVacates: state.history.filter((item) => item.type === "vacation")
  };
  res.json(reports[req.params.type] || []);
});

app.get("/api/audit-logs", authenticate, async (_req, res) => {
  const state = await loadState();
  res.json(state.auditLogs);
});

app.get("/api/backup", authenticate, async (req, res) => {
  const state = await loadState();
  await logAudit("Database backup exported", req.admin.username);
  res.json({ exportedAt: new Date().toISOString(), mongoReady, ...state });
});

app.post("/api/restore", authenticate, async (req, res) => {
  if (!req.body?.hostels || !req.body?.rooms || !req.body?.students) return res.status(400).json({ message: "Invalid backup payload" );
  if (mongoReady) {
    await Promise.all([Models.Hostel.deleteMany({}), Models.Room.deleteMany({}), Models.Student.deleteMany({}), Models.History.deleteMany({}), Models.QuartersResident.deleteMany({}), Models.QuartersSpecialDetail.deleteMany({})]);
    await Promise.all([
      Models.Hostel.insertMany(req.body.hostels),
      Models.Room.insertMany(req.body.rooms),
      Models.Student.insertMany(req.body.students),
      Models.History.insertMany(req.body.history || []),
      Models.QuartersResident.insertMany(req.body.quartersResidents || []),
      Models.QuartersSpecialDetail.insertMany(req.body.quartersSpecialDetails || [])
    ]);
  } else {
    memory.hostels = req.body.hostels;
    memory.rooms = req.body.rooms;
    memory.students = req.body.students;
    memory.history = req.body.history || [];
    memory.quartersResidents = req.body.quartersResidents || [];
    memory.quartersSpecialDetails = req.body.quartersSpecialDetails || [];
  }
  await logAudit("Database restore completed", req.admin.username);
  res.json({ ok: true });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, mongoReady, service: "Namakkal Medical College Hostel API" );
});

if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(join(distPath, "index.html"), (error) => {
      if (error) next(error);
    });
  });
}

connectMongo()
  .catch((error) => {
    console.warn("MongoDB connection failed. Running with in-memory demo data.", error.message);
  })
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`Hostel API running on http://localhost:${PORT}`);
    });
  });