export interface Manual {
  id: string;
  brand: string;
  model: string;
  boardModel: string;
  pdfUrl: string;
  price: number;
  isPremium: boolean;
}

// Using publicly available sample PDFs so the viewer works out-of-the-box.
// Replace pdfUrl values with the real manual PDFs when available.
export const manuals: Manual[] = [
  {
    id: "juki-ddl-8700",
    brand: "Juki",
    model: "DDL-8700",
    boardModel: "SC-921",
    pdfUrl: "https://cdn.mozilla.net/pdfjs/tracemonkey.pdf",
    price: 0,
    isPremium: false,
  },
  {
    id: "brother-s7200c",
    brand: "Brother",
    model: "S-7200C",
    boardModel: "MD-701",
    pdfUrl: "https://cdn.mozilla.net/pdfjs/tracemonkey.pdf",
    price: 200,
    isPremium: true,
  },
  {
    id: "singer-4423",
    brand: "Singer",
    model: "Heavy Duty 4423",
    boardModel: "SG-4423B",
    pdfUrl: "https://cdn.mozilla.net/pdfjs/tracemonkey.pdf",
    price: 150,
    isPremium: true,
  },
  {
    id: "siruba-l818f",
    brand: "Siruba",
    model: "L818F-M1",
    boardModel: "QIXING QX-2020",
    pdfUrl: "https://cdn.mozilla.net/pdfjs/tracemonkey.pdf",
    price: 0,
    isPremium: false,
  },
  {
    id: "jack-a4",
    brand: "Jack",
    model: "JK-A4",
    boardModel: "JK-A4-CT",
    pdfUrl: "https://cdn.mozilla.net/pdfjs/tracemonkey.pdf",
    price: 250,
    isPremium: true,
  },
];
