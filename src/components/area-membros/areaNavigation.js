export const NAV_SECTIONS = [
  {
    label: "Operacao",
    items: [
      {
        href: "/area-membros",
        label: "Dashboard",
        description: "Visao geral da banca",
        icon: "LayoutDashboard",
      },
      {
        href: "/area-membros/banca",
        label: "Banca",
        description: "Apostas e saldo",
        icon: "Wallet",
        actionLabel: "Registrar aposta",
      },
      {
        href: "/area-membros/estatisticas",
        label: "Estatisticas",
        description: "Performance e risco",
        icon: "ChartNoAxesCombined",
      },
      {
        href: "/area-membros/simulador-progressao",
        label: "Progressao",
        description: "Sequencias e simulacao",
        icon: "TrendingUp",
        actionLabel: "Nova progressao",
      },
    ],
  },
  {
    label: "Inteligencia",
    items: [
      {
        href: "/area-membros/metodos",
        label: "Metodos",
        description: "Biblioteca premium",
        icon: "BookOpenCheck",
        badge: "Pro",
      },
      {
        href: "/area-membros/ranking",
        label: "Ranking",
        description: "Comunidade e ligas",
        icon: "Trophy",
      },
      {
        href: "/area-membros/bilhetes",
        label: "Bilhetes",
        description: "Comunidade premium",
        icon: "MessagesSquare",
        badge: "Pro",
      },
    ],
  },
  {
    label: "Conta",
    items: [
      {
        href: "/area-membros/assinatura",
        label: "Assinatura",
        description: "Planos e cobranca",
        icon: "CreditCard",
        badge: "Pro",
      },
    ],
  },
];

export function isPathActive(pathname, href) {
  if (href === "/area-membros") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getNavigationItems() {
  return NAV_SECTIONS.flatMap((section) => section.items);
}

export function getCurrentNavigationItem(pathname) {
  return (
    getNavigationItems()
      .slice()
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) => isPathActive(pathname, item.href)) || NAV_SECTIONS[0].items[0]
  );
}
