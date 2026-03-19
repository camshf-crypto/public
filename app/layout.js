import "./globals.css";

export const metadata = {
  title: "북메이커 — AI 책 내지 디자인",
  description: "워드 파일 하나로 책 한 권이 완성됩니다",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}