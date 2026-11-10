/*
 * The state labor offices of the U.S. Department of Labor list "Contact information for state
 * labor offices" (last updated January 1, 2026, https://www.dol.gov/agencies/whd/state/contacts,
 * read November 10, 2026; `SOURCES.laborOffices`): the office, its address, its phone and its
 * website, as the list gives them. The name of the official who heads each office is left out,
 * since it changes with each appointment; a website the list gives without a scheme is served
 * over https.
 */

export interface LaborOffice {
  readonly name: string;
  /** The street or post office box, then the city, state and ZIP code. */
  readonly address: string;
  readonly phone: string;
  /** The website as the list prints it, and the address a link opens. */
  readonly site: string;
  readonly href: string;
}

export interface StateOffices {
  /** The state's name in English, as the state tables give it. */
  readonly state: string;
  /** One office, or the two the list gives for DC. */
  readonly offices: readonly LaborOffice[];
}

/** The site as the list prints it, without the scheme or a closing slash, and its link. */
const siteOf = (printed: string): Pick<LaborOffice, 'site' | 'href'> => {
  const bare = printed.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return { site: bare, href: printed.startsWith('http') ? printed : `https://${printed}` };
};

const office = (name: string, address: string, phone: string, site: string): LaborOffice => ({
  name,
  address,
  phone,
  ...siteOf(site),
});

const one = (state: string, ...args: Parameters<typeof office>): StateOffices => ({
  state,
  offices: [office(...args)],
});

