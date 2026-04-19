import CCTVFeed from '../canvas/CCTVFeed';

const CAMS = ['GATE 01-A', 'CONCOURSE EAST', 'SOUTH BLEACHERS', 'PLAYER TUNNEL', 'GATE 04-C', 'VAR SUITE'];

export default function SecurityView() {
  return (
    <div className="cctv-grid">
      {CAMS.map(name => (
        <CCTVFeed key={name} name={name} />
      ))}
    </div>
  );
}
