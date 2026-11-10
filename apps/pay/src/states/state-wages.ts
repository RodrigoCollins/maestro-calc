/*
 * U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics, May 2025, all
 * occupations, by state: the wage and salary jobs the survey counts, and the hourly wage that one
 * job in ten pays less than (the 10th percentile) and the median, in cents. Read from the BLS
 * Public Data API (https://api.bls.gov/publicAPI/v1/timeseries/data/) on November 10, 2026, series
 * `OEUS<state FIPS>00000000000000000<type>` with type 01 (employment), 06 (hourly 10th percentile)
 * and 08 (hourly median), and `OEUS<state FIPS>00000000000<occupation>08` for the median of each
 * of the five `JOBS`; every series answered for 2025, without a footnote. Types 11 and 13 (the
 * annual 10th percentile and median, $26,090 and $45,670 in Alabama) were read to check the two
 * hourly types: each is its hourly figure times 2,080 hours, to the survey's rounding. The OEWS
 * survey counts wage and salary jobs, not the self-employed.
 */

export interface StateWages {
  /** Wage and salary jobs, all occupations. */
  readonly jobs: number;
  /** The hourly wage at the 10th percentile, in cents. */
  readonly p10: number;
  /** The median hourly wage, in cents. */
  readonly median: number;
  /** The median hourly wage of each of the five `JOBS`, in cents. */
  readonly jobsAt: Readonly<Record<Job, number>>;
}

/** Five common jobs near the bottom of the pay scale, by their OEWS occupation code. */
export const JOBS = {
  fastFood: '35-3023',
  cashiers: '41-2011',
  retail: '41-2031',
  janitors: '37-2011',
  cooks: '35-2014',
} as const;

export type Job = keyof typeof JOBS;

