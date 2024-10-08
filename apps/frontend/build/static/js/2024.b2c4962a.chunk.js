"use strict";
(self.webpackChunkjetadmin_frontend =
  self.webpackChunkjetadmin_frontend || []).push([
  [2024],
  {
    7357: (e, t, a) => {
      a.r(t), a.d(t, { default: () => f });
      var l = a(65043),
        r = a(73216),
        i = a(26240),
        s = a(68903),
        n = a(63248),
        d = a(93747),
        o = a(47097),
        p = a(77769),
        _ = a(63516),
        h = a(11068),
        c = a(73752),
        g = a(88739),
        u = a(76639),
        y = a(97054),
        m = a(70579);
      const x = (e) => {
          let { id: t } = e;
          const a = (0, i.A)(),
            r = (0, n.jE)(),
            {
              isLoading: x,
              data: f,
              error: v,
              refetch: E,
            } = (0, d.I)({
              queryKey: [g.a.REACT_QUERY_KEYS.GRAPHS, t],
              queryFn: () => (0, p.BD)({ pmGraphID: t }),
              cacheTime: 0,
              retry: 1,
              staleTime: 0,
            }),
            {
              isPending: A,
              isSuccess: j,
              isError: S,
              error: T,
              mutate: b,
            } = (0, o.n)({
              mutationFn: (e) => {
                let { data: t } = e;
                return (0, p.AD)({ data: t });
              },
              retry: !1,
              onSuccess: () => {
                (0, u.qq)(g.a.STRINGS.GRAPH_UPDATED_SUCCESS),
                  r.invalidateQueries([g.a.REACT_QUERY_KEYS.GRAPHS]);
              },
              onError: (e) => {
                (0, u.jx)(e);
              },
            }),
            P = (0, _.Wx)({
              initialValues: {
                pm_graph_id: t,
                graph_type: y.z.BAR.value,
                title_display_enabled: !0,
                legend_position: g.a.GRAPH_LEGEND_POSITION.TOP,
                pm_graph_title: "",
                query_array: [{ dataset_title: "", query: "" }],
              },
              validateOnMount: !1,
              validateOnChange: !1,
              validate: (e) => ({}),
              onSubmit: (e) => {
                const { pm_graph_title: t, ...a } = e;
                b({
                  data: {
                    pm_graph_id:
                      null === f || void 0 === f ? void 0 : f.pm_graph_id,
                    pm_graph_title: t,
                    pm_graph_options: a,
                  },
                });
              },
            });
          return (
            (0, l.useEffect)(() => {
              f &&
                (console.log({ graphData: f }),
                P.setFieldValue("graph_type", f.pm_graph_options.graph_type),
                P.setFieldValue(
                  "title_display_enabled",
                  f.pm_graph_options.title_display_enabled
                ),
                P.setFieldValue(
                  "legend_position",
                  f.pm_graph_options.legend_position
                ),
                P.setFieldValue("pm_graph_title", f.pm_graph_title),
                P.setFieldValue("query_array", f.pm_graph_options.query_array),
                P.setFieldValue(
                  "refetch_interval",
                  f.pm_graph_options.refetch_interval
                ));
            }, [f]),
            (0, m.jsxs)("div", {
              className: "w-full h-full overflow-y-scroll",
              children: [
                (0, m.jsxs)("div", {
                  className: "flex flex-col items-start justify-start p-3 px-6",
                  style: {
                    background: a.palette.background.default,
                    borderBottomWidth: 1,
                    borderColor: a.palette.divider,
                  },
                  children: [
                    (0, m.jsx)("span", {
                      className: "text-lg font-bold text-start ",
                      children: g.a.STRINGS.GRAPH_UPDATE_PAGE_TITLE,
                    }),
                    f &&
                      (0, m.jsx)("span", {
                        className:
                          "text-xs font-thin text-start text-slate-300",
                        style: { color: a.palette.text.secondary },
                        children: ""
                          .concat(f.pm_graph_title, " | Graph ID : ")
                          .concat(f.pm_graph_id),
                      }),
                  ],
                }),
                (0, m.jsxs)(s.Ay, {
                  container: !0,
                  spacing: 1,
                  className: "!px-3",
                  children: [
                    (0, m.jsx)(s.Ay, {
                      item: !0,
                      lg: 5,
                      md: 4,
                      className: "w-full",
                      children: (0, m.jsx)(c.c, { pmGraphID: t, graphForm: P }),
                    }),
                    f &&
                      f.dataset &&
                      (0, m.jsx)(s.Ay, {
                        item: !0,
                        lg: 7,
                        md: 8,
                        className: "w-full",
                        children: (0, m.jsx)(h.U, {
                          graphType: P.values.graph_type,
                          legendPosition: P.values.legend_position,
                          titleDisplayEnabled: P.values.title_display_enabled,
                          pmGraphTitle: P.values.pm_graph_title,
                          data: f.dataset,
                        }),
                      }),
                  ],
                }),
              ],
            })
          );
        },
        f = () => {
          const { id: e } = (0, r.g)();
          return (0, m.jsx)(x, { id: e });
        };
    },
  },
]);
//# sourceMappingURL=2024.b2c4962a.chunk.js.map
