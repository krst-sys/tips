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
        href: "/area-membros/proximos-jogos",
        labelKey: "sidebar.upcomingGames",
        descriptionKey: "navigation.upcomingGamesDescription",
        icon: "CalendarDays",
      },
      {
        href: "/area-membros/progressao",
        labelKey: "sidebar.progression",
        descriptionKey: "navigation.progressionDescription",
        icon: "TrendingUp",
        actionLabelKey: "progression.newProgression",
      },
      {
        href: "/area-membros/oportunidades",
        labelKey: "sidebar.opportunities",
        descriptionKey: "navigation.opportunitiesDescription",
        icon: "Lightbulb",
      },
    ],
  },
  {
    labelKey: "sidebar.social",
    items: [
      {
        href: "/area-membros/ranking",
        labelKey: "sidebar.ranking",
        descriptionKey: "navigation.rankingDescription",
        icon: "Trophy",
      },
      {
        href: "/area-membros/palpites",
        labelKey: "sidebar.predictions",
        descriptionKey: "navigation.predictionsDescription",
        icon: "Sparkles",
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
  if (pathname === "/area-membros/estatisticas" || pathname.startsWith("/area-membros/estatisticas/")) {
    return {
      href: "/area-membros/estatisticas",
      labelKey: "sidebar.statistics",
      descriptionKey: "navigation.statisticsDescription",
      icon: "ChartNoAxesCombined",
    };
  }

  return (
    getNavigationItems()
      .slice()
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) => isPathActive(pathname, item.href)) || NAV_SECTIONS[0].items[0]
  );
}
