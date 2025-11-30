import { Roboto, Roboto_Condensed} from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const roboto = Roboto({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});
const robotoCondensed = Roboto_Condensed({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto-condensed",
});

export const metadata = {
  metadataBase: new URL("https://meridianbet.pe"),
  title: "Calendario Promocional | Meridianbet",
  description:
    "Mantente al tanto de las ofertas diarias, descubre nuevas promociones y disfruta de recompensas exclusivas con el Calendario Promocional de Meridianbet.",
  alternates: {
    canonical: "/calendario",
  },
  openGraph: {
    title: "Calendario Promocional | Meridianbet",
    description:
      "Mantente al tanto de las ofertas diarias, descubre nuevas promociones y disfruta de recompensas exclusivas con el Calendario Promocional de Meridianbet.",
    url: "/calendario",
    siteName: "Meridianbet",
    images: [
      {
        url: "https://cloud.merbet.com/Preview-image/calendar-universal.png",
        width: 1200,
        height: 630,
        alt: "Calendario Promocional",
      },
    ],
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Calendario Promocional | Meridianbet",
    description:
      "Mantente al tanto de las ofertas diarias, descubre nuevas promociones y disfruta de recompensas exclusivas con el Calendario Promocional de Meridianbet.",
    images: ["https://cloud.merbet.com/Preview-image/callendar-brazil_1.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/src/app/favicon.ico",
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
        
      <body
        className={`${roboto.variable} ${robotoCondensed.variable} min-h-screen`}
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{ style: { background: "#fff", color: "#333" } }}
        />
      </body>
    </html>
  );
}
