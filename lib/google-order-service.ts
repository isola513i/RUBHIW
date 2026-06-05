import { Readable } from "stream";
import { randomBytes } from "crypto";
import { google } from "googleapis";
import type { CartSummary } from "@/lib/cart";

const ORDERS_SHEET_NAME = "Orders";
const ORDER_ITEMS_SHEET_NAME = "OrderItems";
const GOOGLE_AUTH_SCOPES = ["https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/spreadsheets"];

const defaultOrdersSpreadsheetId = "1w9e4ehrWasyEsIUlNofPLrr6osq5b2vaiwLbcxoZmYU";
const defaultSlipFolderId = "15FzP8o8Pju-mrpUjVdIsXlQf1y00D8ye";

type CreateOrderInput = {
  address: string;
  contact: string;
  customerEmail?: string;
  customerName: string;
  promptPayId: string;
  shippingFee: number;
  slip: File;
  summary: CartSummary;
  userId?: string;
};

const getRequiredEnv = (name: string) => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing ${name}`);
  }

  return value;
};

const hasOAuthCredentials = () =>
  Boolean(
    process.env.GOOGLE_OAUTH_CLIENT_ID?.trim() &&
      process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim() &&
      process.env.GOOGLE_OAUTH_REFRESH_TOKEN?.trim(),
  );

const getGoogleAuth = () => {
  if (hasOAuthCredentials()) {
    const oauthClient = new google.auth.OAuth2(
      getRequiredEnv("GOOGLE_OAUTH_CLIENT_ID"),
      getRequiredEnv("GOOGLE_OAUTH_CLIENT_SECRET"),
      process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim() || "http://localhost:3001/api/google/oauth/callback",
    );

    oauthClient.setCredentials({
      refresh_token: getRequiredEnv("GOOGLE_OAUTH_REFRESH_TOKEN"),
    });

    return oauthClient;
  }

  const clientEmail = getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = getRequiredEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: GOOGLE_AUTH_SCOPES,
  });
};

const getPhoneAndLine = (contact: string) => {
  const normalizedContact = contact.trim();
  const phoneCandidate = normalizedContact.replace(/[\s-]/g, "");
  const isPhone = /^[+0-9]{9,15}$/.test(phoneCandidate);

  return {
    line: isPhone ? "" : normalizedContact,
    phone: isPhone ? normalizedContact : "",
  };
};

const formatSheetDate = (date: Date) => date.toISOString();
const sanitizeSheetText = (value: string) => value.replace(/[\r\n\t]+/g, " ").trim();
const formatSheetText = (value: string) => sanitizeSheetText(value);
const createOrderId = () => `RBW-${randomBytes(4).toString("hex").toUpperCase()}`;

async function uploadSlip(auth: ReturnType<typeof getGoogleAuth>, orderId: string, slip: File) {
  const drive = google.drive({ auth, version: "v3" });
  const slipFolderId = process.env.GOOGLE_DRIVE_SLIP_FOLDER_ID?.trim() || defaultSlipFolderId;
  const slipBuffer = Buffer.from(await slip.arrayBuffer());
  const fileExtension = slip.name.includes(".") ? slip.name.split(".").pop() : "jpg";
  const fileName = `${orderId}-slip.${fileExtension}`;

  const response = await drive.files.create({
    fields: "id, webViewLink",
    media: {
      body: Readable.from(slipBuffer),
      mimeType: slip.type || "image/jpeg",
    },
    requestBody: {
      name: fileName,
      parents: [slipFolderId],
    },
  });

  return {
    fileId: response.data.id ?? "",
    fileName,
    webViewLink: response.data.webViewLink ?? "",
  };
}

async function appendRows(auth: ReturnType<typeof getGoogleAuth>, range: string, values: Array<Array<string | number>>) {
  const sheets = google.sheets({ auth, version: "v4" });
  const spreadsheetId = process.env.GOOGLE_ORDERS_SPREADSHEET_ID?.trim() || defaultOrdersSpreadsheetId;

  await sheets.spreadsheets.values.append({
    range,
    requestBody: {
      values,
    },
    spreadsheetId,
    valueInputOption: "RAW",
  });
}

const normalizeLookupValue = (value: string) => value.trim().toLowerCase().replace(/[\s-]/g, "");

const getLookupVariants = (value: string) => {
  const normalizedValue = normalizeLookupValue(value);
  const variants = new Set([normalizedValue]);

  if (/^\+?\d+$/.test(normalizedValue)) {
    variants.add(normalizedValue.replace(/^0+/, ""));
    variants.add(normalizedValue.replace(/^\+66/, "0"));
    variants.add(normalizedValue.replace(/^66/, "0"));
  }

  return Array.from(variants).filter(Boolean);
};

export type OrderStatusLookupResult = {
  createdAt: string;
  customerName: string;
  itemCount: number;
  orderId: string;
  paymentStatus: string;
  status: string;
  total: number;
  trackingNumber: string;
};

const mapOrderStatusRow = (row: Array<string | number>): OrderStatusLookupResult => ({
  createdAt: String(row[1] ?? ""),
  customerName: String(row[5] ?? ""),
  itemCount: Number(row[10] ?? 0),
  orderId: String(row[0] ?? ""),
  paymentStatus: String(row[4] ?? ""),
  status: String(row[3] ?? ""),
  total: Number(row[13] ?? 0),
  trackingNumber: String(row[22] ?? ""),
});

export async function getGoogleSheetOrderStatuses(orderId: string, contact: string): Promise<OrderStatusLookupResult[]> {
  const auth = getGoogleAuth();
  const sheets = google.sheets({ auth, version: "v4" });
  const spreadsheetId = process.env.GOOGLE_ORDERS_SPREADSHEET_ID?.trim() || defaultOrdersSpreadsheetId;
  const normalizedOrderId = orderId.trim().toUpperCase();
  const contactVariants = getLookupVariants(contact);

  const response = await sheets.spreadsheets.values.get({
    range: `${ORDERS_SHEET_NAME}!A:X`,
    spreadsheetId,
  });

  const rows = response.data.values ?? [];
  const matches: OrderStatusLookupResult[] = [];

  for (const row of rows.slice(1)) {
    const rowOrderId = String(row[0] ?? "").trim().toUpperCase();
    const email = String(row[6] ?? "");
    const phone = String(row[7] ?? "");
    const line = String(row[8] ?? "");
    const contacts = [email, phone, line].flatMap(getLookupVariants);
    const matchesOrderId = !normalizedOrderId || rowOrderId === normalizedOrderId;
    const matchesContact = contactVariants.length === 0 || contactVariants.some((variant) => contacts.includes(variant));

    if (matchesOrderId && matchesContact) {
      matches.push(mapOrderStatusRow(row));
    }
  }

  return matches.reverse().slice(0, 10);
}

export async function getGoogleSheetOrderStatus(orderId: string, contact: string): Promise<OrderStatusLookupResult | null> {
  const [order] = await getGoogleSheetOrderStatuses(orderId, contact);
  return order ?? null;
}

export async function createGoogleSheetOrder(input: CreateOrderInput) {
  const auth = getGoogleAuth();
  const orderId = createOrderId();
  const now = new Date();
  const { line, phone } = getPhoneAndLine(input.contact);
  const uploadedSlip = await uploadSlip(auth, orderId, input.slip);
  const shippingFee = input.shippingFee;
  const total = input.summary.subtotal + shippingFee;

  await appendRows(auth, `${ORDERS_SHEET_NAME}!A:X`, [
    [
      orderId,
      formatSheetDate(now),
      formatSheetDate(now),
      "รอตรวจสลิป",
      "pending_review",
      formatSheetText(input.customerName),
      formatSheetText(input.customerEmail ?? ""),
      formatSheetText(phone),
      formatSheetText(line),
      formatSheetText(input.address),
      input.summary.itemCount,
      input.summary.subtotal,
      shippingFee,
      total,
      "PromptPay",
      formatSheetText(input.promptPayId),
      formatSheetText(uploadedSlip.fileName),
      formatSheetText(uploadedSlip.fileId),
      uploadedSlip.webViewLink,
      formatSheetDate(now),
      "",
      "",
      "",
      formatSheetText(input.userId ?? ""),
    ],
  ]);

  await appendRows(
    auth,
    `${ORDER_ITEMS_SHEET_NAME}!A:H`,
    input.summary.lines.map((lineItem) => [
      orderId,
      formatSheetText(lineItem.product.id),
      formatSheetText(lineItem.product.brand),
      formatSheetText(lineItem.product.name),
      lineItem.quantity,
      lineItem.unitPrice,
      lineItem.subtotal,
      formatSheetText(lineItem.product.status),
    ]),
  );

  return {
    orderId,
    status: "pending-slip-review" as const,
  };
}
