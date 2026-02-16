// Knowledge Base Data

export const kbCategories = [
  {
    id: 'applecare',
    title: 'AppleCare+',
    description: 'AppleCare+ and Protect+ coverage information',
    icon: 'Apple',
    articleCount: 3,
    articles: [
      {
        id: 'applecare-price-list',
        title: 'AppleCare+ Price List',
        excerpt: 'Complete pricing for AppleCare+ plans across all Apple devices.',
        content: `## AppleCare+ Price List

AppleCare+ extends your coverage and includes accidental damage protection. Below are the current prices for various Apple devices.

### iPhone
- iPhone 15 Pro / Pro Max: ₹14,900
- iPhone 15 / 15 Plus: ₹12,900
- iPhone SE: ₹7,500

### iPad
- iPad Pro: ₹14,900
- iPad Air: ₹9,900
- iPad: ₹7,500

### Mac
- MacBook Pro: ₹22,900
- MacBook Air: ₹14,900
- iMac: ₹14,900
- Mac mini: ₹7,500

### Other
- Apple Watch: ₹4,900 - ₹7,500
- AirPods: ₹2,900

*Prices are subject to change. Contact us for the latest pricing.*`,
        updatedAt: '2024-12-15'
      },
      {
        id: 'protect-plus-price-list',
        title: 'Protect+ Price List (1 Year Plans)',
        excerpt: 'Pricing for Protect+ extended warranty plans.',
        content: `## Protect+ Price List (1 Year Plans)

Protect+ is our extended protection plan for devices beyond manufacturer warranty.

### Coverage Includes:
- Hardware failures
- Battery replacement (if below 80% health)
- Free diagnostics
- Priority support

### Pricing:
Contact TGME for customized Protect+ pricing based on your device type and age.`,
        updatedAt: '2024-12-10'
      },
      {
        id: 'what-is-applecare',
        title: 'What is AppleCare+ and What Does It Cover?',
        excerpt: 'Understanding AppleCare+ coverage, benefits, and claim process.',
        content: `## What is AppleCare+ and What Does It Cover?

AppleCare+ is Apple's official extended warranty and accidental damage protection plan.

### What's Covered:
- **Hardware Coverage**: Extended warranty for hardware repairs
- **Accidental Damage**: Up to 2 incidents per year (service fee applies)
- **Battery Service**: Free replacement if battery holds less than 80% of original capacity
- **Software Support**: Priority access to Apple experts

### What's NOT Covered:
- Theft or loss (unless you have AppleCare+ with Theft and Loss)
- Cosmetic damage
- Unauthorized modifications
- Damage caused by non-Apple products

### How to Make a Claim:
1. Contact TGME with your device details
2. We verify your AppleCare+ coverage
3. Schedule a repair or replacement
4. Pay applicable service fee (if accidental damage)`,
        updatedAt: '2024-11-20'
      }
    ]
  },
  {
    id: 'email-hosting',
    title: 'Email Hosting & Troubleshooting',
    description: 'Setup guides and troubleshooting for business email',
    icon: 'Mail',
    articleCount: 8,
    articles: [
      {
        id: 'configure-titan-outlook',
        title: 'Configure Titan Mail on Outlook',
        excerpt: 'Step-by-step guide to set up Titan Mail in Microsoft Outlook.',
        content: `## Configure Titan Mail on Outlook

### Prerequisites:
- Titan Mail account credentials
- Microsoft Outlook installed

### IMAP Settings:
- **Incoming Server**: imap.titan.email
- **Port**: 993
- **Encryption**: SSL/TLS

### SMTP Settings:
- **Outgoing Server**: smtp.titan.email
- **Port**: 465
- **Encryption**: SSL/TLS

### Steps:
1. Open Outlook → File → Add Account
2. Select "Manual setup"
3. Choose IMAP
4. Enter your email and password
5. Configure incoming/outgoing servers as above
6. Test the connection
7. Done!`,
        updatedAt: '2024-12-01'
      },
      {
        id: 'add-titan-user',
        title: 'How to Add a New User to Titan Email (as Admin)',
        excerpt: 'Admin guide to adding new users to your Titan Email account.',
        content: `## How to Add a New User to Titan Email

### Steps:
1. Log in to Titan Control Panel
2. Navigate to Users section
3. Click "Add User"
4. Enter user details (name, email address)
5. Set temporary password
6. Assign storage quota
7. Save and notify user

### Tips:
- Use strong passwords
- Set appropriate storage limits
- Document all user accounts`,
        updatedAt: '2024-11-15'
      },
      {
        id: 'google-workspace-mx',
        title: 'How to Configure Google Workspace MX Records',
        excerpt: 'DNS configuration guide for Google Workspace email.',
        content: `## How to Configure Google Workspace MX Records

### Google Workspace MX Records:
| Priority | Mail Server |
|----------|-------------|
| 1 | ASPMX.L.GOOGLE.COM |
| 5 | ALT1.ASPMX.L.GOOGLE.COM |
| 5 | ALT2.ASPMX.L.GOOGLE.COM |
| 10 | ALT3.ASPMX.L.GOOGLE.COM |
| 10 | ALT4.ASPMX.L.GOOGLE.COM |

### Steps:
1. Log in to your domain registrar
2. Navigate to DNS settings
3. Delete existing MX records
4. Add the Google MX records above
5. Wait for propagation (up to 48 hours)
6. Verify in Google Admin Console`,
        updatedAt: '2024-10-20'
      }
    ]
  },
  {
    id: 'fees-charges',
    title: 'Fees & Charges',
    description: 'Service fees for repairs, installation, and support',
    icon: 'IndianRupee',
    articleCount: 5,
    articles: [
      {
        id: 'laptop-service-fees',
        title: 'Laptop Service Fees',
        excerpt: 'Standard labor charges for laptop repairs and servicing.',
        content: `## Laptop Service Fees (Labor Only)

*GST Extra as applicable*

### Diagnosis & Basic Service:
- **Basic Diagnosis**: ₹300 - ₹500
- **OS Installation**: ₹500 - ₹800
- **Software Installation**: ₹200 - ₹500

### Hardware Repairs:
- **Keyboard Replacement**: ₹500 - ₹800
- **Screen Replacement**: ₹800 - ₹1,500
- **Battery Replacement**: ₹300 - ₹500
- **Motherboard Repair**: ₹1,500 - ₹3,000

### Cleaning & Maintenance:
- **Internal Cleaning**: ₹500 - ₹800
- **Thermal Paste Application**: ₹300 - ₹500

*Parts charged separately at actual cost*`,
        updatedAt: '2024-12-10'
      },
      {
        id: 'remote-support-fees',
        title: 'Remote Support Fees',
        excerpt: 'Charges for remote technical support sessions.',
        content: `## Remote Support Fees

### Per Incident:
- **Basic Issue**: ₹300 - ₹500
- **Complex Issue**: ₹500 - ₹1,000
- **After Hours**: +50% surcharge

### Monthly Plans:
Contact TGME for monthly remote support packages.`,
        updatedAt: '2024-11-25'
      },
      {
        id: 'cctv-installation-fees',
        title: 'CCTV Installation & Service – Labor Only',
        excerpt: 'Installation and service charges for CCTV systems.',
        content: `## CCTV Installation & Service Fees

### Installation (Labor Only):
- **Per Camera (Indoor)**: ₹500 - ₹800
- **Per Camera (Outdoor)**: ₹800 - ₹1,200
- **NVR/DVR Setup**: ₹1,000 - ₹1,500
- **Network Configuration**: ₹500 - ₹1,000

### Annual Maintenance:
- **Basic AMC**: Contact for quote
- **Comprehensive AMC**: Contact for quote

*Equipment charged separately*`,
        updatedAt: '2024-11-20'
      }
    ]
  },
  {
    id: 'general-info',
    title: 'General Information',
    description: 'Understanding support scope and service policies',
    icon: 'Info',
    articleCount: 5,
    articles: [
      {
        id: 'chargeable-vs-included',
        title: 'Understanding Chargeable vs Included Support',
        excerpt: 'What\'s covered under your support plan and what\'s extra.',
        content: `## Understanding Chargeable vs Included Support

### Included in Support/AMC:
- Troubleshooting existing issues
- Software updates
- Basic configuration changes
- Remote assistance
- Phone/email support

### Chargeable (Extra):
- New software installation
- Hardware upgrades
- Network restructuring
- New user setup beyond quota
- Training sessions
- On-site visits (if not in plan)

### Grey Areas:
When in doubt, ask us before proceeding. We'll always clarify charges upfront.`,
        updatedAt: '2024-12-05'
      },
      {
        id: 'warranty-vs-amc',
        title: 'Warranty vs AMC – Scope of Coverage',
        excerpt: 'Understanding the difference between warranty and AMC coverage.',
        content: `## Warranty vs AMC – What's Covered?

### Manufacturer Warranty:
- **Covers**: Manufacturing defects
- **Duration**: 1-3 years (varies by product)
- **Parts**: Free (if defect)
- **Labor**: Usually free

### AMC (Annual Maintenance Contract):
- **Covers**: Breakdown repairs, preventive maintenance
- **Duration**: 1 year (renewable)
- **Parts**: May or may not be included
- **Labor**: Included

### Key Differences:
| Aspect | Warranty | AMC |
|--------|----------|-----|
| Accidental Damage | ❌ | Sometimes |
| Wear & Tear | ❌ | ✅ |
| Preventive Maintenance | ❌ | ✅ |
| Response Time SLA | No | Yes |`,
        updatedAt: '2024-11-30'
      },
      {
        id: 'response-vs-resolution',
        title: 'Why Response Time Is Not Resolution Time',
        excerpt: 'Understanding SLA response times vs actual resolution.',
        content: `## Response Time vs Resolution Time

### Response Time:
- Time taken to **acknowledge** your request
- Typically: 1-4 hours (business hours)
- What you get: Confirmation + initial assessment

### Resolution Time:
- Time taken to **fix** the issue
- Depends on: Complexity, parts availability, access
- Can range from hours to days

### Why They're Different:
- Some issues need parts ordering
- Complex problems need diagnosis
- Access to systems may be limited
- External dependencies (vendor, ISP, etc.)

### Our Commitment:
We'll always keep you updated on progress and expected resolution time.`,
        updatedAt: '2024-11-28'
      }
    ]
  },
  {
    id: 'hardware-support',
    title: 'Hardware Support',
    description: 'Troubleshooting guides for common hardware issues',
    icon: 'Cpu',
    articleCount: 4,
    articles: [
      {
        id: 'printer-setup',
        title: 'How to Connect and Set Up a Printer (USB & Network)',
        excerpt: 'Guide to setting up printers via USB or network connection.',
        content: `## How to Connect and Set Up a Printer

### USB Connection:
1. Connect USB cable to computer
2. Windows should auto-detect
3. If not, go to Settings → Devices → Printers
4. Click "Add a printer"
5. Select your printer
6. Install driver if prompted

### Network Connection:
1. Connect printer to network (Ethernet or Wi-Fi)
2. Note printer's IP address
3. Go to Settings → Devices → Printers
4. Click "Add a printer"
5. Select "The printer I want isn't listed"
6. Enter IP address
7. Install driver

### Troubleshooting:
- Ensure printer is powered on
- Check cable connections
- Restart print spooler service
- Update printer drivers`,
        updatedAt: '2024-12-01'
      },
      {
        id: 'no-display-issue',
        title: 'Troubleshooting "No Display" or Blank Monitor',
        excerpt: 'Steps to diagnose and fix blank screen issues.',
        content: `## Troubleshooting No Display Issue

### Quick Checks:
1. Is monitor powered on?
2. Is cable connected properly?
3. Is correct input source selected?
4. Try a different cable

### Computer-Side Checks:
1. Listen for beep codes
2. Check RAM seating
3. Try different video port
4. Test with another monitor

### If Still No Display:
- Could be GPU failure
- Motherboard issue
- Power supply problem
- Contact TGME for diagnosis`,
        updatedAt: '2024-11-15'
      },
      {
        id: 'computer-not-turning-on',
        title: 'What to Do When Your Computer Doesn\'t Turn On',
        excerpt: 'Diagnostic steps for computers that won\'t power on.',
        content: `## Computer Doesn't Turn On

### Step 1: Check Power
- Is power cable connected?
- Is outlet working? (test with phone charger)
- Is PSU switch on? (back of desktop)

### Step 2: Check for Signs of Life
- Any LEDs lighting up?
- Fans spinning?
- Any beep sounds?

### Step 3: Basic Troubleshooting
- Try different power outlet
- Remove and reseat RAM
- Disconnect all peripherals
- Try power button for 30 seconds (drain capacitors)

### When to Call TGME:
- No signs of life after above steps
- Burning smell
- Physical damage visible
- Repeated failures`,
        updatedAt: '2024-11-10'
      }
    ]
  },
  {
    id: 'networking',
    title: 'Networking & Internet',
    description: 'Network setup and connectivity troubleshooting',
    icon: 'Wifi',
    articleCount: 2,
    articles: [
      {
        id: 'share-printer-lan',
        title: 'How to Share a Printer on LAN (Windows 10/11)',
        excerpt: 'Step-by-step guide to share a printer across your network.',
        content: `## Share a Printer on LAN

### On the Computer with Printer:
1. Go to Settings → Devices → Printers
2. Click on your printer
3. Select "Manage" → "Printer properties"
4. Go to "Sharing" tab
5. Check "Share this printer"
6. Give it a share name
7. Click OK

### On Other Computers:
1. Go to Settings → Devices → Printers
2. Click "Add a printer"
3. Select the shared printer from list
4. Or enter: \\\\ComputerName\\PrinterShareName

### Troubleshooting:
- Ensure network discovery is ON
- Check firewall settings
- Both computers should be on same network`,
        updatedAt: '2024-11-20'
      },
      {
        id: 'slow-internet',
        title: 'Internet is Slow or Keeps Disconnecting',
        excerpt: 'Common causes and fixes for internet connectivity issues.',
        content: `## Slow or Disconnecting Internet

### Quick Fixes:
1. Restart router/modem
2. Check cable connections
3. Move closer to Wi-Fi router
4. Disconnect unused devices

### Check for Issues:
- Run speed test (fast.com)
- Compare with plan speed
- Check at different times

### Router-Side:
- Update router firmware
- Change Wi-Fi channel
- Check for interference
- Consider router placement

### When to Contact ISP:
- Speed consistently below plan
- Frequent disconnections
- Line/hardware issues

### When to Contact TGME:
- Network design issues
- Multiple devices affected
- Business-critical connectivity`,
        updatedAt: '2024-11-15'
      }
    ]
  },
  {
    id: 'policies',
    title: 'Operational & Process Policies',
    description: 'Service policies, terms, and escalation procedures',
    icon: 'FileText',
    articleCount: 30,
    articles: [
      {
        id: 'customer-code-of-conduct',
        title: 'Customer Code of Conduct',
        excerpt: 'Expected behavior and mutual respect guidelines.',
        content: `## Customer Code of Conduct

### Our Commitment:
We treat every customer with respect, professionalism, and transparency.

### We Expect:
- Respectful communication with our team
- Accurate information about issues
- Timely responses when we need input
- Understanding of reasonable timelines
- Payment as per agreed terms

### We Don't Tolerate:
- Abusive language or behavior
- Threats or intimidation
- Unreasonable demands
- Dishonesty about issues
- Payment defaults

### Escalation:
If you're unhappy with our service, please use our escalation matrix. We're committed to resolving issues professionally.`,
        updatedAt: '2024-12-01'
      },
      {
        id: 'refund-policy',
        title: 'Refund / Return / Exchange Policy',
        excerpt: 'Our policies on refunds, returns, and exchanges.',
        content: `## Refund / Return / Exchange Policy

### Products:
- **Sealed products**: Return within 7 days (unopened)
- **Opened products**: No return (unless defective)
- **Defective products**: Replacement or repair under warranty

### Services:
- **Completed services**: No refund
- **Cancelled before completion**: Pro-rata refund
- **Unsatisfactory work**: We'll make it right

### Process:
1. Contact us with order/invoice details
2. Explain the issue
3. We'll assess and respond within 48 hours
4. Refunds processed within 7-10 working days

### Exceptions:
- Custom orders: No return
- Software licenses: No return
- Consumables: No return`,
        updatedAt: '2024-11-25'
      },
      {
        id: 'escalation-matrix',
        title: 'Service Escalation Matrix',
        excerpt: 'How to escalate issues if not resolved satisfactorily.',
        content: `## Service Escalation Matrix

### Level 1: Support Team
- **Contact**: support@tgme.in
- **Response**: Within 4 hours
- **For**: All initial requests

### Level 2: Team Lead
- **Contact**: Request escalation from Level 1
- **Response**: Within 24 hours
- **For**: Unresolved after 48 hours

### Level 3: Management
- **Contact**: management@tgme.in
- **Response**: Within 48 hours
- **For**: Unresolved after escalation

### Tips for Faster Resolution:
- Be specific about the issue
- Share ticket/reference numbers
- Document all communication
- Be patient but persistent`,
        updatedAt: '2024-11-20'
      }
    ]
  },
  {
    id: 'maintenance',
    title: 'Routine Maintenance',
    description: 'Preventive maintenance guides and checklists',
    icon: 'Wrench',
    articleCount: 4,
    articles: [
      {
        id: 'monthly-pc-checklist',
        title: 'Monthly Maintenance Checklist for Windows PCs',
        excerpt: 'Regular maintenance tasks to keep your PC running smoothly.',
        content: `## Monthly PC Maintenance Checklist

### Weekly:
- [ ] Run antivirus scan
- [ ] Clear browser cache
- [ ] Empty recycle bin

### Monthly:
- [ ] Windows updates
- [ ] Driver updates
- [ ] Disk cleanup
- [ ] Check disk health
- [ ] Review startup programs
- [ ] Clear temporary files
- [ ] Check backup status

### Quarterly:
- [ ] Internal dust cleaning
- [ ] Check thermal paste
- [ ] Review installed software
- [ ] Password review
- [ ] Full system backup

### Annually:
- [ ] Hardware health check
- [ ] Consider upgrades
- [ ] License renewals
- [ ] Warranty status check`,
        updatedAt: '2024-12-01'
      },
      {
        id: 'ups-maintenance',
        title: 'UPS & Power Backup – Preventive Maintenance',
        excerpt: 'How to maintain your UPS for optimal performance.',
        content: `## UPS Preventive Maintenance

### Monthly:
- Check LED indicators
- Listen for unusual sounds
- Verify load capacity
- Test battery backup (briefly)

### Quarterly:
- Clean exterior
- Check connections
- Verify grounding
- Test self-diagnostic

### Annually:
- Battery health check
- Load test
- Calibration
- Consider battery replacement (3-5 years)

### Warning Signs:
- Frequent beeping
- Short backup time
- Overheating
- Swollen battery

### Battery Replacement:
Contact TGME for genuine battery replacement.`,
        updatedAt: '2024-11-15'
      }
    ]
  },
  {
    id: 'terms-conditions',
    title: 'Terms & Conditions',
    description: 'Legal terms, disclaimers, and privacy policy',
    icon: 'Scale',
    articleCount: 11,
    articles: [
      {
        id: 'advance-payment-terms',
        title: 'Advance Payment Terms & Conditions',
        excerpt: 'Payment terms for orders and services.',
        content: `## Advance Payment Terms

### Why Advance Payment?
- Secures your order/slot
- Enables parts procurement
- Confirms commitment

### Standard Terms:
- **Products**: 50-100% advance
- **Services**: As per quote
- **AMC**: 100% advance

### Payment Modes:
- Bank transfer (NEFT/RTGS/IMPS)
- UPI
- Cheque (subject to clearance)

### Refund of Advance:
- Order cancelled by us: Full refund
- Order cancelled by you: Subject to terms
- Custom orders: Non-refundable`,
        updatedAt: '2024-11-20'
      },
      {
        id: 'goods-quotation-terms',
        title: 'Goods Quotation / Estimate Terms',
        excerpt: 'Terms applicable to product quotations.',
        content: `## Quotation Terms & Conditions

### Validity:
- Quotations valid for 7 days
- Prices subject to change
- Stock subject to availability

### What's Included:
- Product specifications
- Warranty details
- Delivery timeline
- Payment terms

### What's NOT Included (unless specified):
- Installation
- Configuration
- Data migration
- Training

### Acceptance:
- Written confirmation required
- Advance payment confirms order
- Changes after confirmation may affect price/timeline`,
        updatedAt: '2024-11-15'
      }
    ]
  },
  {
    id: 'tools',
    title: 'Tools & Utilities',
    description: 'Software downloads and installation guides',
    icon: 'Download',
    articleCount: 6,
    articles: [
      {
        id: 'remote-software-download',
        title: 'Download Remote Support Software',
        excerpt: 'Download links for remote support sessions.',
        content: `## Remote Support Software

For remote support sessions, please download and install one of the following:

### RustDesk (Recommended):
- Secure and open-source
- Download: [rustdesk.com](https://rustdesk.com)
- Share your ID with our technician

### AnyDesk:
- Download: [anydesk.com](https://anydesk.com)
- Share the 9-digit ID

### TeamViewer:
- Download: [teamviewer.com](https://teamviewer.com)
- Share ID and password

### Instructions:
1. Download and run the software
2. No installation needed (portable)
3. Share the ID/password with our team
4. Accept the incoming connection request`,
        updatedAt: '2024-12-05'
      },
      {
        id: 'install-antivirus',
        title: 'How to Install NPAV (Net Protector Antivirus)',
        excerpt: 'Installation guide for Net Protector Antivirus.',
        content: `## Install Net Protector Antivirus

### Steps:
1. Download from official website or use provided installer
2. Run the installer as Administrator
3. Accept license agreement
4. Enter your license key (provided by TGME)
5. Complete installation
6. Restart if prompted
7. Run first full scan

### Activation:
- Use the license key provided
- Ensure internet connectivity
- Contact us if activation fails

### Updates:
- Enable auto-updates
- Run manual update weekly
- Keep subscription active`,
        updatedAt: '2024-11-20'
      }
    ]
  },
  {
    id: 'how-to',
    title: 'How-To Guides',
    description: 'Step-by-step tutorials for common tasks',
    icon: 'BookOpen',
    articleCount: 2,
    articles: [
      {
        id: 'cpplus-mobile-app',
        title: 'Connect CP Plus NVR to Mobile App',
        excerpt: 'Setup guide for viewing CCTV on gCMOB/iCMOB app.',
        content: `## Connect CP Plus NVR to Mobile App

### Prerequisites:
- NVR connected to internet
- Note NVR's IP address
- Download gCMOB (Android) or iCMOB (iOS)

### Steps:
1. Open the app
2. Tap + to add device
3. Select "Manual Add"
4. Enter device name
5. Enter IP address or P2P serial
6. Enter port (default: 34567)
7. Enter username and password
8. Save and connect

### Troubleshooting:
- Ensure NVR is online
- Check username/password
- Verify port forwarding (if using IP)
- Try P2P mode if IP doesn't work`,
        updatedAt: '2024-12-10'
      }
    ]
  }
];

export const getArticleById = (categoryId, articleId) => {
  const category = kbCategories.find(c => c.id === categoryId);
  if (!category) return null;
  return category.articles.find(a => a.id === articleId);
};

export const searchArticles = (query) => {
  const results = [];
  const lowerQuery = query.toLowerCase();
  
  kbCategories.forEach(category => {
    category.articles.forEach(article => {
      if (
        article.title.toLowerCase().includes(lowerQuery) ||
        article.excerpt.toLowerCase().includes(lowerQuery) ||
        article.content.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          ...article,
          categoryId: category.id,
          categoryTitle: category.title
        });
      }
    });
  });
  
  return results;
};
