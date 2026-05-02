export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[rgba(241,230,253,0.19)] bg-[#12111380] py-6 text-center text-sm text-[#9c9ca8]">
      <p>{currentYear} © Todos os direitos reservados à Cubos Movies</p>
    </footer>
  );
}
