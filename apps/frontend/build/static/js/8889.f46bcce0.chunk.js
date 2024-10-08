(self.webpackChunkjetadmin_frontend =
  self.webpackChunkjetadmin_frontend || []).push([
  [8889],
  {
    4893: (e, t, s) => {
      "use strict";
      s.r(t), s.d(t, { default: () => x });
      var a = s(26240),
        r = s(42518),
        o = s(63248),
        n = s(93747),
        l = s(65043),
        i = s(75200),
        d = s(73216),
        c = s(93197),
        u = s(399),
        p = (s(65211), s(39659), s(5752)),
        f = s(70579);
      const h = (0, u.WidthProvider)(u.Responsive),
        m = (e) => {
          let { widgets: t, layouts: s } = e;
          const r = (0, a.A)(),
            o = "verticle";
          return (0, f.jsx)("div", {
            className: "w-full h-full p-2 overflow-y-scroll pb-10",
            style: { background: r.palette.background.paper },
            children: (0, f.jsx)(h, {
              style: { background: "transparent", minHeight: 300 },
              layouts: s,
              cols: { lg: 5, md: 4, sm: 3, xs: 2, xxs: 1 },
              rowHeight: 300,
              compactType: o,
              preventCollision: !1,
              isDraggable: !1,
              isResizable: !1,
              resizeHandles: [],
              children: t.map((e, t) =>
                (0, f.jsx)(
                  "div",
                  {
                    className: "",
                    children: (0, f.jsx)(p.L, {
                      responsive: !1,
                      widget: e,
                      index: t,
                    }),
                  },
                  e
                )
              ),
            }),
          });
        };
      var y = s(88739);
      const x = () => {
        const { id: e } = (0, d.g)(),
          t = (0, a.A)(),
          s = ((0, o.jE)(), (0, d.Zp)()),
          [u, p] = (0, l.useState)(!1),
          {
            isLoading: h,
            data: x,
            error: g,
            refetch: b,
          } = (0, n.I)({
            queryKey: ["REACT_QUERY_KEY_DASHBOARD_LAYOUTS", e],
            queryFn: () => (0, c.Pg)({ pmDashboardID: e }),
            retry: 1,
          });
        return (0, f.jsxs)("div", {
          className: "w-full h-full flex flex-col justify-start items-stretch",
          children: [
            x &&
              (0, f.jsxs)("div", {
                className:
                  "w-full flex flex-row justify-between items-center px-4 py-2 flex-shrink",
                style: { background: t.palette.background.default },
                children: [
                  (0, f.jsx)("span", {
                    className: "!text-lg font-bold",
                    style: { color: t.palette.primary.main },
                    children: x.dashboard_title,
                  }),
                  (0, f.jsx)(r.A, {
                    variant: "outlined",
                    startIcon: (0, f.jsx)(i.VSk, {}),
                    onClick: () => {
                      s(y.a.ROUTES.DASHBOARD_EDIT_VIEW.path(e));
                    },
                    children: "Edit dashboard",
                  }),
                ],
              }),
            x &&
              (0, f.jsx)(m, {
                widgets: x.dashboard_options
                  ? x.dashboard_options.widgets
                  : null,
                layouts: x.dashboard_options
                  ? x.dashboard_options.layouts
                  : null,
              }),
          ],
        });
      };
    },
    96446: (e, t, s) => {
      "use strict";
      s.d(t, { A: () => b });
      var a = s(58168),
        r = s(98587),
        o = s(65043),
        n = s(58387),
        l = s(68131),
        i = s(58812),
        d = s(18698),
        c = s(45527),
        u = s(70579);
      const p = ["className", "component"];
      var f = s(25430),
        h = s(88279),
        m = s(13375);
      const y = (0, s(57056).A)("MuiBox", ["root"]),
        x = (0, h.A)(),
        g = (function () {
          let e =
            arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
          const {
              themeId: t,
              defaultTheme: s,
              defaultClassName: f = "MuiBox-root",
              generateClassName: h,
            } = e,
            m = (0, l.default)("div", {
              shouldForwardProp: (e) =>
                "theme" !== e && "sx" !== e && "as" !== e,
            })(i.A);
          return o.forwardRef(function (e, o) {
            const l = (0, c.A)(s),
              i = (0, d.A)(e),
              { className: y, component: x = "div" } = i,
              g = (0, r.A)(i, p);
            return (0,
            u.jsx)(m, (0, a.A)({ as: x, ref: o, className: (0, n.A)(y, h ? h(f) : f), theme: (t && l[t]) || l }, g));
          });
        })({
          themeId: m.A,
          defaultTheme: x,
          defaultClassName: y.root,
          generateClassName: f.A.generate,
        }),
        b = g;
    },
    41497: (e, t, s) => {
      "use strict";
      var a = s(13218);
      function r() {}
      function o() {}
      (o.resetWarningCache = r),
        (e.exports = function () {
          function e(e, t, s, r, o, n) {
            if (n !== a) {
              var l = new Error(
                "Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types"
              );
              throw ((l.name = "Invariant Violation"), l);
            }
          }
          function t() {
            return e;
          }
          e.isRequired = e;
          var s = {
            array: e,
            bigint: e,
            bool: e,
            func: e,
            number: e,
            object: e,
            string: e,
            symbol: e,
            any: e,
            arrayOf: t,
            element: e,
            elementType: e,
            instanceOf: t,
            node: e,
            objectOf: t,
            oneOf: t,
            oneOfType: t,
            shape: t,
            exact: t,
            checkPropTypes: o,
            resetWarningCache: r,
          };
          return (s.PropTypes = s), s;
        });
    },
    65173: (e, t, s) => {
      e.exports = s(41497)();
    },
    13218: (e) => {
      "use strict";
      e.exports = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
    },
  },
]);
//# sourceMappingURL=8889.f46bcce0.chunk.js.map
