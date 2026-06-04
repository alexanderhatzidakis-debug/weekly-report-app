import { useMemo, useRef, useState } from "react";
import html2pdf from "html2pdf.js";

const sites = [
  "Chuck and Blade Rochester",
  "Chuck and Blade Canterbury",
  "Chuck and Blade Ramsgate",
  "Chuck and Blade Maidstone",
  "Bare Bones Rochester",
  "Bare Bones Canterbury",
];

const reportTypes = ["FOH", "GM", "BOH", "Online"];

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const emptyReviews = () =>
  days.reduce((acc, day) => {
    acc[day] = {
      reviews: "",
      one: "",
      two: "",
      three: "",
      four: "",
      five: "",
    };
    return acc;
  }, {});

const reportConfig = {
  FOH: {
    intro: "Google and Trip Advisor weekly front of house report.",
    currentPlatforms: ["Google", "Trip Advisor"],
    monthlyPlatforms: ["Google", "Trip Advisor"],
    errorLabels: [],
    showReviews: false,
    reviewReplyQuestion: true,
  },

  GM: {
    intro:
      "General manager report covering public ratings, Uber error rate and review summary.",
    currentPlatforms: ["Google", "Trip Advisor", "Uber"],
    monthlyPlatforms: ["Google", "Trip Advisor", "Uber"],
    errorLabels: ["This month error rate"],
    showReviews: true,
    reviewReplyQuestion: true,
  },

  BOH: {
    intro: "Back of house Uber ratings and error rate report.",
    scoreLabels: [
      "Overall public score",
      "This week’s score",
      "Last week’s report score",
      "This month score",
    ],
    errorLabels: [
      "This week’s score",
      "Last week’s report score",
      "This month score",
    ],
    showReviews: false,
    reviewReplyQuestion: false,
  },

  Online: {
    intro: "Online Uber platform ratings and error rate report.",
    scoreLabels: [
      "Overall public score",
      "This week’s score",
      "Last week’s report score",
      "This month score",
    ],
    errorLabels: [
      "This week’s error rate",
      "Last week’s report error rate",
      "This month error rate",
    ],
    showReviews: false,
    reviewReplyQuestion: true,
  },
};

