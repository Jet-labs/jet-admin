"use strict";
(self.webpackChunkjetadmin_frontend =
  self.webpackChunkjetadmin_frontend || []).push([
  [2013],
  {
    47562: (e, a, s) => {
      s.r(a), s.d(a, { default: () => g });
      var t = s(65043),
        d = s(73216),
        l = s(26240),
        o = s(68903),
        r = s(42518),
        i = s(63248),
        n = s(93747),
        c = s(47097),
        u = s(63516),
        h = s(75200),
        m = s(93197),
        S = s(17160),
        _ = s(76639),
        x = s(56249),
        A = s(45394),
        b = s(88739),
        p = s(70579);
      const D = (e) => {
        let { pmDashboardID: a } = e;
        const { pmUser: s } = (0, S.hD)(),
          l = (0, i.jE)(),
          o = (0, d.Zp)(),
          [n, u] = (0, t.useState)(!1),
          h = (0, t.useMemo)(
            () => !!s && s.extractDashboardDeleteAuthorization(a),
            [s, a]
          ),
          {
            isPending: D,
            isSuccess: T,
            isError: f,
            error: E,
            mutate: j,
          } = (0, c.n)({
            mutationFn: () => (0, m.eV)({ pmDashboardID: a }),
            retry: !1,
            onSuccess: () => {
              (0, _.qq)(b.a.STRINGS.DASHBOARD_DELETED_SUCCESS),
                l.invalidateQueries([b.a.REACT_QUERY_KEYS.DASHBOARDS]),
                u(!1),
                o(b.a.ROUTES.ALL_DASHBOARD_LAYOUTS.path());
            },
            onError: (e) => {
              (0, _.jx)(e);
            },
          });
        return (
          h &&
          (0, p.jsxs)(p.Fragment, {
            children: [
              (0, p.jsx)(r.A, {
                onClick: () => {
                  u(!0);
                },
                startIcon: (0, p.jsx)(A.tW_, { className: "!text-sm" }),
                size: "medium",
                variant: "outlined",
                className: "!ml-2",
                color: "error",
                children: b.a.STRINGS.DELETE_BUTTON_TEXT,
              }),
              (0, p.jsx)(x.K, {
                open: n,
                onAccepted: () => {
                  j({ pmDashboardID: a });
                },
                onDecline: () => {
                  u(!1);
                },
                title: b.a.STRINGS.DASHBOARD_DELETION_CONFIRMATION_TITLE,
                message: ""
                  .concat(
                    b.a.STRINGS.DASHBOARD_DELETION_CONFIRMATION_BODY,
                    " - "
                  )
                  .concat(a),
              }),
            ],
          })
        );
      };
      var T = s(7041),
        f = s(81953),
        E = s(92212),
        j = s(61892);
      const N = (e) => {
          let { id: a } = e;
          const s = (0, l.A)(),
            d = (0, i.jE)(),
            {
              isLoading: S,
              data: x,
              error: A,
              refetch: N,
            } = (0, n.I)({
              queryKey: [b.a.REACT_QUERY_KEYS.DASHBOARDS, a],
              queryFn: () => (0, m.Pg)({ pmDashboardID: a }),
              retry: 1,
            }),
            {
              isPending: g,
              isSuccess: v,
              isError: R,
              error: y,
              mutate: I,
            } = (0, c.n)({
              mutationFn: (e) => {
                let { data: a } = e;
                return (0, m.e_)({ data: a });
              },
              retry: !1,
              onSuccess: () => {
                (0, _.qq)(b.a.STRINGS.DASHBOARD_UPDATED_SUCCESS),
                  d.invalidateQueries([b.a.REACT_QUERY_KEYS.DASHBOARDS]);
              },
              onError: (e) => {
                (0, _.jx)(e);
              },
            }),
            w = (0, u.Wx)({
              initialValues: { dashboard_title: "", widgets: [], layouts: [] },
              validateOnMount: !1,
              validateOnChange: !1,
              validate: (e) => ({}),
              onSubmit: (e) => {
                const {
                  dashboard_title: s,
                  dashboard_description: t,
                  ...d
                } = e;
                I({
                  data: {
                    pm_dashboard_id: a,
                    dashboard_title: s,
                    dashboard_description: t,
                    dashboard_options: d,
                  },
                });
              },
            });
          return (
            (0, t.useEffect)(() => {
              x &&
                (w.setFieldValue("dashboard_title", x.dashboard_title),
                w.setFieldValue(
                  "dashboard_description",
                  x.dashboard_description
                ),
                w.setFieldValue("widgets", x.dashboard_options.widgets),
                w.setFieldValue("layouts", x.dashboard_options.layouts));
            }, [x]),
            (0, p.jsx)("div", {
              className: "w-full h-full",
              children: (0, p.jsxs)(j.HK, {
                className: "!h-full",
                direction: "horizontal",
                autoSaveId: "dashboard-update-widget-panel-sizes",
                children: [
                  (0, p.jsx)(j.wV, {
                    defaultSize: 70,
                    className: "w-full !h-[calc(100vh-48px)]",
                    children: (0, p.jsx)(T.f, {
                      widgets: w.values.widgets,
                      setWidgets: (e) => w.setFieldValue("widgets", e),
                      layouts: w.values.layouts,
                      setLayouts: (e) => {
                        w.setFieldValue("layouts", e);
                      },
                    }),
                  }),
                  (0, p.jsx)(j.WM, { withHandle: !0 }),
                  (0, p.jsxs)(j.wV, {
                    defaultSize: 30,
                    className: "w-full !h-[calc(100vh-48px)] !overflow-y-auto",
                    style: { background: s.palette.background.default },
                    children: [
                      (0, p.jsxs)(o.Ay, {
                        sm: 12,
                        className: "!top-0 !sticky !z-50",
                        children: [
                          (0, p.jsxs)("div", {
                            className:
                              "flex flex-row justify-start items-center p-3 ",
                            style: { background: s.palette.background.default },
                            children: [
                              (0, p.jsx)(h.VSk, {
                                className: "!text-base !font-semibold",
                              }),
                              (0, p.jsx)("span", {
                                className:
                                  "text-sm font-semibold text-start ml-2",
                                children: "Update dashboard : ".concat(a),
                              }),
                            ],
                          }),
                          (0, p.jsxs)("div", {
                            className:
                              "flex flex-col justify-center items-start p-3 ",
                            style: { background: s.palette.background.default },
                            children: [
                              (0, p.jsx)(f.K, {
                                name: "dashboard_title",
                                type: b.a.DATA_TYPES.STRING,
                                value: w.values.dashboard_title,
                                onChange: w.handleChange,
                              }),
                              (0, p.jsx)("div", { className: "mt-2" }),
                              (0, p.jsx)(f.K, {
                                name: "dashboard_description",
                                type: b.a.DATA_TYPES.STRING,
                                value: w.values.dashboard_description,
                                onChange: w.handleChange,
                              }),
                              (0, p.jsxs)("div", {
                                className:
                                  "mt-3 w-full flex flex-row justify-end",
                                children: [
                                  (0, p.jsx)(r.A, {
                                    variant: "contained",
                                    className: "!ml-2",
                                    onClick: w.handleSubmit,
                                    children: b.a.STRINGS.UPDATE_BUTTON_TEXT,
                                  }),
                                  (0, p.jsx)(D, { pmDashboardID: a }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, p.jsx)(o.Ay, {
                        sm: 12,
                        children: (0, p.jsx)(E.c, {}),
                      }),
                    ],
                  }),
                ],
              }),
            })
          );
        },
        g = () => {
          const { id: e } = (0, d.g)();
          return (0, p.jsx)(N, { id: e });
        };
    },
    26600: (e, a, s) => {
      s.d(a, { A: () => x });
      var t = s(58168),
        d = s(98587),
        l = s(65043),
        o = s(58387),
        r = s(68606),
        i = s(85865),
        n = s(34535),
        c = s(98206),
        u = s(87034),
        h = s(2563),
        m = s(70579);
      const S = ["className", "id"],
        _ = (0, n.Ay)(i.A, {
          name: "MuiDialogTitle",
          slot: "Root",
          overridesResolver: (e, a) => a.root,
        })({ padding: "16px 24px", flex: "0 0 auto" }),
        x = l.forwardRef(function (e, a) {
          const s = (0, c.b)({ props: e, name: "MuiDialogTitle" }),
            { className: i, id: n } = s,
            x = (0, d.A)(s, S),
            A = s,
            b = ((e) => {
              const { classes: a } = e;
              return (0, r.A)({ root: ["root"] }, u.t, a);
            })(A),
            { titleId: p = n } = l.useContext(h.A);
          return (0,
          m.jsx)(_, (0, t.A)({ component: "h2", className: (0, o.A)(b.root, i), ownerState: A, ref: a, variant: "h6", id: null != n ? n : p }, x));
        });
    },
  },
]);
//# sourceMappingURL=2013.211a7a7c.chunk.js.map
