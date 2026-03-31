import React from 'react';
import Header from './Header';
import type { AppSection } from '../services/runtime';

interface LayoutProps {
  children: React.ReactNode;
  section: AppSection;
}

const sectionContent: Record<AppSection, { footerTitle: string; footerText: string }> = {
  public: {
    footerTitle: 'Portail clients',
    footerText: 'Consultation, demandes et commandes en ligne.',
  },
  admin: {
    footerTitle: 'Administration interne',
    footerText: 'Gestion du stock, des comptes et des demandes pharmacie.',
  },
};

const Layout: React.FC<LayoutProps> = ({ children, section }) => {
  const content = sectionContent[section];

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50">
      <Header section={section} />
      <main className="w-full flex-grow">{children}</main>
      <footer className="mt-16 w-full border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-5 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-slate-900">{content.footerTitle}</p>
            <p>{content.footerText}</p>
          </div>
          <p>Votre sante, notre priorite.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
