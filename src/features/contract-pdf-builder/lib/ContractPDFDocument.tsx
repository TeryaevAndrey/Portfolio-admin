import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

Font.register({
  family: "Arial",
  fonts: [
    { src: "/fonts/Arial-Regular.ttf" },
    { src: "/fonts/Arial-Bold.ttf", fontWeight: "bold" },
  ],
});

export interface ContractPDFData {
  contractNumber: string;
  contractDate: string;
  city: string;
  // Исполнитель
  sellerName: string;
  sellerAddress: string;
  sellerINN: string;
  sellerOGRN: string;
  sellerRepresentative: string;
  sellerPosition: string;
  sellerBank: string;
  sellerAccount: string;
  sellerBIK: string;
  sellerCorrAccount: string;
  // Заказчик
  clientName: string;
  clientAddress: string;
  clientINN: string;
  clientRepresentative: string;
  clientPosition: string;
  // Условия
  subject: string;
  amount: string;
  currency: string;
  paymentTerms: string;
  startDate: string;
  endDate: string;
  additionalTerms: string;
}

const s = StyleSheet.create({
  page: {
    fontFamily: "Arial",
    fontSize: 10,
    paddingHorizontal: 56,
    paddingVertical: 56,
    lineHeight: 1.5,
    color: "#111",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 20,
    color: "#444",
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 10,
    marginBottom: 6,
    marginTop: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingBottom: 3,
    borderBottom: "1px solid #ccc",
  },
  paragraph: {
    marginBottom: 6,
    textAlign: "justify",
  },
  bold: {
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    marginBottom: 3,
  },
  label: {
    fontWeight: "bold",
    width: 130,
    flexShrink: 0,
  },
  value: {
    flex: 1,
  },
  signRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 36,
  },
  signCol: {
    width: "47%",
  },
  signColTitle: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 10,
  },
  signLine: {
    borderBottom: "1px solid #000",
    marginTop: 28,
    marginBottom: 4,
  },
  signDesc: {
    fontSize: 8,
    color: "#555",
  },
  divider: {
    borderBottom: "1px solid #ddd",
    marginVertical: 10,
  },
});

const Field = ({ label, value }: { label: string; value: string }) => (
  <View style={s.row}>
    <Text style={s.label}>{label}:</Text>
    <Text style={{ flex: 1 }}>{value || "—"}</Text>
  </View>
);

const Section = ({ title }: { title: string }) => (
  <Text style={s.sectionTitle}>{title}</Text>
);

export const ContractPDFDocument = ({ data }: { data: ContractPDFData }) => {
  const num = data.contractNumber || "___";
  const date = data.contractDate || "«___»_______ 20__ г.";
  const city = data.city || "г. Москва";

  return (
    <Document title={`Договор № ${num}`} author={data.sellerName}>
      <Page size="A4" style={s.page}>
        {/* Заголовок */}
        <Text style={s.title}>Договор № {num}</Text>
        <Text style={s.title}>на оказание услуг</Text>
        <Text style={s.subtitle}>{city} &nbsp;&nbsp;•&nbsp;&nbsp; {date}</Text>

        <View style={s.divider} />

        {/* Стороны */}
        <Section title="1. Стороны договора" />

        <Text style={s.paragraph}>
          <Text style={s.bold}>{data.sellerName || "_______________"}</Text>
          {`, именуемое далее «Исполнитель», в лице ${data.sellerPosition || "_______________"} ${data.sellerRepresentative || "_______________"}, действующего на основании Устава, с одной стороны, и`}
        </Text>

        <Text style={s.paragraph}>
          <Text style={s.bold}>{data.clientName || "_______________"}</Text>
          {`, именуемое далее «Заказчик», в лице ${data.clientPosition || "_______________"} ${data.clientRepresentative || "_______________"}, с другой стороны, совместно именуемые «Стороны», заключили настоящий Договор о нижеследующем:`}
        </Text>

        {/* Предмет */}
        <Section title="2. Предмет договора" />
        <Text style={s.paragraph}>{"2.1. "}{data.subject || "Исполнитель обязуется по заданию Заказчика оказать услуги, указанные в настоящем Договоре, а Заказчик обязуется принять и оплатить эти услуги."}</Text>

        {/* Стоимость */}
        <Section title="3. Стоимость и порядок оплаты" />
        <Text style={s.paragraph}>
          {"3.1. Стоимость услуг по настоящему Договору составляет "}
          <Text style={s.bold}>{data.amount ? `${data.amount} ${data.currency || "RUB"}` : "_______________"}</Text>
          {"."}
        </Text>
        <Text style={s.paragraph}>
          {"3.2. "}{data.paymentTerms || "Оплата производится в течение 5 (пяти) рабочих дней с момента подписания Акта сдачи-приёмки оказанных услуг."}
        </Text>

        {/* Сроки */}
        <Section title="4. Сроки исполнения" />
        <Text style={s.paragraph}>
          {"4.1. Дата начала оказания услуг: "}
          <Text style={s.bold}>{data.startDate || "_______________"}</Text>
          {"."}
        </Text>
        <Text style={s.paragraph}>
          {"4.2. Дата завершения оказания услуг: "}
          <Text style={s.bold}>{data.endDate || "_______________"}</Text>
          {"."}
        </Text>

        {/* Допусловия */}
        {data.additionalTerms ? (
          <>
            <Section title="5. Дополнительные условия" />
            <Text style={s.paragraph}>{data.additionalTerms}</Text>
          </>
        ) : null}

        {/* Ответственность (стандартный блок) */}
        <Section title={data.additionalTerms ? "6. Ответственность сторон" : "5. Ответственность сторон"} />
        <Text style={s.paragraph}>За неисполнение или ненадлежащее исполнение обязательств по настоящему Договору Стороны несут ответственность в соответствии с действующим законодательством Российской Федерации.</Text>

        {/* Реквизиты */}
        <Section title="Реквизиты и подписи сторон" />

        <View style={s.signRow}>
          {/* Исполнитель */}
          <View style={s.signCol}>
            <Text style={s.signColTitle}>Исполнитель:</Text>
            <Field label="Наименование" value={data.sellerName} />
            <Field label="Адрес" value={data.sellerAddress} />
            <Field label="ИНН" value={data.sellerINN} />
            <Field label="ОГРН" value={data.sellerOGRN} />
            <Field label="Банк" value={data.sellerBank} />
            <Field label="Р/с" value={data.sellerAccount} />
            <Field label="БИК" value={data.sellerBIK} />
            <Field label="К/с" value={data.sellerCorrAccount} />
            <View style={s.signLine} />
            <Text style={s.signDesc}>{data.sellerRepresentative || "Подпись / Ф.И.О."}</Text>
          </View>

          {/* Заказчик */}
          <View style={s.signCol}>
            <Text style={s.signColTitle}>Заказчик:</Text>
            <Field label="Наименование" value={data.clientName} />
            <Field label="Адрес" value={data.clientAddress} />
            <Field label="ИНН" value={data.clientINN} />
            <View style={s.signLine} />
            <Text style={s.signDesc}>{data.clientRepresentative || "Подпись / Ф.И.О."}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
