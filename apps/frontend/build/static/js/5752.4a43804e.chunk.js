"use strict";
(self.webpackChunkjetadmin_frontend =
  self.webpackChunkjetadmin_frontend || []).push([
  [5752],
  {
    77769: (e, a, t) => {
      t.d(a, {
        Ir: () => o,
        iL: () => c,
        Wp: () => u,
        Xm: () => d,
        BD: () => p,
        AD: () => n,
      });
      var r,
        l = t(88739);
      class i {
        constructor(e) {
          let {
            pm_graph_id: a,
            graph_title: t,
            graph_description: r,
            graph_options: l,
            dataset: i,
            is_disabled: s,
            created_at: o,
            updated_at: n,
            disabled_at: d,
            disable_reason: p,
          } = e;
          (this.pm_graph_id = parseInt(a)),
            (this.graph_title = String(t)),
            (this.graph_description = String(r)),
            (this.graph_options = "object" === typeof l ? l : JSON.parse(l)),
            (this.dataset = i),
            (this.is_disabled = s),
            (this.created_at = o),
            (this.updated_at = n),
            (this.disabled_at = d),
            (this.disable_reason = p);
        }
      }
      (r = i),
        (i.toList = (e) => {
          if (Array.isArray(e)) return e.map((e) => new r(e));
        });
      var s = t(33211);
      const o = async (e) => {
          let { data: a } = e;
          try {
            const e = await s.A.post(l.a.APIS.GRAPH.addGraph(), a);
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : l.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        n = async (e) => {
          let { data: a } = e;
          try {
            const e = await s.A.put(l.a.APIS.GRAPH.updateGraph(), a);
            if ((console.log({ response: e }), e.data && 1 == e.data.success))
              return !0;
            throw e.data && e.data.error
              ? e.data.error
              : l.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw (console.log({ error: t }), t);
          }
        },
        d = async (e) => {
          let { pmGraphID: a } = e;
          try {
            const e = await s.A.get(l.a.APIS.GRAPH.getGraphByID({ id: a }));
            if (e.data && 1 == e.data.success) return new i(e.data.graph);
            throw e.data.error ? e.data.error : l.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        p = async (e) => {
          let { pmGraphID: a } = e;
          try {
            const e = await s.A.get(l.a.APIS.GRAPH.getGraphDataByID({ id: a }));
            if (e.data && 1 == e.data.success) return new i(e.data.graph);
            throw e.data.error ? e.data.error : l.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        c = async (e) => {
          let { pmGraphID: a } = e;
          try {
            const e = await s.A.delete(
              l.a.APIS.GRAPH.deleteGraphByID({ id: a })
            );
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : l.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        u = async () => {
          try {
            const e = await s.A.get(l.a.APIS.GRAPH.getAllGraphs());
            if (e.data && 1 == e.data.success) return i.toList(e.data.graphs);
            throw e.data.error ? e.data.error : l.a.ERROR_CODES.SERVER_ERROR;
          } catch (e) {
            throw e;
          }
        };
    },
    5752: (e, a, t) => {
      t.d(a, { L: () => E });
      var r = t(26240),
        l = t(17392),
        i = t(65043),
        s = (t(65211), t(60184));
      t(39659);
      var o = t(93747),
        n = t(77769),
        d = t(97054),
        p = t(70579);
      const c = (e) => {
        var a, t, l, i;
        let { id: s, width: c, height: u } = e;
        const h = (0, r.A)(),
          {
            isLoading: g,
            data: b,
            error: m,
            refetch: y,
          } = (0, o.I)({
            queryKey: ["REACT_QUERY_KEY_GRAPH", s],
            queryFn: () => (0, n.Xm)({ pmGraphID: s }),
            cacheTime: 0,
            retry: 1,
            staleTime: 0,
          }),
          {
            isLoading: _,
            data: R,
            error: E,
            refetch: T,
          } = (0, o.I)({
            queryKey: ["REACT_QUERY_KEY_GRAPH_DATA", s],
            queryFn: () => (0, n.BD)({ pmGraphID: s }),
            cacheTime: 0,
            retry: 1,
            staleTime: 0,
            refetchInterval:
              1e3 *
              (null === b ||
              void 0 === b ||
              null === (a = b.graph_options) ||
              void 0 === a
                ? void 0
                : a.refetch_interval),
          }),
          v =
            null === R ||
            void 0 === R ||
            null === (t = R.graph_options) ||
            void 0 === t
              ? void 0
              : t.graph_type,
          A = null === R || void 0 === R ? void 0 : R.graph_title,
          x =
            null === R || void 0 === R
              ? void 0
              : R.graph_options.legend_position,
          I =
            null === R || void 0 === R
              ? void 0
              : R.graph_options.title_display_enabled,
          D = null === R || void 0 === R ? void 0 : R.dataset,
          P =
            1e3 *
            (null === b ||
            void 0 === b ||
            null === (l = b.graph_options) ||
            void 0 === l
              ? void 0
              : l.refetch_interval);
        return (0, p.jsx)("div", {
          className: "rounded !p-4",
          style: {
            background: h.palette.background.default,
            width: c,
            height: u,
          },
          children:
            null === (i = d.z[v]) || void 0 === i
              ? void 0
              : i.component({
                  legendPosition: x,
                  titleDisplayEnabled: I,
                  graphTitle: A,
                  data: D,
                  refetchInterval: P,
                }),
        });
      };
      var u = t(39336),
        h = t(35113),
        g = (t(83359), t(79314)),
        b = t.n(g),
        m = (t(68685), t(87895)),
        y = t(31628),
        _ = t(51473);
      const R = (e) => {
          let { id: a, width: t, height: l } = e;
          const s = (0, r.A)(),
            { themeType: n } = (0, m.i7)(),
            {
              isPending: d,
              isLoading: c,
              isError: g,
              error: R,
              data: E,
              refetch: T,
            } = (0, o.I)({
              queryKey: ["REACT_QUERY_KEY_QUERIES_RESULT", a],
              queryFn: () => (0, h.UM)({ pm_query_id: a }),
              retry: !1,
              cacheTime: 0,
              retry: 1,
              staleTime: 0,
            }),
            {
              isPending: v,
              isLoading: A,
              isError: x,
              error: I,
              data: D,
              refetch: P,
            } = (0, o.I)({
              queryKey: ["REACT_QUERY_KEY_QUERIES", a],
              queryFn: () => (0, h.Fd)({ pmQueryID: a }),
              retry: !1,
              cacheTime: 0,
              retry: 1,
              staleTime: 0,
            }),
            f = E ? b()(Array.isArray(E) ? E[0] : E) : {};
          (0, i.useMemo)(() => {
            if (f && f.properties)
              return Object.keys(f.properties).map((e) => ({
                key: e,
                name: (0, y.ZH)(e),
              }));
          }, [f]);
          return (0, p.jsxs)("div", {
            className: "rounded",
            style: {
              background: s.palette.background.default,
              width: t,
              height: l,
            },
            children: [
              (0, p.jsx)("div", {
                style: { height: 30 },
                className:
                  "flex flex-row justify-start items-center w-full px-1",
                children: (0, p.jsx)("span", {
                  className: "!text-sm !font-semibold",
                  children:
                    null === D || void 0 === D ? void 0 : D.pm_query_title,
                }),
              }),
              (0, p.jsx)(u.A, {}),
              (0, p.jsx)(_.O, { data: E, border: !1, height: l - 31 }),
            ],
          });
        },
        E = (e) => {
          let { widget: a, index: t, handleDelete: o, responsive: n = !0 } = e;
          const d = (0, r.A)(),
            u = String(a).split("_")[0],
            h = parseInt(String(a).split("_")[1]),
            [g, b] = (() => {
              const e = (0, i.useRef)(null),
                [a, t] = (0, i.useState)({ width: 0, height: 0 });
              return (
                (0, i.useEffect)(() => {
                  const a = new ResizeObserver((e) => {
                    if (e[0]) {
                      const { width: a, height: r } = e[0].contentRect;
                      t({ width: a, height: r });
                    }
                  });
                  return (
                    e.current && a.observe(e.current),
                    () => {
                      e.current && a.unobserve(e.current);
                    }
                  );
                }, []),
                [e, a]
              );
            })(),
            [m, y] = (0, i.useState)(!1);
          return (0, p.jsxs)("div", {
            className: "!p-1 !rounded !h-full !w-full flex-grow relative",
            style: {
              background:
                m && n ? d.palette.primary.main : d.palette.background.default,
            },
            onMouseEnter: () => {
              y(!0);
            },
            onMouseLeave: () => {
              y(!1);
            },
            onClick: (e) => {
              e.stopPropagation();
            },
            children: [
              o &&
                m &&
                n &&
                (0, p.jsx)("div", {
                  className:
                    "!flex-row justify-end !items-center !w-full absolute top-1 left-1 z-50",
                  style: {},
                  children: (0, p.jsx)(l.A, {
                    "aria-label": "delete",
                    size: "small",
                    onClick: (e) => {
                      o(t);
                    },
                    onMouseDown: (e) => {
                      e.stopPropagation();
                    },
                    onTouchStart: (e) => {
                      e.stopPropagation();
                    },
                    style: {
                      borderRadius: 0,
                      borderBottomRightRadius: 4,
                      background: d.palette.primary.main,
                    },
                    children: (0, p.jsx)(s.QCr, {
                      className: "!text-xs",
                      style: { color: d.palette.common.white },
                    }),
                  }),
                }),
              (0, p.jsxs)("div", {
                className:
                  "!flex-row justify-center !items-center !w-full !h-full",
                ref: g,
                children: [
                  "graph" === u &&
                    (0, p.jsx)(c, { id: h, height: b.height, width: b.width }),
                  "query" === u &&
                    (0, p.jsx)(R, {
                      id: h,
                      height: null === b || void 0 === b ? void 0 : b.height,
                      width: null === b || void 0 === b ? void 0 : b.width,
                    }),
                ],
              }),
            ],
          });
        };
    },
    97054: (e, a, t) => {
      t.d(a, { z: () => C });
      var r = t(26240),
        l = t(461),
        i = t(65043),
        s = t(6058),
        o = t(84535),
        n = t(88739),
        d = t(70579);
      l.t1.register(l.PP, l.kc, l.E8, l.hE, l.m_, l.s$);
      const p = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
        ],
        c = {
          labels: p,
          datasets: [
            {
              label: "Dataset 1",
              data: p.map(() => o.Jb.datatype.number({ min: -1e3, max: 1e3 })),
              borderColor: "rgb(255, 99, 132)",
              backgroundColor: "rgba(255, 99, 132, 0.5)",
            },
            {
              label: "Dataset 2",
              data: p.map(() => o.Jb.datatype.number({ min: -1e3, max: 1e3 })),
              borderColor: "rgb(53, 162, 235)",
              backgroundColor: "rgba(53, 162, 235, 0.5)",
            },
          ],
        },
        u = (e) => {
          let {
            legendPosition: a,
            titleDisplayEnabled: t,
            graphTitle: l,
            data: o,
          } = e;
          (0, r.A)();
          const p = (0, i.useMemo)(
            () => ({
              responsive: !0,
              elements: { bar: { borderWidth: 2 } },
              plugins: {
                legend: { position: a || n.a.GRAPH_LEGEND_POSITION.TOP },
                title: {
                  display: Boolean(t),
                  text: l || n.a.STRINGS.UNTITLED_CHART_TITLE,
                },
              },
            }),
            [a, t, l]
          );
          return (0, d.jsx)(s.yP, { options: p, data: o || c });
        };
      l.t1.register(l.Bs, l.m_, l.s$);
      const h = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
        ],
        g = {
          labels: h,
          datasets: [
            {
              label: "Dataset 1",
              data: h.map(() => o.Jb.datatype.number({ min: -1e3, max: 1e3 })),
              borderColor: "rgb(255, 99, 132)",
              backgroundColor: "rgba(255, 99, 132, 0.5)",
            },
            {
              label: "Dataset 2",
              data: h.map(() => o.Jb.datatype.number({ min: -1e3, max: 1e3 })),
              borderColor: "rgb(53, 162, 235)",
              backgroundColor: "rgba(53, 162, 235, 0.5)",
            },
          ],
        },
        b = (e) => {
          let {
            legendPosition: a,
            titleDisplayEnabled: t,
            graphTitle: l,
            data: o,
          } = e;
          (0, r.A)();
          const p = (0, i.useMemo)(
            () => ({
              responsive: !0,
              elements: { bar: { borderWidth: 2 } },
              plugins: {
                legend: { position: a || n.a.GRAPH_LEGEND_POSITION.TOP },
                title: {
                  display: Boolean(t),
                  text: l || n.a.STRINGS.UNTITLED_CHART_TITLE,
                },
              },
            }),
            [a, t, l]
          );
          return (0, d.jsx)(s.nu, { options: p, data: o || g });
        };
      l.t1.register(l.PP, l.kc, l.FN, l.No, l.hE, l.m_, l.dN, l.s$);
      const m = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
        ],
        y = {
          labels: m,
          datasets: [
            {
              label: "Dataset 1",
              data: m.map(() => o.Jb.datatype.number({ min: -1e3, max: 1e3 })),
              borderColor: "rgb(255, 99, 132)",
              backgroundColor: "rgba(255, 99, 132, 0.5)",
            },
            {
              label: "Dataset 2",
              data: m.map(() => o.Jb.datatype.number({ min: -1e3, max: 1e3 })),
              borderColor: "rgb(53, 162, 235)",
              backgroundColor: "rgba(53, 162, 235, 0.5)",
            },
          ],
        },
        _ = (e) => {
          let {
            legendPosition: a,
            titleDisplayEnabled: t,
            graphTitle: l,
            data: o,
          } = e;
          (0, r.A)();
          const p = (0, i.useMemo)(
            () => ({
              maintainAspectRatio: !1,
              elements: { bar: { borderWidth: 2 } },
              plugins: {
                legend: { position: a || n.a.GRAPH_LEGEND_POSITION.TOP },
                title: {
                  display: Boolean(t),
                  text: l || n.a.STRINGS.UNTITLED_CHART_TITLE,
                },
              },
            }),
            [a, t, l]
          );
          return (0, d.jsx)(s.N1, { redraw: !0, options: p, data: o || y });
        };
      l.t1.register(l.Bs, l.m_, l.s$);
      const R = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
        ],
        E = {
          labels: R,
          datasets: [
            {
              label: "Dataset 1",
              data: R.map(() => o.Jb.datatype.number({ min: -1e3, max: 1e3 })),
              borderColor: "rgb(255, 99, 132)",
              backgroundColor: "rgba(255, 99, 132, 0.5)",
            },
            {
              label: "Dataset 2",
              data: R.map(() => o.Jb.datatype.number({ min: -1e3, max: 1e3 })),
              borderColor: "rgb(53, 162, 235)",
              backgroundColor: "rgba(53, 162, 235, 0.5)",
            },
          ],
        },
        T = (e) => {
          let {
            legendPosition: a,
            titleDisplayEnabled: t,
            graphTitle: l,
            data: o,
          } = e;
          (0, r.A)();
          const p = (0, i.useMemo)(
            () => ({
              maintainAspectRatio: !1,
              responsive: !0,
              elements: { pie: { borderWidth: 2, padding: 20 } },
              plugins: {
                legend: { position: a || n.a.GRAPH_LEGEND_POSITION.TOP },
                title: {
                  display: Boolean(t),
                  text: l || n.a.STRINGS.UNTITLED_CHART_TITLE,
                },
              },
            }),
            [a, t, l]
          );
          return (0, d.jsx)(s.Fq, { options: p, data: o || E });
        };
      l.t1.register(l.pr, l.Bs, l.m_, l.s$);
      const v = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
        ],
        A = {
          labels: v,
          datasets: [
            {
              label: "Dataset 1",
              data: v.map(() => o.Jb.datatype.number({ min: -1e3, max: 1e3 })),
              borderColor: "rgb(255, 99, 132)",
              backgroundColor: "rgba(255, 99, 132, 0.5)",
            },
            {
              label: "Dataset 2",
              data: v.map(() => o.Jb.datatype.number({ min: -1e3, max: 1e3 })),
              borderColor: "rgb(53, 162, 235)",
              backgroundColor: "rgba(53, 162, 235, 0.5)",
            },
          ],
        },
        x = (e) => {
          let {
            legendPosition: a,
            titleDisplayEnabled: t,
            graphTitle: l,
            data: o,
          } = e;
          (0, r.A)();
          const p = (0, i.useMemo)(
            () => ({
              responsive: !0,
              elements: { bar: { borderWidth: 2 } },
              plugins: {
                legend: { position: a || n.a.GRAPH_LEGEND_POSITION.TOP },
                title: {
                  display: Boolean(t),
                  text: l || n.a.STRINGS.UNTITLED_CHART_TITLE,
                },
              },
            }),
            [a, t, l]
          );
          return (0, d.jsx)(s.O5, { options: p, data: o || A });
        };
      l.t1.register(l.pr, l.Bs, l.m_, l.s$);
      const I = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
        ],
        D = {
          labels: I,
          datasets: [
            {
              label: "Dataset 1",
              data: I.map(() => o.Jb.datatype.number({ min: -1e3, max: 1e3 })),
              borderColor: "rgb(255, 99, 132)",
              backgroundColor: "rgba(255, 99, 132, 0.5)",
            },
            {
              label: "Dataset 2",
              data: I.map(() => o.Jb.datatype.number({ min: -1e3, max: 1e3 })),
              borderColor: "rgb(53, 162, 235)",
              backgroundColor: "rgba(53, 162, 235, 0.5)",
            },
          ],
        },
        P = (e) => {
          let {
            legendPosition: a,
            titleDisplayEnabled: t,
            graphTitle: l,
            data: o,
          } = e;
          (0, r.A)();
          const p = (0, i.useMemo)(
            () => ({
              maintainAspectRatio: !1,
              responsive: !0,
              elements: { bar: { borderWidth: 2 } },
              plugins: {
                legend: { position: a || n.a.GRAPH_LEGEND_POSITION.TOP },
                title: {
                  display: Boolean(t),
                  text: l || n.a.STRINGS.UNTITLED_CHART_TITLE,
                },
              },
            }),
            [a, t, l]
          );
          return (0, d.jsx)(s.Vd, {
            options: p,
            height: "300 px",
            data: o || D,
          });
        };
      var f = t(60184),
        w = t(23156),
        N = t(49804),
        S = t(83002);
      const C = {
        BAR: {
          label: "Bar",
          value: "BAR",
          fields: ["dataset_title", "x_axis", "y_axis", "index_axis"],
          component: (e) => {
            let {
              legendPosition: a,
              titleDisplayEnabled: t,
              graphTitle: r,
              data: l,
              refetchInterval: i,
            } = e;
            return (0, d.jsx)(u, {
              legendPosition: a,
              titleDisplayEnabled: t,
              graphTitle: r,
              data: l,
              refetchInterval: i,
            });
          },
          icon: (0, d.jsx)(f.v$b, { className: "!text-lg" }),
        },
        LINE: {
          label: "Line",
          value: "LINE",
          fields: ["dataset_title", "x_axis", "y_axis", "fill"],
          component: (e) => {
            let {
              legendPosition: a,
              titleDisplayEnabled: t,
              graphTitle: r,
              data: l,
              refetchInterval: i,
            } = e;
            return (0, d.jsx)(_, {
              legendPosition: a,
              titleDisplayEnabled: t,
              graphTitle: r,
              data: l,
              refetchInterval: i,
            });
          },
          icon: (0, d.jsx)(w.YYR, { className: "!text-lg" }),
        },
        PIE: {
          label: "Pie",
          value: "PIE",
          fields: ["dataset_title", "label", "value"],
          component: (e) => {
            let {
              legendPosition: a,
              titleDisplayEnabled: t,
              graphTitle: r,
              data: l,
              refetchInterval: i,
            } = e;
            return (0, d.jsx)(T, {
              legendPosition: a,
              titleDisplayEnabled: t,
              graphTitle: r,
              data: l,
              refetchInterval: i,
            });
          },
          icon: (0, d.jsx)(f.qvi, { className: "!text-lg" }),
        },
        DOUGHNUT: {
          label: "Doughnut",
          value: "DOUGHNUT",
          fields: ["dataset_title", "label", "value"],
          component: (e) => {
            let {
              legendPosition: a,
              titleDisplayEnabled: t,
              graphTitle: r,
              data: l,
              refetchInterval: i,
            } = e;
            return (0, d.jsx)(b, {
              legendPosition: a,
              titleDisplayEnabled: t,
              graphTitle: r,
              data: l,
              refetchInterval: i,
            });
          },
          icon: (0, d.jsx)(N.hPC, { className: "!text-lg" }),
        },
        POLAR_AREA: {
          label: "Polar Area",
          value: "POLAR_AREA",
          fields: ["dataset_title", "label", "value"],
          component: (e) => {
            let {
              legendPosition: a,
              titleDisplayEnabled: t,
              graphTitle: r,
              data: l,
              refetchInterval: i,
            } = e;
            return (0, d.jsx)(x, {
              legendPosition: a,
              titleDisplayEnabled: t,
              graphTitle: r,
              data: l,
              refetchInterval: i,
            });
          },
          icon: (0, d.jsx)(S.mHc, { className: "!text-lg" }),
        },
        RADAR: {
          label: "Radar",
          value: "RADAR",
          fields: ["dataset_title", "label", "value"],
          component: (e) => {
            let {
              legendPosition: a,
              titleDisplayEnabled: t,
              graphTitle: r,
              data: l,
              refetchInterval: i,
            } = e;
            return (0, d.jsx)(P, {
              legendPosition: a,
              titleDisplayEnabled: t,
              graphTitle: r,
              data: l,
              refetchInterval: i,
            });
          },
          icon: (0, d.jsx)(N.eY8, { className: "!text-lg" }),
        },
      };
    },
  },
]);
//# sourceMappingURL=5752.4a43804e.chunk.js.map
