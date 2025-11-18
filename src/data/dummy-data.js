/**
 * Dummy Data
 * Temporary data for development and testing
 * Will be replaced with SAP SF API calls when integration is complete
 */

// Dummy leave data
export const leaveData = {
  leaveBalance: [
    {
      type: 'Casual Leave (CL)',
      total: 12,
      used: 3,
      available: 9
    },
    {
      type: 'Sick Leave (SL)',
      total: 10,
      used: 2,
      available: 8
    },
    {
      type: 'Privilege Leave (PL)',
      total: 15,
      used: 5,
      available: 10
    },
    {
      type: 'Compensatory Off',
      total: 5,
      used: 1,
      available: 4
    }
  ],
  pendingLeaves: [
    {
      id: 'leave_001',
      type: 'Casual Leave',
      fromDate: '2024-02-15',
      toDate: '2024-02-16',
      reason: 'Personal work',
      status: 'Pending Approval',
      appliedDate: '2024-02-10'
    },
    {
      id: 'leave_002',
      type: 'Sick Leave',
      fromDate: '2024-02-20',
      toDate: '2024-02-20',
      reason: 'Medical appointment',
      status: 'Pending Approval',
      appliedDate: '2024-02-12'
    }
  ]
};

// Dummy holiday data
export const holidayData = [
  {
    id: 'hol_001',
    date: '2024-01-26',
    name: 'Republic Day',
    type: 'National Holiday',
    description: 'Republic Day of India'
  },
  {
    id: 'hol_002',
    date: '2024-03-08',
    name: 'Holi',
    type: 'Public Holiday',
    description: 'Festival of Colors'
  },
  {
    id: 'hol_003',
    date: '2024-03-29',
    name: 'Good Friday',
    type: 'Public Holiday',
    description: 'Good Friday'
  },
  {
    id: 'hol_004',
    date: '2024-04-11',
    name: 'Eid ul-Fitr',
    type: 'Public Holiday',
    description: 'Eid ul-Fitr'
  },
  {
    id: 'hol_005',
    date: '2024-04-17',
    name: 'Ram Navami',
    type: 'Public Holiday',
    description: 'Ram Navami'
  },
  {
    id: 'hol_006',
    date: '2024-05-01',
    name: 'Labour Day',
    type: 'Public Holiday',
    description: 'International Workers Day'
  },
  {
    id: 'hol_007',
    date: '2024-08-15',
    name: 'Independence Day',
    type: 'National Holiday',
    description: 'Independence Day of India'
  },
  {
    id: 'hol_008',
    date: '2024-10-02',
    name: 'Gandhi Jayanti',
    type: 'National Holiday',
    description: 'Birthday of Mahatma Gandhi'
  },
  {
    id: 'hol_009',
    date: '2024-10-31',
    name: 'Diwali',
    type: 'Public Holiday',
    description: 'Festival of Lights'
  },
  {
    id: 'hol_010',
    date: '2024-11-15',
    name: 'Guru Nanak Jayanti',
    type: 'Public Holiday',
    description: 'Birthday of Guru Nanak'
  },
  {
    id: 'hol_011',
    date: '2024-12-25',
    name: 'Christmas',
    type: 'Public Holiday',
    description: 'Christmas Day'
  }
];

// Dummy attendance data
export const attendanceData = {
  userId: 'user123',
  month: 'January',
  year: 2024,
  totalDays: 22,
  presentDays: 20,
  absentDays: 1,
  leaveDays: 1,
  attendancePercentage: 90.9,
  irregularities: [
    {
      date: '2024-01-15',
      reason: 'Forgot to mark attendance',
      status: 'pending_regularization'
    }
  ],
  monthlySummary: [
    {
      date: '2024-01-01',
      status: 'Present',
      checkIn: '09:15 AM',
      checkOut: '06:30 PM'
    },
    {
      date: '2024-01-02',
      status: 'Present',
      checkIn: '09:00 AM',
      checkOut: '06:45 PM'
    },
    {
      date: '2024-01-15',
      status: 'Irregular',
      checkIn: null,
      checkOut: null,
      note: 'Forgot to mark attendance'
    }
  ]
};

