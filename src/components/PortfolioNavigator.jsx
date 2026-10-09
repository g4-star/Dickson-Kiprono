import { useState } from "react";
import {
  Compass,
  X,
  ArrowRight,
  Sparkles,
  Send,
  RotateCcw,
  ExternalLink,
  BookOpen,
  Trophy,
  CheckCircle2,
} from "lucide-react";
import "./PortfolioNavigator.css";

const topics = [
  {
    id: "about",
    title: "Meet Dickson",
    short: "About Dickson",
    question: "Would you like to explore Dickson's background and professional goals?",
    answer:
      "This is Dickson's About section. It introduces his background, technical interests, and professional direction.",
    keywords: ["about", "background", "who", "dickson", "bio", "profile", "goals"],
  },
  {
    id: "certifications",
    title: "Certifications & Education",
    short: "Certifications",
    question: "Would you like to explore Dickson's certifications, education, and training?",
    answer:
      "This is Dickson's Certifications & Education page, where you can explore his education, training, certifications, and achievements.",
    keywords: ["certification", "certifications", "certificate", "education", "qualification", "moringa", "course", "training"],
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity",
    short: "Cyber skills",
    question: "Would you like to explore Dickson's cybersecurity interests and security domains?",
    answer:
      "This is Dickson's Cybersecurity section, covering his security interests, defensive thinking, network security, Linux, assessments, automation, and security operations.",
    keywords: ["cyber", "cybersecurity", "security", "soc", "pentest", "pentesting", "penetration", "network", "defense", "defensive"],
  },
  {
    id: "projects",
    title: "Projects & Development",
    short: "Projects",
    question: "Would you like to see Dickson's projects and software development work?",
    answer:
      "This is Dickson's Projects section. Explore the projects featured in his portfolio and follow available live-demo or source-code links.",
    keywords: ["project", "projects", "github", "code", "coding", "software", "development", "app", "jumaa", "repository"],
  },
  {
    id: "labs",
    title: "Security Labs & Reports",
    short: "Labs and reports",
    question: "Would you like to view Dickson's hands-on labs and cybersecurity reports?",
    answer:
      "This is Dickson's Labs and Reports section, featuring available security exercises, lab projects, and technical write-ups.",
    keywords: ["lab", "labs", "report", "reports", "writeup", "write-up", "ctf", "hack", "tryhackme", "hack the box"],
  },
  {
    id: "skills",
    title: "Tools & Technical Skills",
    short: "Technical skills",
    question: "Would you like to see the technologies and tools Dickson works with?",
    answer:
      "This is Dickson's Tools & Skills section, covering technologies and tools such as Linux, Python, networking, databases, and security platforms.",
    keywords: ["skill", "skills", "tools", "technology", "technologies", "python", "linux", "wireshark", "nmap", "docker", "database"],
  },
  {
    id: "learning",
    title: "Learning Journey",
    short: "Learning",
    question: "Would you like to explore Dickson's cybersecurity learning journey?",
    answer:
      "This is Dickson's Learning section, highlighting his ongoing development through structured training and hands-on practice.",
    keywords: ["learning", "journey", "study", "studies", "moringa", "cisco", "tryhackme", "hack the box"],
  },
  {
    id: "services",
    title: "Services & Opportunities",
    short: "Hire or collaborate",
    question: "Would you like to explore Dickson's services and potential collaboration opportunities?",
    answer:
      "This is Dickson's Services section. Explore the services listed in his portfolio and get in touch to discuss a project, internship, or professional opportunity.",
    keywords: ["hire", "hiring", "job", "jobs", "work", "service", "services", "freelance", "freelancing", "internship", "internships", "collaborate", "collaboration", "opportunity", "opportunities"],
  },
  {
    id: "security-team",
    title: "Security Team",
    short: "Security team",
    question: "Would you like to visit the Security Team page?",
    answer:
      "This is Dickson's Security Team page. Explore the team profiles and security-related content available there.",
    keywords: ["team", "security team", "members", "people"],
  },
  {
    id: "contact",
    title: "Contact Dickson",
    short: "Contact",
    question: "Would you like to see Dickson's contact information and reach out?",
    answer:
      "This is Dickson's Contact section, where you can find the available contact options and professional links.",
    keywords: ["contact", "email", "phone", "whatsapp", "linkedin", "reach", "message", "talk"],
  },
];


