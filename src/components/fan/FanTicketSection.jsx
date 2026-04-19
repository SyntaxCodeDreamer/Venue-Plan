export default function FanTicketSection({ fanInfo }) {
  const ticketId = fanInfo?.ticketId || 'TKT-XXXX';
  const fanName  = fanInfo?.fanName  || 'Fan Pass';

  return (
    <section className="insight-section">
      <h3 style={{ marginBottom:'1rem', color:'white' }}>Digital Ticket</h3>
      <div style={{ background:'white', borderRadius:'12px', padding:'2rem', textAlign:'center', color:'black' }}>
        <h2 style={{ marginBottom:'0.5rem' }}>{fanName}</h2>

        {/* Barcode strip */}
        <div style={{
          width:'100%', height:'80px',
          background:'repeating-linear-gradient(90deg,#000,#000 3px,transparent 3px,transparent 6px)',
          margin:'1.5rem 0'
        }} />

        <p style={{ fontFamily:'monospace', fontSize:'1.2rem', marginTop:'0.5rem' }}>{ticketId}</p>

        <div style={{ display:'flex', justifyContent:'space-between', marginTop:'2rem', textAlign:'left' }}>
          {[
            { label:'Section', value:'114' },
            { label:'Row',     value:'G' },
            { label:'Seat',    value:'22' },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize:'0.7rem', color:'#666', textTransform:'uppercase' }}>{item.label}</div>
              <div style={{ fontWeight:700 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
