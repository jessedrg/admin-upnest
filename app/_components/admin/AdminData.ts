// Admin data — shared mock dataset for all admin views.
// Organizations, roles, candidates, recruiters, contracts, activity.

const ADMIN_DATA = (() => {
  const orgs = [
    { id:'org-1', name:'Ramp',             type:'company', tier:'Enterprise', logo:'R', joined:'2024-03', mrr:18400, health:'healthy',  seats:42, roles:11, candidates:189, primary:'Catherine Hughes', domain:'ramp.com' },
    { id:'org-2', name:'Anthropic',        type:'company', tier:'Enterprise', logo:'A', joined:'2024-01', mrr:22100, health:'healthy',  seats:58, roles:7,  candidates:412, primary:'Dario Odom',       domain:'anthropic.com' },
    { id:'org-3', name:'Stripe',           type:'company', tier:'Growth',     logo:'S', joined:'2023-11', mrr:12400, health:'healthy',  seats:26, roles:14, candidates:301, primary:'Mel Patel',        domain:'stripe.com' },
    { id:'org-4', name:'Linear',           type:'company', tier:'Growth',     logo:'L', joined:'2024-05', mrr:8900,  health:'at-risk',  seats:14, roles:4,  candidates:56,  primary:'Karri Saarinen',   domain:'linear.app' },
    { id:'org-5', name:'Vercel',           type:'company', tier:'Growth',     logo:'V', joined:'2024-04', mrr:9600,  health:'healthy',  seats:18, roles:6,  candidates:142, primary:'Guillermo Rauch',  domain:'vercel.com' },
    { id:'org-6', name:'Parabol Partners', type:'agency',  tier:'Agency',     logo:'P', joined:'2024-02', mrr:3400,  health:'healthy',  seats:8,  roles:0,  candidates:88,  primary:'Rowan Tao',        domain:'parabol.work' },
    { id:'org-7', name:'Northfield Talent',type:'agency',  tier:'Agency',     logo:'N', joined:'2024-06', mrr:2100,  health:'dormant',  seats:5,  roles:0,  candidates:19,  primary:'Yuki Tanabe',      domain:'northfield.io' },
    { id:'org-8', name:'Cedar & Finch',    type:'agency',  tier:'Agency',     logo:'C', joined:'2024-07', mrr:1800,  health:'healthy',  seats:4,  roles:0,  candidates:34,  primary:'Mina Osei',        domain:'cedarfinch.co' },
  ];

  const stages = ['New','Screening','Phone','Technical','Sent to Client','On-site','Offer','Hired','Rejected'];

  const roles = [
    { id:'r-001', num:'R-01284', org:'Ramp',       title:'Senior Platform Engineer',   location:'New York',    workMode:'Hybrid',  status:'open',   salary:'$190–240k', opened:'14d ago', focused:true,  confidential:false, recruiters:3, candidates:42, pipeline:{New:12, Screening:9, Phone:6, Technical:5, SentToClient:4, OnSite:3, Offer:2, Hired:1, Rejected:0}, age:14, tta:'11d', fee:'22%',  priority:'high' },
    { id:'r-002', num:'R-01281', org:'Ramp',       title:'Staff iOS Engineer',         location:'Remote US',   workMode:'Remote',  status:'open',   salary:'$220–270k', opened:'9d ago',  focused:true,  confidential:true,  recruiters:2, candidates:28, pipeline:{New:5,  Screening:6, Phone:5, Technical:4, SentToClient:3, OnSite:2, Offer:1, Hired:0, Rejected:2}, age:9,  tta:'—',   fee:'22%',  priority:'high' },
    { id:'r-003', num:'R-01277', org:'Anthropic',  title:'Research Scientist — RL',    location:'San Francisco',workMode:'Onsite', status:'open',   salary:'$320–420k', opened:'21d ago', focused:false, confidential:true,  recruiters:4, candidates:87, pipeline:{New:22, Screening:18, Phone:14, Technical:12, SentToClient:9, OnSite:6, Offer:3, Hired:1, Rejected:2}, age:21, tta:'—',   fee:'25%',  priority:'high' },
    { id:'r-004', num:'R-01276', org:'Anthropic',  title:'Product Designer',           location:'Remote',      workMode:'Remote',  status:'open',   salary:'$180–220k', opened:'18d ago', focused:false, confidential:false, recruiters:2, candidates:64, pipeline:{New:15, Screening:14, Phone:10, Technical:8,  SentToClient:7, OnSite:4, Offer:2, Hired:1, Rejected:3}, age:18, tta:'—',   fee:'20%',  priority:'med'  },
    { id:'r-005', num:'R-01272', org:'Stripe',     title:'Financial Crimes Lead',      location:'Dublin',      workMode:'Hybrid',  status:'open',   salary:'€140–180k', opened:'32d ago', focused:false, confidential:false, recruiters:3, candidates:51, pipeline:{New:8,  Screening:12, Phone:11, Technical:8, SentToClient:6, OnSite:3, Offer:1, Hired:1, Rejected:1}, age:32, tta:'29d', fee:'22%',  priority:'med'  },
    { id:'r-006', num:'R-01271', org:'Stripe',     title:'Growth PM',                  location:'London',      workMode:'Hybrid',  status:'paused', salary:'£130–160k', opened:'40d ago', focused:false, confidential:false, recruiters:2, candidates:36, pipeline:{New:4,  Screening:6, Phone:8, Technical:6, SentToClient:5, OnSite:4, Offer:2, Hired:0, Rejected:1}, age:40, tta:'—',   fee:'22%',  priority:'low'  },
    { id:'r-007', num:'R-01268', org:'Linear',     title:'Engineering Manager',        location:'Remote EU',   workMode:'Remote',  status:'open',   salary:'€140–180k', opened:'28d ago', focused:true,  confidential:false, recruiters:2, candidates:31, pipeline:{New:6,  Screening:7, Phone:6, Technical:5, SentToClient:3, OnSite:2, Offer:1, Hired:0, Rejected:1}, age:28, tta:'—',   fee:'22%',  priority:'med'  },
    { id:'r-008', num:'R-01265', org:'Vercel',     title:'Senior Next.js Engineer',    location:'Remote',      workMode:'Remote',  status:'open',   salary:'$180–230k', opened:'12d ago', focused:false, confidential:false, recruiters:3, candidates:58, pipeline:{New:14, Screening:11, Phone:9, Technical:7, SentToClient:6, OnSite:4, Offer:3, Hired:2, Rejected:2}, age:12, tta:'10d', fee:'22%',  priority:'med'  },
    { id:'r-009', num:'R-01261', org:'Ramp',       title:'Head of Revenue Ops',        location:'New York',    workMode:'Onsite',  status:'open',   salary:'$200–250k', opened:'45d ago', focused:false, confidential:false, recruiters:1, candidates:19, pipeline:{New:2,  Screening:4, Phone:5, Technical:3, SentToClient:2, OnSite:1, Offer:1, Hired:0, Rejected:1}, age:45, tta:'—',   fee:'22%',  priority:'low'  },
  ];

  const firstNames = ['Adrien','Priya','Leo','Yuki','Tomás','Marcus','Sofía','Aki','Rania','Kieran','Dashiell','Anwen','Ezra','Mei','Ola','Claudia','Theo','Hana','Isla','Omar','Finn','Noa','Rhea','Devon','Ines','Kai','Ada','Jules','Ozlem'];
  const lastNames  = ['Novak','Ramanathan','Zimmerman','Shimizu','Alvarez','Holt','Vargas','Tanabe','Haddad','Byrne','Mulholland','Ellis','Wolfson','Chen','Wójcik','Beltran','Haakonsen','Pak','Quinn','Rahimi','Crowley','Aasen','Sandoval','Pierce','Mota','Okafor','Kowalski','Durand','Yilmaz'];
  const titles     = ['Staff Engineer','Senior iOS Engineer','Principal ML Engineer','Lead Product Designer','Platform Engineer','Product Manager','Senior Backend Engineer','VP of Revenue','Staff PM','Engineering Manager','Senior Data Scientist','Head of Design','Staff Frontend Engineer','Senior RecOps','Research Engineer'];
  const sources    = ['Cold email','Referral','LinkedIn','Agency: Parabol','Agency: Cedar & Finch','Direct apply','Inbound'];

  const hash = (s: string) => { let h = 0; for (let i=0;i<s.length;i++) h = (h*31 + s.charCodeAt(i))|0; return Math.abs(h); };

  const candidates: any[] = [];
  for (let i=0; i<48; i++) {
    const r = roles[i % roles.length];
    const fn = firstNames[(i*7) % firstNames.length];
    const ln = lastNames[(i*13) % lastNames.length];
    const stageIdx = Math.min(stages.length-1, (i*3) % stages.length);
    const stage = stages[stageIdx];
    candidates.push({
      id: 'c-' + String(1000 + i),
      num: 'C-' + String(2100 + i).padStart(5,'0'),
      name: fn + ' ' + ln,
      initials: (fn[0] + ln[0]).toUpperCase(),
      title: titles[(i*5) % titles.length],
      current: ['Figma','Plaid','Datadog','Airbnb','Shopify','Notion','Brex','Mercury','Snowflake','Square'][(i*11) % 10],
      role: r.title,
      roleId: r.id,
      org: r.org,
      stage,
      source: sources[(i*17) % sources.length],
      submitted: ['2d ago','4d ago','6d ago','1w ago','2w ago','3w ago'][(i*3) % 6],
      recruiter: ['Jesse Dragstra','Mira Holt','Noor Salim','Ben Ortiz','Aiko Sato'][(i*7) % 5],
      location: ['New York','Remote','San Francisco','Dublin','Berlin','London','Lisbon'][(i*9) % 7],
      salary: ['$220k','$245k','$180k','$260k','$310k','$150k','€140k','£130k'][(i*11) % 8],
      years: 3 + ((i*7) % 14),
      quote: [
        'Rebuilt Airbnb search infra; cut p99 by 36%.',
        'Led 4-person team shipping Plaid\'s Link 2.0.',
        'Owned $40M ARR growth PM surface end-to-end.',
        'Published 3 papers on RLHF alignment.',
        'Scaled Brex underwriting to 8 countries.',
        'Cut Datadog\'s iOS crash rate by 81%.',
      ][i % 6],
      flagged: (i % 11) === 0,
      saved: (i % 5) === 0,
    });
  }

  const recruiters = [
    { id:'rc-1', name:'Jesse Dragstra',  org:'Parabol Partners', status:'active',  tier:'owner',   roles:6, submitted:38, placed:5, rev:142000, fee:'22%', joined:'2024-02', email:'jesse@parabol.work', phone:'+1 (415) 555 0129', linkedin:'linkedin.com/in/jessedragstra', location:'New York, NY', timezone:'ET', portfolio:'parabol.work/jesse', bio:'12 years placing platform + infra engineers for fintech and devtools.' },
    { id:'rc-2', name:'Mira Holt',       org:'Parabol Partners', status:'active',  tier:'senior',  roles:5, submitted:29, placed:3, rev:96000,  fee:'22%', joined:'2024-03', email:'mira@parabol.work', phone:'+1 (646) 555 0284', linkedin:'linkedin.com/in/miraholt',    location:'Brooklyn, NY', timezone:'ET', portfolio:'parabol.work/mira',  bio:'Mobile and design recruiter, ex-Figma partnerships.' },
    { id:'rc-3', name:'Noor Salim',      org:'Cedar & Finch',    status:'active',  tier:'senior',  roles:4, submitted:22, placed:2, rev:64000,  fee:'20%', joined:'2024-07', email:'noor@cedarfinch.co', phone:'+44 20 7946 0914', linkedin:'linkedin.com/in/noorsalim',   location:'London, UK',    timezone:'GMT', portfolio:'cedarfinch.co/noor', bio:'Growth + product recruiter based in London.' },
    { id:'rc-4', name:'Ben Ortiz',       org:'Independent',       status:'active',  tier:'junior',  roles:2, submitted:11, placed:0, rev:0,      fee:'20%', joined:'2024-09', email:'ben@ortiz.work', phone:'+1 (510) 555 0447', linkedin:'linkedin.com/in/benortiz',    location:'Oakland, CA',  timezone:'PT',  portfolio:'ortiz.work',          bio:'Solo recruiter focused on early-stage startups.' },
    { id:'rc-5', name:'Aiko Sato',       org:'Northfield Talent',status:'dormant', tier:'senior',  roles:0, submitted:2,  placed:0, rev:0,      fee:'22%', joined:'2024-06', email:'aiko@northfield.io', phone:'+81 3 4560 0192',  linkedin:'linkedin.com/in/aikosato',    location:'Tokyo, JP',    timezone:'JST', portfolio:'northfield.io/aiko', bio:'APAC exec recruiter, dormant since Q3.' },
    {
      id:'rc-6', name:'Theo Callahan', org:'Independent', status:'pending', tier:'—', roles:0, submitted:0, placed:0, rev:0, fee:'—', joined:'pending', email:'theo@callahan.co',
      phone:'+1 (213) 555 0381', linkedin:'linkedin.com/in/theo-callahan', location:'Los Angeles, CA', timezone:'PT',
      portfolio:'theocallahan.com', bio:'8 yrs placing ML + research engineers; ex-Scale, ex-Cohere partnerships.',
      specialties:['Machine Learning','Research','Infra'], yearsExp:8, appliedAt:'2 days ago',
      prevClients:['Scale AI','Cohere','Hugging Face','Replicate'],
      references:[
        { name:'Sasha Luccioni', role:'Research Lead · Hugging Face', email:'sasha@hf.co' },
        { name:'Arnav Kapoor',   role:'Head of Talent · Cohere',      email:'arnav@cohere.com' },
      ],
      notes:'Submitted 3 strong references. Portfolio checks out. LinkedIn shows consistent tenure.',
    },
    {
      id:'rc-7', name:'Rhea Vijay', org:'Independent', status:'pending', tier:'—', roles:0, submitted:0, placed:0, rev:0, fee:'—', joined:'pending', email:'rhea@vijay.ai',
      phone:'+1 (929) 555 0719', linkedin:'linkedin.com/in/rheavijay', location:'Austin, TX', timezone:'CT',
      portfolio:'vijay.ai', bio:'Design + product recruiter, 5 yrs. Previously in-house at Figma and Notion.',
      specialties:['Product Design','Brand','PM'], yearsExp:5, appliedAt:'5 days ago',
      prevClients:['Figma','Notion','Arc','Raycast'],
      references:[
        { name:'Alex Barron', role:'Head of Design · Arc', email:'alex@thebrowser.company' },
      ],
      notes:'Only one reference provided — request a second before approving.',
    },
    {
      id:'rc-9', name:'Devon Marsh', org:'Independent', status:'pending', tier:'—', roles:0, submitted:0, placed:0, rev:0, fee:'—', joined:'pending', email:'devon@marshtalent.co',
      phone:'+1 (347) 555 0822', linkedin:'linkedin.com/in/devonmarsh', location:'Remote · NYC', timezone:'ET',
      portfolio:'marshtalent.co', bio:'Revenue + GTM recruiter, ex-Klaviyo in-house for 4 yrs.',
      specialties:['Sales','RevOps','Customer Success'], yearsExp:6, appliedAt:'1 day ago',
      prevClients:['Klaviyo','Gong','Ramp'],
      references:[
        { name:'Lina Park', role:'VP Revenue · Gong', email:'lina@gong.io' },
        { name:'Mike Stein', role:'Head of GTM · Klaviyo', email:'mike@klaviyo.com' },
        { name:'Ravi Menon', role:'Recruiting Lead · Ramp', email:'ravi@ramp.com' },
      ],
      notes:'Complete profile. 3 solid references, all contactable.',
    },
    { id:'rc-8', name:'Marcus Aalto',    org:'Parabol Partners', status:'revoked', tier:'senior',  roles:0, submitted:14, placed:1, rev:22000,  fee:'22%', joined:'2024-04', email:'marcus@parabol.work', phone:'+358 40 555 0018', linkedin:'linkedin.com/in/marcus-aalto', location:'Helsinki, FI', timezone:'EET', portfolio:'parabol.work/marcus', bio:'Revoked for unresponsive communication.' },
  ];

  const pendingOrgs = [
    {
      id:'org-p1', name:'Hearth Robotics', type:'company', tier:'Growth', logo:'H',
      domain:'hearth.ai', primary:'Alana Frost', primaryTitle:'VP of People',
      email:'alana@hearth.ai', phone:'+1 (206) 555 0448', linkedin:'linkedin.com/company/hearth-robotics', website:'hearth.ai',
      size:'60–120', hq:'Seattle, WA', appliedAt:'1 day ago',
      expectedRoles:['Robotics SWE','Embedded Firmware','Sr Mech Eng'], expectedHires:8,
      funding:'Series B · $42M', investors:'Index, Founders Fund',
      notes:'Introduced by Linear CEO. Likely strong fit — escalated to partner team.', stage:'new',
    },
    {
      id:'org-p2', name:'Vantage Health', type:'company', tier:'Enterprise', logo:'V',
      domain:'vantagehealth.io', primary:'Dr. Ruben Patel', primaryTitle:'CTO',
      email:'ruben@vantagehealth.io', phone:'+1 (312) 555 0174', linkedin:'linkedin.com/company/vantage-health', website:'vantagehealth.io',
      size:'200–400', hq:'Chicago, IL', appliedAt:'4 days ago',
      expectedRoles:['Staff Backend','Clinical AI Lead','Security Eng'], expectedHires:12,
      funding:'Series C · $90M', investors:'GV, a16z Bio',
      notes:'HIPAA-heavy. Contract terms will need legal review.', stage:'review',
    },
    {
      id:'org-p3', name:'Obsidian Capital', type:'company', tier:'Enterprise', logo:'O',
      domain:'obsidiancap.com', primary:'Mira Chen', primaryTitle:'Head of Engineering',
      email:'mira@obsidiancap.com', phone:'+1 (212) 555 0901', linkedin:'linkedin.com/company/obsidian-capital', website:'obsidiancap.com',
      size:'500+', hq:'New York, NY', appliedAt:'2 weeks ago',
      expectedRoles:['Quant Dev','Platform SWE','SRE'], expectedHires:6,
      funding:'Profitable', investors:'—',
      notes:'Rigorous NDA required before sharing roles with recruiters.', stage:'review',
    },
  ];

  const pendingAgencies = [
    {
      id:'org-p4', name:'Meridian Search', type:'agency', tier:'Agency', logo:'M',
      domain:'meridiansearch.co', primary:'Ines Meira', primaryTitle:'Managing Partner',
      email:'ines@meridiansearch.co', phone:'+351 91 555 0222', linkedin:'linkedin.com/company/meridian-search', website:'meridiansearch.co',
      size:'4 recruiters', hq:'Lisbon, PT', appliedAt:'3 days ago',
      specialties:['Product','Engineering','Design'], recruiterCount:4, yearsActive:6,
      prevClients:['Remote.com','Sword Health','Anchorage'],
      notes:'Strong EU presence. References check out.', stage:'review',
    },
  ];

  const roleSubmittals = [
    {
      id:'rs-1', num:'RS-00481', org:'Ramp', submittedBy:'Catherine Hughes', submittedAt:'3h ago',
      title:'Staff Compiler Engineer', location:'New York', workMode:'Hybrid',
      salary:'$240–310k', bounty:'$28,000', feePct:'22%', guarantee:'90 days',
      headcount:2, priority:'high', confidential:true,
      description:'Rebuild internal expression engine. Rust + LLVM background required.',
      skills:['Rust','LLVM','Compilers','Systems'], seniority:'Staff / Principal',
      status:'pending', agencyRestriction:'preferred-network',
      department:'Platform · Risk Engine', industry:'Fintech', type:'Full-time', level:'Staff',
      visaSponsor:true, phoneScreen:true, difficulty:'Very Hard',
      requirements:'• 7+ years building production compilers, interpreters, or rule engines\n• Deep Rust or C++ in performance-critical environments\n• Familiarity with LLVM, MLIR, or comparable IR frameworks\n• Comfortable owning a system end-to-end — design, ship, debug in prod\n\nBonus:\n• Experience with policy languages, DSLs, or financial rule systems',
      about:'Ramp\'s internal expression engine evaluates millions of policy rules per second. We\'re rebuilding from scratch with a typed IR and ahead-of-time compilation.',
      benefits:'Top-tier comp · 0.05–0.15% equity · Unlimited PTO · $5k learning budget · Hybrid (3 days NY)',
      requiredSkills:['Rust','LLVM/MLIR','Compilers','Systems Design','Production Debugging'],
      niceToHave:['Policy DSLs','MLIR','Financial Domain'],
      redFlags:['Pure research background with no production shipping','FAANG-only career with no early-stage exposure'],
      screeningQs:['Walk me through a compiler or DSL you built end-to-end.','How do you approach correctness guarantees in a system where wrong answers cost money?'],
      hiringManager:{ name:'Eric Glyman', title:'Co-founder & CEO', linkedin:'linkedin.com/in/ericglyman' },
      calibrationBenchmarks:[
        { kind:'candidate', name:'Niko Matsakis', title:'Sr Principal · Rust Compiler · AWS', linkedin:'linkedin.com/in/nikomatsakis',
          location:'Boston, MA', headline:'Compiler engineer. Rust language team.',
          experience:[
            { company:'Amazon Web Services', logo:'A', title:'Sr Principal Engineer · Rust', start:'2020', end:'Present', dur:'5 yrs', desc:'Rust language design + compiler internals.' },
            { company:'Mozilla', logo:'M', title:'Senior Researcher · Servo + Rust', start:'2011', end:'2020', dur:'9 yrs', desc:'Co-designed Rust\'s ownership system.' },
          ],
          education:[ { school:'ETH Zürich', degree:'PhD · Programming Languages', years:'2008' } ] },
      ],
      recommendedCandidates:[
        { init:'NM', color:'#7BB252', name:'Niko Markovic',   title:'Compiler Eng · ex-MongoDB',     fit:96, location:'NYC',   yrs:'9 yrs', match:'Rust + IR design' },
        { init:'AS', color:'#6B3FA0', name:'Aditi Sharma',    title:'Staff SWE · Snowflake',          fit:92, location:'NYC',   yrs:'11 yrs', match:'Query compilers' },
      ],
      aiInsight:'This role rewards depth over breadth. Best fit: someone who has shipped a real compiler or rule engine in production.',
    },
    {
      id:'rs-2', num:'RS-00479', org:'Anthropic', submittedBy:'Dario Odom', submittedAt:'1d ago',
      title:'Head of Safety Engineering', location:'San Francisco', workMode:'Onsite',
      salary:'$380–480k', bounty:'$45,000', feePct:'25%', guarantee:'120 days',
      headcount:1, priority:'high', confidential:true,
      description:'Lead safety eng org. Hire + manage 10+ engineers working on alignment + red-teaming.',
      skills:['Leadership','Safety','ML','Alignment'], seniority:'Executive',
      status:'pending', agencyRestriction:'exclusive',
      department:'Safety · Alignment', industry:'AI Research', type:'Full-time', level:'Executive',
      visaSponsor:true, phoneScreen:true, difficulty:'Very Hard',
      requirements:'• 10+ years engineering leadership, ideally with 5+ leading safety or alignment-adjacent orgs\n• Deep technical background in ML or large-scale distributed systems',
      about:'Anthropic\'s safety org owns alignment, evals, red-teaming, and the policy infra that gates every model release.',
      benefits:'Top-of-band cash · Significant equity · Comprehensive health/dental/vision · Relocation · 4 weeks PTO',
      requiredSkills:['ML Systems','Org Leadership','Hiring at Scale','Public Communication','Strategic Judgment'],
      niceToHave:['Alignment Research','Red-team Ops','Policy Background'],
      redFlags:['No experience hiring or managing senior ICs','Pure research with no engineering shipping'],
      screeningQs:['Tell me about the largest org you\'ve grown from scratch.','How would you set the safety roadmap for the next major model release?'],
      hiringManager:{ name:'Dario Amodei', title:'CEO · Anthropic', linkedin:'linkedin.com/in/darioamodei' },
      calibrationBenchmarks:[],
      recommendedCandidates:[
        { init:'JP', color:'#C44A4A', name:'Jada Park',     title:'VP Safety · ex-OpenAI',     fit:94, location:'SF', yrs:'14 yrs', match:'Org build + alignment' },
      ],
      aiInsight:'Hire-the-IC-and-the-manager. Need someone who can write policy with one hand and ship infra with the other.',
    },
    {
      id:'rs-3', num:'RS-00477', org:'Vercel', submittedBy:'Guillermo Rauch', submittedAt:'2d ago',
      title:'Senior DX Engineer', location:'Remote', workMode:'Remote',
      salary:'$190–240k', bounty:'$22,000', feePct:'22%', guarantee:'90 days',
      headcount:1, priority:'med', confidential:false,
      description:'Ship DX improvements for Next.js. Deep TypeScript + ecosystem experience required.',
      skills:['TypeScript','Next.js','DX','OSS'], seniority:'Senior',
      status:'pending', agencyRestriction:'any',
      department:'Next.js · DX', industry:'Developer Tools', type:'Full-time', level:'Senior',
      visaSponsor:false, phoneScreen:true, difficulty:'Hard',
      requirements:'• 5+ years TypeScript in production at scale\n• Active OSS contributor',
      about:'Next.js powers a meaningful chunk of the modern web. The DX team owns everything between developer keystroke and dev-server feedback.',
      benefits:'Fully remote · $200/mo coworking · $5k home office · 4 weeks PTO · Stock options',
      requiredSkills:['TypeScript','Next.js','Build Tools','OSS','Public Communication'],
      niceToHave:['Rust (Turbopack)','Compiler basics','Twitter presence'],
      redFlags:['Has never published a public OSS contribution'],
      screeningQs:['Show me a PR you\'re proud of in OSS.','What\'s wrong with Next.js DX today, and what would you fix first?'],
      hiringManager:{ name:'Tim Neutkens', title:'Lead · Next.js', linkedin:'linkedin.com/in/timneutkens' },
      calibrationBenchmarks:[],
      recommendedCandidates:[
        { init:'TC', color:'#2FA79A', name:'Tomás Cárdenas', title:'OSS · ex-Astro core', fit:91, location:'Remote · MX', yrs:'7 yrs', match:'TypeScript + DX OSS' },
      ],
      aiInsight:'Bias toward OSS-first profiles.',
    },
    {
      id:'rs-4', num:'RS-00474', org:'Linear', submittedBy:'Karri Saarinen', submittedAt:'5d ago',
      title:'Design Engineer', location:'Remote EU', workMode:'Remote',
      salary:'€120–160k', bounty:'€16,000', feePct:'20%', guarantee:'60 days',
      headcount:1, priority:'med', confidential:false,
      description:'Design engineer sitting between product and engineering.',
      skills:['Design','TypeScript','Figma','Motion'], seniority:'Senior',
      status:'needs-info', agencyRestriction:'any',
      needsInfo:'Client has not confirmed whether relocation is offered.',
      department:'Product · Design Engineering', industry:'Productivity Software', type:'Full-time', level:'Senior',
      visaSponsor:false, phoneScreen:true, difficulty:'Hard',
      requirements:'• 5+ years bridging design and engineering',
      about:'Linear\'s design engineering team ships interactions, not mockups.',
      benefits:'Remote-first (EU timezones preferred) · Annual offsite · Comprehensive health · Stock options',
      requiredSkills:['TypeScript','React','Figma','Motion Design','Visual Craft'],
      niceToHave:['Swift / SwiftUI','Rive / Lottie','3D / WebGL'],
      redFlags:['Engineers who treat design as decoration'],
      screeningQs:['Walk me through one shipped interaction you obsessed over.'],
      hiringManager:{ name:'Karri Saarinen', title:'Co-founder & CEO', linkedin:'linkedin.com/in/karrisaarinen' },
      calibrationBenchmarks:[],
      recommendedCandidates:[
        { init:'CV', color:'#C47A4E', name:'Cosmo Vinella', title:'Design Eng · Loom', fit:89, location:'Berlin', yrs:'6 yrs', match:'Motion + craft' },
      ],
      aiInsight:'Portfolio first, resume second.',
    },
    {
      id:'rs-5', num:'RS-00472', org:'Stripe', submittedBy:'Mel Patel', submittedAt:'1w ago',
      title:'Applied ML Researcher', location:'Dublin', workMode:'Hybrid',
      salary:'€160–210k', bounty:'€22,000', feePct:'22%', guarantee:'90 days',
      headcount:2, priority:'low', confidential:false,
      description:'Fraud and risk modeling. PhD preferred, 5+ yrs industry.',
      skills:['ML','Python','Fraud','Research'], seniority:'Senior / Staff',
      status:'pending', agencyRestriction:'preferred-network',
      department:'Risk · Applied ML', industry:'Fintech', type:'Full-time', level:'Senior / Staff',
      visaSponsor:true, phoneScreen:true, difficulty:'Hard',
      requirements:'• PhD in ML, statistics, or related\n• 5+ years shipping ML models in adversarial domains',
      about:'Stripe\'s risk team models run on every transaction.',
      benefits:'Hybrid (3 days Dublin) · Relocation support · Comprehensive Irish + private health · RSU equity',
      requiredSkills:['Python','PyTorch','ML in Production','Fraud / Risk','Statistics'],
      niceToHave:['Streaming ML','Adversarial Robustness','Causal Inference'],
      redFlags:['Pure academic with no production deployment experience'],
      screeningQs:['Walk me through a model you shipped to production.'],
      hiringManager:{ name:'Mel Patel', title:'Head of Risk · Stripe', linkedin:'linkedin.com/in/melpatel' },
      calibrationBenchmarks:[],
      recommendedCandidates:[
        { init:'OD', color:'#7BB252', name:'Oisín Donnelly', title:'Sr ML Eng · Revolut', fit:93, location:'Dublin', yrs:'8 yrs', match:'Fraud + streaming' },
      ],
      aiInsight:'Don\'t be impressed by pure publication count.',
    },
  ];

  const activity = [
    { id:'a-001', at:'2 min ago',  kind:'candidate',  actor:'Jesse Dragstra',  verb:'submitted',        target:'Adrien Novak',          to:'Ramp · Senior Platform Engineer' },
    { id:'a-002', at:'14 min ago', kind:'role',       actor:'Ramp',            verb:'opened role',      target:'Staff iOS Engineer',    to:'' },
    { id:'a-003', at:'32 min ago', kind:'contract',   actor:'Anthropic',       verb:'signed contract',  target:'Agency MSA · v4.2',     to:'' },
    { id:'a-004', at:'1h ago',     kind:'candidate',  actor:'Mira Holt',       verb:'moved',            target:'Priya Ramanathan',      to:'→ Technical' },
    { id:'a-005', at:'2h ago',     kind:'org',        actor:'Cedar & Finch',   verb:'invited',          target:'2 recruiters',          to:'' },
    { id:'a-006', at:'3h ago',     kind:'candidate',  actor:'Noor Salim',      verb:'hired',            target:'Leo Zimmerman',         to:'Stripe · Financial Crimes Lead' },
    { id:'a-007', at:'5h ago',     kind:'comment',    actor:'Catherine Hughes',verb:'commented on',     target:'Marcus Holt',           to:'"Strong signal on systems design."' },
    { id:'a-008', at:'yesterday',  kind:'org',        actor:'Platform',        verb:'flagged',          target:'Linear',                to:'health: at-risk' },
    { id:'a-009', at:'yesterday',  kind:'recruiter',  actor:'Theo Callahan',   verb:'applied to join',  target:'Independent',           to:'' },
    { id:'a-010', at:'2 days ago', kind:'email',      actor:'Jesse Dragstra',  verb:'sent email',       target:'5 recruiters',          to:'"New role open · Ramp"' },
  ];

  return { orgs, roles, candidates, recruiters, activity, stages, pendingOrgs, pendingAgencies, roleSubmittals };
})();

export default ADMIN_DATA;
