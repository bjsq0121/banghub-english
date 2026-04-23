import { Link } from "react-router-dom";

type TrackCardProps = {
  heading: string;
  title: string;
  description: string;
  to: string;
};

export function TrackCard({ heading, title, description, to }: TrackCardProps) {
  return (
    <article className="track-card">
      <p>{heading}</p>
      <h2>{title}</h2>
      <p>{description}</p>
      <Link to={to}>Start</Link>
    </article>
  );
}