const quizBank = [
  {
    id: "hr-1", category: "hr", type: "open",
    question: "Tell me about yourself and why you are interested in this role.",
    sampleAnswer: "Use Present–Past–Future: introduce your current skills and training, mention a relevant project or practical experience, then explain how this role fits your goals. Keep the answer focused on the employer's needs."
  },
  {
    id: "hr-2", category: "hr", type: "open",
    question: "What is one of your strengths, and how have you demonstrated it?",
    sampleAnswer: "Choose a genuine strength such as problem-solving or persistence. Support it with a specific example from a project, lab, course, or team activity, and explain the result."
  },
  {
    id: "hr-3", category: "hr", type: "open",
    question: "Tell me about a challenge you faced and how you handled it.",
    sampleAnswer: "Use STAR: Situation, Task, Action, Result. Explain what you personally did, what you learned, and how you would apply that learning in the new role."
  },
  {
    id: "hr-4", category: "hr", type: "open",
    question: "Why should we hire you for an entry-level IT or cybersecurity role?",
    sampleAnswer: "Connect your relevant training, practical labs, projects, willingness to learn, and careful approach to security. Give concrete examples and be honest about the areas where you are still developing."
  },
  {
    id: "cyber-1", category: "cyber", type: "mcq",
    question: "Which protocol is commonly used to securely access a remote Linux terminal?",
    options: ["FTP", "SSH", "HTTP", "Telnet"],
    correct: 1,
    explanation: "SSH encrypts remote terminal sessions and is commonly used for secure administration."
  },
  {
    id: "cyber-2", category: "cyber", type: "mcq",
    question: "What should a SOC analyst generally do first after receiving a credible security alert?",
    options: [
      "Delete all affected logs",
      "Immediately shut down every company system",
      "Validate and triage the alert using available evidence",
      "Ignore it until a user complains"
    ],
    correct: 2,
    explanation: "Validate and triage the alert, assess severity and scope, and follow the organization's incident-response procedures."
  },
  {
    id: "cyber-3", category: "cyber", type: "mcq",
    question: "What does the principle of least privilege mean?",
    options: [
      "Everyone receives administrator access",
      "Users receive only the access needed for their tasks",
      "Passwords never expire",
      "Security logs are disabled"
    ],
    correct: 1,
    explanation: "Least privilege limits unnecessary permissions and reduces the impact of compromised accounts."
  },
  {
    id: "cyber-4", category: "cyber", type: "mcq",
    question: "Which Linux command lists files, including hidden files, in a directory?",
    options: ["pwd", "whoami", "ls -a", "mkdir"],
    correct: 2,
    explanation: "The -a option makes ls include hidden entries whose names normally begin with a dot."
  },
  {
    id: "it-1", category: "it", type: "mcq",
    question: "What does an HTTP 404 status usually indicate?",
    options: [
      "The request succeeded",
      "The requested resource was not found",
      "The server is permanently offline",
      "Authentication succeeded"
    ],
    correct: 1,
    explanation: "HTTP 404 means the server could not find the requested resource."
  },
  {
    id: "it-2", category: "it", type: "mcq",
    question: "What is the primary purpose of a database index?",
    options: [
      "To encrypt every database row",
      "To improve lookup and query performance",
      "To replace database backups",
      "To automatically validate every user"
    ],
    correct: 1,
    explanation: "Indexes can speed up data retrieval, although they use storage and can add overhead to writes."
  },
  {
    id: "it-3", category: "it", type: "mcq",
    question: "In Git, what does a commit represent?",
    options: [
      "A saved snapshot of repository changes",
      "A guaranteed deployment to production",
      "A database password",
      "A deleted remote repository"
    ],
    correct: 0,
    explanation: "A commit records a snapshot of tracked project changes in the repository history."
  },
  {
    id: "it-4", category: "it", type: "mcq",
    question: "What is the purpose of an API?",
    options: [
      "To physically repair a computer",
      "To define how software systems communicate",
      "To replace every database",
      "To guarantee that an application has no bugs"
    ],
    correct: 1,
    explanation: "An API defines interfaces and rules that allow software components or systems to exchange data and functionality."
  }
];

