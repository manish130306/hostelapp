import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BedDouble, Building2, CheckCircle2, Download, Edit3, Eye, FileSpreadsheet,
  FileText, Home, Layers3, LogOut, Moon, Plus, Printer,
  RotateCcw, Search, ShieldCheck, Stethoscope, Sun, UserCircle, UserMinus,
  Users, X
} from "lucide-react";
import { jsPDF } from "jspdf";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from "recharts";
import "./styles.css";

const API = "/api";
const today = new Date().toISOString().slice(0, 10);
const quartersTypes = ["A", "C", "D"];
const pageSizes = [10, 25, 50];
const emptyHostelResident = {
  rollNumber: "",
  name: "",
  courseYear: "",
  gender: "Male",
  hostelName: "Boys Hostel",
  roomNumber: "",
  joiningDate: today,
  contact: "",
  parentName: "",
  parentContact: ""
};
const emptyQuarter = {
  quartersNo: "",
  name: "",
  entryDate: "",
  designation: "",
  department: "",
  phoneNo: "",
  ifhrmsNo: "",
  refNoAndDate: "",
  occupyDate: "",
  ebNo: "",
  quartersType: "A"
};
function App() {
  const [token, setToken] = useState(() => localStorage.getItem("nmc_admin_token") || "");
  const [dark, setDark] = useState(() => localStorage.getItem("nmc_theme") === "dark");
  const [active, setActive] = useState("Hostel Dashboard");
  const [query, setQuery] = useState("");
  const [hostelFilters, setHostelFilters] = useState({
    hostelType: [], floor: [], roomNumber: [], occupancyStatus: [], department: [], academicYear: [], gender: [], vacatingStatus: [], sortBy: "name"
  });
  const [quartersFilters, setQuartersFilters] = useState({
    quartersType: [], department: [], designation: [], occupancy: [], ifhrmsNo: [], sortBy: "quartersNo"
  });
  const [hostelPage, setHostelPage] = useState({ page: 1, size: 10 });
  const [quartersPage, setQuartersPage] = useState({ page: 1, size: 10 });
  const [state, setState] = useState({
    hostels: [],
    rooms: [],
    students: [],
    history: [],
    auditLogs: [],
    quartersResidents: [],
    dashboard: {}
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState(null);

  const authed = Boolean(token);

  useEffect(() => {
    if (authed) loadBootstrap();
  }, [authed]);

  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Request failed");
    return data;
  }

  async function loadBootstrap() {
    setLoading(true);
    try {
      const data = await request("/bootstrap");
      setState({
        hostels: data.hostels || [],
        rooms: data.rooms || [],
        students: data.students || [],
        history: data.history || [],
        auditLogs: data.auditLogs || [],
        quartersResidents: data.quartersResidents || [],
        dashboard: data.dashboard || {}
      });
    } catch (error) {
      notify(error.message);
      if (error.message.includes("token")) logout();
    } finally {
      setLoading(false);
    }
  }

  async function login(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const data = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.get("username"), password: form.get("password") })
      }).then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || "Login failed");
        return payload;
      });
      localStorage.setItem("nmc_admin_token", data.token);
      setToken(data.token);
      notify("Signed in successfully");
    } catch (error) {
      notify(error.message);
    }
  }

  function logout() {
    localStorage.removeItem("nmc_admin_token");
    setToken("");
  }

  function notify(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2800);
  }

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("nmc_theme", next ? "dark" : "light");
  }

  async function saveHostelResident(payload, originalRollNumber) {
    try {
      const path = originalRollNumber ? `/students/${encodeURIComponent(originalRollNumber)}` : "/students";
      const method = originalRollNumber ? "PUT" : "POST";
      await request(path, { method, body: JSON.stringify(payload) });
      setModal(null);
      notify(originalRollNumber ? "Hostel resident updated" : "Hostel resident added");
      await loadBootstrap();
    } catch (error) {
      notify(error.message);
    }
  }

  async function vacateResident(student, payload) {
    try {
      await request(`/students/${encodeURIComponent(student.rollNumber)}/vacate`, { method: "POST", body: JSON.stringify(payload) });
      setModal(null);
      notify(`${student.name} vacated ${student.roomNumber}`);
      await loadBootstrap();
    } catch (error) {
      notify(error.message);
    }
  }

  async function transferResident(student, payload) {
    try {
      await request(`/students/${encodeURIComponent(student.rollNumber)}/transfer`, { method: "POST", body: JSON.stringify(payload) });
      setModal(null);
      notify(`${student.name} transferred`);
      await loadBootstrap();
    } catch (error) {
      notify(error.message);
    }
  }

  async function saveQuarter(payload, originalQuartersNo) {
    try {
      const path = originalQuartersNo ? `/quarters/${encodeURIComponent(originalQuartersNo)}` : "/quarters";
      const method = originalQuartersNo ? "PUT" : "POST";
      await request(path, { method, body: JSON.stringify(payload) });
      setModal(null);
      notify(originalQuartersNo ? "Quarters resident updated" : "Quarters resident added");
      await loadBootstrap();
    } catch (error) {
      notify(error.message);
    }
  }

  async function deleteQuarter(quartersNo) {
    if (!window.confirm(`Delete quarters resident ${quartersNo}?`)) return;
    try {
      await request(`/quarters/${encodeURIComponent(quartersNo)}`, { method: "DELETE" });
      notify("Quarters resident deleted");
      await loadBootstrap();
    } catch (error) {
      notify(error.message);
    }
  }

  const quartersRows = useMemo(() => {
    const term = query.toLowerCase();
    const includes = (values, value) => !values.length || values.includes(value || "");
    return state.quartersResidents.filter((resident) => {
      const haystack = [
        resident.name, resident.quartersNo, resident.ifhrmsNo, resident.phoneNo,
        resident.department, resident.designation, resident.ebNo, resident.refNoAndDate, resident.entryDate
      ].join(" ").toLowerCase();
      const occupied = Boolean(resident.name);
      return (!term || haystack.includes(term)) &&
        includes(quartersFilters.quartersType, resident.quartersType) &&
        includes(quartersFilters.department, resident.department) &&
        includes(quartersFilters.designation, resident.designation) &&
        includes(quartersFilters.ifhrmsNo, resident.ifhrmsNo) &&
        (!quartersFilters.occupancy.length || quartersFilters.occupancy.includes(occupied ? "Occupied" : "Vacant"));
    }).sort((a, b) => String(a[quartersFilters.sortBy] || "").localeCompare(String(b[quartersFilters.sortBy] || ""), undefined, { numeric: true }));
  }, [state.quartersResidents, query, quartersFilters]);

  const hostelResidents = useMemo(() => {
    const term = query.toLowerCase();
    const includes = (values, value) => !values.length || values.includes(value || "");
    return state.students.filter((student) => {
      const room = state.rooms.find((item) => item.roomNumber === student.roomNumber) || {};
      const haystack = [student.rollNumber, student.name, student.hostelName, student.roomNumber, student.courseYear, student.contact, student.department].join(" ").toLowerCase();
      return (!term || haystack.includes(term)) &&
        includes(hostelFilters.hostelType, student.hostelName) &&
        includes(hostelFilters.floor, room.floor) &&
        includes(hostelFilters.roomNumber, student.roomNumber) &&
        includes(hostelFilters.department, student.department) &&
        includes(hostelFilters.academicYear, student.courseYear) &&
        includes(hostelFilters.gender, student.gender) &&
        includes(hostelFilters.vacatingStatus, student.status) &&
        (!hostelFilters.occupancyStatus.length || hostelFilters.occupancyStatus.includes(room.vacancy === 0 ? "Full" : room.occupied > 0 ? "Partially Occupied" : "Vacant"));
    }).sort((a, b) => String(a[hostelFilters.sortBy] || "").localeCompare(String(b[hostelFilters.sortBy] || ""), undefined, { numeric: true }));
  }, [state.students, state.rooms, query, hostelFilters]);

  const hostelStats = useMemo(() => makeHostelStats(state.hostels, state.rooms, state.students), [state.hostels, state.rooms, state.students]);
  const quartersStats = useMemo(() => makeQuartersStats(state.quartersResidents), [state.quartersResidents]);

  if (!authed) {
    return (
      <main className={dark ? "dark" : ""}>
        <section className="login-shell">
          <div className="login-hero">
            <LogoMark />
            <p className="eyebrow">Namakkal Medical College</p>
            <h1>Hostel & Quarters Management</h1>
            <p>Separate Hostel and Quarters modules with shared secure administration, live occupancy, resident records, and manual CRUD workflows.</p>
            <div className="hero-metrics"><span><ShieldCheck size={18} />Admin Access</span><span><Building2 size={18} />Two Independent Modules</span></div>
          </div>
          <form className="login-card" onSubmit={login}>
            <div className="brand-row"><LogoMark /><div><strong>Administration</strong><small>Secure login</small></div></div>
            <label>Username<input name="username" placeholder="admin" required /></label>
            <label>Password<input name="password" type="password" placeholder="admin123" required /></label>
            <button className="primary" type="submit">Secure Login</button>
            <p className="hint">Default credentials: admin / admin123</p>
          </form>
          {toast && <div className="toast">{toast}</div>}
        </section>
      </main>
    );
  }

  const nav = [
    ["Hostel Dashboard", Home],
    ["Hostel Rooms", BedDouble],
    ["Hostel Residents", Users],
    ["Quarters Dashboard", Building2],
    ["Quarters Residents", UserCircle],
    ["Letters", FileText],
    ["Excel Exports", FileSpreadsheet]
  ];

  return (
    <main className={dark ? "app dark" : "app"}>
      <aside className="sidebar">
        <div className="brand-row"><LogoMark /><div><strong>Namakkal Medical College</strong><small>Hostel & Quarters</small></div></div>
        <nav>{nav.map(([item, Icon]) => <button key={item} className={active === item ? "nav active" : "nav"} onClick={() => setActive(item)}><Icon size={18} />{item}</button>)}</nav>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <div><p className="eyebrow">Administration Workspace</p><h2>{active}</h2></div>
          <div className="top-actions">
            <div className="search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search records" /></div>
            <button className="profile-pill"><UserCircle size={18} />Admin</button>
            <button className="icon-button" onClick={toggleTheme} title="Toggle theme">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button className="icon-button" onClick={logout} title="Sign out"><LogOut size={18} /></button>
          </div>
        </header>

        {loading && <div className="notice">Loading latest records...</div>}
        {active === "Hostel Dashboard" && <HostelDashboard stats={hostelStats} rooms={state.rooms} students={hostelResidents} onAdd={() => setModal({ type: "hostel-form" })} />}
        {active === "Hostel Rooms" && <HostelRooms rooms={state.rooms} hostels={state.hostels} onTransfer={(room) => setModal({ type: "transfer-room", room })} />}
        {active === "Hostel Residents" && <HostelResidents students={hostelResidents} allStudents={state.students} rooms={state.rooms} filters={hostelFilters} setFilters={setHostelFilters} pageState={hostelPage} setPageState={setHostelPage} onAdd={() => setModal({ type: "hostel-form" })} onEdit={(student) => setModal({ type: "hostel-form", student })} onVacate={(student) => setModal({ type: "vacate", student })} onTransfer={(student) => setModal({ type: "transfer", student })} onLetter={(student) => setModal({ type: "vacating-letter", student })} />}
        {active === "Quarters Dashboard" && <QuartersDashboard stats={quartersStats} rows={quartersRows} onAdd={() => setModal({ type: "quarter-form" })} />}
        {active === "Quarters Residents" && <QuartersResidents rows={quartersRows} allRows={state.quartersResidents} filters={quartersFilters} setFilters={setQuartersFilters} pageState={quartersPage} setPageState={setQuartersPage} onAdd={() => setModal({ type: "quarter-form" })} onEdit={(resident) => setModal({ type: "quarter-form", resident })} onView={(resident) => setModal({ type: "quarter-details", resident })} onDelete={deleteQuarter} />}
        {active === "Letters" && <LetterGenerator students={state.students} quartersResidents={state.quartersResidents} onPreview={(letter) => setModal({ type: "letter-preview", letter })} notify={notify} />}
        {active === "Excel Exports" && <ExcelExports students={hostelResidents} allStudents={state.students} rooms={state.rooms} hostels={state.hostels} quartersRows={quartersRows} allQuarters={state.quartersResidents} notify={notify} />}

        {modal?.type === "hostel-form" && <Modal title={modal.student ? "Edit Hostel Resident" : "Add Hostel Resident"} onClose={() => setModal(null)}><HostelResidentForm student={modal.student} rooms={state.rooms} hostels={state.hostels} onSubmit={saveHostelResident} /></Modal>}
        {modal?.type === "vacate" && <Modal title="Vacate Room" onClose={() => setModal(null)}><VacateForm student={modal.student} onSubmit={vacateResident} /></Modal>}
        {modal?.type === "transfer" && <Modal title="Transfer Resident" onClose={() => setModal(null)}><TransferForm student={modal.student} rooms={state.rooms} onSubmit={transferResident} /></Modal>}
        {modal?.type === "quarter-form" && <Modal title={modal.resident ? "Edit Quarters Resident" : "Add New Resident"} onClose={() => setModal(null)}><QuarterForm resident={modal.resident} existing={state.quartersResidents} onSubmit={saveQuarter} /></Modal>}
        {modal?.type === "quarter-details" && <Modal title="Quarters Details" onClose={() => setModal(null)}><QuartersDetails resident={modal.resident} /></Modal>}
        {modal?.type === "vacating-letter" && <Modal title="Vacating Letter Generator" onClose={() => setModal(null)}><VacatingLetterForm student={modal.student} onPreview={(letter) => setModal({ type: "letter-preview", letter })} /></Modal>}
        {modal?.type === "letter-preview" && <Modal title="Letter Preview" onClose={() => setModal(null)}><LetterPreview letter={modal.letter} /></Modal>}
        {toast && <div className="toast">{toast}</div>}
      </section>
    </main>
  );
}

