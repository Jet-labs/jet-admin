"use strict";
(self.webpackChunkjetadmin_frontend =
  self.webpackChunkjetadmin_frontend || []).push([
  [2684],
  {
    369: (e, a, t) => {
      t.r(a), t.d(a, { default: () => m });
      t(65043);
      var l = t(68903),
        s = t(63248),
        r = t(47097),
        i = t(63516),
        n = t(77769),
        d = t(11068),
        o = t(88739),
        c = t(76639),
        p = t(55756),
        u = t(97054),
        _ = t(73752),
        h = t(70579);
      const g = () => {
          const e = (0, p.u)(),
            a = (0, s.jE)(),
            {
              isPending: t,
              isSuccess: g,
              isError: m,
              error: x,
              mutate: y,
            } = (0, r.n)({
              mutationFn: (e) => {
                let { data: a } = e;
                return (0, n.Ir)({ data: a });
              },
              retry: !1,
              onSuccess: () => {
                (0, c.qq)(o.a.STRINGS.GRAPH_ADDITION_SUCCESS),
                  a.invalidateQueries([o.a.REACT_QUERY_KEYS.GRAPHS]);
              },
              onError: (e) => {
                (0, c.jx)(e);
              },
            }),
            f = (0, i.Wx)({
              initialValues: {
                graph_type: u.z.BAR.value,
                title_display_enabled: !0,
                legend_position: o.a.GRAPH_LEGEND_POSITION.TOP,
                pm_graph_title: "",
                refetch_interval: 5,
                query_array: [{ dataset_title: "", query: "" }],
              },
              validateOnMount: !1,
              validateOnChange: !1,
              validate: (e) => ({}),
              onSubmit: (e) => {
                const { pm_graph_title: a, ...t } = e;
                y({ data: { pm_graph_title: a, pm_graph_options: t } });
              },
            });
          return (0, h.jsxs)("div", {
            className: "w-full h-full overflow-y-scroll",
            children: [
              (0, h.jsx)("div", {
                className: "flex flex-col items-start justify-start p-3 px-6",
                style: { background: e.palette.background.paper },
                children: (0, h.jsx)("span", {
                  className: "text-lg font-bold text-start mt-1",
                  children: o.a.STRINGS.GRAPH_ADDITION_PAGE_TITLE,
                }),
              }),
              (0, h.jsxs)(l.Ay, {
                container: !0,
                spacing: 1,
                className: "!px-3",
                children: [
                  (0, h.jsx)(l.Ay, {
                    item: !0,
                    lg: 5,
                    md: 4,
                    className: "w-full",
                    children: (0, h.jsx)(_.c, { graphForm: f }),
                  }),
                  (0, h.jsx)(l.Ay, {
                    item: !0,
                    lg: 7,
                    md: 8,
                    className: "w-full",
                    children: (0, h.jsx)(d.U, {
                      graphType: f.values.graph_type,
                      legendPosition: f.values.legend_position,
                      titleDisplayEnabled: f.values.title_display_enabled,
                      pmGraphTitle: f.values.pm_graph_title,
                    }),
                  }),
                ],
              }),
            ],
          });
        },
        m = () => (0, h.jsx)(g, {});
    },
  },
]);
//# sourceMappingURL=2684.a1826362.chunk.js.map
