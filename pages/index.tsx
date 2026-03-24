import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { mock, mockArray, mockFunction, mockObject } from "../src/mock";

type HomePageProps = {
  generatedAt: string;
  requestPath: string;
  profile: typeof mock;
  profileSummary: typeof mockObject;
  contactsCount: number;
  message: string;
};

export const getServerSideProps: GetServerSideProps<HomePageProps> = async (
  context,
) => {
  return {
    props: {
      generatedAt: new Date().toISOString(),
      requestPath: context.resolvedUrl,
      profile: mock,
      profileSummary: mockObject,
      contactsCount: mockArray.length,
      message: mockFunction(),
    },
  };
};

const HomePage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ generatedAt, requestPath, profile, profileSummary, contactsCount, message }) => {
  return (
    <main
      style={{
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        margin: "0 auto",
        maxWidth: "760px",
        padding: "48px 24px",
        lineHeight: 1.6,
      }}
    >
      <p
        style={{
          display: "inline-block",
          margin: 0,
          borderRadius: "999px",
          backgroundColor: "#eef2ff",
          color: "#3730a3",
          padding: "6px 12px",
          fontSize: "14px",
          fontWeight: 600,
        }}
      >
        SSR via Pages Router
      </p>
      <h1 style={{ marginBottom: "12px" }}>Next.js 15 test page</h1>
      <p style={{ marginTop: 0, color: "#4b5563" }}>
        This page is rendered on the server on every request with{" "}
        <code>getServerSideProps</code>.
      </p>

      <section
        style={{
          marginTop: "32px",
          padding: "24px",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Server data</h2>
        <ul style={{ paddingLeft: "20px", marginBottom: 0 }}>
          <li>
            <strong>Generated at:</strong> {generatedAt}
          </li>
          <li>
            <strong>Request path:</strong> {requestPath}
          </li>
          <li>
            <strong>Message:</strong> {message}
          </li>
          <li>
            <strong>Contacts count:</strong> {contactsCount}
          </li>
        </ul>
      </section>

      <section
        style={{
          marginTop: "24px",
          padding: "24px",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Profile</h2>
        <p>
          <strong>Name:</strong> {profile.name}
        </p>
        <p>
          <strong>Email:</strong> {profile.email}
        </p>
        <p>
          <strong>Website:</strong> {profile.website}
        </p>
        <p style={{ marginBottom: 0 }}>
          <strong>Summary address:</strong> {profileSummary.address}
        </p>
      </section>
    </main>
  );
};

export default HomePage;
