export interface Manual {
  id: string;
  brand: string;
  model: string;
  boardModel: string;
  pdfUrl: string;
  price: number;
  isPremium: boolean;
}

// Google Drive public PDF links are used so the homepage viewer can embed them
// directly through Drive's native /preview iframe.
export const manuals: Manual[] = [
  {
    id: "juki-ddl-8700",
    brand: "Juki",
    model: "DDL-8700",
    boardModel: "SC-921",
    pdfUrl: "https://drive.google.com/file/d/1qnkQH_zsiWu7uJCopABlcOZLQ34FjOyl/view?usp=sharing",
    price: 0,
    isPremium: false,
  },
  {
    id: "brother-s7200c",
    brand: "Brother",
    model: "S-7200C",
    boardModel: "MD-701",
    pdfUrl: "https://drive.google.com/file/d/1H7Na3RF6BQ7A6XYzLqbMw1GJ0khxtaIt/view?usp=sharing",
    price: 200,
    isPremium: true,
  },
  {
    id: "singer-4423",
    brand: "Singer",
    model: "Heavy Duty 4423",
    boardModel: "SG-4423B",
    pdfUrl: "https://drive.google.com/file/d/0B9pZyM5hT0mxWG1DNGpFbmJJbTA/view?usp=sharing",
    price: 150,
    isPremium: true,
  },
  {
    id: "siruba-l818f",
    brand: "Siruba",
    model: "L818F-M1",
    boardModel: "QIXING QX-2020",
    pdfUrl: "https://drive.google.com/file/d/1qnkQH_zsiWu7uJCopABlcOZLQ34FjOyl/view?usp=sharing",
    price: 0,
    isPremium: false,
  },
  {
    id: "jack-a4",
    brand: "Jack",
    model: "JK-A4",
    boardModel: "JK-A4-CT",
    pdfUrl: "https://drive.google.com/file/d/1H7Na3RF6BQ7A6XYzLqbMw1GJ0khxtaIt/view?usp=sharing",
    price: 250,
    isPremium: true,
  },
];
