import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { v4 as uuidv4 } from 'uuid';
import {
  cycles,
  reports,
  developmentGoals,
  entries,
  entryGoals,
  reportSummaries,
  archivedGoals,
} from './schema';

// Connect directly to the local database
const client = createClient({ url: 'file:local.db' });
const db = drizzle(client);

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const now = new Date().toISOString();

async function seed() {
  console.log('Clearing existing data...');
  await db.delete(entryGoals);
  await db.delete(reportSummaries);
  await db.delete(archivedGoals);
  await db.delete(entries);
  await db.delete(developmentGoals);
  await db.delete(reports);
  await db.delete(cycles);

  // ── Cycles ──────────────────────────────────────────────
  console.log('Creating cycles...');
  const cycleQ1 = uuidv4();
  const cycleQ2 = uuidv4();

  await db.insert(cycles).values([
    {
      id: cycleQ1,
      name: 'Q1 2026',
      status: 'archived',
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-03-31T23:59:59.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: cycleQ2,
      name: 'Q2 2026',
      status: 'active',
      startDate: '2026-04-01T00:00:00.000Z',
      endDate: null,
      createdAt: '2026-04-01T00:00:00.000Z',
    },
  ]);

  // ── Reports ─────────────────────────────────────────────
  console.log('Creating reports...');
  const reportSarah = uuidv4();
  const reportMarcus = uuidv4();
  const reportElena = uuidv4();
  const reportJames = uuidv4();
  const reportAisha = uuidv4();

  await db.insert(reports).values([
    { id: reportSarah, firstName: 'Sarah', lastName: 'Chen', developmentGoals: null, createdAt: daysAgo(90), updatedAt: daysAgo(2) },
    { id: reportMarcus, firstName: 'Marcus', lastName: 'Johnson', developmentGoals: null, createdAt: daysAgo(90), updatedAt: daysAgo(5) },
    { id: reportElena, firstName: 'Elena', lastName: 'Rodriguez', developmentGoals: null, createdAt: daysAgo(60), updatedAt: daysAgo(1) },
    { id: reportJames, firstName: 'James', lastName: 'O\'Brien', developmentGoals: null, createdAt: daysAgo(60), updatedAt: daysAgo(10) },
    { id: reportAisha, firstName: 'Aisha', lastName: 'Patel', developmentGoals: null, createdAt: daysAgo(30), updatedAt: daysAgo(3) },
  ]);

  // ── Development Goals ───────────────────────────────────
  console.log('Creating development goals...');

  // Sarah's goals
  const goalSarah1 = uuidv4();
  const goalSarah2 = uuidv4();
  const goalSarah3 = uuidv4();

  // Marcus's goals
  const goalMarcus1 = uuidv4();
  const goalMarcus2 = uuidv4();

  // Elena's goals
  const goalElena1 = uuidv4();
  const goalElena2 = uuidv4();
  const goalElena3 = uuidv4();

  // James's goals
  const goalJames1 = uuidv4();
  const goalJames2 = uuidv4();

  // Aisha's goals
  const goalAisha1 = uuidv4();
  const goalAisha2 = uuidv4();

  await db.insert(developmentGoals).values([
    // Sarah
    { id: goalSarah1, reportId: reportSarah, title: 'Lead cross-team architecture reviews', description: 'Take ownership of architecture review process for the platform team. Run at least 2 reviews per sprint and document decisions in ADRs.', sortOrder: 0, createdAt: daysAgo(80), updatedAt: daysAgo(10) },
    { id: goalSarah2, reportId: reportSarah, title: 'Mentor junior engineers', description: 'Provide weekly 1:1 mentoring sessions with two junior engineers. Focus on code review skills and system design thinking.', sortOrder: 1, createdAt: daysAgo(80), updatedAt: daysAgo(15) },
    { id: goalSarah3, reportId: reportSarah, title: 'Improve incident response skills', description: 'Lead at least 3 incident responses this quarter. Write thorough post-mortems and present learnings to the wider team.', sortOrder: 2, createdAt: daysAgo(60), updatedAt: daysAgo(20) },
    // Marcus
    { id: goalMarcus1, reportId: reportMarcus, title: 'Develop product thinking skills', description: 'Participate in product discovery sessions. Write at least 2 product proposals based on user research and data analysis.', sortOrder: 0, createdAt: daysAgo(85), updatedAt: daysAgo(5) },
    { id: goalMarcus2, reportId: reportMarcus, title: 'Improve technical writing', description: 'Publish 3 internal blog posts or RFCs. Get feedback from tech leads on clarity and completeness of documentation.', sortOrder: 1, createdAt: daysAgo(85), updatedAt: daysAgo(12) },
    // Elena
    { id: goalElena1, reportId: reportElena, title: 'Deepen frontend performance expertise', description: 'Complete Core Web Vitals optimization for the main product pages. Reduce LCP by 30% and achieve all green scores.', sortOrder: 0, createdAt: daysAgo(55), updatedAt: daysAgo(3) },
    { id: goalElena2, reportId: reportElena, title: 'Build design system components', description: 'Design and implement 5 reusable components for the shared design system. Ensure full accessibility compliance (WCAG 2.1 AA).', sortOrder: 1, createdAt: daysAgo(55), updatedAt: daysAgo(7) },
    { id: goalElena3, reportId: reportElena, title: 'Present at team tech talks', description: 'Give at least 2 tech talks on frontend topics. Share learnings from performance work and design system architecture.', sortOrder: 2, createdAt: daysAgo(40), updatedAt: daysAgo(1) },
    // James
    { id: goalJames1, reportId: reportJames, title: 'Strengthen data pipeline reliability', description: 'Reduce data pipeline failures by 50%. Implement better monitoring, alerting, and self-healing mechanisms.', sortOrder: 0, createdAt: daysAgo(55), updatedAt: daysAgo(10) },
    { id: goalJames2, reportId: reportJames, title: 'Cross-functional collaboration', description: 'Partner with the analytics team on 2 joint projects. Improve handoff processes and shared documentation.', sortOrder: 1, createdAt: daysAgo(50), updatedAt: daysAgo(15) },
    // Aisha
    { id: goalAisha1, reportId: reportAisha, title: 'Ship mobile onboarding redesign', description: 'Lead the redesign of the mobile onboarding flow. Target 20% improvement in completion rate through A/B testing.', sortOrder: 0, createdAt: daysAgo(25), updatedAt: daysAgo(3) },
    { id: goalAisha2, reportId: reportAisha, title: 'Grow stakeholder communication', description: 'Present project updates to leadership bi-weekly. Practice synthesizing complex technical decisions into clear business outcomes.', sortOrder: 1, createdAt: daysAgo(25), updatedAt: daysAgo(5) },
  ]);

  // ── Entries (Q2 - active cycle) ─────────────────────────
  console.log('Creating entries...');

  const allEntries: {
    id: string;
    reportId: string;
    cycleId: string;
    entryType: string;
    feedbackType?: string | null;
    feedbackGiven?: boolean;
    situation?: string | null;
    behavior?: string | null;
    impact?: string | null;
    title?: string | null;
    notes?: string | null;
    link?: string | null;
    providerName?: string | null;
    createdAt: string;
    updatedAt: string;
    goalLinks?: string[];
  }[] = [];

  // ── Sarah Chen entries ──
  const eSarah1 = uuidv4();
  allEntries.push({
    id: eSarah1, reportId: reportSarah, cycleId: cycleQ2, entryType: 'feedback',
    feedbackType: 'positive', feedbackGiven: true,
    situation: 'During the payments migration architecture review last Tuesday',
    behavior: 'Sarah identified a critical race condition in the proposed design that no one else had caught. She clearly explained the issue using a sequence diagram and proposed two alternative solutions with trade-offs.',
    impact: 'Prevented a potentially severe production bug. The team adopted her suggested approach which also simplified the overall design. Multiple engineers thanked her for the thorough review.',
    title: null, notes: null, link: null, providerName: null,
    createdAt: daysAgo(3), updatedAt: daysAgo(3),
    goalLinks: [goalSarah1],
  });

  const eSarah2 = uuidv4();
  allEntries.push({
    id: eSarah2, reportId: reportSarah, cycleId: cycleQ2, entryType: 'accomplishment',
    feedbackType: null, feedbackGiven: false,
    situation: null, behavior: null, impact: null,
    title: 'Led successful migration of auth service to new identity provider',
    notes: 'Coordinated a zero-downtime migration affecting 2M+ users. Created detailed runbooks, ran 3 dry-runs, and set up comprehensive monitoring dashboards. The migration completed 2 days ahead of schedule with no customer-facing issues.',
    link: null, providerName: null,
    createdAt: daysAgo(7), updatedAt: daysAgo(7),
    goalLinks: [goalSarah3],
  });

  const eSarah3 = uuidv4();
  allEntries.push({
    id: eSarah3, reportId: reportSarah, cycleId: cycleQ2, entryType: 'feedback',
    feedbackType: 'constructive', feedbackGiven: true,
    situation: 'In the weekly team standup when discussing the API versioning strategy',
    behavior: 'Sarah dismissed the junior engineer\'s suggestion without fully hearing them out, and moved on to her own proposal quickly.',
    impact: 'The junior engineer seemed discouraged and didn\'t contribute for the rest of the meeting. Later, their original idea turned out to have merit and had to be revisited.',
    title: null, notes: 'Discussed this in our 1:1. Sarah acknowledged the behavior and committed to being more inclusive in discussions.', link: null, providerName: null,
    createdAt: daysAgo(12), updatedAt: daysAgo(10),
    goalLinks: [goalSarah2],
  });

  const eSarah4 = uuidv4();
  allEntries.push({
    id: eSarah4, reportId: reportSarah, cycleId: cycleQ2, entryType: 'kudos',
    feedbackType: null, feedbackGiven: false,
    situation: null, behavior: null, impact: null,
    title: 'Shoutout from the infrastructure team',
    notes: 'The infra team gave Sarah a public shoutout in the all-hands for her work on improving the CI/CD pipeline. Her changes reduced build times by 40% across all teams.',
    link: null, providerName: null,
    createdAt: daysAgo(5), updatedAt: daysAgo(5),
    goalLinks: [],
  });

  const eSarah5 = uuidv4();
  allEntries.push({
    id: eSarah5, reportId: reportSarah, cycleId: cycleQ2, entryType: 'career_conversation',
    feedbackType: null, feedbackGiven: false,
    situation: null, behavior: null, impact: null,
    title: 'Career growth discussion - Staff Engineer path',
    notes: 'Discussed Sarah\'s interest in the Staff Engineer track. She\'s strong on technical depth and cross-team influence. Areas to develop: strategic thinking at the org level and written communication of technical vision. Recommended she write a tech strategy doc for the platform team as practice.',
    link: null, providerName: null,
    createdAt: daysAgo(14), updatedAt: daysAgo(14),
    goalLinks: [goalSarah1, goalSarah2],
  });

  // ── Marcus Johnson entries ──
  const eMarcus1 = uuidv4();
  allEntries.push({
    id: eMarcus1, reportId: reportMarcus, cycleId: cycleQ2, entryType: 'feedback',
    feedbackType: 'positive', feedbackGiven: true,
    situation: 'During the Q2 planning session when prioritizing the search feature',
    behavior: 'Marcus presented a thorough analysis of user search patterns, combining quantitative data from analytics with qualitative insights from customer interviews. He made a compelling case for re-prioritizing the search overhaul.',
    impact: 'The product team changed the Q2 roadmap based on his analysis. His approach was cited as an example of good product thinking by the VP of Product.',
    title: null, notes: null, link: null, providerName: null,
    createdAt: daysAgo(8), updatedAt: daysAgo(8),
    goalLinks: [goalMarcus1],
  });

  const eMarcus2 = uuidv4();
  allEntries.push({
    id: eMarcus2, reportId: reportMarcus, cycleId: cycleQ2, entryType: 'accomplishment',
    feedbackType: null, feedbackGiven: false,
    situation: null, behavior: null, impact: null,
    title: 'Published RFC on event-driven architecture migration',
    notes: 'Wrote a comprehensive RFC proposing the migration from synchronous API calls to an event-driven architecture for the notification system. Received positive feedback from 4 tech leads. Currently in review with the architecture board.',
    link: null, providerName: null,
    createdAt: daysAgo(6), updatedAt: daysAgo(6),
    goalLinks: [goalMarcus2],
  });

  const eMarcus3 = uuidv4();
  allEntries.push({
    id: eMarcus3, reportId: reportMarcus, cycleId: cycleQ2, entryType: 'feedback',
    feedbackType: 'constructive', feedbackGiven: true,
    situation: 'When reviewing Marcus\'s pull request for the caching layer',
    behavior: 'The PR had minimal documentation and no migration guide for other teams that depend on the cache. Test coverage was below the team standard at 65%.',
    impact: 'Two downstream teams had to delay their releases by a day to understand the cache changes. This created unnecessary friction and could have been avoided with better docs.',
    title: null, notes: 'Marcus took the feedback well and immediately added documentation. We agreed on a PR checklist going forward.', link: null, providerName: null,
    createdAt: daysAgo(15), updatedAt: daysAgo(14),
    goalLinks: [goalMarcus2],
  });

  const eMarcus4 = uuidv4();
  allEntries.push({
    id: eMarcus4, reportId: reportMarcus, cycleId: cycleQ2, entryType: 'notes',
    feedbackType: null, feedbackGiven: false,
    situation: null, behavior: null, impact: null,
    title: 'Observation: growing technical leadership',
    notes: 'Marcus has been increasingly sought out by other engineers for advice on system design. Three different engineers mentioned him as someone who helped unblock them this sprint. He\'s naturally gravitating toward a tech lead role.',
    link: null, providerName: null,
    createdAt: daysAgo(4), updatedAt: daysAgo(4),
    goalLinks: [],
  });

  // ── Elena Rodriguez entries ──
  const eElena1 = uuidv4();
  allEntries.push({
    id: eElena1, reportId: reportElena, cycleId: cycleQ2, entryType: 'accomplishment',
    feedbackType: null, feedbackGiven: false,
    situation: null, behavior: null, impact: null,
    title: 'Achieved all-green Core Web Vitals on product pages',
    notes: 'After 3 weeks of focused work, Elena optimized all main product pages to achieve green Core Web Vitals scores. LCP improved by 42% (exceeding the 30% target), CLS reduced to near-zero, and FID improved by 60%. She documented all optimizations in a detailed internal guide.',
    link: null, providerName: null,
    createdAt: daysAgo(2), updatedAt: daysAgo(2),
    goalLinks: [goalElena1],
  });

  const eElena2 = uuidv4();
  allEntries.push({
    id: eElena2, reportId: reportElena, cycleId: cycleQ2, entryType: 'feedback',
    feedbackType: 'positive', feedbackGiven: true,
    situation: 'During the design system review meeting with the design team',
    behavior: 'Elena presented the new DataTable component with live demos showing accessibility features. She proactively tested with screen readers and had already incorporated feedback from the accessibility audit.',
    impact: 'The design team was impressed and approved the component for the shared library immediately. The accessibility-first approach is now being adopted as a standard practice for all new components.',
    title: null, notes: null, link: null, providerName: null,
    createdAt: daysAgo(5), updatedAt: daysAgo(5),
    goalLinks: [goalElena2],
  });

  const eElena3 = uuidv4();
  allEntries.push({
    id: eElena3, reportId: reportElena, cycleId: cycleQ2, entryType: 'accomplishment',
    feedbackType: null, feedbackGiven: false,
    situation: null, behavior: null, impact: null,
    title: 'Tech talk: "Performance Budgets That Actually Work"',
    notes: 'Elena gave a 30-minute tech talk on implementing performance budgets in CI/CD pipelines. 25+ engineers attended. She shared practical examples from our codebase and provided a starter template that teams can adopt immediately. Several teams are already implementing her recommendations.',
    link: null, providerName: null,
    createdAt: daysAgo(9), updatedAt: daysAgo(9),
    goalLinks: [goalElena1, goalElena3],
  });

  const eElena4 = uuidv4();
  allEntries.push({
    id: eElena4, reportId: reportElena, cycleId: cycleQ2, entryType: 'third_party_feedback',
    feedbackType: null, feedbackGiven: false,
    situation: null, behavior: null, impact: null,
    title: 'Feedback from Design Lead (Maria Santos)',
    notes: '"Elena is one of the best engineering partners I\'ve worked with. She doesn\'t just implement designs — she improves them. Her understanding of accessibility and performance constraints helps us make better design decisions early. The DataTable component she built exceeded our expectations."',
    link: null, providerName: 'Maria Santos',
    createdAt: daysAgo(4), updatedAt: daysAgo(4),
    goalLinks: [goalElena2],
  });

  const eElena5 = uuidv4();
  allEntries.push({
    id: eElena5, reportId: reportElena, cycleId: cycleQ2, entryType: 'kudos',
    feedbackType: null, feedbackGiven: false,
    situation: null, behavior: null, impact: null,
    title: 'Performance improvement recognized by CPO',
    notes: 'The CPO mentioned Elena\'s performance work in the company all-hands, noting the significant improvement in page load times and its positive impact on user engagement metrics.',
    link: null, providerName: null,
    createdAt: daysAgo(1), updatedAt: daysAgo(1),
    goalLinks: [goalElena1],
  });

  // ── James O'Brien entries ──
  const eJames1 = uuidv4();
  allEntries.push({
    id: eJames1, reportId: reportJames, cycleId: cycleQ2, entryType: 'accomplishment',
    feedbackType: null, feedbackGiven: false,
    situation: null, behavior: null, impact: null,
    title: 'Reduced pipeline failures by 35%',
    notes: 'Implemented circuit breakers and retry logic across the top 5 most failure-prone data pipelines. Added PagerDuty integration with smart alerting that reduces noise. Still working toward the 50% target but on good track.',
    link: null, providerName: null,
    createdAt: daysAgo(10), updatedAt: daysAgo(10),
    goalLinks: [goalJames1],
  });

  const eJames2 = uuidv4();
  allEntries.push({
    id: eJames2, reportId: reportJames, cycleId: cycleQ2, entryType: 'feedback',
    feedbackType: 'constructive', feedbackGiven: true,
    situation: 'During the joint planning session with the analytics team',
    behavior: 'James was late to the meeting and hadn\'t reviewed the shared document beforehand. When discussing timelines, he committed to dates without checking with his team first.',
    impact: 'The analytics team planned around his estimates, which later turned out to be unrealistic. This required a difficult renegotiation and strained the working relationship.',
    title: null, notes: 'James acknowledged this was a miss. We set up a pre-meeting prep reminder and agreed he would caveat estimates until confirmed with his team.', link: null, providerName: null,
    createdAt: daysAgo(18), updatedAt: daysAgo(16),
    goalLinks: [goalJames2],
  });

  const eJames3 = uuidv4();
  allEntries.push({
    id: eJames3, reportId: reportJames, cycleId: cycleQ2, entryType: 'notes',
    feedbackType: null, feedbackGiven: false,
    situation: null, behavior: null, impact: null,
    title: 'Check-in: engagement and motivation',
    notes: 'James mentioned feeling somewhat disconnected from the broader product impact of his data work. We discussed ways to increase his visibility into how downstream teams use the data pipelines. Agreed to set up monthly demos with the analytics and product teams.',
    link: null, providerName: null,
    createdAt: daysAgo(11), updatedAt: daysAgo(11),
    goalLinks: [goalJames2],
  });

  // ── Aisha Patel entries ──
  const eAisha1 = uuidv4();
  allEntries.push({
    id: eAisha1, reportId: reportAisha, cycleId: cycleQ2, entryType: 'accomplishment',
    feedbackType: null, feedbackGiven: false,
    situation: null, behavior: null, impact: null,
    title: 'Mobile onboarding v2 prototype shipped',
    notes: 'Completed the prototype for the redesigned mobile onboarding flow. Initial user testing with 12 participants showed a 28% improvement in task completion rate. Currently iterating on the second screen based on user feedback before the full A/B test launch.',
    link: null, providerName: null,
    createdAt: daysAgo(3), updatedAt: daysAgo(3),
    goalLinks: [goalAisha1],
  });

  const eAisha2 = uuidv4();
  allEntries.push({
    id: eAisha2, reportId: reportAisha, cycleId: cycleQ2, entryType: 'feedback',
    feedbackType: 'positive', feedbackGiven: true,
    situation: 'In the leadership update meeting presenting the onboarding project status',
    behavior: 'Aisha delivered a clear, concise presentation that connected technical milestones to business metrics. She confidently answered tough questions from the VP of Engineering about timeline risks and had a clear mitigation plan ready.',
    impact: 'Leadership approved additional resources for the project. The VP mentioned it was one of the best project updates they\'d seen from a mid-level engineer.',
    title: null, notes: null, link: null, providerName: null,
    createdAt: daysAgo(6), updatedAt: daysAgo(6),
    goalLinks: [goalAisha2],
  });

  const eAisha3 = uuidv4();
  allEntries.push({
    id: eAisha3, reportId: reportAisha, cycleId: cycleQ2, entryType: 'third_party_feedback',
    feedbackType: null, feedbackGiven: false,
    situation: null, behavior: null, impact: null,
    title: 'Feedback from Product Manager (Tom Walsh)',
    notes: '"Aisha has been exceptional to work with on the onboarding project. She pushes back constructively when specs are unclear and always comes with data to support her suggestions. She\'s operating well above her level and I\'d strongly support her for promotion consideration."',
    link: null, providerName: 'Tom Walsh',
    createdAt: daysAgo(2), updatedAt: daysAgo(2),
    goalLinks: [goalAisha1, goalAisha2],
  });

  const eAisha4 = uuidv4();
  allEntries.push({
    id: eAisha4, reportId: reportAisha, cycleId: cycleQ2, entryType: 'career_conversation',
    feedbackType: null, feedbackGiven: false,
    situation: null, behavior: null, impact: null,
    title: 'Career discussion - Senior Engineer promotion',
    notes: 'Discussed Aisha\'s readiness for Senior Engineer. She\'s demonstrating strong ownership, cross-functional collaboration, and technical decision-making. Key area to develop before promo: mentoring others and scaling her impact beyond her own projects. Suggested she start pairing with newer team members on the onboarding project.',
    link: null, providerName: null,
    createdAt: daysAgo(8), updatedAt: daysAgo(8),
    goalLinks: [goalAisha2],
  });

  // Insert all entries
  const entryValues = allEntries.map(({ goalLinks: _, ...entry }) => entry);
  await db.insert(entries).values(entryValues);

  // ── Entry-Goal Links ────────────────────────────────────
  console.log('Creating entry-goal links...');
  const links: { id: string; entryId: string; goalId: string; createdAt: string }[] = [];

  for (const entry of allEntries) {
    if (entry.goalLinks && entry.goalLinks.length > 0) {
      for (const goalId of entry.goalLinks) {
        links.push({
          id: uuidv4(),
          entryId: entry.id,
          goalId,
          createdAt: entry.createdAt,
        });
      }
    }
  }

  if (links.length > 0) {
    await db.insert(entryGoals).values(links);
  }

  // ── Archived Goals (Q1 snapshot) ────────────────────────
  console.log('Creating archived goals for Q1...');
  await db.insert(archivedGoals).values([
    {
      id: uuidv4(),
      reportId: reportSarah,
      cycleId: cycleQ1,
      developmentGoals: null,
      goalsSnapshot: JSON.stringify([
        { id: goalSarah1, title: 'Lead cross-team architecture reviews', description: 'Take ownership of architecture review process for the platform team.', sortOrder: 0 },
        { id: goalSarah2, title: 'Mentor junior engineers', description: 'Provide weekly 1:1 mentoring sessions with two junior engineers.', sortOrder: 1 },
      ]),
      createdAt: '2026-03-31T23:59:59.000Z',
    },
    {
      id: uuidv4(),
      reportId: reportMarcus,
      cycleId: cycleQ1,
      developmentGoals: null,
      goalsSnapshot: JSON.stringify([
        { id: goalMarcus1, title: 'Develop product thinking skills', description: 'Participate in product discovery sessions.', sortOrder: 0 },
      ]),
      createdAt: '2026-03-31T23:59:59.000Z',
    },
  ]);

  // ── Summary ─────────────────────────────────────────────
  console.log('\nSeed complete!');
  console.log('  Cycles:    2 (Q1 archived, Q2 active)');
  console.log('  Reports:   5 (Sarah, Marcus, Elena, James, Aisha)');
  console.log('  Goals:     12');
  console.log(`  Entries:   ${allEntries.length}`);
  console.log(`  Goal links: ${links.length}`);
  console.log('  Archived:  2 (Q1 snapshots for Sarah & Marcus)');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
