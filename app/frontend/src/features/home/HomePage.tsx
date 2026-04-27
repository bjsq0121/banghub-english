import type { HomeResponse } from "@banghub/shared";
import { Link } from "react-router-dom";
import { EmptyState } from "../common/EmptyState";

type HomePageProps = {
  data: HomeResponse;
};

export function HomePage({ data }: HomePageProps) {
  const mission = data.todayMission;

  return (
    <main className="page home-page">
      {mission ? (
        <>
          <section className="home-hero">
            <div className="home-hero-copy">
              <p className="hero-kicker">TODAY&apos;S TOY FOREST MISSION</p>
              <h1>{mission.title}</h1>
              <p className="home-hero-summary">Robo helps dad and kids play together.</p>
              <div className="home-hero-actions">
                <Link className="primary-action" to={`/mission/${mission.id}/together`}>
                  같이 하기
                </Link>
              </div>
              <div className="home-secondary-actions">
                <Link className="secondary-action" to={`/mission/${mission.id}/age3`}>
                  3세랑 하기
                </Link>
                <Link className="secondary-action" to={`/mission/${mission.id}/age6`}>
                  6세랑 하기
                </Link>
              </div>
            </div>

            <div className="home-hero-art">
              <img src={mission.image.url} alt={mission.image.alt} width="360" />
              <div className="character-chip">{mission.character}</div>
            </div>
          </section>

          <section className="home-support-grid">
            <article className="support-card">
              <p className="support-label">오늘 배울 말</p>
              <strong>{mission.phrase}</strong>
            </article>
            <article className="support-card">
              <p className="support-label">아빠 준비</p>
              <span>{mission.dadGuideKo}</span>
            </article>
          </section>
        </>
      ) : (
        <section className="grid">
          <EmptyState title="오늘의 미션" body="오늘 준비된 미션이 아직 없어요." />
        </section>
      )}
    </main>
  );
}
