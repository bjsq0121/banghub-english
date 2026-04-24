import type { HomeResponse } from "@banghub/shared";
import { Link } from "react-router-dom";
import { EmptyState } from "../common/EmptyState";

type HomePageProps = {
  data: HomeResponse;
};

export function HomePage({ data }: HomePageProps) {
  return (
    <main className="page">
      <header className="hero">
        <p>Daily toy forest routine</p>
        <h1>오늘의 미션</h1>
      </header>

      <section className="grid">
        {data.todayMission ? (
          <article className="track-card">
            <p>{data.todayMission.theme}</p>
            <h2>{data.todayMission.title}</h2>
            <p>{data.todayMission.dadGuideKo}</p>
            <div>
              <Link to={`/mission/${data.todayMission.id}/age3`}>3세랑 하기</Link>
              <Link to={`/mission/${data.todayMission.id}/age6`}>6세랑 하기</Link>
              <Link to={`/mission/${data.todayMission.id}/together`}>같이 하기</Link>
            </div>
          </article>
        ) : (
          <EmptyState title="오늘의 미션" body="오늘 준비된 미션이 아직 없어요." />
        )}
      </section>
    </main>
  );
}
