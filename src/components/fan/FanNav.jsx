const TABS = [
  { id: 'map',        label: 'Map' },
  { id: 'facilities', label: 'Facilities' },
  { id: 'tickets',    label: 'Tickets' },
];

export default function FanNav({ activeTab, onTabChange }) {
  return (
    <footer className="fan-nav">
      {TABS.map(tab => (
        <div
          key={tab.id}
          className={`fan-nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </div>
      ))}
    </footer>
  );
}
