import { Html, Head, Main, NextScript } from 'next/document'
import { useEffect } from 'react'

export default function Document() {
  
  return (
    <Html lang="en">
      <Head>
      <link rel="icon" href="/logo.png" />        
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
