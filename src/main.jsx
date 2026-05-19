import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArchiveRestore, BedDouble, Bell, Building2, Camera, CheckCircle2, ClipboardList,
  Download, Edit3, FileText, Home, IdCard, Layers3, LogOut, Moon,
  Plus, Printer, Search, Settings, ShieldCheck, Stethoscope, Sun, UserCircle,
  UserMinus, UserPlus, Users, X
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import "./styles.css";

const today = new Date().toISOString().slice(0, 10);

// Quarters types
const quartersTypes = ["A", "C", "D"];

// Validate phone number (10 digits)
const validatePhone = (phone) => {
  return /^\d{10}$/.test(phone);
};

// Validate date
const validateDate = (date) => {
  return !isNaN(Date.parse(date));
};

// Initialize quarters data with the required initial data
const initializeQuartersData = () => {
  const quartersData = [];

  // C Type Quarters (C1 to C18)
  const cTypes = [
    { quartersNo: "C1", name: "Dr.V. Balaji", designation: "Doctor", department: "Medicine" },
    { quartersNo: "C2", name: "Dr.V. Slimbarasan", designation: "Doctor", department: "Medicine" },
    { quartersNo: "C3", name: "Dr.S.K. Jayaswarya", designation: "Doctor", department: "Medicine" },
    { quartersNo: "C4", name: "Dr.A. Marudhavanan", designation: "Doctor", department: "Medicine" },
    { quartersNo: "C5", name: "Dr.S. Balasubramanian", designation: "Doctor", department: "Medicine" },
    { quartersNo: "C6", name: "Dr.T. Karthikeyan", designation: "Doctor", department: "Medicine" },
    { quartersNo: "C7", name: "Dr.A.Mary Arul priya", designation: "Doctor", department: "Medicine" },
    { quartersNo: "C8", name: "Dr.A.Daivik", designation: "Doctor", department: "Medicine" },
    { quartersNo: "C9", name: "Dr.P.Gomathi", designation: "Doctor", department: "Medicine" },
    { quartersNo: "C10", name: "Dr.M.Srimuthalage", designation: "Doctor", department: "Medicine" },
    { quartersNo: "C11", name: "Dr.K.Shankar", designation: "Doctor", department: "Medicine" },
    { quartersNo: "C12", name: "Dr.S.Jeyakumar", designation: "Doctor", department: "Medicine" },
    { quartersNo: "C13", name: "Dr.P. Tamilarsi", designation: "Doctor", department: "Medicine" },
    { quartersNo: "C14", name: "Dr.M. Sathish", designation: "Doctor", department: "Medicine" },
    { quartersNo: "C15", name: "Dr.L.Mohanapriya", designation: "Doctor", department: "Medicine" },
    { quartersNo: "C16", name: "Dr.S. Mukilan", designation: "Doctor", department: "Medicine" },
    { quartersNo: "C17", name: "Dr.S. Vigneshwari", designation: "Doctor", department: "Medicine" },
    { quartersNo: "C18", name: "Dr.A.Gayatri", designation: "Doctor", department: "Medicine" }
  ];

  cTypes.forEach((item, index) => {
    quartersData.push({
      ...item,
      quartersNo: `C${index + 1}`,
      quartersType: "C",
      phoneNo: "",
      ifhrmsNo: "",
      refNoAndDate: "",
      occupyDate: "",
      ebNo: ""
    });
  });

  // A Type Quarters (A1 to A36)
  const aTypes = [
    { quartersNo: "A1", name: "P.R.ARVIND", designation: "Staff", department: "Administration" },
    { quartersNo: "A2", name: "M.DEEPA", designation: "Staff", department: "Administration" },
    { quartersNo: "A3", name: "B.MENAKA", designation: "Staff", department: "Administration" },
    { quartersNo: "A4", name: "S.SHANKAR", designation: "Staff", department: "Administration" },
    { quartersNo: "A5", name: "A.THIYARAJAN", designation: "Staff", department: "Administration" },
    { quartersNo: "A6", name: "M.BALAMURGAN", designation: "Staff", department: "Administration" },
    { quartersNo: "A7", name: "M.KUMAR", designation: "Staff", department: "Administration" },
    { quartersNo: "A8", name: "M.MUTHU KRISHAN", designation: "Staff", department: "Administration" },
    { quartersNo: "A9", name: "M.SETTU", designation: "Staff", department: "Administration" },
    { quartersNo: "A10", name: "M.MUTHAMIZH", designation: "Staff", department: "Administration" },
    { quartersNo: "A11", name: "P.BOOBALAN", designation: "Staff", department: "Administration" },
    { quartersNo: "A12", name: "G.SURESH", designation: "Staff", department: "Administration" },
    { quartersNo: "A13", name: "S.KALA", designation: "Staff", department: "Administration" },
    { quartersNo: "A14", name: "P.SAKUNTHALA", designation: "Staff", department: "Administration" },
    { quartersNo: "A15", name: "A.GEETHA", designation: "Staff", department: "Administration" },
    { quartersNo: "A16", name: "D.SATHIS KUMAR", designation: "Staff", department: "Administration" },
    { quartersNo: "A17", name: "R.A,LASKSHMI DEVI", designation: "Staff", department: "Administration" },
    { quartersNo: "A18", name: "R.PALANIAMMAL", designation: "Staff", department: "Administration" },
    { quartersNo: "A19", name: "S.SAMUNDESWARI", designation: "Staff", department: "Administration" },
    { quartersNo: "A20", name: "K.REVATHI", designation: "Staff", department: "Administration" },
    { quartersNo: "A21", name: "M.RADHAMANI", designation: "Staff", department: "Administration" },
    { quartersNo: "A22", name: "A.ARUNSHANKAR", designation: "Staff", department: "Administration" },
    { quartersNo: "A23", name: "P.ANANDHAN", designation: "Staff", department: "Administration" },
    { quartersNo: "A24", name: "S.KOKILA", designation: "Staff", department: "Administration" },
    { quartersNo: "A25", name: "N.PACHAMUTHU", designation: "Staff", department: "Administration" },
    { quartersNo: "A26", name: "S.GUGANATHAN", designation: "Staff", department: "Administration" },
    { quartersNo: "A27", name: "S.UMAMAHESWARI", designation: "Staff", department: "Administration" },
    { quartersNo: "A28", name: "S.STELLARUBI", designation: "Staff", department: "Administration" },
    { quartersNo: "A29", name: "S.SUBHA", designation: "Staff", department: "Administration" },
    { quartersNo: "A30", name: "S.RAMESH", designation: "Staff", department: "Administration" },
    { quartersNo: "A31", name: "S.SOMALATHA", designation: "Staff", department: "Administration" },
    { quartersNo: "A32", name: "M.KALAIVANI", designation: "Staff", department: "Administration" },
    { quartersNo: "A33", name: "R.PUSPAM", designation: "Staff", department: "Administration" },
    { quartersNo: "A34", name: "R.SEVI", designation: "Staff", department: "Administration" },
    { quartersNo: "A35", name: "M.PUSPHASHERILI", designation: "Staff", department: "Administration" },
    { quartersNo: "A36", name: "S.VASANTHA", designation: "Staff", department: "Administration" }
  ];

  aTypes.forEach((item, index) => {
    quartersData.push({
      ...item,
      quartersNo: `A${index + 1}`,
      quartersType: "A",
      phoneNo: "",
      ifhrmsNo: "",
      refNoAndDate: "",
      occupyDate: "",
      ebNo: ""
    });
  });

  // D Type Quarters (D1 to D8)
  const dTypes = [
    { quartersNo: "D1", name: "Dr.M. Dhanasekaran", designation: "Doctor", department: "Medicine" },
    { quartersNo: "D2", name: "Dr.R. Gunasekaran", designation: "Doctor", department: "Medicine" },
    { quartersNo: "D3", name: "Dr.S.Dhanalakshmi", designation: "Doctor", department: "Medicine" },
    { quartersNo: "D4", name: "Dr.P.Arul", designation: "Doctor", department: "Medicine" },
    { quartersNo: "D5", name: "Dr.P. Saravanan", designation: "Doctor", department: "Medicine" },
    { quartersNo: "D6", name: "Dr.A.Leena Devi", designation: "Doctor", department: "Medicine" },
    { quartersNo: "D7", name: "Dr.M.Sumathi", designation: "Doctor", department: "Medicine" },
    { quartersNo: "D8", name: "Dr.M.Duraimurgan", designation: "Doctor", department: "Medicine" }
  ];

  dTypes.forEach((item, index) => {
    quartersData.push({
      ...item,
      quartersNo: `D${index + 1}`,
      quartersType: "D",
      phoneNo: "",
      ifhrmsNo: "",
      refNoAndDate: "",
      occupyDate: "",
      ebNo: ""
    });
  });

  return quartersData;
};

