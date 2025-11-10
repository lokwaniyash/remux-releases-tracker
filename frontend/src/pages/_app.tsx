import "../styles/globals.css";
import { AppProps } from "next/app";
import Head from "next/head";
import Header from "../components/Header";

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <link rel="icon" href="/favicon.ico" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
            </Head>
            <div className="min-h-screen bg-gray-900 text-white">
                <Header />
                <Component {...pageProps} />
            </div>
        </>
    );
}

export default MyApp;
