export const formatDisplayDate = (dateString) => {
    if (!dateString) return 'Tanggal tidak tersedia';

    // Handle ISO Timestamp (e.g. 2026-01-15T00:00:00.000Z)
    let cleanDate = String(dateString);
    if (cleanDate.includes('T')) {
        cleanDate = cleanDate.split('T')[0];
    }

    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    let parts = cleanDate.split('-');
    let dateObj;

    if (parts.length === 3) {
        if (parts[0].length === 4) {
            // YYYY-MM-DD
            dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        } else {
            // DD-MM-YYYY (Legacy)
            dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
    } else {
        return dateString;
    }

    if (isNaN(dateObj.getTime())) return dateString;
    return `${dateObj.getDate()} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
};

export const parseDateFromString = (ds) => {
    let cleanDate = String(ds);
    if (cleanDate.includes('T')) {
        cleanDate = cleanDate.split('T')[0];
    }
    const parts = cleanDate.split('-');

    if (parts[0].length === 4) {
        // YYYY-MM-DD
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    // Assume DD-MM-YYYY
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
};

export const getDoctorLeaveStatus = (doctorName, leaveData) => {
    if (!leaveData || leaveData.length === 0) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return leaveData.find(l => {
        const start = parseDateFromString(l.TanggalMulaiCuti); // legacy format
        const end = parseDateFromString(l.TanggalSelesaiCuti);
        return l.NamaDokter === doctorName && today >= start && today <= end;
    });
};

/**
 * Format leave dates intelligently by merging separate dates in the same month
 * @param {Array} dates - Array of {start, end} date strings
 * @returns {string} Formatted leave date string
 */
export const formatLeaveDates = (dates) => {
    if (!dates || dates.length === 0) return '';
    if (dates.length === 1) {
        // Single date range
        const { start, end } = dates[0];
        if (start === end) return start;
        return `${start} s/d ${end}`;
    }

    // Multiple date ranges - try to merge
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    // Parse all dates
    const parsedDates = dates.map(d => {
        const startParts = d.start.split(' '); // e.g., "15 Januari 2026"
        const endParts = d.end.split(' ');
        return {
            startDay: parseInt(startParts[0]),
            startMonth: startParts[1],
            startYear: startParts[2],
            endDay: parseInt(endParts[0]),
            endMonth: endParts[1],
            endYear: endParts[2],
            isSingleDay: d.start === d.end
        };
    });

    // Check if all are single days in the same month and year
    const allSameMonthYear = parsedDates.every((d, i, arr) =>
        d.isSingleDay &&
        d.startMonth === arr[0].startMonth &&
        d.startYear === arr[0].startYear
    );

    if (allSameMonthYear) {
        // Merge: "15 & 17 Januari 2026"
        const days = parsedDates.map(d => d.startDay).sort((a, b) => a - b);
        const month = parsedDates[0].startMonth;
        const year = parsedDates[0].startYear;
        return `${days.join(' & ')} ${month} ${year}`;
    }

    // Otherwise, show separate ranges
    return dates.map(d => {
        if (d.start === d.end) return d.start;
        return `${d.start} s/d ${d.end}`;
    }).join(', ');
};