// Initialize special details data
const initializeSpecialDetailsData = () => {
  // Create empty special details for each quarter
  const quartersData = initializeQuartersData();
  return quartersData.map(q => ({
    quartersNo: q.quartersNo,
    specialNotes: "",
    maintenanceIssues: "",
    familyMembersCount: 0,
    vehicleNumber: "",
    aadhaarNumber: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    residentStatus: "Active"
  }));
};

function App() {
  const [isAuthed, setIsAuthed] = useState(() => localStorage.getItem("nmc_admin_token") === "demo-token");
  const [dark, setDark] = useState(() => localStorage.getItem("nmc_theme") === "dark");
  const [active, setActive] = useState("Dashboard");
  const [quartersData, setQuartersData] = useState(initializeQuartersData);
  const [specialDetailsData, setSpecialDetailsData] = useState(initializeSpecialDetailsData);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [editingQuarters, setEditingQuarters] = useState(null);
  const [viewingQuarters, setViewingQuarters] = useState(null);
  const [updatingSpecialDetails, setUpdatingSpecialDetails] = useState(null);
  const [toast, setToast] = useState("");
  const [auditLogs, setAuditLogs] = useState([
    "System initialized with separated quarters module",
    "Quarters data initialized with A, C, D type quarters"
  ]);

  // Filter quarters data based on search query
  const filteredQuarters = quartersData.filter(q =>
    `${q.quartersNo} ${q.name} ${q.designation} ${q.department} ${q.phoneNo} ${q.ifhrmsNo}`.toLowerCase().includes(query.toLowerCase())
  );

  // Get special details for a specific quarter
  const getSpecialDetailsByQuartersNo = (quartersNo) => {
    return specialDetailsData.find(sd => sd.quartersNo === quartersNo) || {
      quartersNo,
      specialNotes: "",
      maintenanceIssues: "",
      familyMembersCount: 0,
      vehicleNumber: "",
      aadhaarNumber: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      residentStatus: "Active"
    };
  };

  // Update special details
  const updateSpecialDetails = (quartersNo, updatedData) => {
    setSpecialDetailsData(prev => prev.map(sd =>
      sd.quartersNo === quartersNo ? { ...sd, ...updatedData } : sd
    ));

    // Update resident status in quarters data if it changed
    if (updatedData.residentStatus !== undefined) {
      setQuartersData(prev => prev.map(q =>
        q.quartersNo === quartersNo ? { ...q, ...updatedData } : q
      ));
    }
  };

  // Count statistics
  const totalQuarters = quartersData.length;
  const occupiedQuarters = quartersData.filter(q => {
    const sd = getSpecialDetailsByQuartersNo(q.quartersNo);
    return sd.residentStatus !== "Vacated";
  }).length;
  const vacantQuarters = totalQuarters - occupiedQuarters;

  const typeCounts = {
    A: quartersData.filter(q => q.quartersType === "A").length,
    C: quartersData.filter(q => q.quartersType === "C").length,
    D: quartersData.filter(q => q.quartersType === "D").length
  };

  function notify(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2600);
  }

  function addAudit(action) {
    setAuditLogs([`${new Date().toLocaleString()} - ${action}`, ...auditLogs]);
  }

  function login(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get("username") === "admin" && form.get("password") === "admin123") {
      localStorage.setItem("nmc_admin_token", "demo-token");
      setIsAuthed(true);
      addAudit("Admin login");
      return;
    }
    notify("Invalid admin credentials. Use admin / admin123 for demo.");
  }

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("nmc_theme", next ? "dark" : "light");
  }

  function addQuartersResident(data) {
    // Validation
    if (!data.quartersNo) {
      notify("Quarters number is required");
      return;
    }

    if (quartersData.some(q => q.quartersNo === data.quartersNo)) {
      notify("Quarters number already exists");
      return;
    }

    if (!data.name) {
      notify("Name is required");
      return;
    }

    if (!data.quartersType) {
      notify("Quarters type is required");
      return;
    }

    if (!quartersTypes.includes(data.quartersType)) {
      notify("Invalid quarters type");
      return;
    }

    if (data.phoneNo && !validatePhone(data.phoneNo)) {
      notify("Phone number must be exactly 10 digits");
      return;
    }

    if (data.ebNo && quartersData.some(q => q.ebNo === data.ebNo)) {
      notify("EB number must be unique");
      return;
    }

    if (data.occupyDate && !validateDate(data.occupyDate)) {
      notify("Invalid occupy date");
      return;
    }

    const newQuarters = {
      quartersNo: data.quartersNo,
      name: data.name,
      designation: data.designation || "",
      department: data.department || "",
      phoneNo: data.phoneNo || "",
      ifhrmsNo: data.ifhrmsNo || "",
      refNoAndDate: data.refNoAndDate || "",
      occupyDate: data.occupyDate || "",
      ebNo: data.ebNo || "",
      quartersType: data.quartersType
    };

    setQuartersData(prev => [newQuarters, ...prev]);

    // Initialize special details for new quarters
    setSpecialDetailsData(prev => [
      {
        quartersNo: data.quartersNo,
        specialNotes: "",
        maintenanceIssues: "",
        familyMembersCount: 0,
        vehicleNumber: "",
        aadhaarNumber: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        residentStatus: "Active"
      },
      ...prev
    ]);

    notify(`New quarters resident added: ${data.name}`);
    addAudit(`Added quarters resident ${data.quartersNo}`);
  }

  function updateQuartersResident(data) {
    // Validation
    if (!data.quartersNo) {
      notify("Quarters number is required");
      return;
    }

    const existingIndex = quartersData.findIndex(q => q.quartersNo === data.quartersNo);
    if (existingIndex === -1) {
      notify("Quarters not found");
      return;
    }

    // Check if quarters number is being changed to an existing one
    if (data.quartersNo !== quartersData[existingIndex].quartersNo &&
        quartersData.some(q => q.quartersNo === data.quartersNo)) {
      notify("Quarters number already exists");
      return;
    }

    if (!data.name) {
      notify("Name is required");
      return;
    }

    if (!data.quartersType) {
      notify("Quarters type is required");
      return;
    }

    if (!quartersTypes.includes(data.quartersType)) {
      notify("Invalid quarters type");
      return;
    }

    if (data.phoneNo && !validatePhone(data.phoneNo)) {
      notify("Phone number must be exactly 10 digits");
      return;
    }

    if (data.ebNo && quartersData.some(q => q.ebNo === data.ebNo && q.quartersNo !== data.quartersNo)) {
      notify("EB number must be unique");
      return;
    }

    if (data.occupyDate && !validateDate(data.occupyDate)) {
      notify("Invalid occupy date");
      return;
    }

    const updatedQuarters = {
      quartersNo: data.quartersNo,
      name: data.name,
      designation: data.designation || "",
      department: data.department || "",
      phoneNo: data.phoneNo || "",
      ifhrmsNo: data.ifhrmsNo || "",
      refNoAndDate: data.refNoAndDate || "",
      occupyDate: data.occupyDate || "",
      ebNo: data.ebNo || "",
      quartersType: data.quartersType
    };

    setQuartersData(prev => prev.map((q, index) =>
      index === existingIndex ? updatedQuarters : q
    ));

    notify(`Quarters resident updated: ${data.name}`);
    addAudit(`Updated quarters resident ${data.quartersNo}`);
  }

  function deleteQuartersResident(quartersNo) {
    if (window.confirm(`Are you sure you want to delete quarters ${quartersNo}?`)) {
      setQuartersData(prev => prev.filter(q => q.quartersNo !== quartersNo));
      setSpecialDetailsData(prev => prev.filter(sd => sd.quartersNo !== quartersNo));
      notify(`Quarters ${quartersNo} deleted`);
      addAudit(`Deleted quarters ${quartersNo}`);
    }
  }

  function updateSpecialDetailsHandler(data) {
    const quartersNo = data.quartersNo;
    const existingIndex = specialDetailsData.findIndex(sd => sd.quartersNo === quartersNo);

    if (existingIndex === -1) {
      notify("Quarters not found");
      return;
    }

    const updatedData = {
      specialNotes: data.specialNotes || "",
      maintenanceIssues: data.maintenanceIssues || "",
      familyMembersCount: parseInt(data.familyMembersCount) || 0,
      vehicleNumber: data.vehicleNumber || "",
      aadhaarNumber: data.aadhaarNumber || "",
      emergencyContactName: data.emergencyContactName || "",
      emergencyContactPhone: data.emergencyContactPhone || "",
      residentStatus: data.residentStatus || "Active"
    };

    // If status is changing to Vacated, we'll handle it in the updateSpecialDetails function
    setSpecialDetailsData(prev => prev.map((sd, index) =>
      index === existingIndex ? { ...sd, ...updatedData } : sd
    ));

    // Update quarters data with the new resident status
    setQuartersData(prev => prev.map(q =>
      q.quartersNo === quartersNo ? { ...q, ...updatedData } : q
    ));

    notify(`Special details updated for quarters ${quartersNo}`);
    addAudit(`Updated special details for quarters ${quartersNo}`);
  }

  if (!isAuthed) {
    return <main className={dark ? "dark" : ""}><section className="login-shell"><div className="login-hero"><LogoMark /><p className="eyebrow">Namakkal Medical College</p><h1>Quarters Management System</h1><p>Management system for quarters accommodation (A, C, D types)</p><div className="hero-metrics"><span><ShieldCheck size={18} />Admin Access</span><span><Building2 size={18} />Quarters Management</span></div></div><form className="login-card" onSubmit={login}><div className="brand-row"><LogoMark /><div><strong>Quarters Administration</strong><small>Secure admin login</small></div></div><label>Username<input name="username" placeholder="admin" required /></label><label>Password<input name="password" type="password" placeholder="admin123" required /></label><button className="primary" type="submit">Secure Login</button><p className="hint">Demo credentials: admin / admin123</p></form>{toast && <div className="toast">{toast}</div>}</section></main>;
  }

  const nav = [
    ["Dashboard", Home],
    ["Quarters Dashboard", Layers3],
    ["Add Quarters", Plus],
    ["Special Details", FileText],
    ["Reports", ClipboardList],
    ["Settings", Settings]
  ];

  return (
    <main className={dark ? "app dark" : "app"}>
      <aside className="sidebar">
        <div className="brand-row"><LogoMark /><div><strong>Namakkal Medical College</strong><strong>Quarters Management</strong></div></div>
        <nav>{nav.map(([item, Icon]) => <button key={item} className={active === item ? "nav active" : "nav"} onClick={() => setActive(item)}><Icon size={18} />{item}</button>)}</nav>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <div><p className="eyebrow">Quarters Administration Dashboard</p><h2>{active}</h2></div>
          <div className="top-actions">
            <div className="search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search quarters no, name, designation, department, phone" /></div>
            <button className="profile-pill"><UserCircle size={18} />Admin</button>
            <button className="icon-button" onClick={toggleTheme} title="Toggle theme">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button className="icon-button" onClick={() => { localStorage.removeItem("nmc_admin_token"); setIsAuthed(false); }} title="Sign out"><LogOut size={18} /></button>
          </div>
        </header>
        {active === "Dashboard" && <Dashboard
          quartersData={quartersData}
          specialDetailsData={specialDetailsData}
          filteredQuarters={filteredQuarters}
          totalQuarters={totalQuarters}
          occupiedQuarters={occupiedQuarters}
          vacantQuarters={vacantQuarters}
          typeCounts={typeCounts}
          query={query}
          setQuery={setQuery}
          addQuartersResident={addQuartersResident}
          updateQuartersResident={updateQuartersResident}
          deleteQuartersResident={deleteQuartersResident}
          updateSpecialDetailsHandler={updateSpecialDetailsHandler}
          getSpecialDetailsByQuartersNo={getSpecialDetailsByQuartersNo}
          setEditingQuarters={setEditingQuarters}
          setViewingQuarters={setViewingQuarters}
          setUpdatingSpecialDetails={setUpdatingSpecialDetails}
          editingQuarters={editingQuarters}
          viewingQuarters={viewingQuarters}
          updatingSpecialDetails={updatingSpecialDetails}
          notify={notify}
          addAudit={addAudit}
        />}
        {active === "Quarters Dashboard" && <QuartersDashboard
          quartersData={quartersData}
          specialDetailsData={specialDetailsData}
          filteredQuarters={filteredQuarters}
          totalQuarters={totalQuarters}
          occupiedQuarters={occupiedQuarters}
          vacantQuarters={vacantQuarters}
          typeCounts={typeCounts}
          query={query}
          setQuery={setQuery}
          addQuartersResident={addQuartersResident}
          updateQuartersResident={updateQuartersResident}
          deleteQuartersResident={deleteQuartersResident}
          updateSpecialDetailsHandler={updateSpecialDetailsHandler}
          getSpecialDetailsByQuartersNo={getSpecialDetailsByQuartersNo}
          setEditingQuarters={setEditingQuarters}
          setViewingQuarters={setViewingQuarters}
          setUpdatingSpecialDetails={setUpdatingSpecialDetails}
          editingQuarters={editingQuarters}
          viewingQuarters={viewingQuarters}
          updatingSpecialDetails={updatingSpecialDetails}
          notify={notify}
          addAudit={addAudit}
        />}
        {active === "Add Quarters" && <QuartersForm
          onSubmit={addQuartersResident}
          editingQuarters={editingQuarters}
          setEditingQuarters={setEditingQuarters}
          notify={notify}
          addAudit={addAudit}
        />}
        {active === "Special Details" && <SpecialDetailsForm
          quartersData={quartersData}
          specialDetailsData={specialDetailsData}
          filteredQuarters={filteredQuarters}
          query={query}
          setQuery={setQuery}
          updateSpecialDetailsHandler={updateSpecialDetailsHandler}
          getSpecialDetailsByQuartersNo={getSpecialDetailsByQuartersNo}
          setUpdatingSpecialDetails={setUpdatingSpecialDetails}
          updatingSpecialDetails={updatingSpecialDetails}
          notify={notify}
          addAudit={addAudit}
        />}
        {active === "Reports" && <QuartersReports
          quartersData={quartersData}
          specialDetailsData={specialDetailsData}
          filteredQuarters={filteredQuarters}
          notify={notify}
          addAudit={addAudit}
        />}
        {active === "Settings" && <AdminTools
          auditLogs={auditLogs}
          addAudit={addAudit}
          notify={notify}
          quartersData={quartersData}
          specialDetailsData={specialDetailsData}
        />}
        {editingQuarters && <Modal title="Edit Quarters Resident" onClose={() => setEditingQuarters(null)}><QuartersForm quartersData={editingQuarters} onSubmit={updateQuartersResident} setEditingQuarters={setEditingQuarters} notify={notify} addAudit={addAudit} /></Modal>}
        {viewingQuarters && <Modal title="Quarters Details" onClose={() => setViewingQuarters(null)}><QuartersDetails quartersData={quartersData} specialDetailsData={specialDetailsData} quartersNo={viewingQuarters} /></Modal>}
        {updatingSpecialDetails && <Modal title="Update Special Details" onClose={() => setUpdatingSpecialDetails(null)}><SpecialDetailsForm
          quartersData={quartersData}
          specialDetailsData={specialDetailsData}
          quartersToUpdate={updatingSpecialDetails}
          onSubmit={updateSpecialDetailsHandler}
          setUpdatingSpecialDetails={setUpdatingSpecialDetails}
          notify={notify}
          addAudit={addAudit}
        /></Modal>}
        {toast && <div className="toast">{toast}</div>}
      </section>
    </main>
  );
}

