import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-in-production";
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD || "admin123", 10);
const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, "..", "dist");

// CORS configuration - restrict to production domains in production
const corsOptions = process.env.NODE_ENV === "production" 
  ? { origin: process.env.ALLOWED_ORIGINS?.split(",") || "*", credentials: true }
  : { origin: "*", credentials: false };

app.use(cors(corsOptions));
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
    ["Third Floor", 37, 93]
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

const sampleStudents = [];

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
  entryDate: String,
  designation: String,
  department: String,
  phoneNo: { type: String, maxlength: 10, set: emptyToUndefined },
  ifhrmsNo: { type: String, set: emptyToUndefined },
  refNoAndDate: { type: String, set: emptyToUndefined },
  occupyDate: String,
  ebNo: { type: String, unique: true, sparse: true, set: emptyToUndefined },
  quartersType: { type: String, enum: ['A', 'C', 'D'], required: true }
}, { timestamps: true });

const Models = {
  Hostel: mongoose.model("Hostel", hostelsSchema),
  Room: mongoose.model("Room", roomSchema),
  Student: mongoose.model("Student", studentSchema),
  History: mongoose.model("AdmissionVacation", historySchema),
  AdminUser: mongoose.model("AdminUser", adminSchema),
  AuditLog: mongoose.model("AuditLog", auditSchema),
  QuartersResident: mongoose.model("QuartersResident", quartersResidentSchema)
};

function emptyToUndefined(value) {
  return value === "" || value === null ? undefined : value;
}

function parseSqlValues(tuple) {
  const values = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < tuple.length; index += 1) {
    const char = tuple[index];
    const next = tuple[index + 1];
    if (char === "'" && next === "'") {
      current += "'";
      index += 1;
    } else if (char === "'") {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values.map((value) => {
    if (value.toUpperCase() === "NULL") return undefined;
    return value;
  });
}

function parseQuartersSeedFromSql() {
  const sqlPath = join(__dirname, "..", "database", "schema.sql");
  if (!existsSync(sqlPath)) return [];
  const sql = readFileSync(sqlPath, "utf8");
  const rows = [];
  const insertBlocks = sql.match(/INSERT INTO quarters_residents[\s\S]*?;/g) || [];
  const columnMap = {
    quarters_no: "quartersNo",
    name: "name",
    entry_date: "entryDate",
    designation: "designation",
    department: "department",
    phone_no: "phoneNo",
    ifhrms_no: "ifhrmsNo",
    ref_no_and_date: "refNoAndDate",
    occupy_date: "occupyDate",
    eb_no: "ebNo",
    quarters_type: "quartersType"
  };
  for (const block of insertBlocks) {
    // Extract columns from INSERT INTO quarters_residents (...) VALUES
    const columnsMatch = block.match(/INSERT INTO quarters_residents\s*\(([^)]+)\)\s*VALUES/is);
    if (!columnsMatch) continue;
    const columns = columnsMatch[1].split(",").map((column) => column.trim());
    const valuesPart = block.slice(block.indexOf("VALUES") + 6, -1);
    const tuples = valuesPart.match(/\([\s\S]*?\)(?=,|\s*$)/g) || [];
    for (const tuple of tuples) {
      const values = parseSqlValues(tuple.slice(1, -1));
      const row = {};
      columns.forEach((column, index) => {
        const key = columnMap[column];
        if (key) row[key] = values[index];
      });
      rows.push(row);
    }
  }
  console.log(`[Seed] Parsed ${rows.length} quarters residents from schema.sql`);
  return rows;
}

const quartersSeed = parseQuartersSeedFromSql();

const memory = {
  hostels: hostelSeed,
  rooms: makeRooms(hostelSeed),
  students: sampleStudents,
  history: [],
  quartersResidents: quartersSeed,
  auditLogs: [{ id: 1, action: "System initialized with hostel structure and quarters records", actor: "System", time: new Date().toISOString() }]
};

let mongoReady = false;

