export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  badge?: string;
  sizes: readonly string[];
  stock: string;
  description: string;
  image: string;
  alt: string;
};

export const products: Product[] = [
  {
    id: "void-hoodie",
    name: "Obsidian Void Hoodie",
    category: "Apparel // Outerwear",
    price: 850,
    badge: "New Drop",
    sizes: ["S", "M", "L", "XL"],
    stock: "Only 2 left in Medium",
    description:
      "Heavyweight French Terry cotton with dropped shoulders, cropped body, elongated sleeves, and a decoded CTC emblem engineered into the chest fabric.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB-ecX7F17LfCxbKSwz9gvLlHIifPmTYMXtSZj8-gyieNa2pGJvSqJnFbnVD3VGPOUcky7z999UKtavckZiospQxMLWCderkM2RDF9foJBf_0ew_hKYlAm_w2MWOinoaxITQfJibLaUjhbhAKrUtnsE8CtFIyqsnZ6rlq5q13yGbQRDWR22kwok4ecJcY91lFIT6mwT0jcpUHOSGw8Ut6FEvRhtlj5ek365WO-ym2Q-qkizTYToj2lCEnvlJdCOjQonjwU9dtKM8bk",
    alt: "Dark oversized streetwear hoodie in cinematic editorial lighting",
  },
  {
    id: "tactical-vest",
    name: "Tactical Shell Vest",
    category: "Apparel // Utility",
    price: 1200,
    badge: "Mascot Pick",
    sizes: ["S", "M", "L"],
    stock: "In stock",
    description:
      "Structured utility vest with tonal paneling, deep pockets, and a sharp silhouette for night-market movement.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAppZfbVp1RLy-iIL8VzNygXpN-3EPsjoFDnVjjELqxaRWNfF7HNS3sZ-3KgoRyZkh4-NJYyYF4bDqVA6mckAce2fj96UGUD1AStQy9oJm7aj-YOBVak5quCugFs2Csgc4-lxhqnHTrirknxAIkvqQ560FrlxWphBz-4PjSScd5izvYRDn_NcHuoalBd5mOdP_6lOvdiRu6TQEU8SeFrFD5UydX-Lu_6H-aRXJX4oY3VYHEKq6UqamUJSso-DkHEjCBqxugjSUPuzM",
    alt: "Fashion model in a dark streetwear utility jacket",
  },
  {
    id: "identity-tee",
    name: "Core Identity Tee",
    category: "Apparel // Tees",
    price: 450,
    sizes: ["S", "M", "L", "XL"],
    stock: "Low in Large",
    description:
      "Dense cotton tee with a washed obsidian finish, tight neckline, and restrained pink code mark.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBuNeZH3X3nZ9KpJPVxZg5FsnRhEVbc13vLKOnNAlwyR27m0ZE1f75fDHERakpukYAb57CSHhK_c8-6s9MvRWdUrcEnkqZElRYlOh0TV5NsOfDPSQ0Sux9XZ-2JSn-fjmTX-cEuH3FxWUOj1nMYssARNNa83t5NJqS8LHLA5oqE-dTyE1FDIip2xD9HpalTZ2iOrTEPtj9Mdc5z8rUfA1AkPrF0CXwM0Eyo58DP66NUNQuvBTHaXmaXh8b-x7BVaMsysqxWa5mFkGk",
    alt: "Close-up of a premium black streetwear graphic tee",
  },
  {
    id: "heavy-cargo",
    name: "Heavyweight Cargo",
    category: "Apparel // Bottoms",
    price: 950,
    sizes: ["M", "L", "XL"],
    stock: "In stock",
    description:
      "Wide-leg cargo pant with reinforced knee panels, oversized pocketing, and a matte black hardware system.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAjZwq2Cod3YimyTyQn99ndr1kDiVU1jZNunRgcBgFPjGQJgQTg5UeqDdNQAFHSIi09x_7cpAc3R32me801NXf2BZGHObYrhowPB76LqnAfiQTjje_t33DAf__Te4GhVhfBFQeRB8Pz53fJ4fei0ngrvDI9ememMr1xNzW4_UQFrr0PRLJdkHpQTpS5FPshSlpurAl4CwCg0be7kK9NN3PxVSZkMfKw17k8qH_BhDAW_bf2Ct7nbLmmqZPoGUn7FvTHWMQ6taWUc2A",
    alt: "Model in shadow wearing wide-leg cargo pants and sneakers",
  },
];

export const cartItems = [
  { product: products[0], size: "M", quantity: 1 },
  { product: products[2], size: "L", quantity: 1 },
];

export const formatGhs = (amount: number) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 0,
  }).format(amount);

export const orders = [
  ["#CTC-8092", "Alex Mercer", "GHS 450", "Paid"],
  ["#CTC-8091", "Jordan Lee", "GHS 1,200", "Pending"],
  ["#CTC-8090", "Sam Rivera", "GHS 890", "Paid"],
  ["#CTC-8089", "Ama Mensah", "GHS 2,100", "Paid"],
];

export const inventoryRows = [
  { sku: "NH-001", name: "Nocturne Oversized Hoodie", price: "GHS 850", stock: [12, 45, 30, 2] },
  { sku: "DT-042", name: "Decode Graphic Tee", price: "GHS 450", stock: [0, 15, 4, 10] },
  { sku: "SV-018", name: "Tactical Shell Vest", price: "GHS 1,200", stock: [6, 18, 12, 0] },
];
