# MongoDB Schema Updates

The backend now includes MongoDB/Mongoose schemas in `server/index.js` for:

- `AdminUser`: admin-only authentication and future role scalability
- `Hostel`: UG hostels, CRRI hostels, resident quarters, staff quarters, nurses hostel
- `Room`: hostel room inventory, capacity, room number, floor, category
- `Student`: student profile, parent details, photo, allocation, active/vacated status
- `AdmissionVacation`: admission and vacating history
- `AuditLog`: admin actions, backups, restores, admissions, and vacates

Use `MONGODB_URI` to connect the API to MongoDB. If it is not set, the API runs with seeded in-memory data for local development.