async function connectMongo() {
  if (!process.env.MONGODB_URI) {
    console.log("[DB] MONGODB_URI not configured, running with in-memory data");
    return;
  }
  try {
    console.log("[DB] Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    mongoReady = true;
    console.log("[DB] ✓ MongoDB connected successfully");
    await seedMongo();
  } catch (error) {
    console.error("[DB] ✗ MongoDB connection failed:", error.message);
    throw error;
  }
}

async function seedMongo() {
  console.log("[Seed] Starting MongoDB seeding process");
  
  const hostelsCount = await Models.Hostel.countDocuments();
  if (hostelsCount !== hostelSeed.length) {
    console.log(`[Seed] Hostels count mismatch (expected ${hostelSeed.length}, got ${hostelsCount}), reseeding...`);
    await Models.Hostel.deleteMany({});
    await Models.Hostel.insertMany(hostelSeed);
    console.log(`[Seed] ✓ Inserted ${hostelSeed.length} hostel records`);
  } else {
    console.log(`[Seed] ✓ ${hostelsCount} hostel records already present`);
  }
  
  const roomsCount = await Models.Room.countDocuments();
  const expectedRoomsCount = makeRooms(hostelSeed).length;
  if (roomsCount !== expectedRoomsCount) {
    console.log(`[Seed] Rooms count mismatch (expected ${expectedRoomsCount}, got ${roomsCount}), reseeding...`);
    await Models.Room.deleteMany({});
    const rooms = makeRooms(hostelSeed);
    await Models.Room.insertMany(rooms);
    console.log(`[Seed] ✓ Inserted ${rooms.length} room records`);
  } else {
    console.log(`[Seed] ✓ ${roomsCount} room records already present`);
  }
  
  const studentCount = await Models.Student.countDocuments();
  if (!studentCount && sampleStudents.length) {
    await Models.Student.insertMany(sampleStudents.map((student) => ({ ...student, verificationId: verifyPayload(student) })));
    console.log(`[Seed] ✓ Inserted ${sampleStudents.length} student records`);
  } else if (!sampleStudents.length) {
    console.log(`[Seed] ℹ No student sample data to seed`);
  } else {
    console.log(`[Seed] ✓ ${studentCount} student records already present`);
  }
  
  const adminCount = await Models.AdminUser.countDocuments();
  if (!adminCount) {
    await Models.AdminUser.create({ username: ADMIN_USER, passwordHash: ADMIN_PASSWORD_HASH, role: "admin" });
    console.log(`[Seed] ✓ Created admin user`);
  } else {
    console.log(`[Seed] ✓ Admin user already exists`);
  }

  if (quartersSeed.length) {
    console.log(`[Seed] Upserting ${quartersSeed.length} quarters residents...`);
    const result = await Models.QuartersResident.bulkWrite(quartersSeed.map((resident) => ({
      updateOne: {
        filter: { quartersNo: resident.quartersNo },
        update: { $set: resident },
        upsert: true
      }
    })));
    console.log(`[Seed] ✓ Upserted quarters residents (matched: ${result.matchedCount}, modified: ${result.modifiedCount}, upserted: ${result.upsertedCount})`);
  } else {
    console.log(`[Seed] ⚠ No quarters residents data found to seed`);
  }

  await logAudit("MongoDB seed verified", "System");
  console.log("[Seed] MongoDB seeding complete");
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
  const [hostels, rooms, students, history, auditLogs, quartersResidents] = await Promise.all([
    Models.Hostel.find().lean(),
    Models.Room.find().lean(),
    Models.Student.find().lean(),
    Models.History.find().sort({ createdAt: -1 }).lean(),
    Models.AuditLog.find().sort({ createdAt: -1 }).limit(100).lean(),
    Models.QuartersResident.find().lean()
  ]);
  return { hostels, rooms, students, history, auditLogs, quartersResidents };
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

function normalizeQuartersPayload(body = {}) {
  return {
    quartersNo: String(body.quartersNo || "").trim().toUpperCase(),
    name: String(body.name || "").trim(),
    entryDate: body.entryDate || undefined,
    designation: body.designation ? String(body.designation).trim() : undefined,
    department: body.department ? String(body.department).trim() : undefined,
    phoneNo: body.phoneNo ? String(body.phoneNo).trim() : undefined,
    ifhrmsNo: body.ifhrmsNo ? String(body.ifhrmsNo).trim() : undefined,
    refNoAndDate: body.refNoAndDate ? String(body.refNoAndDate).trim() : undefined,
    occupyDate: body.occupyDate || undefined,
    ebNo: body.ebNo ? String(body.ebNo).trim() : undefined,
    quartersType: String(body.quartersType || "").trim().toUpperCase()
  };
}

function validateQuartersPayload(payload, existing = [], currentQuartersNo = "") {
  const errors = [];
  if (!payload.quartersNo) errors.push("Quarters No is required");
  if (!payload.name) errors.push("Name is required");
  if (!["A", "C", "D"].includes(payload.quartersType)) errors.push("Quarters Type must be A, C, or D");
  if (payload.phoneNo && !/^\d{10}$/.test(payload.phoneNo)) errors.push("Phone number must contain exactly 10 digits");
  if (payload.occupyDate && Number.isNaN(Date.parse(payload.occupyDate))) errors.push("Occupy date is invalid");
  if (existing.some((item) => item.quartersNo === payload.quartersNo && item.quartersNo !== currentQuartersNo)) errors.push("Quarters No must be unique");
  if (payload.ebNo && existing.some((item) => item.ebNo === payload.ebNo && item.quartersNo !== currentQuartersNo)) errors.push("EB No must be unique");
  return errors;
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
  const payload = normalizeQuartersPayload(req.body);
  const state = await loadState();
  const errors = validateQuartersPayload(payload, state.quartersResidents);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });
  if (mongoReady) await Models.QuartersResident.create(payload);
  else memory.quartersResidents.push(payload);
  await logAudit(`Quarters resident ${payload.quartersNo} added`, req.admin.username, payload);
  res.status(201).json(payload);
});

