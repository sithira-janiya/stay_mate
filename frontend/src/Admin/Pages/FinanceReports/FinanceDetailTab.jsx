// frontend/src/Pages/Admin/Finance/FinanceDetailsTab.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getFinanceReport } from "../../../services/financeApi";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

/* ===================== PDF ===================== */
const styles = StyleSheet.create({
  page: { padding: 28 },
  title: { fontSize: 20, marginBottom: 4, textAlign: "center" },
  subtitle: { fontSize: 11, marginBottom: 16, textAlign: "center" },
  row: { flexDirection: "row", marginBottom: 8 },
  cellH: { flex: 1, padding: 6, backgroundColor: "#222", color: "#fff", fontSize: 10 },
  cell: { flex: 1, padding: 6, borderBottomWidth: 1, borderBottomColor: "#ddd", fontSize: 10 },
  foot: { fontSize: 9, marginTop: 14, textAlign: "center" }
});
const fmtMoney = (n) => `Rs. ${Number(n || 0).toLocaleString()}`;

const ReportPDF = ({ report, totals }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Finance Report</Text>
      <Text style={styles.subtitle}>
        {`Code: ${report?.reportCode || "-"}  •  Type: ${report?.reportType?.toUpperCase() || "-"}  •  Month: ${report?.month || "-"}`}
      </Text>

      {/* INCOME */}
      <View style={styles.row}>
        <Text style={styles.cellH}>INCOME</Text>
        <Text style={styles.cellH}>AMOUNT</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.cell}>Base Rent</Text>
        <Text style={styles.cell}>{fmtMoney(totals.totalBaseRentIncome)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.cell}>INCOME TOTAL</Text>
        <Text style={styles.cell}>{fmtMoney(totals.totalBaseRentIncome)}</Text>
      </View>

      {/* EXPENSES */}
      <View style={[styles.row, { marginTop: 10 }]}>
        <Text style={styles.cellH}>EXPENSES</Text>
        <Text style={styles.cellH}>AMOUNT</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.cell}>Utilities - Water</Text>
        <Text style={styles.cell}>{fmtMoney(totals.totalWaterCost)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.cell}>Utilities - Electricity</Text>
        <Text style={styles.cell}>{fmtMoney(totals.totalElectricityCost)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.cell}>Meals</Text>
        <Text style={styles.cell}>{fmtMoney(totals.totalMealCost)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.cell}>Income Tax (6%)</Text>
        <Text style={styles.cell}>{fmtMoney(totals.incomeTax)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.cell}>EXPENSE TOTAL</Text>
        <Text style={styles.cell}>{fmtMoney(totals.totalSpendings)}</Text>
      </View>

      {/* NET INCOME (after tax) */}
      <View style={[styles.row, { marginTop: 10 }]}>
        <Text style={styles.cell}>NET INCOME</Text>
        <Text style={styles.cell}>{fmtMoney(totals.profit)}</Text>
      </View>

      <Text style={styles.foot}>
        Generated at: {report?.generatedAt ? new Date(report.generatedAt).toLocaleString() : "-"}
      </Text>
    </Page>
  </Document>
);

/* =============== Donut (SVG) =============== */
function Donut({ income = 0, spendings = 0, profit = 0 }) {
  const r = 52, c = 2 * Math.PI * r;
  const total = Math.max(1, income + spendings + Math.abs(profit));
  const segs = [
    { label: "Income", value: income, className: "stroke-green-500" },
    { label: "Spendings", value: spendings, className: "stroke-red-500" },
    { label: "Profit", value: Math.max(0, profit), className: "stroke-blue-500" },
  ];
  let offset = 0;
  const arcs = segs.map((s, i) => {
    const len = (s.value / total) * c;
    const node = (
      <circle
        key={`${s.label}-${i}`}
        r={r}
        cx="60"
        cy="60"
        fill="transparent"
        strokeWidth="16"
        className={s.className}
        strokeDasharray={`${len} ${c - len}`}
        strokeDashoffset={-offset}
      />
    );
    offset += len;
    return node;
  });

  return (
    <div className="card">
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 120 120" width="140" height="140" className="shrink-0">
          <circle r={r} cx="60" cy="60" fill="transparent" strokeWidth="16" className="stroke-gray-700" />
          {arcs}
          <text x="60" y="64" textAnchor="middle" className="fill-gray-200" fontSize="12">
            Summary
          </text>
        </svg>
        <div className="space-y-1 text-sm">
          <div><span className="inline-block w-3 h-3 rounded-sm bg-green-500 mr-2"></span>Income</div>
          <div><span className="inline-block w-3 h-3 rounded-sm bg-red-500 mr-2"></span>Spendings</div>
          <div><span className="inline-block w-3 h-3 rounded-sm bg-blue-500 mr-2"></span>Profit</div>
        </div>
      </div>
    </div>
  );
}

