"use strict";
(self.webpackChunkjetadmin_frontend =
  self.webpackChunkjetadmin_frontend || []).push([
  [4047],
  {
    14047: (e, a, t) => {
      t.r(a), t.d(a, { default: () => N });
      var l = t(65043),
        r = t(73216),
        s = t(88739),
        n = t(26240),
        i = t(35721),
        o = t(17392),
        c = t(42518),
        d = t(30681),
        p = t(38968),
        m = t(2050),
        x = t(48734),
        u = t(35475),
        f = t(60184),
        h = t(16082),
        j = t(17160),
        v = t(35659),
        b = t(70579);
      const g = () => {
        const e = (0, n.A)(),
          a = (0, r.g)(),
          t = "app_variable_".concat(
            null === a || void 0 === a ? void 0 : a["*"]
          ),
          { pmUser: g } = (0, j.hD)(),
          y = (0, r.Zp)(),
          { appVariables: _ } = (0, h.O0)(),
          { reloadAllAppVariables: A } = (0, h.wI)(),
          N = (0, l.useMemo)(
            () => g && g.extractAppVariableAddAuthorization(),
            [g]
          );
        return (0, b.jsxs)(i.A, {
          style: {
            borderRightWidth: 1,
            borderColor: e.palette.divider,
            backgroundColor: e.palette.background.default,
          },
          component: "nav",
          "aria-labelledby": "nested-list-subheader",
          className:
            " !h-[calc(100vh-48px)] !overflow-y-auto !overflow-x-hidden w-full",
          children: [
            (0, b.jsxs)("div", {
              className:
                "!px-3.5 py-1 flex flex-row justify-between items-center w-full",
              children: [
                (0, b.jsx)("span", {
                  className: "!font-semibold",
                  style: { color: e.palette.primary.main },
                  children: "App variables",
                }),
                (0, b.jsx)(o.A, {
                  onClick: A,
                  children: (0, b.jsx)(f.Swo, {
                    style: { color: e.palette.primary.main },
                    className: "!text-sm",
                  }),
                }),
              ],
            }),
            N &&
              (0, b.jsx)("div", {
                className: "!px-3 !py-1.5 !w-full",
                children: (0, b.jsx)(c.A, {
                  onClick: () => {
                    y(s.a.ROUTES.ADD_APP_VARIABLES.path());
                  },
                  variant: "contained",
                  className: "!w-full",
                  startIcon: (0, b.jsx)(f.OiG, { className: "!text-sm" }),
                  children: "Add more constants",
                }),
              }),
              (0, b.jsx)("div", { className: "!mt-1" }),
              _ && _.length > 0
                ? _.map((a) => {
                    const l = "app_variable_".concat(a.pm_app_variable_id);
                    return (0, b.jsx)(
                      u.N_,
                      {
                        to: s.a.ROUTES.GRAPH_VIEW.path(a.pm_app_variable_id),
                        children: (0, b.jsx)(
                          d.Ay,
                          {
                            disablePadding: !0,
                            className: "!px-3 !py-1.5",
                            children: (0, b.jsxs)(p.A, {
                              sx: {
                                background: e.palette.background.paper,
                                border: l == t ? 1 : 0,
                                borderColor: e.palette.primary.main,
                              },
                              selected: l == t,
                              className: "!rounded",
                              children: [
                                (0, b.jsx)(m.A, {
                                  className: "!ml-1",
                                  sx: {
                                    color:
                                      l == t
                                        ? e.palette.primary.main
                                        : e.palette.primary.contrastText,
                                    minWidth: 0,
                                  },
                                  children: (0, b.jsx)(v.dPB, {
                                    className: "!text-lg",
                                  }),
                                }),
                                (0, b.jsx)(x.A, {
                                  sx: {
                                    color:
                                      l == t
                                        ? e.palette.primary.main
                                        : e.palette.primary.contrastText,
                                  },
                                  primary: a.pm_app_variable_title,
                                  primaryTypographyProps: {
                                    sx: {
                                      fontWeight: l == t ? "700" : "500",
                                      fontSize: 12,
                                      marginLeft: 2,
                                    },
                                  },
                                }),
                              ],
                            }),
                          },
                          "_app_variable_".concat(a.pm_app_variable_id)
                        ),
                      },
                      l
                    );
                  })
                : null;,
          ],
        });
      };
      var y = t(61892);
      const _ = (0, l.lazy)(() =>
          Promise.all([
            t.e(7779),
            t.e(5404),
            t.e(3013),
            t.e(6043),
            t.e(6380),
            t.e(1504),
            t.e(5274),
            t.e(3135),
            t.e(4225),
            t.e(5268),
          ]).then(t.bind(t, 53978))
        ),
        A = (0, l.lazy)(() =>
          Promise.all([
            t.e(7779),
            t.e(3013),
            t.e(6380),
            t.e(5274),
            t.e(3135),
            t.e(6249),
            t.e(5156),
          ]).then(t.bind(t, 55930))
        ),
        N = () =>
          (0, b.jsxs)(y.HK, {
            direction: "horizontal",
            autoSaveId: "app=constants-panel-sizes",
            children: [
              (0, b.jsx)(y.wV, {
                defaultSize: 20,
                children: (0, b.jsx)(g, {}),
              }),
              (0, b.jsx)(y.WM, { withHandle: !0 }),
              (0, b.jsxs)(y.wV, {
                defaultSize: 80,
                children: [
                  (0, b.jsxs)(r.BV, {
                    children: [
                      (0, b.jsx)(r.qh, {
                        index: !0,
                        element: (0, b.jsx)(_, {}),
                      }),
                      (0, b.jsx)(r.qh, {
                        path: s.a.ROUTES.ADD_APP_VARIABLES.code,
                        element: (0, b.jsx)(_, {}),
                      }),
                      (0, b.jsx)(r.qh, {
                        path: s.a.ROUTES.APP_VARIABLES_VIEW.code,
                        element: (0, b.jsx)(A, {}),
                      }),
                    ],
                  }),
                  (0, b.jsx)(r.sv, {}),
                ],
              }),
            ],
          });
    },
    61892: (e, a, t) => {
      t.d(a, { HK: () => i, WM: () => c, wV: () => o });
      var l = t(26240),
        r = t(66833),
        s = t(59458),
        n = t(70579);
      const i = (e) => {
          let { className: a, ...t } = e;
          return (0, n.jsx)(s.YZ, {
            className:
              "flex h-full w-full data-[panel-group-direction=vertical]:flex-col ".concat(
                a
              ),
            ...t,
          });
        },
        o = s.Zk,
        c = (e) => {
          let { withHandle: a, className: t, ...i } = e;
          const o = (0, l.A)();
          return (0, n.jsx)(s.TW, {
            className:
              '\n      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",\n      '.concat(
                t,
                "\n    "
              ),
            ...i,
            children:
              a &&
              (0, n.jsx)("div", {
                className:
                  "z-10 flex h-4 w-3 items-center justify-center rounded-sm border",
                style: {
                  background: o.palette.background.default,
                  borderColor: o.palette.divider,
                  color: o.palette.text.primary,
                },
                children: (0, n.jsx)(r.GPm, { className: "!text-lg" }),
              }),
          });
        };
    },
  },
]);
//# sourceMappingURL=4047.884e506f.chunk.js.map