app.put("/api/quarters/:quartersNo", authenticate, async (req, res) => {
  const quartersNo = req.params.quartersNo.toUpperCase();
  const payload = normalizeQuartersPayload(req.body);
  const state = await loadState();
  const errors = validateQuartersPayload(payload, state.quartersResidents, quartersNo);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });
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
    if (index === -1) return res.status(404).json({ message: "Quarters not found" });
    const deleted = memory.quartersResidents.splice(index, 1)[0];
    await logAudit(`Quarters resident ${quartersNo} deleted`, req.admin.username, { quartersNo });
    res.json({ deleted: true });
  }
});

app.post("/api/students", authenticate, async (req, res) => {
  const body = req.body;
  if (!body.rollNumber || !body.name || !body.gender || !body.joiningDate) return res.status(400).json({ message: "Roll number, name, gender, and joining date are required" });
  const state = await loadState();
  if (state.students.some((item) => item.rollNumber === body.rollNumber)) return res.status(409).json({ message: "Roll number already exists" });
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
    memory.students.unshift({ id: student.rollNumber, ...student });
    memory.history.unshift({ id: `${student.rollNumber}-admission`, ...history });
  }
  await logAudit(`New admission recorded for ${student.rollNumber}`, req.admin.username, student);
  res.status(201).json(student);
});

app.put("/api/students/:rollNumber", authenticate, async (req, res) => {
  const { rollNumber } = req.params;
  const body = req.body;
  if (!body.name || !body.gender || !body.joiningDate) return res.status(400).json({ message: "Name, gender, and joining date are required" });
  const payload = {
    name: body.name,
    courseYear: body.courseYear,
    gender: body.gender,
    hostelName: body.hostelName,
    roomNumber: body.roomNumber,
    joiningDate: body.joiningDate,
    contact: body.contact,
    parentName: body.parentName,
    parentContact: body.parentContact
  };
  if (body.roomNumber) await findAvailableRoom({ hostelName: body.hostelName, gender: body.gender, preferredRoom: body.roomNumber });
  let student;
  if (mongoReady) {
    student = await Models.Student.findOneAndUpdate({ rollNumber }, payload, { new: true }).lean();
  } else {
    memory.students = memory.students.map((item) => {
      if (item.rollNumber !== rollNumber) return item;
      student = { ...item, ...payload, verificationId: verifyPayload({ ...item, ...payload }) };
      return student;
    });
  }
  if (!student) return res.status(404).json({ message: "Student not found" });
  await logAudit(`Student ${rollNumber} updated`, req.admin.username, payload);
  res.json(student);
});

app.post("/api/students/:rollNumber/transfer", authenticate, async (req, res) => {
  const { rollNumber } = req.params;
  const state = await loadState();
  const current = state.students.find((item) => item.rollNumber === rollNumber && item.status === "active");
  if (!current) return res.status(404).json({ message: "Active student not found" });
  const room = await findAvailableRoom({ hostelName: req.body.hostelName || current.hostelName, gender: current.gender, preferredRoom: req.body.roomNumber });
  let student;
  if (mongoReady) {
    student = await Models.Student.findOneAndUpdate({ rollNumber }, { hostelName: room.hostelName, roomNumber: room.roomNumber }, { new: true }).lean();
  } else {
    memory.students = memory.students.map((item) => {
      if (item.rollNumber !== rollNumber) return item;
      student = { ...item, hostelName: room.hostelName, roomNumber: room.roomNumber, verificationId: verifyPayload({ ...item, roomNumber: room.roomNumber }) };
      return student;
    });
  }
  await logAudit(`Student ${rollNumber} transferred to ${room.roomNumber}`, req.admin.username, { roomNumber: room.roomNumber });
  res.json(student);
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
  if (!student) {
    return res.status(404).json({
      message: "Student not found"
    });
  }
  await logAudit(`Student ${rollNumber} vacated room ${student.roomNumber}`, req.admin.username, { vacatingDate, vacatingReason });
  res.json(student);
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, mongoReady, service: "Namakkal Medical College Hostel API" });
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

app.use((error, _req, res, _next) => {
  const duplicate = error?.code === 11000;
  const status = duplicate ? 409 : 500;
  res.status(status).json({
    message: duplicate ? "Duplicate record found" : "Server error",
    detail: process.env.NODE_ENV === "production" ? undefined : error.message
  });
});

connectMongo()
  .catch((error) => {
    console.warn("MongoDB connection failed. Running with in-memory demo data.", error.message);
  })
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`Hostel API running on http://localhost:${PORT}`);
    });
  });
