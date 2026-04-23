import { createBrowserRouter, redirect, useLoaderData } from "react-router-dom";
import type { ChildMode } from "@banghub/shared";
import { AppShell } from "./AppShell";
import { AdminPage } from "../features/admin/AdminPage";
import { LoginPage } from "../features/auth/LoginPage";
import { ErrorPage } from "../features/common/ErrorPage";
import { HomePage } from "../features/home/HomePage";
import { MissionPage } from "../features/mission/MissionPage";
import { DifficultyPage } from "../features/onboarding/DifficultyPage";
import { getHome, getMission, markCompletion } from "../lib/api";

function HomeRoute() {
  const data = useLoaderData() as Awaited<ReturnType<typeof getHome>>;
  return <HomePage data={data} />;
}

function normalizeChildMode(childMode: string | undefined): ChildMode {
  if (childMode === "age3" || childMode === "age6" || childMode === "together") {
    return childMode;
  }

  return "together";
}

function MissionRoute() {
  const data = useLoaderData() as {
    mission: Awaited<ReturnType<typeof getMission>>;
    viewer: Awaited<ReturnType<typeof getHome>>["viewer"];
    childMode: ChildMode;
  };

  return (
    <MissionPage
      mission={data.mission}
      childMode={data.childMode}
      viewer={data.viewer}
      onComplete={async () => {
        await markCompletion({ missionId: data.mission.id, childMode: data.childMode });
      }}
    />
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        loader: async () => getHome(),
        element: <HomeRoute />
      },
      {
        path: "mission/:id/:childMode",
        loader: async ({ params }) => {
          const [home, mission] = await Promise.all([getHome(), getMission(params.id ?? "")]);

          return {
            mission,
            viewer: home.viewer,
            childMode: normalizeChildMode(params.childMode)
          };
        },
        element: <MissionRoute />
      },
      { path: "login", element: <LoginPage /> },
      { path: "difficulty", element: <DifficultyPage /> },
      {
        path: "admin",
        loader: async () => {
          const home = await getHome();

          if (!home.viewer?.isAdmin) {
            throw redirect("/login");
          }

          return null;
        },
        element: <AdminPage />
      }
    ]
  }
]);
