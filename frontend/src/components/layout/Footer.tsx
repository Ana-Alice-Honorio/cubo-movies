export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t" style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(0,0,0,0.04)', paddingTop: '1.5rem', paddingBottom: '1.5rem', textAlign: 'center' }}>
      <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>{currentYear} © Todos os direitos reservados à Cubos Movies</p>
    </footer>
  );
}