function shuffled(items) {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

export default function PortfolioNavigator({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState(() => shuffled(topics).slice(0, 4));
  const [selected, setSelected] = useState(null);
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("");

  const [mode, setMode] = useState("explore");
  const [quizCategory, setQuizCategory] = useState("mixed");
  const [quizQuestion, setQuizQuestion] = useState(null);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCount, setQuizCount] = useState(0);



  function selectQuizQuestion(category, previousId = null) {
    const pool = quizBank.filter(
      (item) => category === "mixed" || item.category === category
    );
    const available = pool.filter((item) => item.id !== previousId);
    const choices = available.length ? available : pool;
    const next = choices[Math.floor(Math.random() * choices.length)];

    setQuizQuestion(next);
    setQuizAnswer("");
    setQuizSubmitted(false);
    setShowSampleAnswer(false);
  }

  function startQuiz(category) {
    setMode("quiz");
    setQuizCategory(category);
    setQuizScore(0);
    setQuizCount(0);
    selectQuizQuestion(category);
  }

  function submitQuizAnswer() {
    if (!quizQuestion || quizQuestion.type !== "mcq" ||
        quizAnswer === "" || quizSubmitted) return;

    if (Number(quizAnswer) === quizQuestion.correct) {
      setQuizScore((score) => score + 1);
    }

    setQuizCount((count) => count + 1);
    setQuizSubmitted(true);
  }

  function openNavigator() {
    setSuggestions(shuffled(topics).slice(0, 4));
    setSelected(null);
    setReply("");
    setOpen(true);
  }

  function chooseTopic(topic) {
    setSelected(topic);
    setReply("");
  }

  function askQuestion(event) {
    event.preventDefault();

    const question = input.trim().toLowerCase();
    if (!question) return;

    const normalized = question.replace(/[’']/g, "").replace(/\s+/g, " ");

    const hiringIntent =
      /\b(can|could|may|should|would)\s+i\s+(hire|employ|recruit)\b/.test(normalized) ||
      /\b(hire|hiring|employ|employment|recruit|recruiting)\b/.test(normalized) ||
      /\b(work with dickson|bring dickson on board|offer him a job)\b/.test(normalized);

    const salaryIntent =
      /\b(salary|salaries|monthly pay|expected pay|pay expectation|compensation|remuneration|wage|wages|how much.*(earn|charge|pay)|salary expectation|salary range)\b/.test(normalized);

    if (salaryIntent) {
      setSelected(null);
      setReply(
        "Thanks for asking! 😊 As a starting point, expected monthly salary is around KSh 35,000–70,000, depending on the role, responsibilities, and skills required. Dickson is open to negotiation and happy to discuss a package that fits the opportunity. Feel free to explore my services and contact me so we can talk about the details."
      );
      setSuggestions(
        topics.filter((topic) =>
          ["services", "projects", "skills", "contact"].includes(topic.id)
        )
      );
      setInput("");
      setMode("explore");
      return;
    }

    if (hiringIntent) {
      setSelected(null);
      setReply(
        "Absolutely, yes! 😊 Dickson is open to exciting opportunities and collaborations. Feel free to explore his projects and see the amazing work he has been building! You can also check out his services to discover how he could help with your project or team. If you see a good fit, feel free to contact him and start a conversation!"
      );
      setSuggestions(
        topics.filter((topic) =>
          ["services", "projects", "skills", "contact"].includes(topic.id)
        )
      );
      setInput("");
      setMode("explore");
      return;
    }

    const matches = topics
      .map((topic) => ({
        topic,
        score: topic.keywords.reduce(
          (score, keyword) =>
            score + (normalized.includes(keyword.toLowerCase()) ? keyword.length : 0),
          0
        ),
      }))
      .sort((a, b) => b.score - a.score);

    if (matches[0]?.score > 0) {
      chooseTopic(matches[0].topic);
      setInput("");
      return;
    }

    setSelected(null);
    setReply(
      "Hey there! 😊 Dickson's portfolio guide is here to help you explore his work. You can ask me about hiring, salary expectations, projects, cybersecurity, technical skills, education, services, or how to contact him. What would you like to know?"
    );
    setSuggestions(shuffled(topics).slice(0, 4));
    setInput("");
  }

  function handleYes() {
    if (!selected) return;

    const topic = selected;
    setOpen(false);
    setSelected(null);
    setReply("");
    onNavigate(topic.id);
  }

  function handleNo() {
    setSelected(null);
    setSuggestions(shuffled(topics).slice(0, 4));
    setReply("No problem! What else would you like to explore?");
  }

  return (
    <div className="portfolio-navigator">
      {open && (
        <section
          className="pn-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="pn-title"
        >
          <header className="pn-header">
            <div className="pn-avatar">
              <Compass size={23} />
            </div>

            <div className="pn-heading">
              <strong id="pn-title">Portfolio Navigator</strong>
              <span><i /> Dickson's interactive guide</span>
            </div>

            <button
              className="pn-close"
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close portfolio navigator"
            >
              <X size={19} />
            </button>
          </header>

          <div className="pn-content">
            <div className="pn-intro">
              <span className="pn-eyebrow"><Sparkles size={13} /> YOUR PORTFOLIO GUIDE</span>
              <h3>What would you like to discover?</h3>
              <p>
                Pick a topic or ask me where to find something. I'll guide you
                to the right section.
              </p>
            </div>

            <div className="pn-mode-switch">
              <button
                type="button"
                className={mode === "explore" ? "is-active" : ""}
                onClick={() => setMode("explore")}
              >
                <Compass size={15} /> Explore
              </button>
              <button
                type="button"
                className={mode === "quiz" ? "is-active" : ""}
                onClick={() => setMode("quiz")}
              >
                <BookOpen size={15} /> Practice &amp; quizzes
              </button>
            </div>

            {mode === "quiz" ? (
              <div className="pn-quiz">
                <span className="pn-topic-label">PRACTICE MODE</span>

                <div className="pn-quiz-categories">
                  <button type="button" onClick={() => startQuiz("hr")}>
                    HR interviews
                  </button>
                  <button type="button" onClick={() => startQuiz("cyber")}>
                    Cybersecurity
                  </button>
                  <button type="button" onClick={() => startQuiz("it")}>
                    IT &amp; development
                  </button>
                  <button type="button" onClick={() => startQuiz("mixed")}>
                    Random mixed quiz
                  </button>
                </div>

                {quizQuestion ? (
                  <>
                    <div className="pn-quiz-score">
                      <Trophy size={16} />
                      Score: {quizScore}/{quizCount}
                    </div>

                    <h4 className="pn-quiz-question">
                      {quizQuestion.question}
                    </h4>

                    {quizQuestion.type === "mcq" ? (
                      <>
                        <div className="pn-quiz-options">
                          {quizQuestion.options.map((option, index) => (
                            <button
                              type="button"
                              key={option}
                              disabled={quizSubmitted}
                              className={[
                                quizAnswer === String(index) ? "is-selected" : "",
                                quizSubmitted && index === quizQuestion.correct ? "is-correct" : "",
                                quizSubmitted && quizAnswer === String(index) &&
                                  index !== quizQuestion.correct ? "is-incorrect" : "",
                              ].filter(Boolean).join(" ")}
                              onClick={() => setQuizAnswer(String(index))}
                            >
                              {option}
                              {quizSubmitted && index === quizQuestion.correct && (
                                <CheckCircle2 size={16} />
                              )}
                            </button>
                          ))}
                        </div>

                        {quizSubmitted && (
                          <div className="pn-quiz-feedback" role="status">
                            <strong>
                              {Number(quizAnswer) === quizQuestion.correct
                                ? "Correct!"
                                : "Not quite — review the answer."}
                            </strong>
                            <p>{quizQuestion.explanation}</p>
                          </div>
                        )}

                        {!quizSubmitted ? (
                          <button
                            type="button"
                            className="pn-yes pn-quiz-primary"
                            disabled={quizAnswer === ""}
                            onClick={submitQuizAnswer}
                          >
                            Submit answer <ArrowRight size={15} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="pn-yes pn-quiz-primary"
                            onClick={() => selectQuizQuestion(
                              quizCategory, quizQuestion.id
                            )}
                          >
                            Next question <ArrowRight size={15} />
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="pn-quiz-hint">
                          Take a moment to answer aloud or write your response
                          before checking the example.
                        </p>
                        {showSampleAnswer && (
                          <div className="pn-quiz-feedback">
                            <strong>Example answer approach</strong>
                            <p>{quizQuestion.sampleAnswer}</p>
                          </div>
                        )}
                        <div className="pn-choice-row">
                          <button
                            type="button"
                            className="pn-yes"
                            onClick={() => setShowSampleAnswer(true)}
                          >
                            {showSampleAnswer ? "Sample answer shown" : "Show sample answer"}
                          </button>
                          <button
                            type="button"
                            className="pn-no"
                            onClick={() => selectQuizQuestion(
                              quizCategory, quizQuestion.id
                            )}
                          >
                            Next question
                          </button>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <p>Choose a practice category above to begin.</p>
                )}
              </div>
            ) : selected ? (
              <div className="pn-selected-topic">
                <span className="pn-topic-label">YOUR SELECTED TOPIC</span>
                <h4>{selected.title}</h4>
                <p>{selected.question}</p>
                <div className="pn-choice-row">
                  <button type="button" className="pn-yes" onClick={handleYes}>
                    Yes, take me there <ArrowRight size={16} />
                  </button>
                  <button type="button" className="pn-no" onClick={handleNo}>
                    No, explore more
                  </button>
                </div>
              </div>
            ) : (
              <>
                {reply && (
                  <div className="pn-reply" role="status">{reply}</div>
                )}

                <div className="pn-suggestions">
                  <span className="pn-topic-label">
                    {reply ? "EXPLORE A TOPIC" : "SUGGESTED TOPICS"}
                  </span>
                  {suggestions.map((topic) => (
                    <button
                      type="button"
                      className="pn-topic"
                      key={topic.id}
                      onClick={() => chooseTopic(topic)}
                    >
                      <span>{topic.short}</span>
                      <ArrowRight size={16} />
                    </button>
                  ))}
                </div>

                <form className="pn-ask-form" onSubmit={askQuestion}>
                  <label htmlFor="pn-question">Ask about another topic</label>
                  <div className="pn-input-row">
                    <input
                      id="pn-question"
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      placeholder="e.g. Does Dickson know Python?"
                      autoComplete="off"
                    />
                    <button type="submit" aria-label="Find a portfolio topic">
                      <Send size={17} />
                    </button>
                  </div>
                </form>
              </>
            )}

            <button
              type="button"
              className="pn-reset"
              onClick={() => {
                setSelected(null);
                setReply("");
                setSuggestions(shuffled(topics).slice(0, 4));
              }}
            >
              <RotateCcw size={13} /> Ask something else
            </button>
          </div>

          <footer className="pn-footer">
            <span>EXPLORE • DISCOVER • CONNECT</span>
            <a href="https://github.com/g4-star" target="_blank" rel="noreferrer">
              GitHub <ExternalLink size={12} />
            </a>
          </footer>
        </section>
      )}

      <button
        type="button"
        className={`pn-launcher ${open ? "is-open" : ""}`}
        onClick={open ? () => setOpen(false) : openNavigator}
        aria-expanded={open}
        aria-label={open ? "Close portfolio navigator" : "Open portfolio navigator"}
      >
        {open ? <X size={20} /> : <Compass size={21} />}
        <span>{open ? "Close" : "Explore"}</span>
        {!open && <i className="pn-launcher-dot" />}
      </button>
    </div>
  );
}
