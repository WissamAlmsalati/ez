export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: any;
  children?: ChildItem[];
  item?: any;
  url?: any;
  color?: string;
  requiredRole?: "manager" | "employee";
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: any;
  id?: number;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: any;
}

let __uid = 0;
const uid = () => {
  __uid += 1;
  return `id_${__uid}`;
};

const SidebarContent: MenuItem[] = [
  {
    id: 1,
    name: "Pages",
    items: [
      {
        children: [
          {
            name: "الرئيسية",
            icon: "solar:home-2-line-duotone",
            id: uid(),
            url: "/",
          },
          {
            name: "الأقسام",
            icon: "tabler:category",
            id: uid(),
            url: "/categories",
            requiredRole: "manager",
          },
          {
            name: "المجموعات",
            icon: "tabler:box-seam",
            id: uid(),
            url: "/types",
          },
          {
            name: "الأصناف",
            icon: "tabler:cake-roll",
            id: uid(),
            url: "/products",
          },
          {
            name: "الطلبات",
            icon: "tabler:shopping-cart",
            id: uid(),
            url: "/orders",
          },
          {
            name: "المستخدمون",
            icon: "tabler:users",
            id: uid(),
            url: "/users",
            requiredRole: "manager",
          },
          {
            name: "الإعلانات",
            icon: "tabler:device-tv",
            id: uid(),
            url: "/advertisements",
            requiredRole: "manager",
          },
          {
            name: "إعدادات النظام",
            icon: "tabler:settings",
            id: uid(),
            url: "/settings",
            requiredRole: "manager",
          },
        ],
      },
    ],
  },
];

export default SidebarContent;