export default function App() {
  const reportRef = useRef(null);

  const [form, setForm] = useState({
    manager: "",
    site: "",
    week: "",
    reportType: "FOH",
    currentRatings: {},
    monthlyRatings: {},
    uberScores: {},
    errorRates: {},
    reviews: emptyReviews(),
    allReviewsReplied: "",
    wentWell: "",
    didntGoWell: "",
    improvements: "",
    actionPlan: "",
  });

  const config = reportConfig[form.reportType];

  const totals = useMemo(() => {
    return Object.values(form.reviews).reduce(
      (acc, row) => {
        acc.reviews += Number(row.reviews || 0);
        acc.one += Number(row.one || 0);
        acc.two += Number(row.two || 0);
        acc.three += Number(row.three || 0);
        acc.four += Number(row.four || 0);
        acc.five += Number(row.five || 0);
        return acc;
      },
      { reviews: 0, one: 0, two: 0, three: 0, four: 0, five: 0 }
    );
  }, [form.reviews]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateNested(section, key, value) {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  }

  function updateReview(day, field, value) {
    setForm((prev) => ({
      ...prev,
      reviews: {
        ...prev.reviews,
        [day]: {
          ...prev.reviews[day],
          [field]: value,
        },
      },
    }));
  }

  function downloadPDF() {
    const filename = `${form.reportType || "Report"} Report - ${
      form.site || "Site"
    } - ${form.week || "Week"}.pdf`;

    html2pdf()
      .set({
        margin: [14, 10, 14, 10],
        filename,
        image: {
          type: "jpeg",
          quality: 1,
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
          scrollY: 0,
          windowWidth: reportRef.current.scrollWidth,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
        pagebreak: {
          mode: ["css", "legacy"],
          avoid: [".section", ".ratingBox", ".reflectionBox", "tr"],
        },
      })
      .from(reportRef.current)
      .save();
  }

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
        <header style={styles.header}>
          <div style={styles.logo}>C&B</div>

          <div>
            <h1 style={styles.title}>Weekly Performance Report</h1>
            <p style={styles.subtitle}>
              Select the site, choose the report type, complete each section,
              then save as PDF.
            </p>
          </div>
        </header>

        <main ref={reportRef} style={styles.card}>
          <FormSection number="1" title="Report Details">
            <p style={styles.helpText}>{config.intro}</p>

            <div style={styles.grid}>
              <Field label="Manager Name">
                <input
                  style={styles.input}
                  value={form.manager}
                  onChange={(e) => updateField("manager", e.target.value)}
                />
              </Field>

              <Field label="Restaurant / Site">
                <select
                  style={styles.input}
                  value={form.site}
                  onChange={(e) => updateField("site", e.target.value)}
                >
                  <option value="">Select Site</option>
                  {sites.map((site) => (
                    <option key={site}>{site}</option>
                  ))}
                </select>
              </Field>

              <Field label="Week Starting">
                <input
                  style={styles.input}
                  type="date"
                  value={form.week}
                  onChange={(e) => updateField("week", e.target.value)}
                />
              </Field>

              <Field label="Report Type">
                <select
                  style={styles.input}
                  value={form.reportType}
                  onChange={(e) => updateField("reportType", e.target.value)}
                >
                  {reportTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </Field>
            </div>
          </FormSection>

          {(config.currentPlatforms || config.monthlyPlatforms) && (
            <FormSection number="2" title="Platform Ratings">
              {config.currentPlatforms && (
                <>
                  <h3 style={styles.subTitle}>Current Overall Ratings</h3>
                  <RatingRows
                    rows={config.currentPlatforms}
                    values={form.currentRatings}
                    onChange={(key, value) =>
                      updateNested("currentRatings", key, value)
                    }
                  />
                </>
              )}

              {config.monthlyPlatforms && (
                <>
                  <h3 style={styles.subTitle}>Platform Ratings for the Month</h3>
                  <RatingRows
                    rows={config.monthlyPlatforms}
                    values={form.monthlyRatings}
                    onChange={(key, value) =>
                      updateNested("monthlyRatings", key, value)
                    }
                  />
                </>
              )}
            </FormSection>
          )}

          {config.scoreLabels && (
            <FormSection number="2" title="Platform Ratings Uber">
              <RatingRows
                rows={config.scoreLabels}
                values={form.uberScores}
                onChange={(key, value) =>
                  updateNested("uberScores", key, value)
                }
              />
            </FormSection>
          )}

          {config.errorLabels.length > 0 && (
            <FormSection number="3" title="Uber Error Rate">
              <p style={styles.helpText}>
                Enter the Uber error rate information from the Uber restaurant
                platform.
              </p>

              <RatingRows
                rows={config.errorLabels}
                values={form.errorRates}
                onChange={(key, value) =>
                  updateNested("errorRates", key, value)
                }
              />
            </FormSection>
          )}

          {config.showReviews && (
            <FormSection number="4" title="Reviews Summary">
              <p style={styles.helpText}>
                Log the number of reviews received each day, broken down by star
                rating.
              </p>

              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {[
                        "Day",
                        "Reviews",
                        "1 Star",
                        "2 Star",
                        "3 Star",
                        "4 Star",
                        "5 Star",
                      ].map((h) => (
                        <th key={h} style={styles.th}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {days.map((day) => (
                      <tr key={day}>
                        <td style={styles.dayCell}>{day}</td>

                        {[
                          "reviews",
                          "one",
                          "two",
                          "three",
                          "four",
                          "five",
                        ].map((field) => (
                          <td style={styles.td} key={field}>
                            <input
                              style={styles.tableInput}
                              type="number"
                              min="0"
                              value={form.reviews[day][field]}
                              onChange={(e) =>
                                updateReview(day, field, e.target.value)
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    ))}

                    <tr style={styles.totalRow}>
                      <td style={styles.dayCell}>Totals</td>
                      <td style={styles.td}>{totals.reviews}</td>
                      <td style={styles.td}>{totals.one}</td>
                      <td style={styles.td}>{totals.two}</td>
                      <td style={styles.td}>{totals.three}</td>
                      <td style={styles.td}>{totals.four}</td>
                      <td style={styles.td}>{totals.five}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </FormSection>
          )}

          <FormSection
            number={config.showReviews ? "5" : "4"}
            title="Weekly Reflection and Planning"
          >
            {config.reviewReplyQuestion && (
              <TextArea
                label="Have all reviews been replied to?"
                helper="Use Nory to reply to Google reviews. Trip Advisor needs to be replied to directly."
                value={form.allReviewsReplied}
                onChange={(v) => updateField("allReviewsReplied", v)}
              />
            )}

            <TextArea
              label="What went well this week?"
              helper="Identify successes such as high-performing days, positive feedback, or operational wins."
              value={form.wentWell}
              onChange={(v) => updateField("wentWell", v)}
            />

            <TextArea
              label="What didn’t go well?"
              helper="Highlight challenges such as staffing issues or negative feedback. What have we done to address the issue?"
              value={form.didntGoWell}
              onChange={(v) => updateField("didntGoWell", v)}
            />

            <TextArea
              label="What areas need improvement?"
              helper="Pinpoint specific areas such as site cleaning, speed of service, or customer attentiveness."
              value={form.improvements}
              onChange={(v) => updateField("improvements", v)}
            />

            <TextArea
              label="What is your action plan for next week?"
              helper="Write down concrete steps to address improvements and build on strengths."
              value={form.actionPlan}
              onChange={(v) => updateField("actionPlan", v)}
            />
          </FormSection>
        </main>

        <div style={styles.actions}>
          <button onClick={downloadPDF} style={styles.primaryButton}>
            Download / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function RatingRows({ rows, values, onChange }) {
  return (
    <div style={styles.ratingBox} className="ratingBox">
      {rows.map((row) => (
        <div style={styles.ratingRow} key={row}>
          <strong>{row}</strong>
          <input
            style={styles.input}
            value={values[row] || ""}
            onChange={(e) => onChange(row, e.target.value)}
            placeholder="Enter score / rating"
          />
        </div>
      ))}
    </div>
  );
}

function FormSection({ number, title, children }) {
  return (
    <section style={styles.section} className="section">
      <div style={styles.sectionHeader}>
        <span style={styles.number}>{number}</span>
        <h2 style={styles.sectionTitle}>{title}</h2>
      </div>

      {children}
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      {children}
    </label>
  );
}

function TextArea({ label, helper, value, onChange }) {
  return (
    <label style={styles.field} className="reflectionBox">
      <span style={styles.label}>{label}</span>
      {helper && <span style={styles.helper}>{helper}</span>}
      <textarea
        style={styles.textarea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows="4"
      />
    </label>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4efe7",
    padding: 22,
    fontFamily: "Arial, Helvetica, sans-serif",
    color: "#171717",
  },

  wrapper: {
    maxWidth: 1050,
    margin: "0 auto",
  },

  header: {
    background: "#111",
    color: "white",
    borderRadius: 18,
    padding: 24,
    marginBottom: 18,
    display: "flex",
    alignItems: "center",
    gap: 18,
  },

  logo: {
    width: 60,
    height: 60,
    borderRadius: 14,
    background: "#f6b900",
    color: "#111",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    fontSize: 20,
    flexShrink: 0,
  },

  title: {
    margin: 0,
    fontSize: 32,
    lineHeight: 1.1,
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#ddd",
    fontSize: 15,
    lineHeight: 1.5,
  },

  card: {
    background: "white",
    borderRadius: 18,
    padding: 22,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },

  section: {
    border: "1px solid #e2d4bf",
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    background: "#fffdf9",
    breakInside: "avoid",
    pageBreakInside: "avoid",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },

  number: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "#111",
    color: "#f6b900",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
  },

  sectionTitle: {
    margin: 0,
    fontSize: 22,
  },

  subTitle: {
    margin: "10px 0",
    fontSize: 17,
  },

  helpText: {
    marginTop: -4,
    marginBottom: 16,
    color: "#666",
    fontSize: 14,
    lineHeight: 1.5,
  },

  helper: {
    color: "#666",
    fontSize: 13,
    lineHeight: 1.4,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
  },

  field: {
    display: "grid",
    gap: 6,
    marginBottom: 14,
    breakInside: "avoid",
    pageBreakInside: "avoid",
  },

  label: {
    fontWeight: 800,
    fontSize: 14,
    color: "#333",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    borderRadius: 10,
    border: "1px solid #cdbfa8",
    fontSize: 15,
    background: "white",
    outlineColor: "#f6b900",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: 14,
    borderRadius: 10,
    border: "1px solid #cdbfa8",
    fontSize: 15,
    resize: "vertical",
    fontFamily: "Arial",
    background: "white",
    outlineColor: "#f6b900",
    breakInside: "avoid",
    pageBreakInside: "avoid",
  },

  ratingBox: {
    display: "grid",
    gap: 10,
    marginBottom: 20,
    breakInside: "avoid",
    pageBreakInside: "avoid",
  },

  ratingRow: {
    display: "grid",
    gridTemplateColumns: "minmax(180px, 260px) 1fr",
    gap: 12,
    alignItems: "center",
  },

  tableWrap: {
    overflowX: "visible",
    width: "100%",
    breakInside: "avoid",
    pageBreakInside: "avoid",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
    breakInside: "avoid",
    pageBreakInside: "avoid",
  },

  th: {
    background: "#111",
    color: "white",
    padding: 6,
    textAlign: "center",
    fontSize: 10,
  },

  td: {
    border: "1px solid #e2d4bf",
    padding: 4,
    textAlign: "center",
    fontSize: 10,
  },

  dayCell: {
    border: "1px solid #e2d4bf",
    padding: 5,
    fontWeight: 800,
    background: "#fbf5eb",
    fontSize: 10,
  },

  tableInput: {
    width: "100%",
    maxWidth: 50,
    padding: 4,
    borderRadius: 4,
    border: "1px solid #cdbfa8",
    textAlign: "center",
    fontSize: 10,
    boxSizing: "border-box",
  },

  totalRow: {
    background: "#fff1bc",
    fontWeight: 800,
  },

  actions: {
    position: "sticky",
    bottom: 0,
    background: "rgba(244,239,231,0.96)",
    padding: "14px 0",
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  primaryButton: {
    background: "#111",
    color: "white",
    border: "none",
    borderRadius: 10,
    padding: "15px 24px",
    fontSize: 16,
    fontWeight: 800,
    cursor: "pointer",
  },
};