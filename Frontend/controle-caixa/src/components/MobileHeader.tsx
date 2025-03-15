interface MobileHeaderProps {
  onMenuClick: () => void;
}

export default function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <div className="md:hidden bg-[#1B2A4E] text-white">
      <div className="px-4 py-4 flex items-center justify-between">
        <button
          onClick={onMenuClick}
          className="text-white hover:text-gray-200 focus:outline-none"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-lg font-semibold">Sistema de Projetos</span>
        <div className="w-6"></div> {/* Espaçador para centralizar o título */}
      </div>
    </div>
  );
} 