function makeHostelStats(hostels, rooms, students) {
  const active = students.filter((item) => item.status === "active");
  const occupiedRooms = rooms.filter((room) => room.occupied > 0).length;
  const capacity = rooms.reduce((sum, room) => sum + Number(room.capacity || 0), 0);
  const floorWise = Object.values(rooms.reduce((acc, room) => {
    acc[room.floor] ||= { name: room.floor, rooms: 0, residents: 0 };
    acc[room.floor].rooms += 1;
    acc[room.floor].residents += Number(room.occupied || 0);
    return acc;
  }, {}));
  const hostelWise = hostels.map((hostel) => {
    const hostelRooms = rooms.filter((room) => room.hostelName === hostel.name);
    return { name: hostel.name, rooms: hostelRooms.length, residents: hostelRooms.reduce((sum, room) => sum + Number(room.occupied || 0), 0) };
  });
  return {
    totalRooms: rooms.length,
    occupiedRooms,
    vacantRooms: rooms.length - occupiedRooms,
    totalResidents: active.length,
    capacity,
    floorWise,
    hostelWise,
    genderWise: [
      { name: "Male", value: active.filter((item) => item.gender === "Male").length },
      { name: "Female", value: active.filter((item) => item.gender === "Female").length }
    ]
  };
}

