import './globals.css';
import './games.css';

export const metadata = {
  title: 'A Question for Jessica 💗',
  description: 'A tiny pink pixel-style date invitation.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
