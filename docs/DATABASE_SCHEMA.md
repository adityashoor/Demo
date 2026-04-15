# Database Schema

## Tables

### workers
| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Unique ID |
| name | VARCHAR(100) | Worker name |
| phone | VARCHAR(15) UNIQUE | Mobile number (used for WhatsApp/IVR) |
| alternatePhone | VARCHAR | Backup contact |
| aadhaarNumber | VARCHAR | Identity verification |
| skills | SkillType[] | packing, loading, unloading, manufacturing, general |
| status | WorkerStatus | available, working, unavailable, suspended |
| reliabilityScore | DECIMAL(3,2) | 0-5 composite score |
| totalShiftsCompleted | INT | Attendance history |
| totalShiftsMissed | INT | Miss history |
| dailyWageRate | DECIMAL | ₹ per day |
| hasSmartphone | BOOL | Determines WhatsApp vs IVR |
| preferredLanguage | VARCHAR | hindi, punjabi, english |
| supervisorId | UUID FK | Linked supervisor |

### supervisors
| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | |
| name | VARCHAR | |
| phone | VARCHAR UNIQUE | |
| maxWorkerCapacity | INT | How many workers they manage |
| commissionRate | DECIMAL | ₹ per worker per shift |
| rating | DECIMAL | 0-5 |

### businesses
| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | |
| name | VARCHAR | Company name |
| contactPhone | VARCHAR UNIQUE | |
| type | BusinessType | factory, warehouse, sme |
| isVerified | BOOL | KYC verified |

### bookings
| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | |
| businessId | UUID FK | |
| supervisorId | UUID FK | Auto-assigned |
| shiftDate | DATE | |
| shiftType | ShiftType | morning/afternoon/night/full_day |
| workersRequired | INT | How many needed |
| workersConfirmed | INT | How many assigned |
| workersPresent | INT | Actual attendance |
| skillRequired | SkillType | |
| status | BookingStatus | pending→confirmed→in_progress→completed |
| dailyWageOffered | DECIMAL | ₹ offered |

### attendance
| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | |
| workerId | UUID FK | |
| bookingId | UUID FK | |
| date | DATE | |
| status | AttendanceStatus | present/absent/late/half_day |
| checkInMethod | CheckInMethod | supervisor/qr_scan/otp/whatsapp |
| checkInTime | TIMESTAMP | |
| otpCode | VARCHAR | For self check-in |

### payroll_records
| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | |
| workerId | UUID FK | |
| bookingId | UUID FK | |
| workDate | DATE | |
| baseWage | DECIMAL | Standard day wage |
| overtime | DECIMAL | Extra hours |
| advance | DECIMAL | Pre-payments |
| deductions | DECIMAL | Penalties |
| netAmount | DECIMAL | Final payout |
| paymentStatus | PaymentStatus | pending/paid/failed |
| paymentMethod | PaymentMethod | cash/upi/bank_transfer |

### ratings
| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | |
| workerId | UUID FK | |
| businessId | UUID FK | Who is rating |
| punctualityScore | INT | 1-5 |
| qualityScore | INT | 1-5 |
| behaviorScore | INT | 1-5 |
| overallScore | DECIMAL | Average |

## Reliability Score Formula

```
reliabilityScore = AVG(all rating scores from businesses)
                   weighted by attendance %

Range: 0–5
>4.0 = Elite worker
3.0–4.0 = Reliable
<3.0 = Monitor closely
```
