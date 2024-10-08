"use strict";
(self.webpackChunkjetadmin_frontend =
  self.webpackChunkjetadmin_frontend || []).push([
  [3212],
  {
    66129: (e, a, t) => {
      t.d(a, {
        HP: () => o,
        rW: () => c,
        rw: () => p,
        il: () => n,
        bz: () => d,
      });
      var r,
        s = t(88739);
      class l {
        constructor(e) {
          let {
            pm_job_id: a,
            pm_job_title: t,
            pm_query_id: r,
            pm_job_schedule: s,
            is_disabled: l,
            created_at: i,
            updated_at: o,
            disabled_at: d,
            disable_reason: n,
          } = e;
          (this.pm_job_id = parseInt(a)),
            (this.pm_job_title = String(t)),
            (this.pm_query_id = String(r)),
            (this.pm_job_schedule = String(s)),
            (this.is_disabled = l),
            (this.created_at = i),
            (this.updated_at = o),
            (this.disabled_at = d),
            (this.disable_reason = n);
        }
      }
      (r = l),
        (l.toList = (e) => {
          if (Array.isArray(e)) return e.map((e) => new r(e));
        });
      var i = t(33211);
      const o = async (e) => {
          let { data: a } = e;
          try {
            const e = await i.A.post(s.a.APIS.JOB.addJob(), a);
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        d = async (e) => {
          let { data: a } = e;
          try {
            const e = await i.A.put(s.a.APIS.JOB.updateJob(), a);
            if (e.data && 1 == e.data.success) return !0;
            throw e.data && e.data.error
              ? e.data.error
              : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw (console.log({ error: t }), t);
          }
        },
        n = async (e) => {
          let { pmJobID: a } = e;
          try {
            const e = await i.A.get(s.a.APIS.JOB.getJobByID({ id: a }));
            if (e.data && 1 == e.data.success) return new l(e.data.job);
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        c = async (e) => {
          let { pmJobID: a } = e;
          try {
            const e = await i.A.delete(s.a.APIS.JOB.deleteJobByID({ id: a }));
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        p = async () => {
          try {
            const e = await i.A.get(s.a.APIS.JOB.getAllJobs());
            if (e.data && 1 == e.data.success) return l.toList(e.data.jobs);
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (e) {
            throw e;
          }
        };
    },
    73212: (e, a, t) => {
      t.r(a), t.d(a, { default: () => E });
      var r = t(65043),
        s = t(73216),
        l = t(88739),
        i = t(26240),
        o = t(35721),
        d = t(17392),
        n = t(42518),
        c = t(30681),
        p = t(38968),
        h = t(2050),
        m = t(48734),
        u = t(60184),
        b = t(93747),
        x = t(35475),
        _ = t(66129),
        f = t(17160),
        j = t(6720),
        R = t(70579);
      const y = () => {
        const e = (0, i.A)(),
          a = (0, s.g)(),
          t = "job_".concat(null === a || void 0 === a ? void 0 : a["*"]),
          { pmUser: y } = (0, f.hD)(),
          w = (0, s.Zp)(),
          g = (0, r.useMemo)(() => y && y.extractJobAddAuthorization(), [y]),
          {
            isLoading: O,
            data: v,
            error: E,
            refetch: S,
          } = (0, b.I)({
            queryKey: ["REACT_QUERY_KEY_JOBS"],
            queryFn: () => (0, _.rw)(),
            cacheTime: 0,
            retry: 1,
            staleTime: 0,
          });
        return (0, R.jsxs)(o.A, {
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
            (0, R.jsxs)("div", {
              className:
                "!px-3.5 py-1 flex flex-row justify-between items-center w-full",
              children: [
                (0, R.jsx)("span", {
                  className: "!font-semibold",
                  style: { color: e.palette.primary.main },
                  children: "Jobs",
                }),
                (0, R.jsx)(d.A, {
                  onClick: S,
                  children: (0, R.jsx)(u.Swo, {
                    style: { color: e.palette.primary.main },
                    className: "!text-sm",
                  }),
                }),
              ],
            }),
            g &&
              (0, R.jsxs)("div", {
                className: "!px-3 !py-1.5 !w-full",
                children: [
                  (0, R.jsx)(n.A, {
                    onClick: () => {
                      w(l.a.ROUTES.ADD_JOB.path());
                    },
                    variant: "contained",
                    className: "!w-full",
                    startIcon: (0, R.jsx)(u.OiG, { className: "!text-sm" }),
                    children: "Add more jobs",
                  }),
                  (0, R.jsx)(n.A, {
                    onClick: () => {
                      w(l.a.ROUTES.JOB_HISTORY.path());
                    },
                    variant: "outlined",
                    className: "!w-full  !mt-3",
                    startIcon: (0, R.jsx)(u.OKX, { className: "!text-sm" }),
                    children: "View job history",
                  }),
                ],
              }),
            (0, R.jsx)("div", { className: "!mt-1" }),
            v && v.length > 0
              ? v.map((a) => {
                  const r = "job_".concat(a.pm_job_id);
                  return (0, R.jsx)(
                    x.N_,
                    {
                      to: l.a.ROUTES.GRAPH_VIEW.path(a.pm_job_id),
                      children: (0, R.jsx)(
                        c.Ay,
                        {
                          disablePadding: !0,
                          className: "!px-3 !py-1.5",
                          children: (0, R.jsxs)(p.A, {
                            sx: {
                              background: e.palette.background.paper,
                              border: r == t ? 1 : 0,
                              borderColor: e.palette.primary.main,
                            },
                            selected: r == t,
                            className: "!rounded",
                            children: [
                              (0, R.jsx)(h.A, {
                                className: "!ml-1",
                                sx: {
                                  color:
                                    r == t
                                      ? e.palette.primary.main
                                      : e.palette.primary.contrastText,
                                  minWidth: 0,
                                },
                                children: (0, R.jsx)(j.fO9, {
                                  className: "!text-lg",
                                }),
                              }),
                              (0, R.jsx)(m.A, {
                                sx: {
                                  color:
                                    r == t
                                      ? e.palette.primary.main
                                      : e.palette.primary.contrastText,
                                },
                                primary: a.pm_job_title,
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
                        "_job_".concat(a.pm_job_id)
                      ),
                    },
                    r
                  );
                })
              : null,
          ],
        });
      };
      var w = t(61892);
      const g = (0, r.lazy)(() =>
          Promise.all([
            t.e(7779),
            t.e(5404),
            t.e(2098),
            t.e(6380),
            t.e(8405),
            t.e(7053),
            t.e(5274),
            t.e(4348),
            t.e(2602),
            t.e(5351),
            t.e(9058),
          ]).then(t.bind(t, 86994))
        ),
        O = (0, r.lazy)(() =>
          Promise.all([
            t.e(7779),
            t.e(5404),
            t.e(3013),
            t.e(2098),
            t.e(6380),
            t.e(8405),
            t.e(7053),
            t.e(4348),
            t.e(2602),
            t.e(6249),
            t.e(5351),
            t.e(113),
          ]).then(t.bind(t, 93714))
        ),
        v = (0, r.lazy)(() =>
          Promise.all([
            t.e(7779),
            t.e(5404),
            t.e(3013),
            t.e(6043),
            t.e(6380),
            t.e(1504),
            t.e(9397),
            t.e(4225),
            t.e(3803),
          ]).then(t.bind(t, 33803))
        ),
        E = () =>
          (0, R.jsxs)(w.HK, {
            direction: "horizontal",
            autoSaveId: "job-panel-sizes",
            children: [
              (0, R.jsx)(w.wV, {
                defaultSize: 20,
                children: (0, R.jsx)(y, {}),
              }),
              (0, R.jsx)(w.WM, { withHandle: !0 }),
              (0, R.jsxs)(w.wV, {
                defaultSize: 80,
                children: [
                  (0, R.jsxs)(s.BV, {
                    children: [
                      (0, R.jsx)(s.qh, {
                        index: !0,
                        element: (0, R.jsx)(g, {}),
                      }),
                      (0, R.jsx)(s.qh, {
                        path: l.a.ROUTES.ADD_JOB.code,
                        element: (0, R.jsx)(g, {}),
                      }),
                      (0, R.jsx)(s.qh, {
                        path: l.a.ROUTES.JOB_HISTORY.code,
                        element: (0, R.jsx)(v, {}),
                      }),
                      (0, R.jsx)(s.qh, {
                        path: l.a.ROUTES.JOB_VIEW.code,
                        element: (0, R.jsx)(O, {}),
                      }),
                    ],
                  }),
                  (0, R.jsx)(s.sv, {}),
                ],
              }),
            ],
          });
    },
    61892: (e, a, t) => {
      t.d(a, { HK: () => o, WM: () => n, wV: () => d });
      var r = t(26240),
        s = t(66833),
        l = t(59458),
        i = t(70579);
      const o = (e) => {
          let { className: a, ...t } = e;
          return (0, i.jsx)(l.YZ, {
            className:
              "flex h-full w-full data-[panel-group-direction=vertical]:flex-col ".concat(
                a
              ),
            ...t,
          });
        },
        d = l.Zk,
        n = (e) => {
          let { withHandle: a, className: t, ...o } = e;
          const d = (0, r.A)();
          return (0, i.jsx)(l.TW, {
            className:
              '\n      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",\n      '.concat(
                t,
                "\n    "
              ),
            ...o,
            children:
              a &&
              (0, i.jsx)("div", {
                className:
                  "z-10 flex h-4 w-3 items-center justify-center rounded-sm border",
                style: {
                  background: d.palette.background.default,
                  borderColor: d.palette.divider,
                  color: d.palette.text.primary,
                },
                children: (0, i.jsx)(s.GPm, { className: "!text-lg" }),
              }),
          });
        };
    },
  },
]);
//# sourceMappingURL=3212.42a03748.chunk.js.map
