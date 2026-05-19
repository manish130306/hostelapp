# MongoDB Collections

The Express API defines these Mongoose-backed collections and automatically seeds the Namakkal Medical College hostel infrastructure when `MONGODB_URI` is configured.

## `hostels`

- `code`: unique hostel code such as `UGB`
- `name`: hostel or quarters name
- `category`: Student Hostel, Resident Quarters, CRRI Hostel, Staff Quarters, Nurses Hostel
- `gender`: Male, Female, or All
- `roomCount`: total rooms
- `capacityPerRoom`: room occupancy capacity
- `roomPrefix`: prefix used when seeded room numbers are generated

## `rooms`

- `id`: unique room identifier
- `hostelCode`
- `hostelName`
- `category`
- `gender`
- `floor`
- `roomNumber`: unique room number
- `capacity`

## `students`

- `rollNumber`: unique student roll number
- `name`
- `courseYear`
- `gender`
- `hostelName`
- `roomNumber`
- `joiningDate`
- `contact`
- `parentName`
- `parentContact`
- `photo`: base64 data URL for uploaded photo
- `verificationId`: QR verification payload
- `status`: `active` or `vacated`
- `vacatingDate`
- `vacatingReason`

## `admissionvacations`

- `type`: `admission` or `vacation`
- `rollNumber`
- `studentName`
- `roomNumber`
- `hostelName`
- `date`
- `reason`

## `adminusers`

- `username`
- `passwordHash`
- `role`: admin-only by default

## `auditlogs`

- `action`
- `actor`
- `time`
- `metadata`