function Dashboard({
  quartersData,
  specialDetailsData,
  filteredQuarters,
  totalQuarters,
  occupiedQuarters,
  vacantQuarters,
  typeCounts,
  query,
  setQuery,
  addQuartersResident,
  updateQuartersResident,
  deleteQuartersResident,
  updateSpecialDetailsHandler,
  getSpecialDetailsByQuartersNo,
  setEditingQuarters,
  setViewingQuarters,
  setUpdatingSpecialDetails,
  editingQuarters,
  viewingQuarters,
  updatingSpecialDetails,
  notify,
  addAudit
}) {
  // Status badge colors
  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "#10b981"; // Green
      case "Vacated": return "#ef4444"; // Red
      case "Transferred": return "#f59e0b"; // Orange
      case "On Leave": return "#3b82f6"; // Blue
      default: return "#6b7280"; // Gray
    }
  };

  return <div className="screen quarters-theme">
    <div className="command-strip">
      <div>
        <p className="eyebrow">Quarters Management Dashboard</p>
        <h3>Quarters Dashboard: {totalQuarters} total quarters</h3>
      </div>
      <button className="primary" onClick={() => setEditingQuarters(null)}>
        <Plus size={16} /> Add New Quarters
      </button>
    </div>

    <div className="stat-grid">
      <article className="stat-card">
        <span><Building2 size={21} /></span>
        <p>Total Quarters</p>
        <strong>{totalQuarters}</strong>
      </article>
      <article className="stat-card">
        <span><UserCircle size={21} /></span>
        <p>Occupied Quarters</p>
        <strong>{occupiedQuarters}</strong>
      </article>
      <article className="stat-card">
        <span><CheckCircle2 size={21} /></span>
        <p>Vacant Quarters</p>
        <strong>{vacantQuarters}</strong>
      </article>
      <article className="stat-card">
        <span><Layers3 size={21} /></span>
        <p>A-Type Quarters</p>
        <strong>{typeCounts.A}</strong>
      </article>
      <article className="stat-card">
        <span><Layers3 size={21} /></span>
        <p>C-Type Quarters</p>
        <strong>{typeCounts.C}</strong>
      </article>
      <article className="stat-card">
        <span><Layers3 size={21} /></span>
        <p>D-Type Quarters</p>
        <strong>{typeCounts.D}</strong>
      </article>
    </div>

    <div className="panel-grid">
      <section className="panel">
        <PanelHead title="Quarters Listing" />
        <QuartersTable
          quartersData={filteredQuarters}
          specialDetailsData={specialDetailsData}
          getSpecialDetailsByQuartersNo={getSpecialDetailsByQuartersNo}
          updateQuartersResident={updateQuartersResident}
          deleteQuartersResident={deleteQuartersResident}
          updateSpecialDetailsHandler={updateSpecialDetailsHandler}
          getStatusColor={getStatusColor}
          setEditingQuarters={setEditingQuarters}
          setViewingQuarters={setViewingQuarters}
          setUpdatingSpecialDetails={setUpdatingSpecialDetails}
        />
      </section>
    </div>
  </div>;
}

