export default function FanHeader({ venueName }) {
  return (
    <header className="fan-header">
      <div className="logo">V</div>
      <div className="title">
        <h1>{venueName || 'VenueFlow'}</h1>
        <p>Live Fan Experience</p>
      </div>
    </header>
  );
}