function makeQuartersStats(residents) {
  const counts = { A: 0, C: 0, D: 0 };
  let vacant = 0;
  residents.forEach((resident) => {
    counts[resident.quartersType] += 1;
    if (!resident.name) vacant += 1;
  });
  return {
    total: residents.length,
    occupied: residents.length - vacant,
    vacant,
    active: residents.length - vacant,
    vacated: vacant,
    counts
  };
}

function HostelDashboard({ stats, rooms, students, onAdd }) {
  return (
    <div className="screen">
      <div className="command-strip"><div><p className="eyebrow">Hostel Management Module</p><h3>Accommodation and occupancy overview</h3></div><button className="primary" onClick={onAdd}><Plus size={16} /> Add Resident</button></div>
      <div className="stat-grid">
        <Stat icon={<BedDouble />} label="Total Rooms" value={stats.totalRooms} />
        <Stat icon={<CheckCircle2 />} label="Occupied Rooms" value={stats.occupiedRooms} />
        <Stat icon={<Home />} label="Vacant Rooms" value={stats.vacantRooms} />
        <Stat icon={<Users />} label="Total Residents" value={stats.totalResidents} />
      </div>
      <div className="panel-grid">
        <ChartPanel title="Floor-wise Occupancy" data={stats.floorWise} dataKey="residents" />
        <ChartPanel title="Hostel-wise Occupancy" data={stats.hostelWise} dataKey="residents" />
        <section className="panel">
          <PanelHead title="Gender-wise Statistics" />
          <ResponsiveContainer width="100%" height={240}><PieChart><Pie data={stats.genderWise} dataKey="value" nameKey="name" outerRadius={84}>{stats.genderWise.map((_, index) => <Cell key={index} fill={["#0d8f8d", "#f59e0b"][index]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
        </section>
      </div>
      <section className="panel"><PanelHead title="Recent Hostel Residents" /><HostelTable students={students.slice(0, 8)} /></section>
    </div>
  );
}

function HostelRooms({ rooms }) {
  return (
    <div className="screen">
      <div className="room-grid">
        {rooms.map((room) => {
          const status = room.occupied === 0 ? "vacant" : room.vacancy === 0 ? "full" : "partial";
          return (
            <article className={`room-card ${status}`} key={room.id || room.roomNumber}>
              <div><h3>{room.roomNumber}</h3><p>{room.hostelName} • {room.floor}</p></div>
              <div className="room-meta"><span>{room.capacity} capacity</span><span>{room.occupied || 0} occupied</span><span>{room.vacancy} vacant</span></div>
              {(room.students || []).map((student) => <p className="student-line" key={student.rollNumber}>{student.name} ({student.rollNumber})</p>)}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function HostelResidents({ students, allStudents, rooms, filters, setFilters, pageState, setPageState, onAdd, onEdit, onVacate, onTransfer, onLetter }) {
  const paged = paginate(students, pageState);
  return (
    <section className="screen">
      <div className="command-strip"><PanelHead title="Hostel Residents" /><button className="primary" onClick={onAdd}><Plus size={16} /> Add Resident</button></div>
      <HostelFilterPanel rows={allStudents} rooms={rooms} filters={filters} setFilters={(next) => { setFilters(next); setPageState({ ...pageState, page: 1 }); }} />
      <HostelTable students={paged.rows} rooms={rooms} onEdit={onEdit} onVacate={onVacate} onTransfer={onTransfer} onLetter={onLetter} />
      <Pagination total={students.length} pageState={pageState} setPageState={setPageState} />
    </section>
  );
}

function HostelTable({ students, onEdit, onVacate, onTransfer, onLetter }) {
  return (
    <div className="table-wrap"><table><thead><tr><th>Roll No</th><th>Name</th><th>Hostel</th><th>Room</th><th>Gender</th><th>Course/Year</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      {students.map((student) => <tr key={student.rollNumber}><td>{student.rollNumber}</td><td>{student.name}</td><td>{student.hostelName}</td><td>{student.roomNumber}</td><td>{student.gender}</td><td>{student.courseYear}</td><td><Badge tone={student.status === "active" ? "ok" : "danger"}>{student.status}</Badge></td><td><div className="row-actions">{onEdit && <button className="mini" onClick={() => onEdit(student)}><Edit3 size={14} />Edit</button>}{onLetter && <button className="mini" onClick={() => onLetter(student)}><FileText size={14} />Letter</button>}{onTransfer && student.status === "active" && <button className="mini" onClick={() => onTransfer(student)}><BedDouble size={14} />Transfer</button>}{onVacate && student.status === "active" && <button className="mini" onClick={() => onVacate(student)}><UserMinus size={14} />Vacate</button>}</div></td></tr>)}
      {!students.length && <tr><td colSpan="8">No hostel residents found.</td></tr>}
    </tbody></table></div>
  );
}

function QuartersDashboard({ stats, rows, onAdd }) {
  return (
    <div className="screen">
      <div className="command-strip"><div><p className="eyebrow">Quarters Management Module</p><h3>A, C and D type quarters analytics</h3></div><button className="primary" onClick={onAdd}><Plus size={16} /> Add New Resident</button></div>
      <div className="stat-grid">
        <Stat icon={<Building2 />} label="Total Quarters" value={stats.total} />
        <Stat icon={<UserCircle />} label="Occupied Quarters" value={stats.occupied} />
        <Stat icon={<Home />} label="Vacant Quarters" value={stats.vacant} />
        <Stat icon={<CheckCircle2 />} label="Active Residents" value={stats.active} />
        <Stat icon={<Layers3 />} label="A-Type Count" value={stats.counts.A} />
        <Stat icon={<Layers3 />} label="C-Type Count" value={stats.counts.C} />
        <Stat icon={<Layers3 />} label="D-Type Count" value={stats.counts.D} />
        <Stat icon={<UserMinus />} label="Vacant Quarters" value={stats.vacant} />
      </div>
      <section className="panel"><PanelHead title="Quarters Snapshot" /><QuartersTable rows={rows.slice(0, 10)} compact /></section>
    </div>
  );
}

function QuartersResidents({ rows, allRows, filters, setFilters, pageState, setPageState, onAdd, onEdit, onView, onDelete }) {
  const paged = paginate(rows, pageState);
  return (
    <div className="screen">
      <div className="command-strip"><PanelHead title="Quarters Residents" /><button className="primary" onClick={onAdd}><Plus size={16} /> Add New Resident</button></div>
      <QuartersFilterPanel rows={allRows} filters={filters} setFilters={(next) => { setFilters(next); setPageState({ ...pageState, page: 1 }); }} />
      <QuartersTable rows={paged.rows} onEdit={onEdit} onView={onView} onDelete={onDelete} />
      <Pagination total={rows.length} pageState={pageState} setPageState={setPageState} />
    </div>
  );
}

function QuartersTable({ rows, onEdit, onView, onDelete, compact }) {
  return (
    <div className="table-wrap"><table><thead><tr><th>Quarters No</th><th>Name</th><th>Entry Date</th><th>Designation</th><th>Department</th><th>Phone</th><th>IFHRMS</th><th>Ref No & Date</th><th>Occupy Date</th><th>EB No</th><th>Type</th>{!compact && <th>Actions</th>}</tr></thead><tbody>
      {rows.map((resident) => {
        return <tr key={resident.quartersNo}><td>{resident.quartersNo}</td><td>{resident.name}</td><td>{formatDate(resident.entryDate)}</td><td>{resident.designation || "-"}</td><td>{resident.department || "-"}</td><td>{resident.phoneNo || "-"}</td><td>{resident.ifhrmsNo || "-"}</td><td>{resident.refNoAndDate || "-"}</td><td>{formatDate(resident.occupyDate)}</td><td>{resident.ebNo || "-"}</td><td>{resident.quartersType}</td>{!compact && <td><div className="row-actions">{onView && <button className="mini" onClick={() => onView(resident)}><Eye size={14} />Details</button>}{onEdit && <button className="mini" onClick={() => onEdit(resident)}><Edit3 size={14} />Edit</button>}{onDelete && <button className="mini danger" onClick={() => onDelete(resident.quartersNo)}><X size={14} />Delete</button>}</div></td>}</tr>;
      })}
      {!rows.length && <tr><td colSpan={compact ? 11 : 12}>No quarters records found.</td></tr>}
    </tbody></table></div>
  );
}

function QuartersDetails({ resident }) {
  const fields = [
    ["Quarters No", resident.quartersNo],
    ["Name", resident.name],
    ["Entry Date", formatDate(resident.entryDate)],
    ["Designation", resident.designation],
    ["Department", resident.department],
    ["Phone Number", resident.phoneNo],
    ["IFHRMS Number", resident.ifhrmsNo],
    ["Ref No & Date", resident.refNoAndDate],
    ["Occupy Date", formatDate(resident.occupyDate)],
    ["EB Number", resident.ebNo],
    ["Quarters Type", `${resident.quartersType}-Type`]
  ];
  return <div className="details-grid">{fields.map(([label, value]) => <div key={label}><p>{label}</p><strong>{value || "-"}</strong></div>)}</div>;
}

function HostelFilterPanel({ rows, rooms, filters, setFilters }) {
  const roomByNo = new Map(rooms.map((room) => [room.roomNumber, room]));
  const option = (values) => [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
  const setMulti = (key, values) => setFilters({ ...filters, [key]: values });
  return (
    <section className="panel filter-panel">
      <PanelHead title="Hostel Filters" action={<button className="secondary" onClick={() => setFilters({ hostelType: [], floor: [], roomNumber: [], occupancyStatus: [], department: [], academicYear: [], gender: [], vacatingStatus: [], sortBy: "name" })}><RotateCcw size={15} /> Reset</button>} />
      <div className="filter-grid">
        <MultiSelect label="Hostel Type" values={filters.hostelType} options={option(rows.map((item) => item.hostelName))} onChange={(values) => setMulti("hostelType", values)} />
        <MultiSelect label="Floor" values={filters.floor} options={option(rows.map((item) => roomByNo.get(item.roomNumber)?.floor))} onChange={(values) => setMulti("floor", values)} />
        <MultiSelect label="Room Number" values={filters.roomNumber} options={option(rows.map((item) => item.roomNumber))} onChange={(values) => setMulti("roomNumber", values)} />
        <MultiSelect label="Occupancy Status" values={filters.occupancyStatus} options={["Vacant", "Partially Occupied", "Full"]} onChange={(values) => setMulti("occupancyStatus", values)} />
        <MultiSelect label="Department" values={filters.department} options={option(rows.map((item) => item.department))} onChange={(values) => setMulti("department", values)} />
        <MultiSelect label="Academic Year" values={filters.academicYear} options={option(rows.map((item) => item.courseYear))} onChange={(values) => setMulti("academicYear", values)} />
        <MultiSelect label="Gender" values={filters.gender} options={["Male", "Female"]} onChange={(values) => setMulti("gender", values)} />
        <MultiSelect label="Vacating Status" values={filters.vacatingStatus} options={["active", "vacated"]} onChange={(values) => setMulti("vacatingStatus", values)} />
        <label>Sort By<select value={filters.sortBy} onChange={(event) => setFilters({ ...filters, sortBy: event.target.value })}><option value="name">Name</option><option value="rollNumber">Roll Number</option><option value="roomNumber">Room Number</option><option value="courseYear">Academic Year</option></select></label>
      </div>
    </section>
  );
}

function QuartersFilterPanel({ rows, filters, setFilters }) {
  const option = (values) => [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
  const setMulti = (key, values) => setFilters({ ...filters, [key]: values });
  return (
    <section className="panel filter-panel">
      <PanelHead title="Quarters Filters" action={<button className="secondary" onClick={() => setFilters({ quartersType: [], department: [], designation: [], occupancy: [], ifhrmsNo: [], sortBy: "quartersNo" })}><RotateCcw size={15} /> Reset</button>} />
      <div className="filter-grid">
        <MultiSelect label="Quarters Type" values={filters.quartersType} options={quartersTypes} onChange={(values) => setMulti("quartersType", values)} />
        <MultiSelect label="Department" values={filters.department} options={option(rows.map((item) => item.department))} onChange={(values) => setMulti("department", values)} />
        <MultiSelect label="Designation" values={filters.designation} options={option(rows.map((item) => item.designation))} onChange={(values) => setMulti("designation", values)} />
        <MultiSelect label="Occupancy Status" values={filters.occupancy} options={["Occupied", "Vacant"]} onChange={(values) => setMulti("occupancy", values)} />
        <MultiSelect label="IFHRMS Number" values={filters.ifhrmsNo} options={option(rows.map((item) => item.ifhrmsNo))} onChange={(values) => setMulti("ifhrmsNo", values)} />
        <label>Sort By<select value={filters.sortBy} onChange={(event) => setFilters({ ...filters, sortBy: event.target.value })}><option value="quartersNo">Quarters No</option><option value="name">Name</option><option value="department">Department</option><option value="designation">Designation</option></select></label>
      </div>
    </section>
  );
}

function MultiSelect({ label, values, options, onChange }) {
  return (
    <label>{label}
      <select multiple value={values} onChange={(event) => onChange([...event.target.selectedOptions].map((option) => option.value))}>
        {options.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
    </label>
  );
}

function Pagination({ total, pageState, setPageState }) {
  const pages = Math.max(1, Math.ceil(total / pageState.size));
  const page = Math.min(pageState.page, pages);
  return (
    <div className="pagination">
      <span>{total} records</span>
      <button className="mini" disabled={page <= 1} onClick={() => setPageState({ ...pageState, page: page - 1 })}>Previous</button>
      <strong>Page {page} of {pages}</strong>
      <button className="mini" disabled={page >= pages} onClick={() => setPageState({ ...pageState, page: page + 1 })}>Next</button>
      <select value={pageState.size} onChange={(event) => setPageState({ page: 1, size: Number(event.target.value) })}>{pageSizes.map((size) => <option key={size} value={size}>{size} / page</option>)}</select>
    </div>
  );
}

function LetterGenerator({ students, quartersResidents, onPreview, notify }) {
  return (
    <div className="screen">
      <div className="command-strip"><div><p className="eyebrow">PDF Letter Workspace</p><h3>Vacating and appointment letters</h3></div></div>
      <div className="panel-grid report-grid">
        <section className="panel">
          <PanelHead title="Vacating Letter Generator" />
          <VacatingLetterForm students={students} onPreview={onPreview} />
        </section>
        <section className="panel">
          <PanelHead title="Appointment Letter Generator" />
          <AppointmentLetterForm students={students} quartersResidents={quartersResidents} onPreview={onPreview} notify={notify} />
        </section>
      </div>
    </div>
  );
}

function VacatingLetterForm({ student, students = [], onPreview }) {
  const [selected, setSelected] = useState(student?.rollNumber || "");
  const resident = student || students.find((item) => item.rollNumber === selected) || students[0];
  const [form, setForm] = useState({ vacatingDate: today, reason: "Personal reasons", remarks: "" });
  function submit(event) {
    event.preventDefault();
    if (!resident) return;
    onPreview(makeVacatingLetter(resident, form));
  }
  return (
    <form className="form-grid" onSubmit={submit}>
      {!student && <label className="span-2">Select Hostel Resident<select value={selected} onChange={(event) => setSelected(event.target.value)}>{students.map((item) => <option key={item.rollNumber} value={item.rollNumber}>{item.name} - {item.roomNumber}</option>)}</select></label>}
      {resident && <div className="notice span-2"><strong>{resident.name}</strong> • {resident.hostelName} • {resident.roomNumber} • {resident.courseYear || "-"}</div>}
      {field("Vacating Date", "vacatingDate", form, setForm, true, false, "date")}
      {field("Reason for Vacating", "reason", form, setForm, true)}
      <label className="span-2">Additional Remarks<textarea value={form.remarks} onChange={(event) => setForm({ ...form, remarks: event.target.value })} /></label>
      <button className="primary span-2" type="submit"><Eye size={16} /> Preview Letter</button>
    </form>
  );
}

function AppointmentLetterForm({ students, quartersResidents, onPreview }) {
  const [scope, setScope] = useState("hostel");
  const [selected, setSelected] = useState("");
  const [manual, setManual] = useState({ name: "", designation: "Hostel Staff", department: "", roomNumber: "", occupancyDate: today });
  const [terms, setTerms] = useState("The allottee shall maintain the premises responsibly, follow institution rules, and vacate or transfer accommodation when instructed by the competent authority.");
  const records = scope === "quarters" ? quartersResidents : students;
  const record = records.find((item) => (scope === "quarters" ? item.quartersNo : item.rollNumber) === selected) || records[0];
  function submit(event) {
    event.preventDefault();
    const payload = scope === "staff" ? manual : record;
    if (!payload) return;
    onPreview(makeAppointmentLetter(scope, payload, terms));
  }
  return (
    <form className="form-grid" onSubmit={submit}>
      <label>Applicable For<select value={scope} onChange={(event) => setScope(event.target.value)}><option value="hostel">Hostel Resident</option><option value="quarters">Quarters Resident</option><option value="staff">Hostel Staff</option></select></label>
      {scope !== "staff" && <label>Select Record<select value={selected} onChange={(event) => setSelected(event.target.value)}>{records.map((item) => <option key={scope === "quarters" ? item.quartersNo : item.rollNumber} value={scope === "quarters" ? item.quartersNo : item.rollNumber}>{item.name} - {scope === "quarters" ? item.quartersNo : item.roomNumber}</option>)}</select></label>}
      {scope === "staff" && <>{field("Name", "name", manual, setManual, true)}{field("Designation", "designation", manual, setManual, true)}{field("Department", "department", manual, setManual)}{field("Room/Office No", "roomNumber", manual, setManual)}{field("Occupancy Date", "occupancyDate", manual, setManual, true, false, "date")}</>}
      {scope !== "staff" && record && <div className="notice span-2"><strong>{record.name}</strong> • {scope === "quarters" ? `${record.quartersNo} (${record.quartersType}-Type)` : `${record.hostelName} ${record.roomNumber}`}</div>}
      <label className="span-2">Instructions / Terms<textarea value={terms} onChange={(event) => setTerms(event.target.value)} /></label>
      <button className="primary span-2" type="submit"><Eye size={16} /> Preview Appointment Letter</button>
    </form>
  );
}

function LetterPreview({ letter }) {
  return (
    <div className="letter-preview-shell">
      <div className="button-row">
        <button className="primary" onClick={() => downloadPdf(letter)}><Download size={16} /> Download PDF</button>
        <button className="secondary" onClick={() => printLetter(letter)}><Printer size={16} /> Print</button>
      </div>
      <article className="letter-preview">
        <header><strong>Government Namakkal Medical College & Hospital</strong><span>Hostel & Quarters Administration</span></header>
        <p className="letter-date">Date: {formatDate(letter.date)}</p>
        <h2>{letter.title}</h2>
        {letter.sections.map((section) => <section key={section.heading}><h3>{section.heading}</h3>{section.lines.map((line, index) => <p key={index}>{line}</p>)}</section>)}
        <div className="signature-grid"><span>Resident / Student Signature</span><span>Warden / Administrative Officer</span><span>Approval Authority</span></div>
      </article>
    </div>
  );
}

function ExcelExports({ students, allStudents, rooms, hostels, quartersRows, allQuarters, notify }) {
  const hostelReports = [
    ["All Residents Report", hostelResidentRows(students)],
    ["Room Occupancy Report", roomRows(rooms)],
    ["Vacant Rooms Report", roomRows(rooms.filter((room) => room.occupied === 0))],
    ["Hostel-wise Report", hostels.map((hostel) => ({ Hostel: hostel.name, Rooms: rooms.filter((room) => room.hostelName === hostel.name).length, Residents: rooms.filter((room) => room.hostelName === hostel.name).reduce((sum, room) => sum + Number(room.occupied || 0), 0) }))],
    ["Floor-wise Report", floorRows(rooms)],
    ["Student Details Report", hostelResidentRows(allStudents)],
    ["Vacating Students Report", hostelResidentRows(allStudents.filter((student) => student.status === "vacated"))]
  ];
  const quartersReports = [
    ["All Quarters Residents", quartersExportRows(quartersRows)],
    ["A-Type Report", quartersExportRows(quartersRows.filter((item) => item.quartersType === "A"))],
    ["C-Type Report", quartersExportRows(quartersRows.filter((item) => item.quartersType === "C"))],
    ["D-Type Report", quartersExportRows(quartersRows.filter((item) => item.quartersType === "D"))],
    ["Vacant Quarters Report", quartersExportRows(quartersRows.filter((item) => !item.name))],
    ["Occupied Quarters Report", quartersExportRows(quartersRows.filter((item) => item.name))],
    ["Full Quarters Details", quartersExportRows(allQuarters)]
  ];
  const exportFile = (title, rows) => {
    downloadXlsx(`${slug(title)}.xlsx`, title, rows);
    notify(`${title} exported`);
  };
  return (
    <div className="screen">
      <div className="command-strip"><div><p className="eyebrow">Excel Export Workspace</p><h3>Hostel and quarters .xlsx reports</h3></div></div>
      <div className="panel-grid report-grid">
        <ExportPanel title="Hostel Excel Reports" reports={hostelReports} onExport={exportFile} />
        <ExportPanel title="Quarters Excel Reports" reports={quartersReports} onExport={exportFile} />
      </div>
    </div>
  );
}

function ExportPanel({ title, reports, onExport }) {
  return <section className="panel export-panel"><PanelHead title={title} /><div className="export-list">{reports.map(([name, rows]) => <button key={name} className="export-button" onClick={() => onExport(name, rows)}><FileSpreadsheet size={18} /><span>{name}</span><small>{rows.length} rows</small></button>)}</div></section>;
}

function HostelResidentForm({ student, rooms, hostels, onSubmit }) {
  const [form, setForm] = useState({ ...emptyHostelResident, ...(student || {}) });
  const availableRooms = rooms.filter((room) => room.vacancy > 0 || room.roomNumber === student?.roomNumber);
  function submit(event) {
    event.preventDefault();
    onSubmit(form, student?.rollNumber);
  }
  return <form className="form-grid" onSubmit={submit}>{field("Roll Number", "rollNumber", form, setForm, true, Boolean(student))}{field("Name", "name", form, setForm, true)}{select("Gender", "gender", ["Male", "Female"], form, setForm)}{select("Hostel", "hostelName", hostels.map((item) => item.name), form, setForm)}{select("Room", "roomNumber", availableRooms.map((item) => item.roomNumber), form, setForm)}{field("Course / Year", "courseYear", form, setForm)}{field("Joining Date", "joiningDate", form, setForm, true, false, "date")}{field("Contact", "contact", form, setForm)}{field("Parent Name", "parentName", form, setForm)}{field("Parent Contact", "parentContact", form, setForm)}<button className="primary span-2" type="submit">Save Resident</button></form>;
}

function VacateForm({ student, onSubmit }) {
  const [form, setForm] = useState({ vacatingDate: today, vacatingReason: "" });
  return <form className="form-grid" onSubmit={(event) => { event.preventDefault(); onSubmit(student, form); }}><p className="notice span-2">Vacating {student.name} from {student.roomNumber}</p>{field("Vacating Date", "vacatingDate", form, setForm, true, false, "date")}{field("Reason", "vacatingReason", form, setForm)}<button className="primary span-2" type="submit">Vacate Room</button></form>;
}

function TransferForm({ student, rooms, onSubmit }) {
  const [form, setForm] = useState({ roomNumber: "", hostelName: student.hostelName });
  const availableRooms = rooms.filter((room) => room.vacancy > 0 && room.roomNumber !== student.roomNumber);
  return <form className="form-grid" onSubmit={(event) => { event.preventDefault(); onSubmit(student, form); }}>{select("New Room", "roomNumber", availableRooms.map((item) => item.roomNumber), form, setForm)}<button className="primary span-2" type="submit">Transfer Resident</button></form>;
}

function QuarterForm({ resident, existing, onSubmit }) {
  const [form, setForm] = useState({ ...emptyQuarter, ...(resident || {}) });
  const [error, setError] = useState("");
  function submit(event) {
    event.preventDefault();
    const normalizedNo = form.quartersNo.trim().toUpperCase();
    const ebNo = form.ebNo.trim();
    if (!normalizedNo || !form.name.trim() || !quartersTypes.includes(form.quartersType)) return setError("Quarters No, Name, and Quarters Type are required.");
    if (form.phoneNo && !/^\d{10}$/.test(form.phoneNo)) return setError("Phone number must contain exactly 10 digits.");
    if (existing.some((item) => item.quartersNo === normalizedNo && item.quartersNo !== resident?.quartersNo)) return setError("Quarters No must be unique.");
    if (ebNo && existing.some((item) => item.ebNo === ebNo && item.quartersNo !== resident?.quartersNo)) return setError("EB No must be unique.");
    onSubmit({ ...form, quartersNo: normalizedNo, ebNo }, resident?.quartersNo);
  }
  return <form className="form-grid" onSubmit={submit}>{error && <p className="notice span-2">{error}</p>}{field("Quarters No", "quartersNo", form, setForm, true)}{field("Name", "name", form, setForm, true)}{field("Entry Date", "entryDate", form, setForm, false, false, "date")}{field("Designation", "designation", form, setForm)}{field("Department", "department", form, setForm)}{field("Phone Number", "phoneNo", form, setForm)}{field("IFHRMS Number", "ifhrmsNo", form, setForm)}{field("Ref No & Date", "refNoAndDate", form, setForm)}{field("Occupy Date", "occupyDate", form, setForm, false, false, "date")}{field("EB Number", "ebNo", form, setForm)}{select("Quarters Type", "quartersType", quartersTypes, form, setForm)}<button className="primary span-2" type="submit">Save Quarters Resident</button></form>;
}

function paginate(rows, { page, size }) {
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * size;
  return { rows: rows.slice(start, start + size), page: safePage };
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function makeVacatingLetter(student, form) {
  return {
    type: "vacating",
    title: "Hostel Vacating Letter",
    date: today,
    fileName: `vacating-letter-${student.rollNumber || student.name}`,
    sections: [
      { heading: "Student Details", lines: [
        `Student Name: ${student.name}`,
        `Room Number: ${student.roomNumber || "-"}`,
        `Hostel Name: ${student.hostelName || "-"}`,
        `Department: ${student.department || "-"}`,
        `Course / Year: ${student.courseYear || "-"}`,
        `Admission Date: ${formatDate(student.joiningDate)}`,
        `Vacating Date: ${formatDate(form.vacatingDate)}`
      ] },
      { heading: "Declaration", lines: [
        `This is to certify that ${student.name} has requested to vacate the hostel accommodation allotted at ${student.roomNumber || "-"}, ${student.hostelName || "-"}.`,
        `Reason for vacating: ${form.reason || "-"}`,
        `Additional remarks: ${form.remarks || "-"}`
      ] },
      { heading: "Approval", lines: [
        "The request may be approved after verifying room handover, pending dues, keys, hostel property, and required clearance records."
      ] }
    ]
  };
}

function makeAppointmentLetter(scope, record, terms) {
  const isQuarter = scope === "quarters";
  const isStaff = scope === "staff";
  const name = record.name || "-";
  return {
    type: "appointment",
    title: isQuarter ? "Quarters Allocation / Appointment Letter" : "Hostel Allocation / Appointment Letter",
    date: today,
    fileName: `appointment-letter-${isQuarter ? record.quartersNo : record.rollNumber || name}`,
    sections: [
      { heading: "Allottee Details", lines: [
        `Name: ${name}`,
        `Designation: ${record.designation || (isStaff ? "Hostel Staff" : "Resident / Student")}`,
        `Department: ${record.department || "-"}`,
        `Room / Quarters Number: ${isQuarter ? record.quartersNo : record.roomNumber || "-"}`,
        `Hostel / Quarters Type: ${isQuarter ? `${record.quartersType}-Type Quarters` : record.hostelName || "Hostel"}`,
        `Occupancy Date: ${formatDate(record.occupyDate || record.occupancyDate || record.joiningDate || today)}`
      ] },
      { heading: "Appointment / Allocation", lines: [
        `The above-named person is allotted the accommodation mentioned above subject to institutional rules and administrative approval.`
      ] },
      { heading: "Instructions / Terms", lines: [terms || "-"] }
    ]
  };
}

function downloadPdf(letter) {
  const doc = buildPdf(letter);
  doc.save(`${slug(letter.fileName)}.pdf`);
}

function buildPdf(letter) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 54;
  let y = 54;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Government Namakkal Medical College & Hospital", margin, y);
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Hostel & Quarters Administration", margin, y);
  y += 28;
  doc.setDrawColor(13, 143, 141);
  doc.line(margin, y, 540, y);
  y += 28;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(letter.title, margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Date: ${formatDate(letter.date)}`, 430, y);
  y += 28;
  for (const section of letter.sections) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(section.heading, margin, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    for (const line of section.lines) {
      const split = doc.splitTextToSize(line, 486);
      doc.text(split, margin, y);
      y += split.length * 14 + 6;
      if (y > 720) {
        doc.addPage();
        y = 54;
      }
    }
    y += 8;
  }
  y = Math.max(y + 20, 640);
  doc.setFont("helvetica", "normal");
  doc.text("Resident / Student Signature", margin, y);
  doc.text("Warden / Administrative Officer", 220, y);
  doc.text("Approval Authority", 420, y);
  doc.line(margin, y - 14, 180, y - 14);
  doc.line(220, y - 14, 380, y - 14);
  doc.line(420, y - 14, 540, y - 14);
  return doc;
}

function printLetter(letter) {
  const doc = buildPdf(letter);
  const url = doc.output("bloburl");
  window.open(url, "_blank", "noopener,noreferrer");
}

function hostelResidentRows(rows) {
  return rows.map((student) => ({
    "Roll Number": student.rollNumber,
    Name: student.name,
    Hostel: student.hostelName,
    Room: student.roomNumber,
    Gender: student.gender,
    Department: student.department || "",
    "Academic Year": student.courseYear || "",
    "Admission Date": formatDate(student.joiningDate),
    Contact: student.contact || "",
    Status: student.status || "active",
    "Vacating Date": formatDate(student.vacatingDate)
  }));
}

function roomRows(rows) {
  return rows.map((room) => ({
    Hostel: room.hostelName,
    Floor: room.floor,
    Room: room.roomNumber,
    Capacity: room.capacity,
    Occupied: room.occupied || 0,
    Vacancy: room.vacancy || 0,
    Status: room.occupied === 0 ? "Vacant" : room.vacancy === 0 ? "Full" : "Partially Occupied"
  }));
}

function floorRows(rooms) {
  return Object.values(rooms.reduce((acc, room) => {
    const key = `${room.hostelName} - ${room.floor}`;
    acc[key] ||= { Hostel: room.hostelName, Floor: room.floor, Rooms: 0, Occupied: 0, Vacancy: 0 };
    acc[key].Rooms += 1;
    acc[key].Occupied += Number(room.occupied || 0);
    acc[key].Vacancy += Number(room.vacancy || 0);
    return acc;
  }, {}));
}

function quartersExportRows(rows) {
  return rows.map((resident) => {
    return {
      "Quarters No": resident.quartersNo,
      Name: resident.name,
      "Entry Date": formatDate(resident.entryDate),
      Designation: resident.designation || "",
      Department: resident.department || "",
      Phone: resident.phoneNo || "",
      IFHRMS: resident.ifhrmsNo || "",
      "EB No": resident.ebNo || "",
      Type: resident.quartersType,
      "Occupy Date": formatDate(resident.occupyDate),
      "Ref No & Date": resident.refNoAndDate || "",
      "Occupancy Status": resident.name ? "Occupied" : "Vacant"
    };
  });
}

function downloadXlsx(fileName, sheetName, rows) {
  const headers = rows.length ? Object.keys(rows[0]) : ["No Data"];
  const dataRows = rows.length ? rows : [{ "No Data": "No matching records" }];
  const sheetXml = worksheetXml(headers, dataRows);
  const files = {
    "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`,
    "_rels/.rels": `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    "xl/workbook.xml": `<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${xmlEscape(sheetName.slice(0, 31))}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    "xl/_rels/workbook.xml.rels": `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`,
    "xl/worksheets/sheet1.xml": sheetXml
  };
  const blob = new Blob([zipStore(files)], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  downloadBlob(fileName, blob);
}

function worksheetXml(headers, rows) {
  const rowXml = [headers, ...rows.map((row) => headers.map((header) => row[header] ?? ""))].map((cells, rowIndex) => `<row r="${rowIndex + 1}">${cells.map((value, colIndex) => `<c r="${columnName(colIndex + 1)}${rowIndex + 1}" t="inlineStr"><is><t>${xmlEscape(String(value))}</t></is></c>`).join("")}</row>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rowXml}</sheetData></worksheet>`;
}

function columnName(index) {
  let name = "";
  while (index > 0) {
    const mod = (index - 1) % 26;
    name = String.fromCharCode(65 + mod) + name;
    index = Math.floor((index - mod) / 26);
  }
  return name;
}

function zipStore(files) {
  const encoder = new TextEncoder();
  const chunks = [];
  const central = [];
  let offset = 0;
  for (const [name, content] of Object.entries(files)) {
    const nameBytes = encoder.encode(name);
    const data = encoder.encode(content);
    const crc = crc32(data);
    const local = zipHeader(0x04034b50, nameBytes, data, crc);
    chunks.push(local, nameBytes, data);
    central.push({ nameBytes, data, crc, offset });
    offset += local.length + nameBytes.length + data.length;
  }
  let centralSize = 0;
  const centralChunks = central.map((entry) => {
    const header = zipHeader(0x02014b50, entry.nameBytes, entry.data, entry.crc, entry.offset);
    centralSize += header.length + entry.nameBytes.length;
    return [header, entry.nameBytes];
  }).flat();
  const end = new Uint8Array(22);
  const view = new DataView(end.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(8, central.length, true);
  view.setUint16(10, central.length, true);
  view.setUint32(12, centralSize, true);
  view.setUint32(16, offset, true);
  return new Blob([...chunks, ...centralChunks, end]);
}

function zipHeader(signature, nameBytes, data, crc, centralOffset = 0) {
  const isCentral = signature === 0x02014b50;
  const header = new Uint8Array(isCentral ? 46 : 30);
  const view = new DataView(header.buffer);
  view.setUint32(0, signature, true);
  if (isCentral) {
    view.setUint16(4, 20, true);
    view.setUint16(6, 20, true);
    view.setUint32(16, crc, true);
    view.setUint32(20, data.length, true);
    view.setUint32(24, data.length, true);
    view.setUint16(28, nameBytes.length, true);
    view.setUint32(42, centralOffset, true);
  } else {
    view.setUint16(4, 20, true);
    view.setUint32(14, crc, true);
    view.setUint32(18, data.length, true);
    view.setUint32(22, data.length, true);
    view.setUint16(26, nameBytes.length, true);
  }
  return header;
}

function crc32(data) {
  let crc = -1;
  for (let index = 0; index < data.length; index += 1) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ data[index]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function xmlEscape(value) {
  return value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;" }[char]));
}

function slug(value) {
  return String(value || "export").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function downloadBlob(fileName, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function field(label, key, form, setForm, required = false, disabled = false, type = "text") {
  return <label>{label}<input type={type} value={form[key] || ""} required={required} disabled={disabled} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>;
}

function select(label, key, options, form, setForm) {
  return <label>{label}<select value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })}><option value="">Select</option>{options.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>;
}

function ChartPanel({ title, data, dataKey }) {
  return <section className="panel"><PanelHead title={title} /><ResponsiveContainer width="100%" height={240}><BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey={dataKey} fill="#0d8f8d" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></section>;
}

function Stat({ icon, label, value }) {
  return <article className="stat-card"><span>{React.cloneElement(icon, { size: 21 })}</span><p>{label}</p><strong>{value || 0}</strong></article>;
}

function Badge({ tone, children }) {
  return <span className={`status-badge ${tone}`}>{children}</span>;
}

function Modal({ title, onClose, children }) {
  return <div className="modal-backdrop"><section className="modal"><PanelHead title={title} action={<button className="icon-button" onClick={onClose}><X size={18} /></button>} />{children}</section></div>;
}

function PanelHead({ title, action }) {
  return <div className="panel-head"><h3>{title}</h3>{action}</div>;
}

function LogoMark() {
  return <div className="logo-mark"><Stethoscope size={24} /></div>;
}

createRoot(document.getElementById("root")).render(<App />);