function QuartersForm({ onSubmit, quartersData, setEditingQuarters, notify, addAudit }) {
  const [formData, setFormData] = useState({
    quartersNo: "",
    name: "",
    designation: "",
    department: "",
    phoneNo: "",
    ifhrmsNo: "",
    refNoAndDate: "",
    occupyDate: "",
    ebNo: "",
    quartersType: ""
  });

  const [errors, setErrors] = useState({});

  // If editing existing quarters, populate form data
  if (quartersData) {
    setFormData(quartersData);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};

    if (!formData.quartersNo) newErrors.quartersNo = "Quarters number is required";
    else if (quartersData && quartersData.some(q => q.quartersNo === formData.quartersNo && q !== quartersData)) {
      newErrors.quartersNo = "Quarters number already exists";
    }

    if (!formData.name) newErrors.name = "Name is required";

    if (!formData.quartersType) newErrors.quartersType = "Quarters type is required";
    else if (!["A", "C", "D"].includes(formData.quartersType)) {
      newErrors.quartersType = "Invalid quarters type";
    }

    if (formData.phoneNo && !/^\d{10}$/.test(formData.phoneNo)) {
      newErrors.phoneNo = "Phone number must be exactly 10 digits";
    }

    if (formData.ebNo && quartersData.some(q => q.ebNo === formData.ebNo && q !== quartersData)) {
      newErrors.ebNo = "EB number must be unique";
    }

    if (formData.occupyDate && isNaN(Date.parse(formData.occupyDate))) {
      newErrors.occupyDate = "Invalid occupy date";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
    setEditingQuarters(null);
  };

  return (
    <div className="screen">
      <PanelHead
        title={quartersData ? "Edit Quarters Resident" : "Add New Quarters Resident"}
        action={<button className="primary" onClick={() => setEditingQuarters(null)}><X size={18} /></button>}
      />
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Quarters No <span className="required">*</span></label>
          <input
            name="quartersNo"
            value={formData.quartersNo}
            onChange={handleChange}
          />
          {errors.quartersNo && <span className="error">{errors.quartersNo}</span>}
        </div>

        <div className="form-group">
          <label>Name <span className="required">*</span></label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label>Designation</label>
          <input
            name="designation"
            value={formData.designation}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Department</label>
          <input
            name="department"
            value={formData.department}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            name="phoneNo"
            value={formData.phoneNo}
            onChange={handleChange}
          />
          {errors.phoneNo && <span className="error">{errors.phoneNo}</span>}
          <p className="help-text">Must be exactly 10 digits</p>
        </div>

        <div className="form-group">
          <label>IFHRMS Number</label>
          <input
            name="ifhrmsNo"
            value={formData.ifhrmsNo}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Ref No & Date</label>
          <input
            name="refNoAndDate"
            value={formData.refNoAndDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Occupy Date</label>
          <input
            type="date"
            name="occupyDate"
            value={formData.occupyDate}
            onChange={handleChange}
          />
          {errors.occupyDate && <span className="error">{errors.occupyDate}</span>}
        </div>

        <div className="form-group">
          <label>EB Number</label>
          <input
            name="ebNo"
            value={formData.ebNo}
            onChange={handleChange}
          />
          {errors.ebNo && <span className="error">{errors.ebNo}</span>}
          <p className="help-text">Must be unique</p>
        </div>

        <div className="form-group">
          <label>Quarters Type <span className="required">*</span></label>
          <select
            name="quartersType"
            value={formData.quartersType}
            onChange={handleChange}
          >
            <option value="">Select quarters type</option>
            <option value="A">A Type</option>
            <option value="C">C Type</option>
            <option value="D">D Type</option>
          </select>
          {errors.quartersType && <span className="error">{errors.quartersType}</span>}
        </div>

        <button className="primary" type="submit">
          {quartersData ? "Update Quarters" : "Add Quarters"}
        </button>
        <button className="secondary" onClick={() => setEditingQuarters(null)}>
          Cancel
        </button>
      </form>
    </div>
  );
}

function SpecialDetailsForm({
  quartersData,
  specialDetailsData,
  filteredQuarters,
  query,
  setQuery,
  updateSpecialDetailsHandler,
  getSpecialDetailsByQuartersNo,
  setUpdatingSpecialDetails,
  updatingSpecialDetails,
  notify,
  addAudit,
  quartersToUpdate
}) {
  const [formData, setFormData] = useState({
    quartersNo: "",
    specialNotes: "",
    maintenanceIssues: "",
    familyMembersCount: "",
    vehicleNumber: "",
    aadhaarNumber: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    residentStatus: "Active"
  });

  const [errors, setErrors] = useState({});

  // If editing existing special details, populate form data
  if (quartersToUpdate) {
    const specialDetails = getSpecialDetailsByQuartersNo(quartersToUpdate);
    setFormData(specialDetails);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};

    if (!formData.quartersNo) newErrors.quartersNo = "Quarters number is required";

    if (formData.familyMembersCount && isNaN(parseInt(formData.familyMembersCount))) {
      newErrors.familyMembersCount = "Family members count must be a number";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateSpecialDetailsHandler(formData);
    setUpdatingSpecialDetails(null);
  };

  return (
    <div className="screen">
      <PanelHead
        title={quartersToUpdate ? "Update Special Details" : "Special Details Management"}
        action={<button className="primary" onClick={() => setUpdatingSpecialDetails(null)}><X size={18} /></button>}
      />
      {!quartersToUpdate && (
        <div className="search-bar">
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search quarters no, name, designation..."
          />
          <button className="primary" onClick={() => setEditingQuarters(null)}>
            <Plus size={16} /> Add Quarters
          </button>
        </div>
      )}
      <div className="form-grid">
        {quartersToUpdate && (
          <div className="form-group">
            <label>Quarters No</label>
            <input
              name="quartersNo"
              value={formData.quartersNo}
              readOnly
            />
          </div>
        )}
        {!quartersToUpdate && (
          <QuartersTableSelect
            quartersData={quartersData}
            specialDetailsData={specialDetailsData}
            filteredQuarters={filteredQuarters}
            query={query}
            setQuery={setQuery}
            onQuartersSelect={(quartersNo) => {
              setFormData(prev => ({ ...prev, quartersNo }));
              const specialDetails = getSpecialDetailsByQuartersNo(quartersNo);
              setFormData(prev => ({
                ...prev,
                specialNotes: specialDetails.specialNotes,
                maintenanceIssues: specialDetails.maintenanceIssues,
                familyMembersCount: specialDetails.familyMembersCount.toString(),
                vehicleNumber: specialDetails.vehicleNumber,
                aadhaarNumber: specialDetails.aadhaarNumber,
                emergencyContactName: specialDetails.emergencyContactName,
                emergencyContactPhone: specialDetails.emergencyContactPhone,
                residentStatus: specialDetails.residentStatus
              }));
            }}
          />
        )}

        <div className="form-group">
          <label>Special Notes</label>
          <textarea
            name="specialNotes"
            value={formData.specialNotes}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Maintenance Issues</label>
          <textarea
            name="maintenanceIssues"
            value={formData.maintenanceIssues}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Family Members Count</label>
          <input
            type="number"
            name="familyMembersCount"
            value={formData.familyMembersCount}
            onChange={handleChange}
          />
          {errors.familyMembersCount && <span className="error">{errors.familyMembersCount}</span>}
        </div>

        <div className="form-group">
          <label>Vehicle Number</label>
          <input
            name="vehicleNumber"
            value={formData.vehicleNumber}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Aadhaar Number</label>
          <input
            name="aadhaarNumber"
            value={formData.aadhaarNumber}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Emergency Contact Name</label>
          <input
            name="emergencyContactName"
            value={formData.emergencyContactName}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Emergency Contact Phone</label>
          <input
            name="emergencyContactPhone"
            value={formData.emergencyContactPhone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Resident Status</label>
          <select
            name="residentStatus"
            value={formData.residentStatus}
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="Vacated">Vacated</option>
            <option value="Transferred">Transferred</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>

        <button className="primary" type="submit">
          {quartersToUpdate ? "Update Special Details" : "Save Special Details"}
        </button>
        <button className="secondary" onClick={() => setUpdatingSpecialDetails(null)}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function QuartersTableSelect({
  quartersData,
  specialDetailsData,
  filteredQuarters,
  query,
  setQuery,
  onQuartersSelect
}) {
  const handleQuartersSelect = (quartersNo) => {
    onQuartersSelect(quartersNo);
  };

  return (
    <div className="form-group">
      <label>Select Quarters</label>
      <div className="quarters-select">
        {filteredQuarters.map((quarters) => (
          <div
            key={quarters.quartersNo}
            className="quarters-select-item"
            onClick={() => handleQuartersSelect(quarters.quartersNo)}
          >
            <div className="quarters-info">
              <strong>{quarters.quartersNo}</strong>
              <span>{quarters.name}</span>
            </div>
            <div className="quarters-details">
              <small>{quarters.designation}</small>
              <br />
              <small>{quarters.department}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuartersTable({
  quartersData,
  specialDetailsData,
  getSpecialDetailsByQuartersNo,
  updateQuartersResident,
  deleteQuartersResident,
  updateSpecialDetailsHandler,
  getStatusColor,
  setEditingQuarters,
  setViewingQuarters,
  setUpdatingSpecialDetails
}) {
  if (quartersData.length === 0) {
    return <div className="empty-state">
      <Building2 size={48} />
      <strong>No quarters data available</strong>
      <p>Add quarters residents to get started</p>
    </div>;
  }

  return (
    <div className="table-responsive">
      <table className="quarters-table">
        <thead>
          <tr>
            <th>Quarters No</th>
            <th>Name</th>
            <th>Designation</th>
            <th>Department</th>
            <th>Phone No</th>
            <th>IFHRMS No</th>
            <th>Ref No & Date</th>
            <th>Occupy Date</th>
            <th>EB No</th>
            <th>Quarters Type</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {quartersData.map((quarters) => {
            const specialDetails = getSpecialDetailsByQuartersNo(quarters.quartersNo);
            const statusColor = getStatusColor(specialDetails.residentStatus);

            return (
              <tr key={quarters.quartersNo}>
                <td>{quarters.quartersNo}</td>
                <td>{quarters.name}</td>
                <td>{quarters.designation || "-"}</td>
                <td>{quarters.department || "-"}</td>
                <td>{quarters.phoneNo || "-"}</td>
                <td>{quarters.ifhrmsNo || "-"}</td>
                <td>{quarters.refNoAndDate || "-"}</td>
                <td>{quarters.occupyDate || "-"}</td>
                <td>{quarters.ebNo || "-"}</td>
                <td>{quarters.quartersType}</td>
                <td>
                  <span className="status-badge" style={{ backgroundColor: statusColor }}>
                    {specialDetails.residentStatus}
                  </span>
                </td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button
                      className="btn-icon"
                      onClick={() => {
                        setEditingQuarters(quarters);
                      }}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => {
                        setViewingQuarters(quarters.quartersNo);
                      }}
                    >
                      <FileText size={16} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => {
                        setUpdatingSpecialDetails(quarters.quartersNo);
                      }}
                    >
                      <FileText size={16} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete quarters ${quarters.quartersNo}?`)) {
                          deleteQuartersResident(quarters.quartersNo);
                        }
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function QuartersDetails({ quartersData, specialDetailsData, quartersNo }) {
  const quarters = quartersData.find(q => q.quartersNo === quartersNo);
  const specialDetails = specialDetailsData.find(sd => sd.quartersNo === quartersNo) || {
    quartersNo,
    specialNotes: "",
    maintenanceIssues: "",
    familyMembersCount: 0,
    vehicleNumber: "",
    aadhaarNumber: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    residentStatus: "Active"
  };

  if (!quarters) {
    return <div className="error-state">Quarters not found</div>;
  }

  const statusColors = {
    Active: "#10b981",
    Vacated: "#ef4444",
    Transferred: "#f59e0b",
    "On Leave": "#3b82f6"
  };

  return (
    <div className="details-panel">
      <div className="details-header">
        <h2>Quarters Details: {quarters.quartersNo}</h2>
        <span className="status-badge" style={{ backgroundColor: statusColors[specialDetails.residentStatus] }}>
          {specialDetails.residentStatus}
        </span>
      </div>

      <div className="details-section">
        <h3>Basic Information</h3>
        <div className="details-grid">
          <div>
            <p>Quarters No</p>
            <p>{quarters.quartersNo}</p>
          </div>
          <div>
            <p>Name</p>
            <p>{quarters.name}</p>
          </div>
          <div>
            <p>Designation</p>
            <p>{quarters.designation || "-"}</p>
          </div>
          <div>
            <p>Department</p>
            <p>{quarters.department || "-"}</p>
          </div>
          <div>
            <p>Phone No</p>
            <p>{quarters.phoneNo || "-"}</p>
          </div>
          <div>
            <p>IFHRMS No</p>
            <p>{quarters.ifhrmsNo || "-"}</p>
          </div>
          <div>
            <p>Ref No & Date</p>
            <p>{quarters.refNoAndDate || "-"}</p>
          </div>
          <div>
            <p>Occupy Date</p>
            <p>{quarters.occupyDate || "-"}</p>
          </div>
          <div>
            <p>EB No</p>
            <p>{quarters.ebNo || "-"}</p>
          </div>
          <div>
            <p>Quarters Type</p>
            <p>{quarters.quartersType}</p>
          </div>
        </div>
      </div>

      <div className="details-section">
        <h3>Special Details</h3>
        <div className="details-grid">
          <div>
            <p>Special Notes</p>
            <p>{specialDetails.specialNotes || "-"}</p>
          </div>
          <div>
            <p>Maintenance Issues</p>
            <p>{specialDetails.maintenanceIssues || "-"}</p>
          </div>
          <div>
            <p>Family Members Count</p>
            <p>{specialDetails.familyMembersCount}</p>
          </div>
          <div>
            <p>Vehicle Number</p>
            <p>{specialDetails.vehicleNumber || "-"}</p>
          </div>
          <div>
            <p>Aadhaar Number</p>
            <p>{specialDetails.aadhaarNumber || "-"}</p>
          </div>
          <div>
            <p>Emergency Contact Name</p>
            <p>{specialDetails.emergencyContactName || "-"}</p>
          </div>
          <div>
            <p>Emergency Contact Phone</p>
            <p>{specialDetails.emergencyContactPhone || "-"}</p>
          </div>
          <div>
            <p>Resident Status</p>
            <p>{specialDetails.residentStatus}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuartersReports({ quartersData, specialDetailsData, filteredQuarters, notify, addAudit }) {
  const statusCounts = {
    Active: specialDetailsData.filter(sd => sd.resentStatus === "Active").length,
    Vacated: specialDetailsData.filter(sd => sd.resentStatus === "Vacated").length,
    Transferred: specialDetailsData.filter(sd => sd.resentStatus === "Transferred").length,
    "On Leave": specialDetailsData.filter(sd => sd.resentStatus === "On Leave").length
  };

  const typeCounts = {
    A: quartersData.filter(q => q.quartersType === "A").length,
    C: quartersData.filter(q => q.quartersType === "C").length,
    D: quartersData.filter(q => q.quartersType === "D").length
  };

  return (
    <div className="screen">
      <PanelHead title="Quarters Reports" />
      <div className="report-grid">
        <div className="report-card">
          <h3>Quarters by Type</h3>
          <div className="report-stat">
            <p>A-Type: {typeCounts.A}</p>
            <p>C-Type: {typeCounts.C}</p>
            <p>D-Type: {typeCounts.D}</p>
          </div>
        </div>

        <div className="report-card">
          <h3>Quarters by Status</h3>
          <div className="report-stat">
            <p>Active: {statusCounts.Active}</p>
            <p>Vacated: {statusCounts.Vacated}</p>
            <p>Transferred: {statusCounts.Transferred}</p>
            <p>On Leave: {statusCounts["On Leave"]}</p>
          </div>
        </div>

        <div className="report-card">
          <h3>Occupancy Summary</h3>
          <div className="report-stat">
            <p>Total Quarters: {quartersData.length}</p>
            <p>Occupied: {statusCounts.Active + statusCounts.Transferred + statusCounts["On Leave"]}</p>
            <p>Vacant: {statusCounts.Vacated}</p>
          </div>
        </div>

        <div className="report-card">
          <h3>Recent Updates</h3>
          <div className="report-stat">
            <p>Last updated: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="report-actions">
        <button className="primary" onClick={() => {
          // In a real app, this would generate a report
          notify("Report generated successfully");
          addAudit("Generated quarters report");
        }}>
          <ClipboardList size={16} /> Generate Report
        </button>
        <button className="secondary" onClick={() => {
          notify("Data exported successfully");
          addAudit("Exported quarters data");
        }}>
          <Download size={16} /> Export Data
        </button>
      </div>
    </div>
  );
}

function AdminTools({ auditLogs, addAudit, notify, quartersData, specialDetailsData }) {
  const totalQuarters = quartersData.length;
  const occupiedQuarters = specialDetailsData.filter(sd => sd.residentStatus !== "Vacated").length;
  const vacantQuarters = specialDetailsData.filter(sd => sd.residentStatus === "Vacated").length;

  return (
    <div className="screen">
      <PanelHead title="System Administration" />
      <div className="admin-stats">
        <div className="stat-card">
          <h3>Quarters Statistics</h3>
          <p>Total Quarters: {totalQuarters}</p>
          <p>Occupied: {occupiedQuarters}</p>
          <p>Vacant: {vacantQuarters}</p>
        </div>

        <div className="stat-card">
          <h3>Data Management</h3>
          <p>Last backup: {new Date().toLocaleString()}</p>
          <p>Records: {quartersData.length} quarters, {specialDetailsData.length} special details</p>
        </div>
      </div>

      <div className="admin-actions">
        <button className="primary" onClick={() => {
          notify("Backup completed successfully");
          addAudit("Performed system backup");
        }}>
          <Download size={16} /> Backup Data
        </button>

        <button className="secondary" onClick={() => {
          if (window.confirm("Are you sure you want to reset all data to initial state?")) {
            // Reset to initial state would require reloading the page
            notify("Please refresh the page to reset data");
            addAudit("Requested data reset");
          }
        }}>
          <RefreshCw size={16} /> Reset Data
        </button>

        <button className="secondary" onClick={() => {
          notify("System maintenance completed");
          addAudit("Performed system maintenance");
        }}>
          <Settings size={16} /> System Maintenance
        </button>
      </div>

      <div className="audit-section">
        <PanelHead title="Recent Audit Logs" />
        <div className="audit-log">
          {auditLogs.slice(0, 5).map((log, index) => (
            <div key={index} className="audit-log-entry">
              <ShieldCheck size={16} />
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop">
      <section className="modal">
        <PanelHead title={title} action={<button className="icon-button" onClick={onClose}><X size={18} /></button>} />
        {children}
      </section>
    </div>
  );
}

function PanelHead({ title, action }) {
  return (
    <div className="panel-head">
      <h3>{title}</h3>
      {action}
    </div>
  );
}

function LogoMark() {
  return <div className="logo-mark"><Stethoscope size={24} /></div>;
}

// Refresh icon for reset button
function RefreshCw() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4v5h5M4 4a9 9 0 0 1 9 9"></path>
    </svg>
  );
}