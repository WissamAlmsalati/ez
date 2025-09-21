let __uid = 0;
const uid = () => {
  __uid += 1;
  return `id_${__uid}`;
};

const Menuitems = [
  {
    id: uid(),
    title: "Dashboard",
    icon: "solar:layers-line-duotone",
    href: "",
    column: 1,
    children: [
      {
        id: uid(),
        title: "Sample Page 1",
        icon: "solar:home-angle-outline",
        href: "/",
      },
      {
        id: uid(),
        title: "Sample Page 2",
        icon: "solar:settings-minimalistic-line-duotone",
        href: "/dashboards/analytics",
      },
    ],
  },
];
export default Menuitems;
