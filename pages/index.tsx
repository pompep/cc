import Head from "next/head";
import { Converter } from "../components/Converter";
import { QueryClient, QueryClientProvider } from "react-query";
import { Container } from "../components/atoms/Container";
import { Main } from "../components/atoms/Main";
import { Title } from "../components/atoms/Title";

export default function Home() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <title>CZK converter</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <Main>
          <Title>CZK converter</Title>
          <Converter />
        </Main>
      </Container>
    </QueryClientProvider>
  );
}
