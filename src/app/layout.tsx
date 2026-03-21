import "../styles/globals.scss";
import {MainNavbar} from "@/app/components/MainNavbar/MainNavbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MainNavbar />
        {children}
      </body>
    </html>
  );
}
