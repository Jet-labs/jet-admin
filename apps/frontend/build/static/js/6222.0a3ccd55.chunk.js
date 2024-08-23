"use strict";
(self.webpackChunkjetadmin_frontend =
  self.webpackChunkjetadmin_frontend || []).push([
  [6222],
  {
    27722: (e, a, t) => {
      t.d(a, {
        $z: () => d,
        Ae: () => h,
        S6: () => o,
        UZ: () => u,
        bc: () => i,
        lE: () => m,
        oJ: () => R,
        wP: () => c,
        x9: () => n,
        xH: () => l,
      });
      var r = t(88739),
        s = t(33211);
      const l = async () => {
          try {
            const e = await s.A.get(r.a.APIS.TABLE.getAllTables());
            if (e.data && 1 == e.data.success) return e.data.tables;
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (e) {
            throw e;
          }
        },
        o = async (e) => {
          let { tableName: a } = e;
          try {
            const e = await s.A.get(
              r.a.APIS.TABLE.getTableColumns({ tableName: a })
            );
            if (e.data && 1 == e.data.success)
              return Array.from(e.data.columns);
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        i = async (e) => {
          let { tableName: a } = e;
          try {
            const e = await s.A.get(
              r.a.APIS.TABLE.getAuthorizedColumnsForAdd({ tableName: a })
            );
            if (e.data && 1 == e.data.success)
              return Array.from(e.data.columns);
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        d = async (e) => {
          let {
            tableName: a,
            page: t = 1,
            pageSize: l = 20,
            filterQuery: o,
            sortModel: i,
          } = e;
          try {
            const e = await s.A.get(
              r.a.APIS.TABLE.getTableRows({
                tableName: a,
                page: t,
                pageSize: l,
                filterQuery: o,
                sortModel: i,
              })
            );
            if (e.data && 1 == e.data.success)
              return e.data.rows && Array.isArray(e.data.rows)
                ? { rows: e.data.rows, nextPage: e.data.nextPage }
                : { rows: [], nextPage: null };
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (d) {
            throw d;
          }
        },
        c = async (e) => {
          let { tableName: a, filterQuery: t } = e;
          try {
            const e = await s.A.get(
              r.a.APIS.TABLE.getTableStats({ tableName: a, filterQuery: t })
            );
            if (e.data && 1 == e.data.success)
              return e.data.statistics
                ? { statistics: e.data.statistics }
                : { statistics: null };
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (l) {
            throw l;
          }
        },
        n = async (e) => {
          let { tableName: a, id: t } = e;
          try {
            const e = await s.A.get(
              r.a.APIS.TABLE.getTableRowByID({ tableName: a, id: t })
            );
            if (e.data && 1 == e.data.success) return e.data.row;
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (l) {
            throw l;
          }
        },
        R = async (e) => {
          let { tableName: a, id: t, data: l } = e;
          try {
            const e = await s.A.put(
              r.a.APIS.TABLE.updateTableRowByID({ tableName: a, id: t }),
              l
            );
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (o) {
            throw o;
          }
        },
        u = async (e) => {
          let { tableName: a, data: t } = e;
          try {
            const e = await s.A.post(
              r.a.APIS.TABLE.addTableRowByID({ tableName: a }),
              t
            );
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (l) {
            throw l;
          }
        },
        h = async (e) => {
          let { tableName: a, id: t } = e;
          try {
            const e = await s.A.delete(
              r.a.APIS.TABLE.deleteTableRowByID({ tableName: a, id: t })
            );
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (l) {
            throw l;
          }
        },
        m = async (e) => {
          let { tableName: a, ids: t } = e;
          try {
            const e = await s.A.post(
              r.a.APIS.TABLE.deleteTableRowByMultipleIDs({ tableName: a }),
              { query: t }
            );
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (l) {
            throw l;
          }
        };
    },
    96222: (e, a, t) => {
      t.r(a), t.d(a, { default: () => N });
      var r = t(65043),
        s = t(73216),
        l = t(88739),
        o = t(26240),
        i = t(35721),
        d = t(17392),
        c = t(42518),
        n = t(30681),
        R = t(38968),
        u = t(2050),
        h = t(48734),
        m = t(60184),
        p = t(35475),
        E = t(27722),
        x = t(93747),
        y = t(17160),
        f = t(70579);
      const b = () => {
        const e = (0, o.A)(),
          { pmUser: a } = (0, y.hD)(),
          t = (0, s.g)(),
          b = (0, s.Zp)(),
          w = "table_".concat(null === t || void 0 === t ? void 0 : t["*"]),
          A = (0, r.useMemo)(() => !0, [a]),
          {
            isLoading: g,
            data: S,
            error: j,
            refetch: O,
          } = (0, x.I)({
            queryKey: ["REACT_QUERY_KEY_TABLES"],
            queryFn: () => (0, E.xH)(),
            cacheTime: 0,
            retry: 1,
            staleTime: 0,
          });
        return (0, f.jsxs)(i.A, {
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
            (0, f.jsxs)("div", {
              className:
                "!px-3.5 py-1 flex flex-row justify-between items-center w-full",
              children: [
                (0, f.jsx)("span", {
                  style: { color: e.palette.primary.main },
                  className: "!font-semibold",
                  children: "Tables",
                }),
                (0, f.jsx)(d.A, {
                  onClick: O,
                  children: (0, f.jsx)(m.Swo, {
                    style: { color: e.palette.primary.main },
                    className: "!text-sm",
                  }),
                }),
              ],
            }),
            A &&
              (0, f.jsx)("div", {
                className: "!px-3 !py-1.5 !w-full",
                children: (0, f.jsx)(c.A, {
                  onClick: () => {
                    b(l.a.ROUTES.ADD_TABLE.path());
                  },
                  variant: "contained",
                  className: "!w-full",
                  startIcon: (0, f.jsx)(m.OiG, { className: "!text-sm" }),
                  children: "Add table",
                }),
              }),
            (0, f.jsx)("div", { className: "!mt-1" }),
            null === S || void 0 === S
              ? void 0
              : S.map((a) => {
                  const t = "table_".concat(a);
                  return (0, f.jsx)(
                    p.N_,
                    {
                      to: l.a.ROUTES.TABLE_VIEW.path(a),
                      children: (0, f.jsx)(
                        n.Ay,
                        {
                          disablePadding: !0,
                          className: "!px-3 !py-1.5",
                          sx: {},
                          children: (0, f.jsxs)(R.A, {
                            sx: {
                              background: e.palette.background.paper,
                              border: t == w ? 1 : 0,
                              borderColor: e.palette.primary.main,
                            },
                            selected: t == w,
                            className: "!rounded",
                            children: [
                              (0, f.jsx)(u.A, {
                                className: "!ml-1",
                                sx: {
                                  color:
                                    t == w
                                      ? e.palette.primary.main
                                      : e.palette.primary.contrastText,
                                },
                                children: (0, f.jsx)(m.ist, {
                                  className: "!text-lg",
                                }),
                              }),
                              (0, f.jsx)(h.A, {
                                sx: {
                                  color:
                                    t == w
                                      ? e.palette.primary.main
                                      : e.palette.primary.contrastText,
                                },
                                primary: a,
                                primaryTypographyProps: {
                                  sx: {
                                    fontWeight: t == w ? "700" : "500",
                                    marginLeft: -2,
                                  },
                                },
                              }),
                            ],
                          }),
                        },
                        t
                      ),
                    },
                    t
                  );
                }),
          ],
        });
      };
      var w = t(61892);
      const A = (0, r.lazy)(() =>
          Promise.all([
            t.e(7779),
            t.e(5404),
            t.e(3013),
            t.e(6043),
            t.e(1504),
            t.e(6249),
            t.e(4225),
            t.e(6317),
          ]).then(t.bind(t, 89516))
        ),
        g = (0, r.lazy)(() =>
          Promise.all([
            t.e(7779),
            t.e(5404),
            t.e(3013),
            t.e(6043),
            t.e(1504),
            t.e(4225),
            t.e(3134),
          ]).then(t.bind(t, 73134))
        ),
        S = (0, r.lazy)(() =>
          Promise.all([t.e(2098), t.e(8405), t.e(6660)]).then(t.bind(t, 82627))
        ),
        j = (0, r.lazy)(() =>
          Promise.all([
            t.e(7779),
            t.e(5404),
            t.e(3013),
            t.e(6043),
            t.e(6380),
            t.e(1504),
            t.e(9397),
            t.e(6249),
            t.e(4225),
            t.e(3598),
          ]).then(t.bind(t, 43598))
        ),
        O = (0, r.lazy)(() =>
          Promise.all([
            t.e(7779),
            t.e(5404),
            t.e(2098),
            t.e(4972),
            t.e(5516),
          ]).then(t.bind(t, 55516))
        ),
        N = () =>
          (0, f.jsxs)(w.HK, {
            direction: "horizontal",
            autoSaveId: "table-panel-sizes",
            children: [
              (0, f.jsx)(w.wV, {
                defaultSize: 20,
                children: (0, f.jsx)(b, {}),
              }),
              (0, f.jsx)(w.WM, { withHandle: !0 }),
              (0, f.jsxs)(w.wV, {
                defaultSize: 80,
                children: [
                  (0, f.jsxs)(s.BV, {
                    children: [
                      (0, f.jsx)(s.qh, {
                        index: !0,
                        element: (0, f.jsx)(S, {}),
                      }),
                      (0, f.jsx)(s.qh, {
                        path: l.a.ROUTES.ADD_TABLE.code,
                        element: (0, f.jsx)(O, {}),
                      }),
                      (0, f.jsxs)(s.qh, {
                        path: l.a.ROUTES.TABLE_VIEW.code,
                        children: [
                          (0, f.jsx)(s.qh, {
                            index: !0,
                            element: (0, f.jsx)(j, {}),
                          }),
                          (0, f.jsx)(s.qh, {
                            path: l.a.ROUTES.ADD_ROW.code,
                            element: (0, f.jsx)(g, {}),
                          }),
                          (0, f.jsx)(s.qh, {
                            path: l.a.ROUTES.ROW_VIEW.code,
                            element: (0, f.jsx)(A, {}),
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, f.jsx)(s.sv, {}),
                ],
              }),
            ],
          });
    },
    61892: (e, a, t) => {
      t.d(a, { HK: () => i, WM: () => c, wV: () => d });
      var r = t(26240),
        s = t(66833),
        l = t(59458),
        o = t(70579);
      const i = (e) => {
          let { className: a, ...t } = e;
          return (0, o.jsx)(l.YZ, {
            className:
              "flex h-full w-full data-[panel-group-direction=vertical]:flex-col ".concat(
                a
              ),
            ...t,
          });
        },
        d = l.Zk,
        c = (e) => {
          let { withHandle: a, className: t, ...i } = e;
          const d = (0, r.A)();
          return (0, o.jsx)(l.TW, {
            className:
              '\n      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",\n      '.concat(
                t,
                "\n    "
              ),
            ...i,
            children:
              a &&
              (0, o.jsx)("div", {
                className:
                  "z-10 flex h-4 w-3 items-center justify-center rounded-sm border",
                style: {
                  background: d.palette.background.default,
                  borderColor: d.palette.divider,
                  color: d.palette.text.primary,
                },
                children: (0, o.jsx)(s.GPm, { className: "!text-lg" }),
              }),
          });
        };
    },
  },
]);
//# sourceMappingURL=6222.0a3ccd55.chunk.js.map
