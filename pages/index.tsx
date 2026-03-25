import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { mock, mockArray, mockFunction, mockObject } from "../src/mock";
import { useLogVersion } from "../src/hooks/useLogVersion";

type HomePageProps = {
  generatedAt: string;
  requestPath: string;
  profile: typeof mock;
  profileSummary: typeof mockObject;
  contactsCount: number;
  message: string;
};

const HomePage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({
  generatedAt,
  requestPath,
  profile,
  profileSummary,
  contactsCount,
  message,
}) => {
  useLogVersion();
  return (
    <main>
      <p>SSR via Pages Router</p>
      <h1>Next.js 15 test page</h1>
      <p>
        This page is rendered on the server on every request with
        <code>getServerSideProps</code>.
      </p>

      <section>
        <h2>Server data</h2>
        <ul>
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

      <section>
        <h2>Profile</h2>
        <p>
          <strong>Name:</strong> {profile.name}
        </p>
        <p>
          <strong>Email:</strong> {profile.email}
        </p>
        <p>
          <strong>Website:</strong> {profile.website}
        </p>
        <p>
          <strong>Summary address:</strong> {profileSummary.address}
        </p>
      </section>
    </main>
  );
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

export default HomePage;
