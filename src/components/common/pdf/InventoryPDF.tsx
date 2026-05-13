import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { InventoryRow } from "@/components/views/tables/RSIInventoryView";

Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2",
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff2",
      fontWeight: "bold",
    },
  ],
});

interface InventoryPDFData {
  rows: InventoryRow[];
  sheetLabel: string;
  sheetUnit: string;
  exportDate: string;
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 12,
  },
  header: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F59E0B",
    paddingBottom: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: "Inter",
    fontWeight: "bold",
    color: "#1C1917",
  },
  subtitle: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 2,
    fontFamily: "Inter",
  },
  date: {
    fontSize: 8,
    color: "#9CA3AF",
    marginTop: 4,
    fontFamily: "Inter",
  },
  table: {
    flexDirection: "column",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F59E0B",
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  headerCell: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 8,
    fontFamily: "Inter",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
  },
  rowEven: {
    backgroundColor: "#FFFFFF",
  },
  rowOdd: {
    backgroundColor: "#F9FAFB",
  },
  cell: {
    color: "#1C1917",
    fontSize: 8,
    fontFamily: "Inter",
  },
  cellBold: {
    color: "#1C1917",
    fontSize: 8,
    fontWeight: "bold",
    fontFamily: "Inter",
    textAlign: "right",
  },
  cellRight: {
    color: "#1C1917",
    fontSize: 8,
    fontFamily: "Inter",
    textAlign: "right",
  },
  footer: {
    marginTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#E5E7EB",
    paddingTop: 6,
    alignItems: "center",
  },
  footerText: {
    fontSize: 7,
    color: "#9CA3AF",
    fontFamily: "Inter",
  },
});

export const InventoryPDF = ({ data }: { data: InventoryPDFData }) => {
  const { rows, sheetLabel, sheetUnit, exportDate } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>RSI - {sheetLabel}</Text>
          <Text style={styles.subtitle}>Unit: {sheetUnit}</Text>
          <Text style={styles.date}>Diekspor: {exportDate}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { width: "8%" }]}>No</Text>
            <Text style={[styles.headerCell, { width: "16%" }]}>Tanggal</Text>
            <Text
              style={[styles.headerCell, { width: "12%", textAlign: "right" }]}
            >
              Masuk
            </Text>
            <Text
              style={[styles.headerCell, { width: "12%", textAlign: "right" }]}
            >
              Keluar
            </Text>
            <Text
              style={[styles.headerCell, { width: "12%", textAlign: "right" }]}
            >
              Stock
            </Text>
            <Text style={[styles.headerCell, { width: "40%" }]}>
              Keterangan
            </Text>
          </View>

          {rows.map((row, idx) => (
            <View
              key={row.row ?? idx}
              style={[
                styles.tableRow,
                idx % 2 === 0 ? styles.rowEven : styles.rowOdd,
              ]}
            >
              <Text style={[styles.cell, { width: "8%" }]}>{row.row}</Text>
              <Text style={[styles.cell, { width: "16%" }]}>
                {formatDate(row.Tgl)}
              </Text>
              <Text style={[styles.cellRight, { width: "12%" }]}>
                {row.In > 0 ? row.In.toLocaleString("id-ID") : "-"}
              </Text>
              <Text style={[styles.cellRight, { width: "12%" }]}>
                {row.Out > 0 ? row.Out.toLocaleString("id-ID") : "-"}
              </Text>
              <Text style={[styles.cellBold, { width: "12%" }]}>
                {row.Net.toLocaleString("id-ID")}
              </Text>
              <Text style={[styles.cell, { width: "40%" }]}>
                {row.Keterangan || "-"}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Rumah Susu Indonesia - Inventory Dashboard
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default InventoryPDF;
