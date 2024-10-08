"use strict";
(self.webpackChunkjetadmin_frontend =
  self.webpackChunkjetadmin_frontend || []).push([
  [3593],
  {
    93197: (a, e, t) => {
      t.d(e, {
        _2: () => i,
        eV: () => c,
        IG: () => h,
        Pg: () => n,
        e_: () => l,
      });
      var r,
        s = t(88739);
      class d {
        constructor(a) {
          let {
            pm_dashboard_id: e,
            dashboard_title: t,
            dashboard_description: r,
            dashboard_options: s,
            is_disabled: d,
            created_at: o,
            updated_at: i,
            disabled_at: l,
            disable_reason: n,
          } = a;
          (this.pm_dashboard_id = parseInt(e)),
            (this.dashboard_title = String(t)),
            (this.dashboard_description = String(r)),
            (this.dashboard_options =
              "object" === typeof s ? s : JSON.parse(s)),
            (this.is_disabled = d),
            (this.created_at = o),
            (this.updated_at = i),
            (this.disabled_at = l),
            (this.disable_reason = n);
        }
      }
      (r = d),
        (d.toList = (a) => {
          if (Array.isArray(a)) return a.map((a) => new r(a));
        });
      var o = t(33211);
      const i = async (a) => {
          let { data: e } = a;
          try {
            const a = await o.A.post(
              s.a.APIS.DASHBOARD_LAYOUT.addDashboard(),
              e
            );
            if (a.data && 1 == a.data.success) return !0;
            throw a.data.error ? a.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        l = async (a) => {
          let { data: e } = a;
          try {
            const a = await o.A.put(
              s.a.APIS.DASHBOARD_LAYOUT.updateDashboard(),
              e
            );
            if (a.data && 1 == a.data.success) return !0;
            throw a.data && a.data.error
              ? a.data.error
              : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw (console.log({ error: t }), t);
          }
        },
        n = async (a) => {
          let { pmDashboardID: e } = a;
          try {
            const a = await o.A.get(
              s.a.APIS.DASHBOARD_LAYOUT.getDashboardByID({ id: e })
            );
            if (a.data && 1 == a.data.success) return new d(a.data.dashboard);
            throw a.data.error ? a.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        c = async (a) => {
          let { pmDashboardID: e } = a;
          try {
            const a = await o.A.delete(
              s.a.APIS.DASHBOARD_LAYOUT.deleteDashboardByID({ id: e })
            );
            if (a.data && 1 == a.data.success) return !0;
            throw a.data.error ? a.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        h = async () => {
          try {
            const a = await o.A.get(
              s.a.APIS.DASHBOARD_LAYOUT.getAllDashboards()
            );
            if (a.data && 1 == a.data.success)
              return d.toList(a.data.dashboards);
            throw a.data.error ? a.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (a) {
            throw a;
          }
        };
    },
    33593: (a, e, t) => {
      t.r(e), t.d(e, { default: () => S });
      var r = t(65043),
        s = t(73216),
        d = t(88739),
        o = t(26240),
        i = t(35721),
        l = t(17392),
        n = t(42518),
        c = t(30681),
        h = t(38968),
        p = t(2050),
        u = t(48734),
        m = t(93747),
        b = t(60184),
        _ = t(35475),
        x = t(93197),
        R = t(17160),
        f = t(6720),
        A = t(70579);
      const y = () => {
        const a = (0, o.A)(),
          e = (0, s.g)(),
          t = "dashboard_".concat(null === e || void 0 === e ? void 0 : e["*"]),
          { pmUser: y } = (0, R.hD)(),
          j = (0, s.Zp)(),
          D = (0, r.useMemo)(
            () => y && y.extractAuthorizationForDashboardAddFromPolicyObject(),
            [y]
          ),
          {
            isLoading: O,
            data: w,
            error: S,
            refetch: g,
          } = (0, m.I)({
            queryKey: ["REACT_QUERY_KEY_DASHBOARD_LAYOUTS"],
            queryFn: () => (0, x.IG)(),
            cacheTime: 0,
            retry: 1,
            staleTime: 0,
          });
        return (0, A.jsxs)(i.A, {
          style: {
            borderRightWidth: 1,
            borderColor: a.palette.divider,
            backgroundColor: a.palette.background.default,
          },
          component: "nav",
          "aria-labelledby": "nested-list-subheader",
          className:
            " !h-[calc(100vh-48px)] !overflow-y-auto !overflow-x-hidden w-full",
          children: [
            (0, A.jsxs)("div", {
              className:
                "!px-3.5 py-1 flex flex-row justify-between items-center w-full",
              children: [
                (0, A.jsx)("span", {
                  className: "!font-semibold",
                  style: { color: a.palette.primary.main },
                  children: "Dashboard Layouts",
                }),
                (0, A.jsx)(l.A, {
                  onClick: g,
                  children: (0, A.jsx)(b.Swo, {
                    style: { color: a.palette.primary.main },
                    className: "!text-sm",
                  }),
                }),
              ],
            }),
            D &&
              (0, A.jsx)("div", {
                className: "!px-3 !py-1.5 !w-full",
                children: (0, A.jsx)(n.A, {
                  onClick: () => {
                    j(d.a.ROUTES.ADD_DASHBOARD_LAYOUT.path());
                  },
                  variant: "contained",
                  className: "!w-full",
                  startIcon: (0, A.jsx)(b.OiG, { className: "!text-sm" }),
                  children: "Add more dashboards",
                }),
              }),
            (0, A.jsx)("div", { className: "!mt-1" }),
            w && w.length > 0
              ? w.map((e) => {
                  const r = "dashboard_".concat(e.pm_dashboard_id);
                  return (0, A.jsx)(
                    _.N_,
                    {
                      to: d.a.ROUTES.GRAPH_VIEW.path(e.pm_dashboard_id),
                      children: (0, A.jsx)(
                        c.Ay,
                        {
                          disablePadding: !0,
                          className: "!px-3 !py-1.5",
                          children: (0, A.jsxs)(h.A, {
                            sx: {
                              background: a.palette.background.paper,
                              border: r == t ? 1 : 0,
                              borderColor: a.palette.primary.main,
                            },
                            selected: r == t,
                            className: "!rounded",
                            children: [
                              (0, A.jsx)(p.A, {
                                className: "!ml-1",
                                sx: {
                                  color:
                                    r == t
                                      ? a.palette.primary.main
                                      : a.palette.primary.contrastText,
                                  minWidth: 0,
                                },
                                children: (0, A.jsx)(f._ht, {
                                  className: "!text-lg",
                                }),
                              }),
                              (0, A.jsx)(u.A, {
                                sx: {
                                  color:
                                    r == t
                                      ? a.palette.primary.main
                                      : a.palette.primary.contrastText,
                                },
                                primary: e.dashboard_title,
                                primaryTypographyProps: {
                                  sx: {
                                    fontWeight: r == t ? "700" : "500",
                                    fontSize: 12,
                                    marginLeft: 2,
                                  },
                                },
                              }),
                            ],
                          }),
                        },
                        "_dashboard_".concat(e.pm_dashboard_id)
                      ),
                    },
                    r
                  );
                })
              : null,
          ],
        });
      };
      var j = t(61892);
      const D = (0, r.lazy)(() =>
          Promise.all([
            t.e(7779),
            t.e(5404),
            t.e(3013),
            t.e(6043),
            t.e(2098),
            t.e(8405),
            t.e(7053),
            t.e(4348),
            t.e(141),
            t.e(3544),
            t.e(5351),
            t.e(5752),
            t.e(5332),
            t.e(7641),
          ]).then(t.bind(t, 24511))
        ),
        O = (0, r.lazy)(() =>
          Promise.all([
            t.e(7779),
            t.e(5404),
            t.e(2098),
            t.e(8405),
            t.e(7053),
            t.e(4348),
            t.e(141),
            t.e(3544),
            t.e(5351),
            t.e(5752),
            t.e(8889),
          ]).then(t.bind(t, 4893))
        ),
        w = (0, r.lazy)(() =>
          Promise.all([
            t.e(7779),
            t.e(5404),
            t.e(3013),
            t.e(6043),
            t.e(2098),
            t.e(8405),
            t.e(7053),
            t.e(4348),
            t.e(141),
            t.e(3544),
            t.e(6249),
            t.e(5351),
            t.e(5752),
            t.e(5332),
            t.e(2013),
          ]).then(t.bind(t, 47562))
        ),
        S = () =>
          (0, A.jsxs)(j.HK, {
            direction: "horizontal",
            autoSaveId: "dashboard-panel-sizes",
            children: [
              (0, A.jsx)(j.wV, {
                defaultSize: 20,
                children: (0, A.jsx)(y, {}),
              }),
              (0, A.jsx)(j.WM, { withHandle: !0 }),
              (0, A.jsxs)(j.wV, {
                defaultSize: 80,
                children: [
                  (0, A.jsxs)(s.BV, {
                    children: [
                      (0, A.jsx)(s.qh, {
                        index: !0,
                        element: (0, A.jsx)(D, {}),
                      }),
                      (0, A.jsx)(s.qh, {
                        path: d.a.ROUTES.ADD_DASHBOARD_LAYOUT.code,
                        element: (0, A.jsx)(D, {}),
                      }),
                      (0, A.jsxs)(s.qh, {
                        path: d.a.ROUTES.DASHBOARD_LAYOUT_VIEW.code,
                        children: [
                          (0, A.jsx)(s.qh, {
                            index: !0,
                            element: (0, A.jsx)(O, {}),
                          }),
                          (0, A.jsx)(s.qh, {
                            path: d.a.ROUTES.DASHBOARD_EDIT_VIEW.code,
                            element: (0, A.jsx)(w, {}),
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, A.jsx)(s.sv, {}),
                ],
              }),
            ],
          });
    },
    61892: (a, e, t) => {
      t.d(e, { HK: () => i, WM: () => n, wV: () => l });
      var r = t(26240),
        s = t(66833),
        d = t(59458),
        o = t(70579);
      const i = (a) => {
          let { className: e, ...t } = a;
          return (0, o.jsx)(d.YZ, {
            className:
              "flex h-full w-full data-[panel-group-direction=vertical]:flex-col ".concat(
                e
              ),
            ...t,
          });
        },
        l = d.Zk,
        n = (a) => {
          let { withHandle: e, className: t, ...i } = a;
          const l = (0, r.A)();
          return (0, o.jsx)(d.TW, {
            className:
              '\n      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",\n      '.concat(
                t,
                "\n    "
              ),
            ...i,
            children:
              e &&
              (0, o.jsx)("div", {
                className:
                  "z-10 flex h-4 w-3 items-center justify-center rounded-sm border",
                style: {
                  background: l.palette.background.default,
                  borderColor: l.palette.divider,
                  color: l.palette.text.primary,
                },
                children: (0, o.jsx)(s.GPm, { className: "!text-lg" }),
              }),
          });
        };
    },
  },
]);
//# sourceMappingURL=3593.1857856a.chunk.js.map