/** In the order of the list. */
export const LABOR_OFFICES: readonly StateOffices[] = [
  one(
    'Alabama',
    'Alabama Department of Labor',
    '649 Monroe St, Montgomery, AL 36131',
    '334-309-9000',
    'www.labor.alabama.gov',
  ),
  one(
    'Alaska',
    'Department of Labor and Workforce Development',
    'PO Box 11149, Juneau, AK 99811-1149',
    '907-465-2700',
    'www.labor.state.ak.us',
  ),
  one(
    'Arizona',
    'Industrial Commission of Arizona',
    '800 W Washington St, Phoenix, AZ 85007',
    '602-542-4661',
    'www.azica.gov',
  ),
  one(
    'Arkansas',
    'Arkansas Department of Labor & Licensing',
    '900 West Capital Ave Ste 400, Little Rock, AR 72201',
    '501-682-4500',
    'www.labor.arkansas.gov',
  ),
  one(
    'California',
    'Labor and Workforce Development Agency',
    '800 Capitol Mall, Suite 5000 (MIC-55), Sacramento, CA 95814',
    '833-526-4636',
    'www.dir.ca.gov/contactus.html',
  ),
  one(
    'Colorado',
    'Department of Labor and Employment',
    '633 17th St, Suite 201, Denver, CO 80202-3660',
    '303-318-8441',
    'cdle.colorado.gov/dlss',
  ),
  one(
    'Connecticut',
    'Department of Labor',
    '200 Folly Brook Blvd, Wethersfield, CT 06109-1114',
    '860-263-6000',
    'www.ct.gov/dol',
  ),
  one(
    'Delaware',
    'Department of Labor',
    '4425 N Market St, 4th Floor, Wilmington, DE 19802',
    '302-761-8176',
    'www.labor.delaware.gov',
  ),
  {
    state: 'District of Columbia',
    offices: [
      office(
        'Department of Employment Services',
        '4058 Minnesota Ave NE, Washington, DC 20019',
        '202-671-1900',
        'www.does.dc.gov',
      ),
      office(
        'DC Office of Human Rights',
        '441 4th St NW, Suite 570 North, Washington, DC 20001',
        '202-727-4559',
        'ohr.dc.gov',
      ),
    ],
  },
  one(
    'Florida',
    'Department of Business and Professional Regulation',
    '2601 Blair Stone Road, Tallahassee, FL 32399',
    '850-487-1395',
    'www.myfloridalicense.com/DBPR/',
  ),
  one(
    'Georgia',
    'Department of Labor',
    '148 Andrew Young International Blvd NE, Atlanta, GA 30303',
    '404-232-7300',
    'www.dol.georgia.gov',
  ),
  one(
    'Hawaii',
    'Department of Labor & Industrial Relations',
    'Princess Ruth Ke’elikolani Building, 830 Punchbowl St, Honolulu, HI 96813',
    '808-586-8844',
    'www.labor.hawaii.gov',
  ),
  one(
    'Idaho',
    'Idaho Department of Labor',
    '317 W Main St, Boise, ID 83735',
    '208-332-3570',
    'www.labor.idaho.gov',
  ),
  one(
    'Illinois',
    'Department of Labor',
    '524 S. 2nd Street, Suite 400, Springfield, IL 62701',
    '217-782-6206',
    'www.labor.illinois.gov',
  ),
  one(
    'Indiana',
    'Department of Labor',
    '402 W. Washington St, Room W195, Indianapolis, IN 46204',
    '317-232-2655',
    'www.in.gov/dol',
  ),
  one(
    'Iowa',
    'Department of Inspections, Appeals and Licensing',
    '6200 Park Avenue, Des Moines, Iowa 50321',
    '515-242-5870',
    'www.iowadivisionoflabor.gov',
  ),
  one(
    'Kansas',
    'Department of Labor',
    '401 SW Topeka Blvd, Topeka, KS 66603-3182',
    '785-296-5000',
    'www.dol.ks.gov',
  ),
  one(
    'Kentucky',
    'Education and Labor Cabinet',
    '500 Mero Street, Frankfort, Kentucky 40601',
    '502-564-3534',
    'elc.ky.gov',
  ),
  one(
    'Louisiana',
    'Louisiana Workforce Commission',
    '1001 N 23rd St, Baton Rouge, LA 70802',
    '225-342-3111',
    'www.laworks.net/',
  ),
  one(
    'Maine',
    'Department of Labor',
    '45 State House Station, Augusta, ME 04333',
    '207-623-7900',
    'www.maine.gov/labor',
  ),
  one(
    'Maryland',
    'Department of Labor',
    '1100 North Eutaw Street, Baltimore, MD 21201',
    '410-230-6020',
    'www.labor.maryland.gov',
  ),
  one(
    'Massachusetts',
    'Executive Office of Labor & Workforce Development',
    'One Ashburton Pl, Room 2112, Boston, MA 02108',
    '617-626-7100',
    'www.mass.gov/orgs/executive-office-of-labor-and-workforce-development',
  ),
  one(
    'Michigan',
    'Department of Labor and Economic Opportunity',
    '105 W. Allegan St., Lansing, MI 48933',
    '517-284-7800',
    'www.michigan.gov/leo',
  ),
  one(
    'Minnesota',
    'Department of Labor and Industry',
    '443 Lafayette Rd N, St. Paul, MN 55155',
    '651-284-5005',
    'www.dli.mn.gov',
  ),
  one(
    'Mississippi',
    'Department of Employment Security',
    '1235 Echelon Pkwy, PO Box 1699, Jackson, MS 39215-1699',
    '601-321-6000',
    'www.mdes.ms.gov',
  ),
  one(
    'Missouri',
    'Department of Labor and Industrial Relations',
    '421 E Dunklin St, PO Box 504, Jefferson City, MO 65102-0504',
    '573-751-4091',
    'www.labor.mo.gov',
  ),
  one(
    'Montana',
    'Department of Labor and Industry',
    'PO Box 1728, Helena, MT 59624-1728',
    '406-444-2840',
    'www.dli.mt.gov',
  ),
  one(
    'Nebraska',
    'Department of Labor',
    '550 S 16th St, PO Box 94600, Lincoln, NE 68508-4600',
    '402-471-9000',
    'www.dol.nebraska.gov',
  ),
  one(
    'Nevada',
    'Department of Business and Industry',
    '1830 College Parkway, Suite 100, Carson City, NV 89706',
    '775-684-1890',
    'labor.nv.gov',
  ),
  one(
    'New Hampshire',
    'Department of Labor',
    '95 Pleasant St, Concord, NH 03301',
    '603-271-3176',
    'dol.nh.gov',
  ),
  one(
    'New Jersey',
    'Department of Labor and Workforce Development',
    '1 John Fitch Plaza, 13th Floor, Suite D, PO Box 110, Trenton, NJ 08625-0110',
    '609-292-2305',
    'https://www.nj.gov/labor/',
  ),
  one(
    'New Mexico',
    'Department of Workforce Solutions',
    '401 Broadway Blvd NE, PO Box 1928, Albuquerque, NM 87103',
    '505-841-8405',
    'www.dws.state.nm.us',
  ),
  one(
    'New York',
    'Department of Labor',
    'State Office Bldg # 12, W.A. Harriman Campus, Albany, NY 12240',
    '518-457-9000',
    'www.labor.ny.gov',
  ),
  one(
    'North Carolina',
    'Department of Labor',
    '4 W Edenton St, Raleigh, NC 27601',
    '800-625-2267',
    'www.labor.nc.gov',
  ),
  one(
    'North Dakota',
    'Department of Labor and Human Rights',
    '600 E Boulevard Ave, Dept 406, Bismarck, ND 58505-0340',
    '701-328-2660',
    'www.nd.gov/labor',
  ),
  one(
    'Ohio',
    'Department of Commerce',
    '77 S High St, 23rd Floor, Columbus, OH 43215',
    '614-466-3636',
    'com.ohio.gov',
  ),
  one(
    'Oklahoma',
    'Department of Labor',
    '409 NE 28th St, 3rd Floor, Oklahoma City, OK 73105',
    '405-521-6100',
    'www.oklahoma.gov/labor',
  ),
  one(
    'Oregon',
    'Bureau of Labor and Industries',
    '1800 SW 1st Ave, Suite 500, Portland, OR 97201',
    '971-245-3844',
    'www.oregon.gov/boli',
  ),
  one(
    'Pennsylvania',
    'Department of Labor and Industry',
    '1700 Labor and Industry Bldg, Harrisburg, PA 17121',
    '717-787-5279',
    'https://www.pa.gov/agencies/dli',
  ),
  one(
    'Rhode Island',
    'Department of Labor and Training',
    '1511 Pontiac Ave, Cranston, RI 02920',
    '401-462-8550',
    'www.dlt.ri.gov',
  ),
  one(
    'South Carolina',
    'Department of Labor, Licensing & Regulations',
    '110 Centerview Dr, Columbia, SC 29210',
    '803-896-4300',
    'llr.sc.gov/',
  ),
  one(
    'South Dakota',
    'Department of Labor and Regulation',
    '123 W Missouri Ave, Pierre, SD 57501',
    '605-773-3101',
    'www.dlr.sd.gov',
  ),
  one(
    'Tennessee',
    'Department of Labor & Workforce Development',
    '220 French Landing Dr, Nashville, TN 37243',
    '844-224-5818',
    'www.tn.gov/workforce',
  ),
  one(
    'Texas',
    'Texas Workforce Commission',
    '101 E 15th St, Room 651, Austin, TX 78778',
    '800-628-5115',
    'www.twc.texas.gov/',
  ),
  one(
    'Utah',
    'Utah Labor Commission',
    '160 E 300 S, 3rd Floor, Salt Lake City, UT 84111-6600',
    '801-530-6800',
    'www.laborcommission.utah.gov',
  ),
  one(
    'Vermont',
    'Department of Labor',
    '5 Green Mountain Dr, PO Box 488, Montpelier, VT 05601-0488',
    '802-828-4000',
    'www.labor.vermont.gov',
  ),
  one(
    'Virginia',
    'Department of Labor and Industry',
    '600 E Main St, Suite 207, Richmond, VA 23219-4101',
    '804-371-2327',
    'www.doli.Virginia.gov',
  ),
  one(
    'Washington',
    'Department of Labor and Industries',
    '7273 Linderson Way SW, Tumwater, WA 98501-5414',
    '360-902-5800',
    'www.lni.wa.gov',
  ),
  one(
    'West Virginia',
    'Division of Labor',
    '1900 Kanawha Blvd, State Capitol Complex, Building #3, Room 200, Charleston, WV 25305',
    '304-558-7890',
    'labor.wv.gov',
  ),
  one(
    'Wisconsin',
    'Department of Workforce Development',
    '201 E Washington Ave, Madison, WI 53703',
    '608-266-3131',
    'dwd.wisconsin.gov',
  ),
  one(
    'Wyoming',
    'Department of Workforce Services',
    '5221 Yellowstone Road, Cheyenne, WY 82002',
    '307-777-8650',
    'dws.wyo.gov',
  ),
];

/** The labor offices of the state named `name` in English. */
export const officesOf = (name: string): StateOffices => {
  const found = LABOR_OFFICES.find(({ state }) => state === name);
  if (found === undefined) throw new Error(`no labor office for ${name}`);
  return found;
};
