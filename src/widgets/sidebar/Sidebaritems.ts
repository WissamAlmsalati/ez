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
          },
          {
            name: "الأنواع",
            icon: "tabler:layers",
            id: uid(),
            url: "/types",
          },
          {
            name: "الأصناف",
            icon: "tabler:package",
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
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Menu",
    items: [
      // {
      //   heading: "Multi level",
      //   children: [
      //     {
      //       name: "Menu Level",
      //       icon: "solar:widget-add-line-duotone",
      //       id: uid(),
      //       children: [
      //         {
      //           id: uid(),
      //           name: "Level 1",
      //           url: "",
      //         },
      //         {
      //           id: uid(),
      //           name: "Level 1.1",
      //           icon: "fad:armrecording",
      //           url: "",
      //           children: [
      //             {
      //               id: uid(),
      //               name: "Level 2",
      //               url: "",
      //             },
      //             {
      //               id: uid(),
      //               name: "Level 2.1",
      //               icon: "fad:armrecording",
      //               url: "",
      //               children: [
      //                 {
      //                   id: uid(),
      //                   name: "Level 3",
      //                   url: "",
      //                 },
      //                 {
      //                   id: uid(),
      //                   name: "Level 3.1",
      //                   url: "",
      //                 },
      //               ],
      //             },
      //           ],
      //         },
      //       ],
      //     },
      //   ],
      // },
      // {
      //   heading: "More Options",
      //   children: [
      //     {
      //       id: uid(),
      //       url: "/sample-page",
      //       name: "Applications",
      //       icon: "solar:check-circle-bold",
      //       color: "text-primary",
      //     },
      //     {
      //       id: uid(),
      //       url: "",
      //       name: "Form Options",
      //       icon: "solar:check-circle-bold",
      //       color: "text-secondary",
      //     },
      //     {
      //       id: uid(),
      //       url: "",
      //       name: "Table Variations",
      //       icon: "solar:check-circle-bold",
      //       color: "text-info",
      //     },
      //     {
      //       id: uid(),
      //       url: "",
      //       name: "Charts Selection",
      //       icon: "solar:check-circle-bold",
      //       color: "text-warning",
      //     },
      //     {
      //       id: uid(),
      //       url: "",
      //       name: "Widgets",
      //       icon: "solar:check-circle-bold",
      //       color: "text-success",
      //     },
      //   ],
      // },
    ],
  },
];

export default SidebarContent;