/** By the state's name in English, as the state tables give it. */
export const STATE_WAGES: Readonly<Record<string, StateWages>> = {
  Alabama: {
    jobs: 2113660,
    p10: 1254,
    median: 2196,
    jobsAt: { cashiers: 1358, fastFood: 1140, retail: 1444, cooks: 1547, janitors: 1472 },
  },
  Alaska: {
    jobs: 325570,
    p10: 1679,
    median: 2933,
    jobsAt: { cashiers: 1737, fastFood: 1600, retail: 1793, cooks: 1930, janitors: 1948 },
  },
  Arizona: {
    jobs: 3239430,
    p10: 1644,
    median: 2407,
    jobsAt: { cashiers: 1664, fastFood: 1646, retail: 1718, cooks: 1859, janitors: 1742 },
  },
  Arkansas: {
    jobs: 1303630,
    p10: 1299,
    median: 2098,
    jobsAt: { cashiers: 1330, fastFood: 1262, retail: 1407, cooks: 1451, janitors: 1430 },
  },
  California: {
    jobs: 18213700,
    p10: 1728,
    median: 2800,
    jobsAt: { cashiers: 1784, fastFood: 2033, retail: 1848, cooks: 2158, janitors: 1975 },
  },
  Colorado: {
    jobs: 2873900,
    p10: 1748,
    median: 2875,
    jobsAt: { cashiers: 1772, fastFood: 1744, retail: 1825, cooks: 2000, janitors: 1856 },
  },
  Connecticut: {
    jobs: 1696170,
    p10: 1704,
    median: 2870,
    jobsAt: { cashiers: 1709, fastFood: 1701, retail: 1754, cooks: 1898, janitors: 1825 },
  },
  Delaware: {
    jobs: 484790,
    p10: 1522,
    median: 2509,
    jobsAt: { cashiers: 1610, fastFood: 1505, retail: 1700, cooks: 1819, janitors: 1698 },
  },
  'District of Columbia': {
    jobs: 701920,
    p10: 1906,
    median: 4401,
    jobsAt: { cashiers: 1869, fastFood: 1800, retail: 1851, cooks: 2218, janitors: 1852 },
  },
  Florida: {
    jobs: 9929860,
    p10: 1443,
    median: 2302,
    jobsAt: { cashiers: 1468, fastFood: 1398, retail: 1635, cooks: 1780, janitors: 1658 },
  },
  Georgia: {
    jobs: 4889170,
    p10: 1343,
    median: 2316,
    jobsAt: { cashiers: 1398, fastFood: 1294, retail: 1483, cooks: 1728, janitors: 1650 },
  },
  Hawaii: {
    jobs: 627530,
    p10: 1643,
    median: 2708,
    jobsAt: { cashiers: 1768, fastFood: 1695, retail: 1817, cooks: 2184, janitors: 1813 },
  },
  Idaho: {
    jobs: 857440,
    p10: 1409,
    median: 2306,
    jobsAt: { cashiers: 1460, fastFood: 1391, retail: 1687, cooks: 1752, janitors: 1736 },
  },
  Illinois: {
    jobs: 6098130,
    p10: 1582,
    median: 2498,
    jobsAt: { cashiers: 1658, fastFood: 1630, retail: 1700, cooks: 1807, janitors: 1818 },
  },
  Indiana: {
    jobs: 3201220,
    p10: 1400,
    median: 2301,
    jobsAt: { cashiers: 1426, fastFood: 1384, retail: 1516, cooks: 1691, janitors: 1753 },
  },
  Iowa: {
    jobs: 1559240,
    p10: 1391,
    median: 2334,
    jobsAt: { cashiers: 1393, fastFood: 1365, retail: 1508, cooks: 1715, janitors: 1701 },
  },
  Kansas: {
    jobs: 1437520,
    p10: 1372,
    median: 2308,
    jobsAt: { cashiers: 1385, fastFood: 1326, retail: 1547, cooks: 1689, janitors: 1658 },
  },
  Kentucky: {
    jobs: 2000360,
    p10: 1345,
    median: 2256,
    jobsAt: { cashiers: 1375, fastFood: 1304, retail: 1426, cooks: 1665, janitors: 1554 },
  },
  Louisiana: {
    jobs: 1934900,
    p10: 1092,
    median: 2189,
    jobsAt: { cashiers: 1286, fastFood: 1096, retail: 1418, cooks: 1397, janitors: 1391 },
  },
  Maine: {
    jobs: 640610,
    p10: 1689,
    median: 2473,
    jobsAt: { cashiers: 1679, fastFood: 1669, retail: 1761, cooks: 2178, janitors: 1872 },
  },
  Maryland: {
    jobs: 2763030,
    p10: 1660,
    median: 2861,
    jobsAt: { cashiers: 1654, fastFood: 1618, retail: 1707, cooks: 1819, janitors: 1761 },
  },
  Massachusetts: {
    jobs: 3637650,
    p10: 1747,
    median: 3057,
    jobsAt: { cashiers: 1708, fastFood: 1724, retail: 1760, cooks: 2192, janitors: 2191 },
  },
  Michigan: {
    jobs: 4403730,
    p10: 1456,
    median: 2369,
    jobsAt: { cashiers: 1430, fastFood: 1391, retail: 1665, cooks: 1778, janitors: 1733 },
  },
  Minnesota: {
    jobs: 2949820,
    p10: 1612,
    median: 2736,
    jobsAt: { cashiers: 1665, fastFood: 1508, retail: 1749, cooks: 1855, janitors: 1904 },
  },
  Mississippi: {
    jobs: 1163030,
    p10: 1105,
    median: 1929,
    jobsAt: { cashiers: 1269, fastFood: 1087, retail: 1377, cooks: 1421, janitors: 1364 },
  },
  Missouri: {
    jobs: 2936050,
    p10: 1432,
    median: 2298,
    jobsAt: { cashiers: 1467, fastFood: 1461, retail: 1609, cooks: 1776, janitors: 1726 },
  },
  Montana: {
    jobs: 511580,
    p10: 1413,
    median: 2343,
    jobsAt: { cashiers: 1644, fastFood: 1398, retail: 1744, cooks: 1830, janitors: 1784 },
  },
  Nebraska: {
    jobs: 1024370,
    p10: 1448,
    median: 2355,
    jobsAt: { cashiers: 1454, fastFood: 1394, retail: 1532, cooks: 1781, janitors: 1726 },
  },
  Nevada: {
    jobs: 1551540,
    p10: 1359,
    median: 2291,
    jobsAt: { cashiers: 1436, fastFood: 1536, retail: 1644, cooks: 1856, janitors: 1847 },
  },
  'New Hampshire': {
    jobs: 683290,
    p10: 1588,
    median: 2687,
    jobsAt: { cashiers: 1627, fastFood: 1519, retail: 1741, cooks: 1933, janitors: 1882 },
  },
  'New Jersey': {
    jobs: 4285720,
    p10: 1656,
    median: 2816,
    jobsAt: { cashiers: 1663, fastFood: 1642, retail: 1756, cooks: 1849, janitors: 1809 },
  },
  'New Mexico': {
    jobs: 870970,
    p10: 1383,
    median: 2270,
    jobsAt: { cashiers: 1448, fastFood: 1380, retail: 1601, cooks: 1684, janitors: 1732 },
  },
  'New York': {
    jobs: 9688000,
    p10: 1719,
    median: 2869,
    jobsAt: { cashiers: 1707, fastFood: 1695, retail: 1813, cooks: 2100, janitors: 2002 },
  },
  'North Carolina': {
    jobs: 4941820,
    p10: 1374,
    median: 2306,
    jobsAt: { cashiers: 1389, fastFood: 1374, retail: 1508, cooks: 1702, janitors: 1659 },
  },
  'North Dakota': {
    jobs: 429430,
    p10: 1506,
    median: 2523,
    jobsAt: { cashiers: 1512, fastFood: 1446, retail: 1733, cooks: 1753, janitors: 1815 },
  },
  Ohio: {
    jobs: 5550180,
    p10: 1404,
    median: 2374,
    jobsAt: { cashiers: 1407, fastFood: 1367, retail: 1481, cooks: 1709, janitors: 1726 },
  },
  Oklahoma: {
    jobs: 1707680,
    p10: 1243,
    median: 2192,
    jobsAt: { cashiers: 1355, fastFood: 1127, retail: 1426, cooks: 1525, janitors: 1496 },
  },
  Oregon: {
    jobs: 1967130,
    p10: 1715,
    median: 2740,
    jobsAt: { cashiers: 1697, fastFood: 1685, retail: 1768, cooks: 2072, janitors: 1892 },
  },
  Pennsylvania: {
    jobs: 6064600,
    p10: 1391,
    median: 2389,
    jobsAt: { cashiers: 1405, fastFood: 1374, retail: 1500, cooks: 1759, janitors: 1756 },
  },
  'Rhode Island': {
    jobs: 501340,
    p10: 1561,
    median: 2730,
    jobsAt: { cashiers: 1676, fastFood: 1514, retail: 1676, cooks: 1755, janitors: 1794 },
  },
  'South Carolina': {
    jobs: 2305080,
    p10: 1301,
    median: 2235,
    jobsAt: { cashiers: 1371, fastFood: 1323, retail: 1475, cooks: 1718, janitors: 1499 },
  },
  'South Dakota': {
    jobs: 457380,
    p10: 1409,
    median: 2263,
    jobsAt: { cashiers: 1432, fastFood: 1418, retail: 1652, cooks: 1742, janitors: 1706 },
  },
  Tennessee: {
    jobs: 3278760,
    p10: 1375,
    median: 2278,
    jobsAt: { cashiers: 1374, fastFood: 1321, retail: 1536, cooks: 1751, janitors: 1608 },
  },
  Texas: {
    jobs: 14071160,
    p10: 1310,
    median: 2338,
    jobsAt: { cashiers: 1406, fastFood: 1334, retail: 1481, cooks: 1671, janitors: 1587 },
  },
  Utah: {
    jobs: 1735590,
    p10: 1444,
    median: 2409,
    jobsAt: { cashiers: 1519, fastFood: 1378, retail: 1630, cooks: 1755, janitors: 1548 },
  },
  Vermont: {
    jobs: 303890,
    p10: 1727,
    median: 2711,
    jobsAt: { cashiers: 1717, fastFood: 1732, retail: 1798, cooks: 2182, janitors: 1967 },
  },
  Virginia: {
    jobs: 4109320,
    p10: 1468,
    median: 2678,
    jobsAt: { cashiers: 1470, fastFood: 1448, retail: 1646, cooks: 1767, janitors: 1691 },
  },
  Washington: {
    jobs: 3550970,
    p10: 1859,
    median: 3028,
    jobsAt: { cashiers: 1862, fastFood: 1813, retail: 1902, cooks: 2250, janitors: 2189 },
  },
  'West Virginia': {
    jobs: 701610,
    p10: 1253,
    median: 2178,
    jobsAt: { cashiers: 1268, fastFood: 1254, retail: 1392, cooks: 1423, janitors: 1490 },
  },
  Wisconsin: {
    jobs: 2941540,
    p10: 1441,
    median: 2417,
    jobsAt: { cashiers: 1485, fastFood: 1375, retail: 1658, cooks: 1757, janitors: 1779 },
  },
  Wyoming: {
    jobs: 280740,
    p10: 1388,
    median: 2417,
    jobsAt: { cashiers: 1481, fastFood: 1340, retail: 1650, cooks: 1771, janitors: 1733 },
  },
};

/** The OEWS row of the state named `name` in English. */
export const wagesOf = (name: string): StateWages => {
  const found = STATE_WAGES[name];
  if (found === undefined) throw new Error(`no OEWS row for ${name}`);
  return found;
};
