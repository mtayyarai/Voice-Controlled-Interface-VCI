import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function Hero() {
  return (
    <header className="vci-hero">
      <div className="container">
        <div className="vci-hero__eyebrow">Voice Controlled Interface</div>
        <h1 className="vci-hero__title">
          Build AI agents that are{' '}
          <span className="vci-hero__title-gradient">wired into your app</span>
        </h1>
        <p className="vci-hero__subtitle">
          VCI is a pattern for apps where an AI agent — not a floating
          chatbot, not an RPA script clicking buttons — is <em>the</em>{' '}
          interface. The agent reads your domain state, calls your domain
          functions through a fixed tool contract, and confirms every result
          out loud. The UI is a read-only reflection of state.
        </p>
        <div className="vci-hero__actions">
          <Link
            className="button button--primary button--lg"
            to="/docs/intro"
          >
            Read the spec →
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/implementation-checklist"
          >
            Hand it to an AI coder
          </Link>
          <Link
            className="button button--outline button--lg"
            href="https://github.com/mtayyarai/Voice-Controlled-Interface-VCI"
          >
            GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}

function AgentDiagram() {
  return (
    <section className="vci-section">
      <div className="container">
        <div className="vci-section__eyebrow">The whole point</div>
        <h2 className="vci-section__title">Agents linked to your app</h2>
        <p className="vci-section__lede">
          Most "AI features" bolt a chatbot next to an app and hope the user
          copies the reply back into a form. VCI does the opposite: the agent
          is <strong>inside</strong> the app. It sees your real state on every
          turn, and every action it takes runs through your code — not through
          browser automation or a scraped DOM.
        </p>
        <pre className="vci-diagram">{`┌──────────────────────────────────────────────────────────────┐
│                       Your Application                        │
│                                                               │
│   ┌──────────────┐         ┌──────────────────────────────┐   │
│   │              │  reads  │                              │   │
│   │  Domain      │◄────────│         AI Agent             │   │
│   │  State       │         │      (OpenAI Realtime,       │   │
│   │              │────────►│         gpt-realtime)        │   │
│   │              │ mutates │                              │   │
│   └──────┬───────┘  via    └──────────────┬───────────────┘   │
│          │        tool                    │                   │
│          │        calls                   │ voice in / out    │
│          ▼                                ▼                   │
│   ┌──────────────┐                 ┌──────────────────────┐   │
│   │  Read-only   │                 │   Push-to-Talk mic   │   │
│   │  UI (DOM)    │                 │   +  status pill     │   │
│   └──────────────┘                 └──────────────────────┘   │
└──────────────────────────────────────────────────────────────┘`}</pre>
      </div>
    </section>
  );
}

function PatternComparison() {
  return (
    <section className="vci-section">
      <div className="container">
        <div className="vci-section__eyebrow">Why VCI</div>
        <h2 className="vci-section__title">
          The best way to link an agent to an app
        </h2>
        <p className="vci-section__lede">
          The link between agent and app is <strong>not</strong> the DOM —
          it's a set of tool schemas. One tool per meaningful action. The
          agent picks a tool, your code runs it, and you hand back the fresh
          state. That loop is the whole framework.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table className="vci-table">
            <thead>
              <tr>
                <th>Pattern</th>
                <th>Where the AI lives</th>
                <th>What state it sees</th>
                <th>How it takes action</th>
                <th>Failure mode</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Chatbot widget</td>
                <td>Floating panel</td>
                <td>Only what you pasted into the prompt</td>
                <td>Talks — user must copy reply into a form</td>
                <td>Answers are stale; user does the work anyway</td>
              </tr>
              <tr>
                <td>RPA / DOM automation</td>
                <td>Clicks on behalf of user</td>
                <td>Whatever's visible in the DOM</td>
                <td>Simulates clicks and keystrokes</td>
                <td>Breaks on any layout change; brittle at scale</td>
              </tr>
              <tr>
                <td>Copilot-style inline</td>
                <td>Text editor / IDE</td>
                <td>Local buffer + selection</td>
                <td>Suggests text; user accepts</td>
                <td>Fine for text, doesn't work for domain actions</td>
              </tr>
              <tr className="vci-table__highlight">
                <td>
                  <strong>VCI</strong>
                </td>
                <td>Wired into your data model</td>
                <td>
                  <strong>Full app state, refreshed every turn</strong>
                </td>
                <td>
                  <strong>Typed tool calls into your own functions</strong>
                </td>
                <td>Bounded, testable, deterministic per turn</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function FeatureGrid() {
  const features = [
    {
      title: 'Ground truth every turn',
      body: 'Every tool response echoes `current_state`, so the agent never operates on a stale mental model.',
    },
    {
      title: 'Bounded action space',
      body: 'A closed set of tools (≤ 8 recommended) means the agent can\'t invent an action that doesn\'t exist in your app.',
    },
    {
      title: 'Deterministic execution',
      body: 'Tool handlers are plain functions in your codebase — same testability as any other code path.',
    },
    {
      title: 'No DOM coupling',
      body: 'Redesign the UI, rename buttons, ship a new theme — the agent\'s contract doesn\'t move because it never touched the DOM.',
    },
    {
      title: 'Voice-native',
      body: 'Speech-in, speech-out over WebRTC. No text box, no copy-paste, no context loss between "what I said" and "what the app did."',
    },
    {
      title: 'Framework-agnostic',
      body: 'Vanilla JS, React, Vue, Svelte — VCI is a pattern with four module contracts. Plug it into anything.',
    },
  ];
  return (
    <section className="vci-section">
      <div className="container">
        <div className="vci-section__eyebrow">Why it wins</div>
        <h2 className="vci-section__title">Six properties, one loop</h2>
        <div className="vci-features">
          {features.map((f) => (
            <div key={f.title} className="vci-feature">
              <h3 className="vci-feature__title">{f.title}</h3>
              <p className="vci-feature__body">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Demos() {
  return (
    <section className="vci-section">
      <div className="container">
        <div className="vci-section__eyebrow">See it in action</div>
        <h2 className="vci-section__title">Demos</h2>
        <div className="vci-demos">
          <a
            className="vci-demo"
            href="https://youtu.be/2BkAJLVvpi4"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="vci-demo__thumb"
              src="https://img.youtube.com/vi/2BkAJLVvpi4/hqdefault.jpg"
              alt="DEMO-01 thumbnail"
            />
            <div className="vci-demo__body">
              <div className="vci-demo__title">DEMO-01 — VCI walkthrough</div>
              <p className="vci-demo__desc">
                A first look at the voice-first loop: hold Push-to-Talk, speak
                a command, see the read-only UI update as the agent confirms
                out loud.
              </p>
            </div>
          </a>
          <a
            className="vci-demo"
            href="https://youtu.be/xeTy1f6ZuX4"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="vci-demo__thumb"
              src="https://img.youtube.com/vi/xeTy1f6ZuX4/maxresdefault.jpg"
              alt="DEMO-02 thumbnail"
            />
            <div className="vci-demo__body">
              <div className="vci-demo__title">DEMO-02 — VCI walkthrough</div>
              <p className="vci-demo__desc">
                A second scenario showing tool schemas in action across a
                richer domain and how the agent resolves ambiguous references.
              </p>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

function WhenToUse() {
  return (
    <section className="vci-section">
      <div className="container">
        <div className="vci-section__eyebrow">Know the shape</div>
        <h2 className="vci-section__title">When to use VCI</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="vci-table">
            <thead>
              <tr>
                <th>Good fit</th>
                <th>Bad fit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Personal tools with a bounded action vocabulary</td>
                <td>Multi-user collaborative apps</td>
              </tr>
              <tr>
                <td>Solo users on a single device</td>
                <td>Public deployments without a backend</td>
              </tr>
              <tr>
                <td>To-do, notes, timers, expense capture, kanban, etc.</td>
                <td>Apps needing precise pointer / drag / dense forms</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="vci-section">
      <div className="container" style={{ textAlign: 'center' }}>
        <h2 className="vci-section__title">Ready to ship one?</h2>
        <p className="vci-section__lede" style={{ marginInline: 'auto' }}>
          The spec is written to be handed <em>verbatim</em> to a coding agent
          alongside a description of your target domain. The implementation
          checklist is a task list the agent can work through directly.
        </p>
        <div
          style={{
            display: 'flex',
            gap: '0.85rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link
            className="button button--primary button--lg"
            to="/docs/intro"
          >
            Start with the intro
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/implementation-checklist"
          >
            Jump to the checklist
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="The cleanest way to build an AI agent that is wired directly into your application."
    >
      <Hero />
      <main>
        <AgentDiagram />
        <PatternComparison />
        <FeatureGrid />
        <Demos />
        <WhenToUse />
        <CTA />
      </main>
    </Layout>
  );
}
