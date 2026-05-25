import { useMemo, useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import html2pdf from "html2pdf.js";

const sites = [
  "Chuck and Blade Rochester",
  "Chuck and Blade Canterbury",
  "Chuck and Blade Ramsgate",
  "Chuck and Blade Maidstone",
  "Bare Bones Rochester",
];

const reportTypes = ["FOH", "BOH", "Online"];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const emptyReviews = () =>
  days.reduce((acc, day) => {
    acc[day] = { reviews: "", one: "", two: "", three: "", four: "", five: "" };
    return acc;
  }, {});

export default function App() {
  const reportRef = useRef(null);
  const [sent, setSent] = useState(false);

  const [form, setForm] = useState({
    manager: "",
    site: "",
    week: "",
    reportType: "FOH",
    googleRating: "",
    tripAdvisorRating: "",
    googleMonth: "",
    tripAdvisorMonth: "",
    uberRating: "",
    uberMonth: "",
    uberErrorRate: "",
    reviews: emptyReviews(),
    allReviewsReplied: "",
    wentWell: "",
    didntGoWell: "",
    improvements: "",
    actionPlan: "",
  });

  const isFOH = form.reportType === "FOH";

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
    setSent(false);
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateReview(day, field, value) {
    setSent(false);
    setForm((prev) => ({
      ...prev,
      reviews: {
        ...prev.reviews,
        [day]: { ...prev.reviews[day], [field]: value },
      },
    }));
  }

  function buildReportText() {
    return `
Weekly Performance Report

Manager: ${form.manager}
Site: ${form.site}
Week Starting: ${form.week}
Report Type: ${form.reportType}

${isFOH ? `Google Rating: ${form.googleRating}
Trip Advisor Rating: ${form.tripAdvisorRating}
Google Monthly Average: ${form.googleMonth}
Trip Advisor Monthly Average: ${form.tripAdvisorMonth}` : `Uber Rating: ${form.uberRating}
Uber Monthly Average: ${form.uberMonth}
Uber Error Rate: ${form.uberErrorRate}%`}

Review Totals:
Total Reviews: ${totals.reviews}
1 Star: ${totals.one}
2 Star: ${totals.two}
3 Star: ${totals.three}
4 Star: ${totals.four}
5 Star: ${totals.five}

All reviews replied to:
${form.allReviewsReplied}

What went well:
${form.wentWell}

What didn’t go well:
${form.didntGoWell}

Areas needing improvement:
${form.improvements}

Action plan:
${form.actionPlan}
`;
  }

  async function sendEmail() {
    try {
      await emailjs.send(
        "service_rw8rmhd",
        "template_1bm1x6r",
        { reportText: buildReportText() },
        "mK6eusbx3CUu2NYA4"
      );

      setSent(true);
      alert("Report emailed successfully");
    } catch (error) {
      console.error(error);
      alert("Email failed to send");
    }
  }

  function downloadPDF() {
    const filename = `${form.site || "Weekly Report"} - ${form.week || "No Date"}.pdf`;

    html2pdf()
      .from(reportRef.current)
      .set({
        margin: 8,
        filename,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
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
              Select the site, choose the report type, complete each section, then email or download the report.
            </p>
          </div>
        </header>

        {sent && (
          <div style={styles.success}>
            Report sent successfully.
          </div>
        )}

        <main ref={reportRef} style={styles.card}>
          <FormSection number="1" title="Report Details">
            <div style={styles.grid}>
              <Field label="Manager Name">
                <input style={styles.input} value={form.manager} onChange={(e) => updateField("manager", e.target.value)} />
              </Field>

              <Field label="Site">
                <select style={styles.input} value={form.site} onChange={(e) => updateField("site", e.target.value)}>
                  <option value="">Select Site</option>
                  {sites.map((site) => <option key={site}>{site}</option>)}
                </select>
              </Field>

              <Field label="Week Starting">
                <input style={styles.input} type="date" value={form.week} onChange={(e) => updateField("week", e.target.value)} />
              </Field>

              <Field label="Report Type">
                <select style={styles.input} value={form.reportType} onChange={(e) => updateField("reportType", e.target.value)}>
                  {reportTypes.map((type) => <option key={type}>{type}</option>)}
                </select>
              </Field>
            </div>
          </FormSection>

          <FormSection number="2" title="Platform Ratings">
            <p style={styles.helpText}>
              {isFOH
                ? "Enter Google and Trip Advisor ratings for this week and the current monthly averages."
                : "Enter Uber ratings and error rate for this week and the current monthly average."}
            </p>

            <div style={styles.grid}>
              {isFOH ? (
                <>
                  <Field label="Google Rating">
                    <input style={styles.input} value={form.googleRating} onChange={(e) => updateField("googleRating", e.target.value)} />
                  </Field>
                  <Field label="Trip Advisor Rating">
                    <input style={styles.input} value={form.tripAdvisorRating} onChange={(e) => updateField("tripAdvisorRating", e.target.value)} />
                  </Field>
                  <Field label="Google Monthly Average">
                    <input style={styles.input} value={form.googleMonth} onChange={(e) => updateField("googleMonth", e.target.value)} />
                  </Field>
                  <Field label="Trip Advisor Monthly Average">
                    <input style={styles.input} value={form.tripAdvisorMonth} onChange={(e) => updateField("tripAdvisorMonth", e.target.value)} />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Uber Rating">
                    <input style={styles.input} value={form.uberRating} onChange={(e) => updateField("uberRating", e.target.value)} />
                  </Field>
                  <Field label="Uber Monthly Average">
                    <input style={styles.input} value={form.uberMonth} onChange={(e) => updateField("uberMonth", e.target.value)} />
                  </Field>
                  <Field label="Uber Error Rate %">
                    <input style={styles.input} value={form.uberErrorRate} onChange={(e) => updateField("uberErrorRate", e.target.value)} />
                  </Field>
                </>
              )}
            </div>
          </FormSection>

          <FormSection number="3" title="Reviews Summary">
            <p style={styles.helpText}>
              Log the number of reviews received each day, broken down by star rating.
            </p>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {["Day", "Reviews", "1 Star", "2 Star", "3 Star", "4 Star", "5 Star"].map((h) => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {days.map((day) => (
                    <tr key={day}>
                      <td style={styles.dayCell}>{day}</td>
                      {["reviews", "one", "two", "three", "four", "five"].map((field) => (
                        <td style={styles.td} key={field}>
                          <input
                            style={styles.tableInput}
                            type="number"
                            min="0"
                            value={form.reviews[day][field]}
                            onChange={(e) => updateReview(day, field, e.target.value)}
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

          <FormSection number="4" title="Weekly Reflection and Planning">
            <TextArea label="Have all reviews been replied to?" value={form.allReviewsReplied} onChange={(v) => updateField("allReviewsReplied", v)} />
            <TextArea label="What went well this week?" value={form.wentWell} onChange={(v) => updateField("wentWell", v)} />
            <TextArea label="What didn’t go well?" value={form.didntGoWell} onChange={(v) => updateField("didntGoWell", v)} />
            <TextArea label="What areas need improvement?" value={form.improvements} onChange={(v) => updateField("improvements", v)} />
            <TextArea label="Action plan for next week" value={form.actionPlan} onChange={(v) => updateField("actionPlan", v)} />
          </FormSection>
        </main>

        <div style={styles.actions}>
          <button onClick={sendEmail} style={styles.primaryButton}>Email Report</button>
          <button onClick={downloadPDF} style={styles.secondaryButton}>Download PDF</button>
        </div>
      </div>
    </div>
  );
}

function FormSection({ number, title, children }) {
  return (
    <section style={styles.section}>
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

function TextArea({ label, value, onChange }) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      <textarea style={styles.textarea} value={value} onChange={(e) => onChange(e.target.value)} rows="4" />
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
  success: {
    background: "#e9f8ed",
    color: "#126b2f",
    border: "1px solid #bfe6c9",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontWeight: 700,
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
    marginBottom: 18,
    background: "#fffdf9",
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
  helpText: {
    marginTop: -4,
    marginBottom: 16,
    color: "#666",
    fontSize: 14,
    lineHeight: 1.5,
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
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 760,
  },
  th: {
    background: "#111",
    color: "white",
    padding: 11,
    textAlign: "center",
    fontSize: 14,
  },
  td: {
    border: "1px solid #e2d4bf",
    padding: 8,
    textAlign: "center",
  },
  dayCell: {
    border: "1px solid #e2d4bf",
    padding: 10,
    fontWeight: 800,
    background: "#fbf5eb",
  },
  tableInput: {
    width: 68,
    padding: 8,
    borderRadius: 7,
    border: "1px solid #cdbfa8",
    textAlign: "center",
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
  secondaryButton: {
    background: "#f6b900",
    color: "#111",
    border: "none",
    borderRadius: 10,
    padding: "15px 24px",
    fontSize: 16,
    fontWeight: 800,
    cursor: "pointer",
  },
};