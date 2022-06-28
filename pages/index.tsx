import Head from "next/head";
import { Container, Main, Title } from "../components/sharedstyles";
import { Converter } from "../components/Converter";
import { QueryClient, QueryClientProvider } from "react-query";

export default function Home() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <title>Currency converter</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <Main>
          <Title>Currency converter</Title>
          <Converter />
        </Main>
      </Container>
    </QueryClientProvider>
  );
}
