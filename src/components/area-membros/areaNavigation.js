export const NAV_SECTIONS = [
  {
    labelKey: "sidebar.operation",
    items: [
      {
        href: "/area-membros",
        labelKey: "sidebar.dashboard",
        descriptionKey: "navigation.dashboardDescription",
        icon: "LayoutDashboard",
      },
      {
        href: "/area-membros/banca",
        labelKey: "sidebar.bankroll",
        descriptionKey: "navigation.bankrollDescription",
        icon: "Wallet",
        actionLabelKey: "topbar.recordBet",
      },
      {
        href: "/area-membros/estatisticas",
        labelKey: "sidebar.statistics",
        descriptionKey: "navigation.statisticsDescription",
        icon: "ChartNoAxesCombined",
      },
      {
        href: "/area-membros/proximos-jogos",
        labelKey: "sidebar.upcomingGames",
        descriptionKey: "navigation.upcomingGamesDescription",
        icon: "CalendarDays",
      },
      {
        href: "/area-membros/simulador-progressao",
        labelKey: "sidebar.progression",
        descriptionKey: "navigation.progressionDescription",
        icon: "TrendingUp",
        actionLabelKey: "progression.newProgression",
      },
    ],
  },
  {
    labelKey: "sidebar.intelligence",
    items: [
      {
        href: "/area-membros/metodos",
        labelKey: "sidebar.methods",
        descriptionKey: "navigation.methodsDescription",
        icon: "BookOpenCheck",
        badge: "Pro",
      },
      {
        href: "/area-membros/ranking",
        labelKey: "sidebar.ranking",
        descriptionKey: "navigation.rankingDescription",
        icon: "Trophy",
      },
      {
        href: "/area-membros/bilhetes",
        labelKey: "sidebar.tickets",
        descriptionKey: "navigation.ticketsDescription",
        icon: "MessagesSquare",
        badge: "Pro",
      },
    ],
  },
  {
    labelKey: "sidebar.account",
    items: [
      {
        href: "/area-membros/assinatura",
        labelKey: "sidebar.subscription",
        descriptionKey: "navigation.subscriptionDescription",
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
