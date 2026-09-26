// Site navigation. The header shows MAIN; the full menu and the footer show every group.

export type NavItem = { href: string; label: string };

export const MAIN_NAV: NavItem[] = [
  { href: "/schedule", label: "Расписание" },
  { href: "/program", label: "Программа" },
  { href: "/classes", label: "Направления" },
  { href: "/coaches", label: "Тренеры" },
  { href: "/studios", label: "Клуб" },
  { href: "/memberships", label: "Абонементы" },
];

export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Тренировки",
    items: [
      { href: "/schedule", label: "Расписание" },
      { href: "/program", label: "Программа под пульс" },
      { href: "/classes", label: "Направления" },
      { href: "/zones", label: "Пульсовые зоны" },
      { href: "/program/ruffier", label: "Проба Руфье" },
    ],
  },
  {
    title: "Клуб",
    items: [
      { href: "/club", label: "О клубе" },
      { href: "/studios", label: "Студии и зоны" },
      { href: "/coaches", label: "Тренеры" },
      { href: "/kids", label: "Детский клуб" },
      { href: "/contacts", label: "Контакты" },
    ],
  },
  {
    title: "Клиентам",
    items: [
      { href: "/memberships", label: "Абонементы" },
      { href: "/trial", label: "Пробная тренировка" },
      { href: "/booking", label: "Мои записи" },
      { href: "/corporate", label: "Корпоративным клиентам" },
      { href: "/faq", label: "Вопросы и ответы" },
    ],
  },
  {
    title: "Почитать",
    items: [
      { href: "/journal", label: "Журнал" },
      { href: "/reviews", label: "Отзывы" },
      { href: "/rules", label: "Правила клуба" },
      { href: "/privacy", label: "Политика данных" },
    ],
  },
];
