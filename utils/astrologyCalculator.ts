// This utility provides offline calculations for Vietnamese astrology.
// This eliminates the need for API calls for basic daily details,
// improving performance and preventing API rate limit errors.

// Heavenly Stems (Can)
const CAN = ['Canh', 'Tân', 'Nhâm', 'Quý', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ'];
// Earthly Branches (Chi)
const CHI = ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi'];

// Function to get the Julian Day Number, crucial for calculations.
function getJdn(date: Date): number {
  const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
  const y = date.getFullYear() + 4800 - a;
  const m = date.getMonth() + 1 + 12 * a - 3;
  return date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

/**
 * Calculates the Can Chi (Thiên Can, Địa Chi) for a given date.
 * @param jdn The Julian Day Number for the date.
 * @returns An object with the Can and Chi strings.
 */
function getCanChi(jdn: number): { can: string, chi: string } {
  const canIndex = (jdn + 9) % 10;
  const chiIndex = (jdn + 1) % 12;
  return { can: CAN[canIndex], chi: CHI[chiIndex] };
}

// Data for calculating good/bad hours based on the day's Chi.
const HOANG_DAO_MAP: Record<string, string[]> = {
    'Tý': ["Tý (23-1)", "Sửu (1-3)", "Mão (5-7)", "Ngọ (11-13)", "Thân (15-17)", "Dậu (17-19)"],
    'Ngọ': ["Tý (23-1)", "Sửu (1-3)", "Mão (5-7)", "Ngọ (11-13)", "Thân (15-17)", "Dậu (17-19)"],
    'Sửu': ["Dần (3-5)", "Mão (5-7)", "Tỵ (9-11)", "Thân (15-17)", "Tuất (19-21)", "Hợi (21-23)"],
    'Mùi': ["Dần (3-5)", "Mão (5-7)", "Tỵ (9-11)", "Thân (15-17)", "Tuất (19-21)", "Hợi (21-23)"],
    'Dần': ["Tý (23-1)", "Sửu (1-3)", "Thìn (7-9)", "Tỵ (9-11)", "Mùi (13-15)", "Tuất (19-21)"],
    'Thân': ["Tý (23-1)", "Sửu (1-3)", "Thìn (7-9)", "Tỵ (9-11)", "Mùi (13-15)", "Tuất (19-21)"],
    'Mão': ["Tý (23-1)", "Dần (3-5)", "Mão (5-7)", "Ngọ (11-13)", "Mùi (13-15)", "Dậu (17-19)"],
    'Dậu': ["Tý (23-1)", "Dần (3-5)", "Mão (5-7)", "Ngọ (11-13)", "Mùi (13-15)", "Dậu (17-19)"],
    'Thìn': ["Dần (3-5)", "Thìn (7-9)", "Tỵ (9-11)", "Thân (15-17)", "Dậu (17-19)", "Hợi (21-23)"],
    'Tuất': ["Dần (3-5)", "Thìn (7-9)", "Tỵ (9-11)", "Thân (15-17)", "Dậu (17-19)", "Hợi (21-23)"],
    'Tỵ': ["Sửu (1-3)", "Thìn (7-9)", "Ngọ (11-13)", "Mùi (13-15)", "Tuất (19-21)", "Hợi (21-23)"],
    'Hợi': ["Sửu (1-3)", "Thìn (7-9)", "Ngọ (11-13)", "Mùi (13-15)", "Tuất (19-21)", "Hợi (21-23)"],
};

const ALL_HOURS = ["Tý (23-1)", "Sửu (1-3)", "Dần (3-5)", "Mão (5-7)", "Thìn (7-9)", "Tỵ (9-11)", "Ngọ (11-13)", "Mùi (13-15)", "Thân (15-17)", "Dậu (17-19)", "Tuất (19-21)", "Hợi (21-23)"];

// A simplified model for good/bad stars. A full implementation is extremely complex.
// This provides a representative set of data for the UI.
const GOOD_STARS_BY_CHI: Record<string, {name: string, meaning: string}[]> = {
    'Tý': [{ name: 'Thiên Quý', meaning: 'May mắn, quý nhân phù trợ' }, { name: 'Thiên Hỷ', meaning: 'Tin vui, hỷ sự'}],
    'Sửu': [{ name: 'Thiên Quan', meaning: 'Tốt cho công danh, thi cử' }],
    'Dần': [{ name: 'Phúc Sinh', meaning: 'Có phúc, may mắn' }, { name: 'Giải Thần', meaning: 'Hóa giải hung hiểm'}],
    'Mão': [{ name: 'Nguyệt Tài', meaning: 'Tốt cho cầu tài, kinh doanh' }],
    'Thìn': [{ name: 'Thiên Y', meaning: 'Tốt cho chữa bệnh, sức khỏe' }],
    'Tỵ': [{ name: 'Dịch Mã', meaning: 'Tốt cho di chuyển, xuất hành' }],
    'Ngọ': [{ name: 'Thiên Đức', meaning: 'Được trời đất che chở' }, { name: 'Phúc Đức', meaning: 'Gặp nhiều may mắn'}],
    'Mùi': [{ name: 'Nguyệt Ân', meaning: 'Phúc lộc, được giúp đỡ' }],
    'Thân': [{ name: 'Thanh Long', meaning: 'May mắn, thành công' }],
    'Dậu': [{ name: 'Lộc Khố', meaning: 'Tốt cho tài lộc, của cải' }],
    'Tuất': [{ name: 'Thiên Giải', meaning: 'Hóa giải tai ương' }],
    'Hợi': [{ name: 'Nguyệt Đức', meaning: 'Được quý nhân giúp đỡ' }]
};

const BAD_STARS_BY_CHI: Record<string, {name: string, meaning: string}[]> = {
    'Tý': [{ name: 'Thiên Lại', meaning: 'Dễ vướng vào pháp luật' }, { name: 'Đại Hao', meaning: 'Tốn tiền, hao của'}],
    'Sửu': [{ name: 'Tiểu Hao', meaning: 'Hao tài nhỏ' }],
    'Dần': [{ name: 'Kiếp Sát', meaning: 'Gặp chuyện không may' }, { name: 'Câu Trận', meaning: 'Gặp trở ngại, rắc rối'}],
    'Mão': [{ name: 'Thụ Tử', meaning: 'Mọi việc đều xấu, tránh làm' }],
    'Thìn': [{ name: 'Hoang Vu', meaning: 'Công việc không thuận lợi' }],
    'Tỵ': [{ name: 'Cô Thần', meaning: 'Cảm thấy cô đơn, bất lợi' }],
    'Ngọ': [{ name: 'Thiên Cương', meaning: 'Dễ gặp tranh chấp, mâu thuẫn' }],
    'Mùi': [{ name: 'Quả Tú', meaning: 'Bất lợi cho tình duyên' }],
    'Thân': [{ name: 'Bạch Hổ', meaning: 'Đề phòng tai nạn, bệnh tật' }],
    'Dậu': [{ name: 'Thiên Hỏa', meaning: 'Đề phòng hỏa hoạn' }],
    'Tuất': [{ name: 'Thổ Phủ', meaning: 'Không tốt cho xây dựng, động thổ' }],
    'Hợi': [{ name: 'Vãng Vong', meaning: 'Dễ mất mát, thất lạc' }]
};


/**
 * Gets a full set of astrological details for a given date, calculated locally.
 * @param date The date to get details for.
 * @returns An object conforming to the DayDetails structure.
 */
export function getAstrologicalDetails(date: Date) {
    const jdn = getJdn(date);
    const { can, chi } = getCanChi(jdn);

    const goodHours = HOANG_DAO_MAP[chi] || [];
    const badHours = ALL_HOURS.filter(h => !goodHours.includes(h));
    
    // Generate lunar date string
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    // This is a placeholder for a full lunar date calculation, which is very complex.
    // For the UI, we just need a simple representation.
    const lunarDateString = `Ngày ${day} tháng ${month} năm ${year} (Dương lịch)`;

    return {
        lunarDate: lunarDateString,
        dayCanChi: `Ngày ${can} ${chi}`,
        goodHours: goodHours,
        badHours: badHours,
        goodStars: GOOD_STARS_BY_CHI[chi] || [],
        badStars: BAD_STARS_BY_CHI[chi] || [],
        events: [] // Event data is complex and better suited for an API or a larger local database.
    };
}

/**
 * Calculates the Can Chi (Thiên Can, Địa Chi) for a given date.
 * This is a simplified calculation and may not cover all historical calendar complexities.
 * @param date The date to calculate for.
 * @returns A string representing the Can Chi of the day, e.g., "Ngày Giáp Tý".
 */
export function getDayCanChi(date: Date): string {
    const jdn = getJdn(date);
    const { can, chi } = getCanChi(jdn);
    return `Ngày ${can} ${chi}`;
}
