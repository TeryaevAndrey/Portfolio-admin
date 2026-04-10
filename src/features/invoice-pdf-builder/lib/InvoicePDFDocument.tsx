import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

Font.register({
  family: "Arial",
  fonts: [
    { src: "/fonts/Arial-Regular.ttf" },
    { src: "/fonts/Arial-Bold.ttf", fontWeight: "bold" },
  ],
});

export interface InvoiceLineItem {
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
}

export interface InvoicePDFData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  // Продавец
  sellerName: string;
  sellerAddress: string;
  sellerINN: string;
  sellerOGRN: string;
  sellerRepresentative: string;
  sellerBank: string;
  sellerAccount: string;
  sellerBIK: string;
  sellerCorrAccount: string;
  // Покупатель
  clientName: string;
  clientAddress: string;
  clientINN: string;
  // Позиции
  items: InvoiceLineItem[];
  vatRate: number; // 0 | 10 | 20
  currency: string;
  notes: string;
}

const s = StyleSheet.create({
  page: {
    fontFamily: "Arial",
    fontSize: 10,
    paddingHorizontal: 42,
    paddingVertical: 42,
    lineHeight: 1.4,
    color: "#111",
  },

  /* ---------- Header ---------- */
  titleBlock: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  titleSub: {
    fontSize: 10,
    textAlign: "center",
    color: "#555",
  },

  /* ---------- Parties ---------- */
  partiesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    border: "1px solid #ccc",
    borderRadius: 4,
  },
  partyBlock: {
    flex: 1,
    padding: 8,
  },
  partyDivider: {
    borderLeft: "1px solid #ccc",
  },
  partyTitle: {
    fontWeight: "bold",
    fontSize: 9,
    textTransform: "uppercase",
    marginBottom: 5,
    color: "#555",
    letterSpacing: 0.5,
  },
  partyName: {
    fontWeight: "bold",
    marginBottom: 3,
  },
  partyLine: {
    fontSize: 9,
    color: "#333",
    marginBottom: 2,
  },

  /* ---------- Table ---------- */
  tableTitle: {
    fontWeight: "bold",
    fontSize: 10,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#2B4B8E",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #ddd",
  },
  tableRowAlt: {
    flexDirection: "row",
    backgroundColor: "#f8f9fc",
    borderBottom: "1px solid #ddd",
  },
  cellBase: {
    padding: "4 6",
    fontSize: 9,
  },
  cellHeader: {
    padding: "5 6",
    fontSize: 9,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  colNum: { width: 24, textAlign: "center" },
  colDesc: { flex: 1 },
  colQty: { width: 44, textAlign: "center" },
  colUnit: { width: 36, textAlign: "center" },
  colPrice: { width: 68, textAlign: "right" },
  colTotal: { width: 72, textAlign: "right", fontWeight: "bold" },

  /* ---------- Totals ---------- */
  totalsBlock: {
    alignItems: "flex-end",
    marginTop: 8,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 3,
  },
  totalsLabel: {
    width: 130,
    textAlign: "right",
    paddingRight: 8,
    color: "#555",
  },
  totalsValue: {
    width: 90,
    textAlign: "right",
    fontWeight: "bold",
  },
  totalsGrandRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
    paddingTop: 5,
    borderTop: "2px solid #000",
  },
  totalsGrandLabel: {
    width: 130,
    textAlign: "right",
    paddingRight: 8,
    fontWeight: "bold",
    fontSize: 11,
  },
  totalsGrandValue: {
    width: 90,
    textAlign: "right",
    fontWeight: "bold",
    fontSize: 11,
  },

  /* ---------- Bank & Footer ---------- */
  bankBlock: {
    marginTop: 16,
    padding: 10,
    border: "1px solid #ccc",
    borderRadius: 4,
  },
  bankTitle: {
    fontWeight: "bold",
    fontSize: 9,
    textTransform: "uppercase",
    marginBottom: 6,
    color: "#555",
    letterSpacing: 0.4,
  },
  bankRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  bankLabel: {
    fontWeight: "bold",
    width: 90,
    fontSize: 9,
  },
  bankValue: {
    flex: 1,
    fontSize: 9,
  },

  notesBlock: {
    marginTop: 12,
  },
  notesTitle: {
    fontWeight: "bold",
    fontSize: 9,
    marginBottom: 3,
    textTransform: "uppercase",
    color: "#555",
  },
  notesText: {
    fontSize: 9,
    color: "#333",
  },

  signatureBlock: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sigCol: {
    width: "45%",
  },
  sigLine: {
    borderBottom: "1px solid #000",
    marginTop: 24,
    marginBottom: 3,
  },
  sigLabel: {
    fontSize: 8,
    color: "#555",
  },
});