const moneyTxt = (n) => `Rs. ${Number(n || 0).toLocaleString()}`;

/* =============== PAGE COMPONENT =============== */
export default function FinanceDetailsTab() {
  const { id: code } = useParams(); // route: /admin/finance-reports/:id
  const [report, setReport] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getFinanceReport(code);
        if (mounted) setReport(res);
      } catch (e) {
        if (mounted) setErr(e.message || "Failed to load");
      }
    })();
    return () => { mounted = false; };
  }, [code]);

  const totals = useMemo(() => report?.data?.totals || {
    totalBaseRentIncome: 0,
    totalWaterCost: 0,
    totalElectricityCost: 0,
    totalMealCost: 0,
    incomeTax: 0,
    totalSpendings: 0,
    profit: 0,
  }, [report]);

  if (err) return <div className="text-red-400">{err}</div>;
  if (!report) return <div className="text-gray-400">Loading...</div>;

  // Use backend totals to avoid client-side mismatch
  const income = totals.totalBaseRentIncome || 0;
  const spendings = totals.totalSpendings || 0; // already includes incomeTax
  const profit = totals.profit ?? (income - spendings); // after tax

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-white font-semibold">Income Statement</h3>
            <div className="text-gray-400 text-sm">
              Code: <span className="font-mono">{report.reportCode}</span> • Type: <span className="capitalize">{report.reportType}</span> • Month: {report.month}
            </div>
          </div>
          <PDFDownloadLink
            document={<ReportPDF report={report} totals={totals} />}
            fileName={`finance-report_${report.reportCode}.pdf`}
            className="btn-amber"
          >
            {({ loading }) => (loading ? "Preparing PDF…" : "Download PDF")}
          </PDFDownloadLink>
        </div>
      </div>

      {/* Donut summary */}
      <Donut income={income} spendings={spendings} profit={profit} />

      {/* Income-statement table */}
      <div className="table-wrap">
        <table className="admin">
          <thead>
            <tr>
              <th className="th">DESCRIPTION</th>
              <th className="th">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            <tr><th className="th" colSpan={2}>INCOME</th></tr>
            <tr>
              <td className="td">Base Rent</td>
              <td className="td">{moneyTxt(totals.totalBaseRentIncome)}</td>
            </tr>
            <tr>
              <td className="td font-semibold">INCOME TOTAL</td>
              <td className="td font-semibold">{moneyTxt(totals.totalBaseRentIncome)}</td>
            </tr>

            <tr><th className="th" colSpan={2}>EXPENSES</th></tr>
            <tr>
              <td className="td">Utilities - Water</td>
              <td className="td">{moneyTxt(totals.totalWaterCost)}</td>
            </tr>
            <tr>
              <td className="td">Utilities - Electricity</td>
              <td className="td">{moneyTxt(totals.totalElectricityCost)}</td>
            </tr>
            <tr>
              <td className="td">Meals</td>
              <td className="td">{moneyTxt(totals.totalMealCost)}</td>
            </tr>
            <tr>
              <td className="td">Income Tax (6%)</td>
              <td className="td">{moneyTxt(totals.incomeTax)}</td>
            </tr>
            <tr>
              <td className="td font-semibold">EXPENSE TOTAL</td>
              <td className="td font-semibold">{moneyTxt(totals.totalSpendings)}</td>
            </tr>

            <tr>
              <td className="td font-bold">NET INCOME</td>
              <td className="td font-bold">{moneyTxt(totals.profit)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
