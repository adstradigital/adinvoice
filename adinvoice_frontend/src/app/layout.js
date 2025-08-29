import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap CSS


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-light">
      
        <main>{children}</main>
      </body>
    </html>
  );
}