const fmt = (n: number, currency: string) =>
  `${n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;

export const InvoicePDFDocument = ({ data }: { data: InvoicePDFData }) => {
  const currency = data.currency || "RUB";
  const vatRate = data.vatRate ?? 20;

  // Расчёт итогов
  const subtotal = (data.items || []).reduce((sum, it) => sum + (it.qty || 0) * (it.unitPrice || 0), 0);
  const vatAmount = vatRate > 0 ? subtotal * vatRate / 100 : 0;
  const total = subtotal + vatAmount;

  return (
    <Document title={`Счёт № ${data.invoiceNumber || "—"}`} author={data.sellerName}>
      <Page size="A4" style={s.page}>

        {/* ── Заголовок ── */}
        <View style={s.titleBlock}>
          <Text style={s.title}>
            Счёт на оплату № {data.invoiceNumber || "___"}
          </Text>
          <Text style={s.titleSub}>
            Дата выставления: {data.invoiceDate || "___"}
            {"  "}
            {data.dueDate ? `  •  Срок оплаты: ${data.dueDate}` : ""}
          </Text>
        </View>

        {/* ── Стороны ── */}
        <View style={s.partiesRow}>
          <View style={s.partyBlock}>
            <Text style={s.partyTitle}>Поставщик</Text>
            <Text style={s.partyName}>{data.sellerName || "—"}</Text>
            {data.sellerAddress ? <Text style={s.partyLine}>{data.sellerAddress}</Text> : null}
            {data.sellerINN ? <Text style={s.partyLine}>ИНН: {data.sellerINN}{data.sellerOGRN ? `  •  ОГРН: ${data.sellerOGRN}` : ""}</Text> : null}
            {data.sellerRepresentative ? <Text style={s.partyLine}>{data.sellerRepresentative}</Text> : null}
          </View>
          <View style={[s.partyBlock, s.partyDivider]}>
            <Text style={s.partyTitle}>Покупатель</Text>
            <Text style={s.partyName}>{data.clientName || "—"}</Text>
            {data.clientAddress ? <Text style={s.partyLine}>{data.clientAddress}</Text> : null}
            {data.clientINN ? <Text style={s.partyLine}>ИНН: {data.clientINN}</Text> : null}
          </View>
        </View>

        {/* ── Таблица позиций ── */}
        <Text style={s.tableTitle}>Перечень услуг / работ</Text>

        {/* Шапка таблицы */}
        <View style={s.tableHeaderRow}>
          <Text style={[s.cellHeader, s.colNum]}>#</Text>
          <Text style={[s.cellHeader, s.colDesc]}>Наименование</Text>
          <Text style={[s.cellHeader, s.colQty]}>Кол-во</Text>
          <Text style={[s.cellHeader, s.colUnit]}>Ед.</Text>
          <Text style={[s.cellHeader, s.colPrice]}>Цена</Text>
          <Text style={[s.cellHeader, s.colTotal]}>Сумма</Text>
        </View>

        {/* Строки */}
        {(data.items || []).map((item, idx) => {
          const rowTotal = (item.qty || 0) * (item.unitPrice || 0);
          return (
            <View key={idx} style={idx % 2 === 0 ? s.tableRow : s.tableRowAlt}>
              <Text style={[s.cellBase, s.colNum]}>{idx + 1}</Text>
              <Text style={[s.cellBase, s.colDesc]}>{item.description || "—"}</Text>
              <Text style={[s.cellBase, s.colQty]}>{item.qty || 0}</Text>
              <Text style={[s.cellBase, s.colUnit]}>{item.unit || "шт."}</Text>
              <Text style={[s.cellBase, s.colPrice]}>{fmt(item.unitPrice || 0, currency)}</Text>
              <Text style={[s.cellBase, s.colTotal]}>{fmt(rowTotal, currency)}</Text>
            </View>
          );
        })}

        {/* ── Итоги ── */}
        <View style={s.totalsBlock}>
          <View style={s.totalsRow}>
            <Text style={s.totalsLabel}>Итого без НДС:</Text>
            <Text style={s.totalsValue}>{fmt(subtotal, currency)}</Text>
          </View>
          {vatRate > 0 ? (
            <View style={s.totalsRow}>
              <Text style={s.totalsLabel}>НДС {vatRate}%:</Text>
              <Text style={s.totalsValue}>{fmt(vatAmount, currency)}</Text>
            </View>
          ) : (
            <View style={s.totalsRow}>
              <Text style={s.totalsLabel}>НДС:</Text>
              <Text style={s.totalsValue}>Без НДС</Text>
            </View>
          )}
          <View style={s.totalsGrandRow}>
            <Text style={s.totalsGrandLabel}>Итого к оплате:</Text>
            <Text style={s.totalsGrandValue}>{fmt(total, currency)}</Text>
          </View>
        </View>

        {/* ── Банковские реквизиты ── */}
        <View style={s.bankBlock}>
          <Text style={s.bankTitle}>Банковские реквизиты поставщика</Text>
          <View style={s.bankRow}>
            <Text style={s.bankLabel}>Банк:</Text>
            <Text style={s.bankValue}>{data.sellerBank || "—"}</Text>
          </View>
          <View style={s.bankRow}>
            <Text style={s.bankLabel}>Расч. счёт:</Text>
            <Text style={s.bankValue}>{data.sellerAccount || "—"}</Text>
          </View>
          <View style={s.bankRow}>
            <Text style={s.bankLabel}>БИК:</Text>
            <Text style={s.bankValue}>{data.sellerBIK || "—"}</Text>
          </View>
          <View style={s.bankRow}>
            <Text style={s.bankLabel}>Корр. счёт:</Text>
            <Text style={s.bankValue}>{data.sellerCorrAccount || "—"}</Text>
          </View>
        </View>

        {/* ── Примечание ── */}
        {data.notes ? (
          <View style={s.notesBlock}>
            <Text style={s.notesTitle}>Примечание</Text>
            <Text style={s.notesText}>{data.notes}</Text>
          </View>
        ) : null}

        {/* ── Подпись ── */}
        <View style={s.signatureBlock}>
          <View style={s.sigCol}>
            <Text style={{ fontSize: 9, marginBottom: 2 }}>Руководитель:</Text>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>{data.sellerRepresentative || "ФИО / Подпись"}</Text>
          </View>
          <View style={s.sigCol}>
            <Text style={{ fontSize: 9, marginBottom: 2 }}>Бухгалтер / М.П.:</Text>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>Подпись / Печать</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
};
