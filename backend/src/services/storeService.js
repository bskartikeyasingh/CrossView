const mongoose = require('mongoose');
const { getStatus } = require('../config/db');

// In-memory data store for local dev & testing when MongoDB is offline
class MemoryStore {
  constructor() {
    this.users = new Map();
    this.articles = new Map();
    this.events = new Map();
    this.claims = new Map();
    this.reports = new Map();
    this.timelines = new Map();
    this.bookmarks = new Map();
    this.savedReports = new Map();

    this._seedInitialData();
  }

  _seedInitialData() {
    // Seed initial multi-publisher articles
    const seededArticles = [
      {
        _id: '672b10010000000000000001',
        title: 'Global Climate Summit Finalizes Landmark Clean Energy Transition Accord',
        description: 'Over 120 nations signed a binding pact pledging tripling of global renewable capacity by 2030 with dedicated financing mechanisms.',
        content: 'Delegates from 120 countries gathered in Geneva to ratify the Clean Energy Transition Accord. The agreement includes mandatory reporting and a $100 billion annual fund for developing economies.',
        sourceName: 'Reuters',
        sourceDomain: 'reuters.com',
        author: 'Fiona Campbell',
        publishedAt: new Date(Date.now() - 4 * 3600000),
        url: 'https://reuters.com/sustainability/geneva-climate-summit-finalizes-pact',
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
        category: 'Climate',
        country: 'global',
        language: 'en',
        contentAvailability: 'full',
        eventId: '672b20010000000000000001',
        fetchedAt: new Date(),
      },
      {
        _id: '672b10010000000000000002',
        title: 'Nations Pledge $100B in Geneva for Green Infrastructure Amid Heated Negotiations',
        description: 'Developing economies secured a hard-fought $100B commitment, though major fossil fuel producers insisted on transitional gas flexibility.',
        content: 'Negotiations stretched through the night as delegations debated fossil fuel transition clauses. The final text includes transition fuel caveats that drew criticism from small island states.',
        sourceName: 'Associated Press',
        sourceDomain: 'apnews.com',
        author: 'Marcus Vance',
        publishedAt: new Date(Date.now() - 3 * 3600000),
        url: 'https://apnews.com/article/geneva-climate-summit-infrastructure-accord',
        imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1200&auto=format&fit=crop',
        category: 'Climate',
        country: 'global',
        language: 'en',
        contentAvailability: 'full',
        eventId: '672b20010000000000000001',
        fetchedAt: new Date(),
      },
      {
        _id: '672b10010000000000000003',
        title: 'Geneva Climate Treaty: Breakthrough or Compromised Target Roadmap?',
        description: 'Environmental groups caution that loopholes in the $100B transition fund could dilute real-world emission reductions.',
        content: 'While European leaders hailed the accord as a historic triumph, climate watchdogs expressed skepticism over enforcement mechanisms and voluntary self-reporting timelines.',
        sourceName: 'Financial Times',
        sourceDomain: 'ft.com',
        author: 'Elena Rostova',
        publishedAt: new Date(Date.now() - 2 * 3600000),
        url: 'https://ft.com/climate/geneva-accord-analysis-loopholes',
        imageUrl: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=1200&auto=format&fit=crop',
        category: 'Climate',
        country: 'global',
        language: 'en',
        contentAvailability: 'full',
        eventId: '672b20010000000000000001',
        fetchedAt: new Date(),
      },
      {
        _id: '672b10010000000000000004',
        title: 'Central Banks Announce Unified Regulatory Framework for Autonomous AI Systems',
        description: 'International financial regulators agree on strict risk thresholds and mandatory human circuit-breakers for automated algorithmic trading.',
        content: 'A joint coalition of central banking governors issued comprehensive rules governing the integration of generative and autonomous AI across institutional capital markets.',
        sourceName: 'Bloomberg',
        sourceDomain: 'bloomberg.com',
        author: 'Julian Thorne',
        publishedAt: new Date(Date.now() - 8 * 3600000),
        url: 'https://bloomberg.com/news/articles/central-banks-ai-trading-rules',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
        category: 'Economy',
        country: 'global',
        language: 'en',
        contentAvailability: 'full',
        eventId: '672b20010000000000000002',
        fetchedAt: new Date(),
      },
      {
        _id: '672b10010000000000000005',
        title: 'Wall Street Prepares for New Algorithmic Compliance Mandates by Q3',
        description: 'Major investment banking institutions warn of elevated compliance costs while praising clarity in long-delayed AI oversight guidelines.',
        content: 'Executives from top tier financial firms responded to the central banking framework, emphasizing that technical safeguards will require substantial investment before the Q3 deadline.',
        sourceName: 'Wall Street Journal',
        sourceDomain: 'wsj.com',
        author: 'Sarah Jenkins',
        publishedAt: new Date(Date.now() - 7 * 3600000),
        url: 'https://wsj.com/finance/wall-street-algorithm-compliance-rules',
        imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1200&auto=format&fit=crop',
        category: 'Economy',
        country: 'global',
        language: 'en',
        contentAvailability: 'full',
        eventId: '672b20010000000000000002',
        fetchedAt: new Date(),
      },
      {
        _id: '672b10010000000000000006',
        title: 'Next-Generation Quantum Processor Demonstrates Fault-Tolerant Logical Qubits',
        description: 'Physicists achieve a 100x reduction in quantum error rates, clearing a critical threshold for practical cryptographic and molecular simulations.',
        content: 'Researchers at the International Quantum Consortium announced a breakthrough in surface code error correction, maintaining coherence across 48 logical qubits for over ten seconds.',
        sourceName: 'MIT Technology Review',
        sourceDomain: 'technologyreview.com',
        author: 'Dr. Arthur Chen',
        publishedAt: new Date(Date.now() - 12 * 3600000),
        url: 'https://technologyreview.com/quantum-processor-fault-tolerant-qubits',
        imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop',
        category: 'Technology',
        country: 'global',
        language: 'en',
        contentAvailability: 'full',
        eventId: '672b20010000000000000003',
        fetchedAt: new Date(),
      },
      {
        _id: '672b10010000000000000007',
        title: 'Quantum Computing Milestone Sparks Race for Post-Quantum Encryption Deployment',
        description: 'Cybersecurity agencies urge immediate migration to lattice-based cryptographic standards following breakthrough error rates.',
        content: 'Government cybersecurity directorates issued heightened alerts today, noting that practical quantum systems capable of compromising legacy RSA encryption may arrive years sooner than expected.',
        sourceName: 'Wired',
        sourceDomain: 'wired.com',
        author: 'Kim Zetter',
        publishedAt: new Date(Date.now() - 11 * 3600000),
        url: 'https://wired.com/story/quantum-computing-post-rsa-encryption',
        imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop',
        category: 'Technology',
        country: 'global',
        language: 'en',
        contentAvailability: 'full',
        eventId: '672b20010000000000000003',
        fetchedAt: new Date(),
      }
    ];

    seededArticles.forEach(a => this.articles.set(a._id, a));

    // Seed Events
    const seededEvents = [
      {
        _id: '672b20010000000000000001',
        title: 'Geneva Climate Summit Adopts Global Energy Transition Treaty',
        summary: 'More than 120 nations conclude Geneva deliberations with a signed accord establishing a $100 billion annual green infrastructure fund and renewable targets.',
        category: 'Climate',
        country: 'global',
        articleIds: ['672b10010000000000000001', '672b10010000000000000002', '672b10010000000000000003'],
        sourceCount: 3,
        firstReportedAt: new Date(Date.now() - 4 * 3600000),
        lastUpdatedAt: new Date(Date.now() - 2 * 3600000),
        status: 'active',
        confidenceScore: 0.94,
        createdAt: new Date(Date.now() - 4 * 3600000),
      },
      {
        _id: '672b20010000000000000002',
        title: 'Global Regulators Establish Financial AI Compliance Standards',
        summary: 'Central banking coalition issues binding risk guidelines requiring human circuit-breakers and algorithmic auditing in institutional trading.',
        category: 'Economy',
        country: 'global',
        articleIds: ['672b10010000000000000004', '672b10010000000000000005'],
        sourceCount: 2,
        firstReportedAt: new Date(Date.now() - 8 * 3600000),
        lastUpdatedAt: new Date(Date.now() - 7 * 3600000),
        status: 'active',
        confidenceScore: 0.91,
        createdAt: new Date(Date.now() - 8 * 3600000),
      },
      {
        _id: '672b20010000000000000003',
        title: 'Quantum Hardware Error Threshold Cleared in Major Lab Milestone',
        summary: 'Physicists demonstrate 48 fault-tolerant logical qubits, accelerating the timetable for quantum advantage and prompting cybersecurity directives.',
        category: 'Technology',
        country: 'global',
        articleIds: ['672b10010000000000000006', '672b10010000000000000007'],
        sourceCount: 2,
        firstReportedAt: new Date(Date.now() - 12 * 3600000),
        lastUpdatedAt: new Date(Date.now() - 11 * 3600000),
        status: 'active',
        confidenceScore: 0.92,
        createdAt: new Date(Date.now() - 12 * 3600000),
      }
    ];

    seededEvents.forEach(e => this.events.set(e._id, e));

    // Seed Consolidated Reports
    const seededReports = [
      {
        _id: '672b30010000000000000001',
        eventId: '672b20010000000000000001',
        headline: 'Geneva Climate Summit Reaches Consensus on $100B Transition Fund and Clean Energy Targets',
        overview: 'Across coverage from Reuters, Associated Press, and Financial Times, international envoys in Geneva ratified an accord setting binding 2030 clean energy targets alongside an annual financing package.',
        whatHappened: 'Following 72 hours of intensive deliberations, 120 nations formally signed the Clean Energy Transition Accord. The treaty creates an annual $100 billion infrastructure assistance fund while codifying voluntary national carbon caps.',
        sharedInformation: [
          'All outlets confirm 120 participating nations signed the final accord text in Geneva.',
          'Consensus confirmed on a $100 billion annual climate assistance fund for developing economies.',
          'Agreement establishes 2030 as the primary benchmark year for tripling renewable energy capacity.'
        ],
        differences: [
          'Reuters focuses primarily on corporate investment incentives and private equity catalytic funds.',
          'Associated Press highlights overnight diplomatic resistance from oil-producing states demanding transitional fuel caveats.',
          'Financial Times emphasizes structural loopholes in enforcement and criticisms from island developing states.'
        ],
        disputedClaims: [
          'Dispute regarding whether natural gas qualifies as an eligible "transition fuel" under the $100B fund guidelines.',
          'Variance in projections of real-world emission reductions before 2030, ranging from 18% to 27%.'
        ],
        missingContext: [
          'Specific bilateral contribution breakdowns for the $100B fund will not be finalized until next quarter.',
          'Independent verification of compliance mechanisms is left to self-reporting mechanisms.'
        ],
        eventContext: 'This summit follows three prior global rounds marked by deadlocks over loss-and-damage funding provisions.',
        sourceReferences: [
          { sourceName: 'Reuters', sourceDomain: 'reuters.com', title: 'Global Climate Summit Finalizes Landmark Clean Energy Transition Accord', url: 'https://reuters.com/sustainability/geneva-climate-summit-finalizes-pact', publishedAt: new Date(Date.now() - 4 * 3600000).toISOString() },
          { sourceName: 'Associated Press', sourceDomain: 'apnews.com', title: 'Nations Pledge $100B in Geneva for Green Infrastructure Amid Heated Negotiations', url: 'https://apnews.com/article/geneva-climate-summit-infrastructure-accord', publishedAt: new Date(Date.now() - 3 * 3600000).toISOString() },
          { sourceName: 'Financial Times', sourceDomain: 'ft.com', title: 'Geneva Climate Treaty: Breakthrough or Compromised Target Roadmap?', url: 'https://ft.com/climate/geneva-accord-analysis-loopholes', publishedAt: new Date(Date.now() - 2 * 3600000).toISOString() }
        ],
        generatedAt: new Date(Date.now() - 2 * 3600000),
        model: 'gemini-1.5-flash',
        reportVersion: '1.0',
        disclaimer: 'AI-generated consolidated report based on available source material. This report is a synthesis of published coverage and is not independently verified journalism.'
      }
    ];

    seededReports.forEach(r => this.reports.set(r.eventId, r));

    // Seed Claims
    const seededClaims = [
      {
        _id: '672b40010000000000000001',
        eventId: '672b20010000000000000001',
        claimText: '120 nations signed the binding clean energy pact in Geneva.',
        claimType: 'statistic',
        sourceArticleIds: ['672b10010000000000000001', '672b10010000000000000002'],
        supportingEvidence: [
          { sourceName: 'Reuters', articleId: '672b10010000000000000001', url: 'https://reuters.com', quote: 'Delegates from 120 countries gathered in Geneva to ratify...' },
          { sourceName: 'Associated Press', articleId: '672b10010000000000000002', url: 'https://apnews.com', quote: '120 delegations approved the final charter document.' }
        ],
        contradictingEvidence: [],
        evidenceStatus: 'Corroborated by multiple independent sources',
        confidenceScore: 0.98,
        firstReportedDate: new Date(Date.now() - 4 * 3600000),
        lastUpdatedDate: new Date(Date.now() - 2 * 3600000),
      },
      {
        _id: '672b40010000000000000002',
        claimText: 'The $100B transition fund permits investments in transitional natural gas pipelines.',
        claimType: 'policy',
        sourceArticleIds: ['672b10010000000000000002'],
        supportingEvidence: [
          { sourceName: 'Associated Press', articleId: '672b10010000000000000002', url: 'https://apnews.com', quote: 'major fossil fuel producers insisted on transitional gas flexibility' }
        ],
        contradictingEvidence: [
          { sourceName: 'Financial Times', articleId: '672b10010000000000000003', url: 'https://ft.com', quote: 'treaty language remains ambiguous on whether fossil gas qualifies for direct disbursements' }
        ],
        evidenceStatus: 'Disputed by available reports',
        confidenceScore: 0.84,
        firstReportedDate: new Date(Date.now() - 3 * 3600000),
        lastUpdatedDate: new Date(Date.now() - 2 * 3600000),
      },
      {
        _id: '672b40010000000000000003',
        claimText: 'Global emissions will decline by 27% by 2030 as a direct result of the accord.',
        claimType: 'assertion',
        sourceArticleIds: ['672b10010000000000000001'],
        supportingEvidence: [
          { sourceName: 'Reuters', articleId: '672b10010000000000000001', url: 'https://reuters.com', quote: 'proponents estimate up to 27% reduction' }
        ],
        contradictingEvidence: [],
        evidenceStatus: 'Supported by one available source',
        confidenceScore: 0.70,
        firstReportedDate: new Date(Date.now() - 4 * 3600000),
        lastUpdatedDate: new Date(Date.now() - 4 * 3600000),
      }
    ];

    seededClaims.forEach(c => this.claims.set(c._id, c));

    // Seed Timeline
    const seededTimeline = {
      _id: '672b50010000000000000001',
      eventId: '672b20010000000000000001',
      entries: [
        {
          _id: 'entry_1',
          title: 'Preliminary Talks Stall on Loss-and-Damage Terms',
          description: 'Delegations entered closed sessions after disagreement regarding historical accountability language.',
          timestamp: new Date(Date.now() - 14 * 3600000),
          eventDate: new Date(Date.now() - 15 * 3600000),
          sourceName: 'Reuters',
          articleUrl: 'https://reuters.com',
          category: 'first_report'
        },
        {
          _id: 'entry_2',
          title: 'Draft Text Compromise Emerges Overnight',
          description: 'A coalition of European and Latin American delegates drafted a revised $100B compromise proposal.',
          timestamp: new Date(Date.now() - 6 * 3600000),
          eventDate: new Date(Date.now() - 7 * 3600000),
          sourceName: 'Associated Press',
          articleUrl: 'https://apnews.com',
          category: 'development'
        },
        {
          _id: 'entry_3',
          title: 'Final Plenary Vote Approves Geneva Clean Energy Accord',
          description: 'Formal adoption announced with 120 affirmative votes from national delegations.',
          timestamp: new Date(Date.now() - 3 * 3600000),
          eventDate: new Date(Date.now() - 4 * 3600000),
          sourceName: 'Financial Times',
          articleUrl: 'https://ft.com',
          category: 'official_statement'
        }
      ]
    };

    this.timelines.set(seededTimeline.eventId, seededTimeline);
  }
}

const memoryStore = new MemoryStore();

module.exports = { memoryStore };
