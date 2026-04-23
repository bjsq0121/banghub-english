import { createBrowserRouter, useLoaderData } from "react-router-dom";
import { AppShell } from "./AppShell";
import { AdminPage } from "../features/admin/AdminPage";
import { LoginPage } from "../features/auth/LoginPage";
import { HomePage } from "../features/home/HomePage";
import { ConversationPage } from "../features/conversation/ConversationPage";
import { NewsPage } from "../features/news/NewsPage";
import { DifficultyPage } from "../features/onboarding/DifficultyPage";
import { getContentItem, getHome, markCompletion } from "../lib/api";

function HomeRoute() {
  const data = useLoaderData() as Awaited<ReturnType<typeof getHome>>;
  return <HomePage data={data} />;
}

function ConversationRoute() {
  const data = useLoaderData() as {
    item: Awaited<ReturnType<typeof getContentItem>>;
    viewer: Awaited<ReturnType<typeof getHome>>["viewer"];
  };

  return (
    <ConversationPage
      item={data.item as Extract<typeof data.item, { track: "conversation" }>}
      viewer={data.viewer}
      onComplete={async () => markCompletion({ contentId: data.item.id })}
    />
  );
}

function NewsRoute() {
  const data = useLoaderData() as {
    item: Awaited<ReturnType<typeof getContentItem>>;
    viewer: Awaited<ReturnType<typeof getHome>>["viewer"];
  };

  return (
    <NewsPage
      item={data.item as Extract<typeof data.item, { track: "news" }>}
      viewer={data.viewer}
      onComplete={async () => markCompletion({ contentId: data.item.id })}
    />
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        loader: async () => getHome(),
        element: <HomeRoute />
      },
      {
        path: "conversation/:id",
        loader: async ({ params }) => {
          const home = await getHome();
          const item = await getContentItem("conversation", params.id ?? "");

          return {
            item,
            viewer: home.viewer
          };
        },
        element: <ConversationRoute />
      },
      {
        path: "news/:id",
        loader: async ({ params }) => {
          const home = await getHome();
          const item = await getContentItem("news", params.id ?? "");

          return {
            item,
            viewer: home.viewer
          };
        },
        element: <NewsRoute />
      },
      { path: "login", element: <LoginPage /> },
      { path: "difficulty", element: <DifficultyPage /> },
      { path: "admin", element: <AdminPage /> }
    ]
  }
]);
