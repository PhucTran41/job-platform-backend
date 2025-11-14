// prisma/seed.js
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../utils/password.js";
const prisma = new PrismaClient();

const testUsers = [
  {
    email: "admin@test.com",
    username: "admin",
    password: "Admin123!",
    role: "ADMIN",
  },
  {
    email: "user@test.com",
    username: "testuser",
    password: "User123!",
    role: "USER",
  },
  {
    email: "john@test.com",
    username: "john",
    password: "John123!",
    role: "USER",
  },
];

const sampleProducts = [
  {
    title: "iPhone 14 Pro",
    description:
      "The latest iPhone with A16 Bionic chip, Dynamic Island, and advanced camera system. Features a stunning 6.1-inch Super Retina XDR display with ProMotion technology.",
    price: 999.0,
    discountPercentage: 10.5,
    rating: 4.7,
    stock: 94,
    brand: "Apple",
    category: "smartphones",
    thumbnail: "https://cdn.dummyjson.com/product-images/1/thumbnail.jpg",
    images: [
      "https://cdn.dummyjson.com/product-images/1/1.jpg",
      "https://cdn.dummyjson.com/product-images/1/2.jpg",
    ],
  },
  {
    title: "Samsung Galaxy S23",
    description:
      "Flagship Android smartphone with stunning display, powerful performance, and versatile camera system. Features Snapdragon 8 Gen 2 processor.",
    price: 899.0,
    discountPercentage: 8.5,
    rating: 4.6,
    stock: 67,
    brand: "Samsung",
    category: "smartphones",
    thumbnail: "https://cdn.dummyjson.com/product-images/2/thumbnail.jpg",
    images: ["https://cdn.dummyjson.com/product-images/2/1.jpg"],
  },
  {
    title: "MacBook Pro 16",
    description:
      "Powerful laptop for professionals with M2 Pro chip, stunning Liquid Retina XDR display, and up to 22 hours of battery life.",
    price: 2499.0,
    discountPercentage: 5.0,
    rating: 4.9,
    stock: 23,
    brand: "Apple",
    category: "laptops",
    thumbnail: "https://cdn.dummyjson.com/product-images/6/thumbnail.png",
    images: ["https://cdn.dummyjson.com/product-images/6/1.png"],
  },
  {
    title: "Dell XPS 13",
    description:
      "Compact and powerful Windows laptop with stunning InfinityEdge display, Intel Core processors, and premium build quality.",
    price: 1299.0,
    discountPercentage: 12.0,
    rating: 4.5,
    stock: 45,
    brand: "Dell",
    category: "laptops",
    thumbnail: "https://cdn.dummyjson.com/product-images/7/thumbnail.jpg",
    images: ["https://cdn.dummyjson.com/product-images/7/1.jpg"],
  },
  {
    title: "AirPods Pro",
    description:
      "Active noise cancellation wireless earbuds with adaptive transparency, personalized spatial audio, and MagSafe charging case.",
    price: 249.0,
    discountPercentage: 5.5,
    rating: 4.8,
    stock: 156,
    brand: "Apple",
    category: "audio",
    thumbnail: "https://cdn.dummyjson.com/product-images/17/thumbnail.jpg",
    images: ["https://cdn.dummyjson.com/product-images/17/1.jpg"],
  },
  {
    title: "Sony WH-1000XM5",
    description:
      "Industry-leading noise canceling headphones with exceptional sound quality, 30-hour battery life, and premium comfort.",
    price: 399.0,
    discountPercentage: 15.0,
    rating: 4.8,
    stock: 78,
    brand: "Sony",
    category: "audio",
    thumbnail: "https://cdn.dummyjson.com/product-images/18/thumbnail.jpg",
    images: ["https://cdn.dummyjson.com/product-images/18/1.jpg"],
  },
  {
    title: "iPad Air",
    description:
      "Powerful tablet with M1 chip, stunning 10.9-inch Liquid Retina display, and support for Apple Pencil and Magic Keyboard.",
    price: 599.0,
    discountPercentage: 8.0,
    rating: 4.7,
    stock: 112,
    brand: "Apple",
    category: "tablets",
    thumbnail: "https://cdn.dummyjson.com/product-images/19/thumbnail.jpg",
    images: ["https://cdn.dummyjson.com/product-images/19/1.jpg"],
  },
  {
    title: "Samsung Galaxy Tab S8",
    description:
      "Premium Android tablet with stunning 11-inch display, S Pen included, and powerful performance for work and play.",
    price: 699.0,
    discountPercentage: 10.0,
    rating: 4.6,
    stock: 89,
    brand: "Samsung",
    category: "tablets",
    thumbnail: "https://cdn.dummyjson.com/product-images/20/thumbnail.jpg",
    images: ["https://cdn.dummyjson.com/product-images/20/1.jpg"],
  },
  {
    title: "Magic Mouse",
    description:
      "Wireless, rechargeable mouse with Multi-Touch surface. Connects via Bluetooth and features sleek, minimalist design.",
    price: 79.0,
    discountPercentage: 5.0,
    rating: 4.3,
    stock: 234,
    brand: "Apple",
    category: "accessories",
    thumbnail: "https://cdn.dummyjson.com/product-images/21/thumbnail.jpg",
    images: ["https://cdn.dummyjson.com/product-images/21/1.jpg"],
  },
  {
    title: "Logitech MX Master 3",
    description:
      "Advanced wireless mouse designed for power users. Features electromagnetic scrolling, thumb scroll wheel, and programmable buttons.",
    price: 99.0,
    discountPercentage: 18.0,
    rating: 4.9,
    stock: 167,
    brand: "Logitech",
    category: "accessories",
    thumbnail: "https://cdn.dummyjson.com/product-images/22/thumbnail.jpg",
    images: ["https://cdn.dummyjson.com/product-images/22/1.jpg"],
  },
  {
    title: "Google Pixel 7",
    description:
      "Google's flagship smartphone featuring Tensor G2 chip, advanced camera system, and pure Android experience with regular updates.",
    price: 799.0,
    discountPercentage: 7.5,
    rating: 4.5,
    stock: 58,
    brand: "Google",
    category: "smartphones",
    thumbnail: "https://cdn.dummyjson.com/product-images/3/thumbnail.jpg",
    images: ["https://cdn.dummyjson.com/product-images/3/1.jpg"],
  },
  {
    title: "Apple Watch Series 9",
    description:
      "Advanced smartwatch with S9 chip, improved health monitoring, Always-On Retina display, and fast charging.",
    price: 399.0,
    discountPercentage: 6.0,
    rating: 4.7,
    stock: 140,
    brand: "Apple",
    category: "wearables",
    thumbnail: "https://cdn.dummyjson.com/product-images/23/thumbnail.jpg",
    images: ["https://cdn.dummyjson.com/product-images/23/1.jpg"],
  },
  {
    title: "Samsung Galaxy Watch 6",
    description:
      "Premium Android smartwatch with advanced fitness tracking, Super AMOLED display, and powerful performance.",
    price: 349.0,
    discountPercentage: 7.0,
    rating: 4.6,
    stock: 120,
    brand: "Samsung",
    category: "wearables",
    thumbnail: "https://cdn.dummyjson.com/product-images/24/thumbnail.jpg",
    images: ["https://cdn.dummyjson.com/product-images/24/1.jpg"],
  },
  {
    title: "PlayStation 5",
    description:
      "Sony’s next-gen gaming console with super-fast SSD, ray tracing, and immersive DualSense controller.",
    price: 499.0,
    discountPercentage: 3.0,
    rating: 4.9,
    stock: 50,
    brand: "Sony",
    category: "gaming",
    thumbnail: "https://cdn.dummyjson.com/product-images/25/thumbnail.jpg",
    images: ["https://cdn.dummyjson.com/product-images/25/1.jpg"],
  },
  {
    title: "Xbox Series X",
    description:
      "Powerful gaming console with 4K gaming support, fast loading, and large backward-compatibility library.",
    price: 499.0,
    discountPercentage: 4.5,
    rating: 4.8,
    stock: 62,
    brand: "Microsoft",
    category: "gaming",
    thumbnail: "https://cdn.dummyjson.com/product-images/26/thumbnail.jpg",
    images: ["https://cdn.dummyjson.com/product-images/26/1.jpg"],
  },
  {
    title: "Nintendo Switch OLED",
    description:
      "Hybrid gaming console with a vibrant 7-inch OLED screen, enhanced speakers, and improved kickstand.",
    price: 349.0,
    discountPercentage: 5.0,
    rating: 4.8,
    stock: 89,
    brand: "Nintendo",
    category: "gaming",
    thumbnail: "https://cdn.dummyjson.com/product-images/27/thumbnail.jpg",
    images: ["https://cdn.dummyjson.com/product-images/27/1.jpg"],
  },
  {
    title: "Apple AirTag (4-Pack)",
    description:
      "Track your belongings with precision finding. Seamlessly integrated with the Find My network.",
    price: 99.0,
    discountPercentage: 4.0,
    rating: 4.7,
    stock: 300,
    brand: "Apple",
    category: "accessories",
    thumbnail: "https://cdn.dummyjson.com/product-images/28/thumbnail.jpg",
    images: ["https://cdn.dummyjson.com/product-images/28/1.jpg"],
  },
  {
    title: "Anker PowerCore 20000",
    description:
      "High-capacity power bank with fast charging, USB-C input/output, and lightweight design.",
    price: 59.0,
    discountPercentage: 10.0,
    rating: 4.8,
    stock: 210,
    brand: "Anker",
    category: "accessories",
    thumbnail: "https://cdn.dummyjson.com/product-images/29/thumbnail.jpg",
    images: ["https://cdn.dummyjson.com/product-images/29/1.jpg"],
  },
  {
    title: "Razer BlackWidow V3",
    description:
      "Mechanical gaming keyboard with tactile switches, Chroma RGB lighting, and durable build.",
    price: 139.0,
    discountPercentage: 12.0,
    rating: 4.6,
    stock: 75,
    brand: "Razer",
    category: "peripherals",
    thumbnail: "https://cdn.dummyjson.com/product-images/30/thumbnail.jpg",
    images: ["https://cdn.dummyjson.com/product-images/30/1.jpg"],
  },
  {
    title: "Logitech G Pro X",
    description:
      "Pro-grade gaming headset with Blue VO!CE technology, premium sound, and detachable mic.",
    price: 129.0,
    discountPercentage: 10.0,
    rating: 4.7,
    stock: 140,
    brand: "Logitech",
    category: "audio",
    thumbnail: "https://cdn.dummyjson.com/product-images/31/thumbnail.jpg",
    images: ["https://cdn.dummyjson.com/product-images/31/1.jpg"],
  },
  {
    title: "Beats Fit Pro",
    description:
      "Wireless noise-cancelling earbuds with flexible wingtip design, Spatial Audio, and H1 chip.",
    price: 199.0,
    discountPercentage: 8.0,
    rating: 4.5,
    stock: 88,
    brand: "Beats",
    category: "audio",
    thumbnail: "https://cdn.dummyjson.com/product-images/32/thumbnail.jpg",
    images: ["https://cdn.dummyjson.com/product-images/32/1.jpg"],
  },
  {
    title: "GoPro Hero 11",
    description:
      "Action camera with 5.3K video, HyperSmooth stabilization, waterproof design, and improved sensor.",
    price: 499.0,
    discountPercentage: 10.0,
    rating: 4.8,
    stock: 60,
    brand: "GoPro",
    category: "cameras",
    thumbnail: "https://cdn.dummyjson.com/product-images/33/thumbnail.jpg",
    images: ["https://cdn.dummyjson.com/product-images/33/1.jpg"],
  },
  {
    title: "Canon EOS R10",
    description:
      "Mirrorless camera offering high performance autofocus, 4K video, and compact design.",
    price: 979.0,
    discountPercentage: 9.0,
    rating: 4.6,
    stock: 42,
    brand: "Canon",
    category: "cameras",
    thumbnail: "https://cdn.dummyjson.com/product-images/34/thumbnail.jpg",
    images: ["https://cdn.dummyjson.com/product-images/34/1.jpg"],
  },
  {
    title: "DJI Mini 3 Pro",
    description:
      "Compact drone with 4K HDR video, obstacle avoidance, and extended battery life.",
    price: 759.0,
    discountPercentage: 5.0,
    rating: 4.8,
    stock: 37,
    brand: "DJI",
    category: "drones",
    thumbnail: "https://cdn.dummyjson.com/product-images/35/thumbnail.jpg",
    images: ["https://cdn.dummyjson.com/product-images/35/1.jpg"],
  },
  {
    title: "JBL Charge 5",
    description:
      "Portable Bluetooth speaker with powerful sound, waterproof design, and built-in powerbank.",
    price: 179.0,
    discountPercentage: 11.0,
    rating: 4.7,
    stock: 160,
    brand: "JBL",
    category: "audio",
    thumbnail: "https://cdn.dummyjson.com/product-images/36/thumbnail.jpg",
    images: ["https://cdn.dummyjson.com/product-images/36/1.jpg"],
  },
  {
    title: "Amazon Kindle Paperwhite",
    description:
      "Waterproof e-reader with 6.8-inch display, warm light, and long battery life.",
    price: 149.0,
    discountPercentage: 6.0,
    rating: 4.8,
    stock: 180,
    brand: "Amazon",
    category: "tablets",
    thumbnail: "https://cdn.dummyjson.com/product-images/37/thumbnail.jpg",
    images: ["https://cdn.dummyjson.com/product-images/37/1.jpg"],
  },
  {
    title: "TP-Link Archer AX55",
    description:
      "Wi-Fi 6 router with high-speed performance, OFDMA support, and robust security features.",
    price: 149.0,
    discountPercentage: 12.0,
    rating: 4.6,
    stock: 95,
    brand: "TP-Link",
    category: "networking",
    thumbnail: "https://cdn.dummyjson.com/product-images/38/thumbnail.jpg",
    images: ["https://cdn.dummyjson.com/product-images/38/1.jpg"],
  },
  {
    title: "Seagate 2TB Portable HDD",
    description:
      "Portable external hard drive with USB-3.0 support, compact design, and plug-and-play use.",
    price: 69.0,
    discountPercentage: 7.5,
    rating: 4.7,
    stock: 230,
    brand: "Seagate",
    category: "storage",
    thumbnail: "https://cdn.dummyjson.com/product-images/39/thumbnail.jpg",
    images: ["https://cdn.dummyjson.com/product-images/39/1.jpg"],
  },
  {
    title: "Samsung 980 PRO 1TB NVMe SSD",
    description:
      "Ultra-fast PCIe Gen4 NVMe SSD with high endurance and advanced thermal control.",
    price: 129.0,
    discountPercentage: 15.0,
    rating: 4.9,
    stock: 150,
    brand: "Samsung",
    category: "storage",
    thumbnail: "https://cdn.dummyjson.com/product-images/40/thumbnail.jpg",
    images: ["https://cdn.dummyjson.com/product-images/40/1.jpg"],
  },
  {
    title: "LG UltraGear 27-inch 165Hz",
    description:
      "High-performance gaming monitor with 165Hz refresh rate, 1ms response time, and HDR10.",
    price: 349.0,
    discountPercentage: 9.0,
    rating: 4.7,
    stock: 73,
    brand: "LG",
    category: "monitors",
    thumbnail: "https://cdn.dummyjson.com/product-images/41/thumbnail.jpg",
    images: ["https://cdn.dummyjson.com/product-images/41/1.jpg"],
  },
];

async function main() {
  console.log("🌱 Seeding database...\n");

  // Clear data
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Seed users
  console.log("👥 Seeding users...");
  for (const userData of testUsers) {
    const hashedPassword = await hashPassword(userData.password);

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        password: hashedPassword,
        role: userData.role,
      },
    });

    console.log(`   ✅ ${user.username} (${user.role})`);
  }
  // Seed products
  // ADD THIS SECTION - Seed products
  console.log("\n📦 Seeding products...");
  for (const productData of sampleProducts) {
    const product = await prisma.product.create({
      data: productData,
    });
    console.log(`   ✅ ${product.title}`);
  }
  console.log(`\n✅ Seeded ${sampleProducts.length} products`);
  // Removed duplicate main function definition
  console.log("\n📝 Test Credentials:");
  testUsers.forEach((u) => {
    console.log(`${u.role}: ${u.email} / ${u.password}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
