"use strict";
(self.webpackChunkjetadmin_frontend =
  self.webpackChunkjetadmin_frontend || []).push([
  [3162],
  {
    66772: (e, a, t) => {
      t.r(a), t.d(a, { default: () => q });
      var r = t(65043),
        l = t(73216),
        s = t(88739),
        n = t(26240),
        i = t(35721),
        o = t(17392),
        c = t(42518),
        d = t(30681),
        u = t(38968),
        m = t(2050),
        p = t(48734),
        x = t(93747),
        f = t(35475),
        h = t(17160),
        y = t(60184),
        v = t(23156),
        j = t(35113),
        g = t(83359),
        b = t(70579);
      const A = () => {
        const e = (0, n.A)(),
          a = (0, l.g)(),
          t = "query_".concat(null === a || void 0 === a ? void 0 : a["*"]),
          { pmUser: A } = (0, h.hD)(),
          N = (0, l.Zp)(),
          _ = (0, r.useMemo)(() => A && A.extractQueryAddAuthorization(), [A]),
          {
            isLoading: w,
            data: q,
            error: R,
            refetch: C,
          } = (0, x.I)({
            queryKey: ["REACT_QUERY_KEY_QUERIES"],
            queryFn: () => (0, j.Q2)(),
            cacheTime: 0,
            retry: 1,
            staleTime: 0,
          });
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
                  style: { color: e.palette.primary.main },
                  className: "!font-semibold",
                  children: "Queries",
                }),
                (0, b.jsx)(o.A, {
                  onClick: C,
                  children: (0, b.jsx)(y.Swo, {
                    style: { color: e.palette.primary.main },
                    className: "!text-sm",
                  }),
                }),
              ],
            }),
            _ &&
              (0, b.jsx)("div", {
                className: "!px-3 !py-1.5 !w-full",
                children: (0, b.jsx)(c.A, {
                  onClick: () => {
                    N(s.a.ROUTES.ADD_GRAPH.path());
                  },
                  variant: "contained",
                  className: "!w-full",
                  startIcon: (0, b.jsx)(y.OiG, { className: "!text-sm" }),
                  children: "Add query",
                }),
              }),
            (0, b.jsx)("div", { className: "!mt-1" }),
            q && q.length > 0
              ? q.map((a) => {
                  const r = "query_".concat(a.pm_query_id);
                  return (0, b.jsx)(
                    f.N_,
                    {
                      to: s.a.ROUTES.QUERY_VIEW.path(a.pm_query_id),
                      children: (0, b.jsx)(
                        d.Ay,
                        {
                          disablePadding: !0,
                          sx: {},
                          className: "!px-3 !py-1.5",
                          children: (0, b.jsxs)(u.A, {
                            sx: {
                              background: e.palette.background.paper,
                              border: r == t ? 1 : 0,
                              borderColor: e.palette.primary.main,
                            },
                            selected: r == t,
                            className: "!rounded",
                            children: [
                              (0, b.jsx)(m.A, {
                                className: "!ml-1",
                                sx: {
                                  color:
                                    r == t
                                      ? e.palette.primary.main
                                      : e.palette.primary.contrastText,
                                  minWidth: 0,
                                },
                                children: g.R[a.pm_query_type]
                                  ? g.R[a.pm_query_type].icon
                                  : (0, b.jsx)(v.vZy, {
                                      className: "!text-sm",
                                    }),
                              }),
                              (0, b.jsx)(p.A, {
                                sx: {
                                  color:
                                    r == t
                                      ? e.palette.primary.main
                                      : e.palette.primary.contrastText,
                                },
                                primary: a.pm_query_title,
                                primaryTypographyProps: {
                                  sx: {
                                    fontWeight: r == t ? "700" : "500",
                                    marginLeft: 2,
                                    fontSize: 12,
                                  },
                                },
                              }),
                            ],
                          }),
                        },
                        "_query_".concat(a.pm_query_id)
                      ),
                    },
                    r
                  );
                })
              : null,
          ],
        });
      };
      var N = t(61892);
      const _ = (0, r.lazy)(() =>
          Promise.all([t.e(5274), t.e(4816)]).then(t.bind(t, 54816))
        ),
        w = (0, r.lazy)(() =>
          Promise.all([t.e(3013), t.e(5274), t.e(6249), t.e(1106)]).then(
            t.bind(t, 91219)
          )
        ),
        q = () =>
          (0, b.jsxs)(N.HK, {
            direction: "horizontal",
            autoSaveId: "query-panel-sizes",
            children: [
              (0, b.jsx)(N.wV, {
                defaultSize: 20,
                children: (0, b.jsx)(A, {}),
              }),
              (0, b.jsx)(N.WM, { withHandle: !0 }),
              (0, b.jsxs)(N.wV, {
                defaultSize: 80,
                children: [
                  (0, b.jsxs)(l.BV, {
                    children: [
                      (0, b.jsx)(l.qh, {
                        index: !0,
                        element: (0, b.jsx)(_, {}),
                      }),
                      (0, b.jsx)(l.qh, {
                        path: s.a.ROUTES.ADD_QUERY.code,
                        element: (0, b.jsx)(_, {}),
                      }),
                      (0, b.jsx)(l.qh, {
                        path: s.a.ROUTES.QUERY_VIEW.code,
                        element: (0, b.jsx)(w, {}),
                      }),
                    ],
                  }),
                  (0, b.jsx)(l.sv, {}),
                ],
              }),
            ],
          });
    },
    61892: (e, a, t) => {
      t.d(a, { HK: () => i, WM: () => c, wV: () => o });
      var r = t(26240),
        l = t(66833),
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
          const o = (0, r.A)();
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
                children: (0, n.jsx)(l.GPm, { className: "!text-lg" }),
              }),
          });
        };
    },
    96446: (e, a, t) => {
      t.d(a, { A: () => j });
      var r = t(58168),
        l = t(98587),
        s = t(65043),
        n = t(58387),
        i = t(68131),
        o = t(58812),
        c = t(18698),
        d = t(45527),
        u = t(70579);
      const m = ["className", "component"];
      var p = t(25430),
        x = t(88279),
        f = t(13375);
      const h = (0, t(57056).A)("MuiBox", ["root"]),
        y = (0, x.A)(),
        v = (function () {
          let e =
            arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
          const {
              themeId: a,
              defaultTheme: t,
              defaultClassName: p = "MuiBox-root",
              generateClassName: x,
            } = e,
            f = (0, i.default)("div", {
              shouldForwardProp: (e) =>
                "theme" !== e && "sx" !== e && "as" !== e,
            })(o.A);
          return s.forwardRef(function (e, s) {
            const i = (0, d.A)(t),
              o = (0, c.A)(e),
              { className: h, component: y = "div" } = o,
              v = (0, l.A)(o, m);
            return (0,
            u.jsx)(f, (0, r.A)({ as: y, ref: s, className: (0, n.A)(h, x ? x(p) : p), theme: (a && i[a]) || i }, v));
          });
        })({
          themeId: f.A,
          defaultTheme: y,
          defaultClassName: h.root,
          generateClassName: p.A.generate,
        }),
        j = v;
    },
    16871: (e, a, t) => {
      t.d(a, { A: () => s });
      t(65043);
      var r = t(59662),
        l = t(70579);
      const s = (0, r.A)(
        (0, l.jsx)("path", {
          d: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
        }),
        "Close"
      );
    },
  },
]);
//# sourceMappingURL=3162.a92c00e9.chunk.js.map
